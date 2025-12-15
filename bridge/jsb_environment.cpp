#include "jsb_environment.h"

#include "jsb_bridge_module_loader.h"
#include "jsb_godot_module_loader.h"
#include "jsb_transpiler.h"
#include "jsb_ref.h"
#include "jsb_bridge_helper.h"
#include "jsb_builtins.h"
#include "jsb_object_bindings.h"
#include "jsb_type_convert.h"
#include "jsb_class_register.h"
#include "jsb_worker.h"
#include "jsb_essentials.h"
#include "jsb_amd_module_loader.h"

#include "../internal/jsb_path_util.h"
#include "../internal/jsb_class_util.h"
#include "../internal/jsb_variant_util.h"
#include "../internal/jsb_settings.h"
#include "../jsb_project_preset.h"

#ifdef TOOLS_ENABLED
#if GODOT_4_5_OR_NEWER
#include "editor/settings/editor_settings.h"
#else
#include "editor/editor_settings.h"
#endif
#endif
#include "main/performance.h"

//TODO remove this
#include "../weaver/jsb_script.h"
#include "modules/GodotJS/weaver/jsb_script_instance.h"
#include "modules/GodotJS/weaver/jsb_script_language.h"

#if !JSB_WITH_STATIC_BINDINGS
#include "jsb_primitive_bindings_reflect.h"
#define register_primitive_bindings(param) register_primitive_bindings_reflect(param)
#else
#include "jsb_primitive_bindings_static.h"
#define register_primitive_bindings(param) register_primitive_bindings_static(param)
#endif

namespace jsb
{
#if JSB_V8_CPPGC
    // for cppgc wrapper descriptor
    enum
    {
        kWrapperTypeIndex,
        kWrapperInstanceIndex,
        kWrapperFieldCount,
    };
    namespace { const uint16_t kWrapperID = 1; }
#endif

    struct EnvironmentStore
    {
        std::vector<std::shared_ptr<Environment>> get_list()
        {
            std::vector<std::shared_ptr<Environment>> rval;
            lock_.lock();
            for (void* ptr : all_runtimes_)
            {
                //TODO check if it's not removed from `all_runtimes_` but being destructed already (consider remove it from the list immediately on destructor called)
                Environment* env = (Environment*) ptr;
                rval.push_back(env->shared_from_this());
            }
            lock_.unlock();
            return rval;
        }

        // return an Environment shared pointer with an unknown pointer if it's a valid Environment instance.
        std::shared_ptr<Environment> access(void* p_runtime)
        {
            std::shared_ptr<Environment> rval;
            lock_.lock();
            if (all_runtimes_.has(p_runtime))
            {
                //TODO check if it's not removed from `all_runtimes_` but being destructed already (consider remove it from the list immediately on destructor called)
                Environment* env = (Environment*) p_runtime;
                rval = env->shared_from_this();
            }
            lock_.unlock();
            return rval;
        }

        // return existing Environment on the caller thread
        std::shared_ptr<Environment> access()
        {
            std::shared_ptr<Environment> rval;
            lock_.lock();
            for (void* ptr : all_runtimes_)
            {
                //TODO check if it's not removed from `all_runtimes_` but being destructed already (consider remove it from the list immediately on destructor called)
                Environment* env = (Environment*) ptr;
                if (env->thread_id_ != Thread::UNASSIGNED_ID && env->is_caller_thread())
                {
                    rval = env->shared_from_this();
                    break;
                }
            }
            lock_.unlock();
            return rval;
        }

        // unsafe, may be destructing
        Environment* internal_access(void* p_runtime)
        {
            Environment* rval = nullptr;
            lock_.lock();
            if (all_runtimes_.has(p_runtime))
            {
                rval = (Environment*) p_runtime;
            }
            lock_.unlock();
            return rval;
        }

        bool exists(void* p_runtime) const
        {
            lock_.lock();
            const bool rval = all_runtimes_.has(p_runtime);
            lock_.unlock();
            return rval;
        }

        void add(void* p_runtime)
        {
            lock_.lock();
            jsb_check(!all_runtimes_.has(p_runtime));
            all_runtimes_.insert(p_runtime);
            lock_.unlock();
        }

        void remove(void* p_runtime)
        {
            lock_.lock();
            jsb_check(all_runtimes_.has(p_runtime));
            all_runtimes_.erase(p_runtime);
            lock_.unlock();
        }

        jsb_force_inline static EnvironmentStore& get_shared()
        {
            static EnvironmentStore global_store;
            return global_store;
        }

    private:
        BinaryMutex lock_;
        HashSet<void*> all_runtimes_;
    };

    struct InstanceBindingCallbacks
    {
        jsb_force_inline operator const GDExtensionInstanceBindingCallbacks* () const { return &callbacks_; }

        InstanceBindingCallbacks()
            : callbacks_ { create_callback, free_callback, reference_callback }
        {}

    private:
        static void* create_callback(void* p_token, void* p_instance)
        {
            return p_instance;
        }

        static void free_callback(void* p_token, void* p_instance, void* p_binding)
        {
            if (const std::shared_ptr<Environment> env = EnvironmentStore::get_shared().access(p_token))
            {
                // p_binding must equal to the return value of `create_callback`
                jsb_check(p_instance == p_binding);

                // must check before async, InstanceBindingCallback need to know whether the object should die or not if it's a ref-counted object.
                if (env->verify_object(p_binding))
                {
                    // Note: Our pointer to the native Godot object is about to become invalid. We must IMMEDIATELY
                    //       remove this pointer/address from our data structures. It's not safe to post a message and
                    //       do this work on the environment's thread, because another Godot object may be allocated at
                    //       the same address before our message is handled. This is not hypothetical, it was observed
                    //       in practice several times.
                    env->free_object(p_binding, FinalizationType::None);
                }
            }
        }

        static GDExtensionBool reference_callback(void* p_token, void* p_binding, GDExtensionBool p_reference)
        {
            if (const std::shared_ptr<Environment> env = EnvironmentStore::get_shared().access(p_token))
            {
                if (env->verify_object(p_binding) && env->add_async_call(
                    p_reference ? Environment::AsyncCall::TYPE_REF : Environment::AsyncCall::TYPE_DEREF,
                    p_binding))
                {
                    //NOTE Always return false to avoid `delete` in godot unreference() call,
                    //     object_gc_callback would eventually delete the RefCounted Object.
                    return false;
                }
            }
            return true;
        }

        GDExtensionInstanceBindingCallbacks callbacks_;
    };

    namespace { InstanceBindingCallbacks gd_instance_binding_callbacks = {}; }

    namespace
    {
#if JSB_PRINT_GC_TIME
        uint64_t gc_ticks = 0;

        void OnPreGCCallback(v8::Isolate* isolate, v8::GCType type, v8::GCCallbackFlags flags)
        {
            if (const OS* os = OS::get_singleton())
            {
                gc_ticks = os->get_ticks_msec();
            }
        }

        void OnPostGCCallback(v8::Isolate* isolate, v8::GCType type, v8::GCCallbackFlags flags)
        {
            JSB_LOG(VeryVerbose, "v8 gc time %dms type:%d flags:%d",
                OS::get_singleton() ? OS::get_singleton()->get_ticks_msec() - gc_ticks : -1, type, flags);
        }
#endif

        void PromiseRejectCallback_(v8::PromiseRejectMessage message)
        {
            if (message.GetEvent() != v8::kPromiseRejectWithNoHandler)
            {
                return;
            }

            const v8::Local<v8::Promise> promise = message.GetPromise();
            v8::Isolate* isolate = promise->GetIsolate();

            const String str = impl::Helper::to_string_without_side_effect(isolate, message.GetValue());
            JSB_LOG(Error, "unhandled promise rejection: %s", str);
        }
    }

    Environment::Environment(const CreateParams& p_params)
        : thread_id_(p_params.thread_id)
        , object_db_(p_params.initial_object_slots)
    {
        JSB_BENCHMARK_SCOPE(JSEnvironment, Construct);
        impl::GlobalInitialize::init();
        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator = &allocator_;
#if JSB_V8_CPPGC
        // old version:
        cpp_heap_ = v8::CppHeap::Create(impl::GlobalInitialize::get_platform(),
            v8::CppHeapCreateParams({}, v8::WrapperDescriptor(kWrapperTypeIndex, kWrapperInstanceIndex, kWrapperID)));
        // new version:
        // cpp_heap_ = v8::CppHeap::Create(impl::GlobalInitialize::get_platform(), v8::CppHeapCreateParams({}));
        create_params.cpp_heap = cpp_heap_.get();
#endif

        if (p_params.type == Type::Worker) flags_ |= EF_Worker;
        else if (p_params.type == Type::Shadow) flags_ |= EF_Shadow;

        isolate_ = v8::Isolate::New(create_params);
        isolate_->SetData(kIsolateEmbedderData, this);
        isolate_->SetPromiseRejectCallback(PromiseRejectCallback_);
#if JSB_PRINT_GC_TIME
        isolate_->AddGCPrologueCallback(&OnPreGCCallback);
        isolate_->AddGCEpilogueCallback(&OnPostGCCallback);
#endif

        {
            v8::Isolate::Scope isolate_scope(isolate_);

            // create context
            {
                v8::HandleScope handle_scope(isolate_);

                for (int index = 0; index < Symbols::kNum; ++index)
                {
                    symbols_[index].Reset(isolate_, v8::Symbol::New(isolate_));
                }

                native_classes_.reserve(p_params.initial_class_slots);
                script_classes_.reserve(p_params.initial_script_slots);

                module_loaders_.insert("godot", memnew(GodotModuleLoader));
                module_loaders_.insert("godot-jsb", memnew(BridgeModuleLoader));
                EnvironmentStore::get_shared().add(this);

                JSB_BENCHMARK_SCOPE(JSRealm, Construct);

                const v8::Local<v8::Context> context = v8::Context::New(isolate_);
                const v8::Context::Scope context_scope(context);
                const v8::Local<v8::Object> global = context->Global();

                context->SetAlignedPointerInEmbedderData(kContextEmbedderData, this);
                context_.Reset(isolate_, context);

                // init module cache, and register the global 'require' function
                {
                    const v8::Local<v8::Object> cache_obj = v8::Object::New(isolate_);
                    const v8::Local<v8::Function> require_func = JSB_NEW_FUNCTION(context, Builtins::_require, {});
                    require_func->Set(context, jsb_name(this, cache), cache_obj).Check();
                    require_func->Set(context, impl::Helper::new_string_ascii(isolate_, "moduleId"), v8::String::Empty(isolate_)).Check();
                    global->Set(context, impl::Helper::new_string_ascii(isolate_, "require"), require_func).Check();
                    global->Set(context, impl::Helper::new_string_ascii(isolate_, "define"), JSB_NEW_FUNCTION(context, Builtins::_define, {})).Check();
                    module_cache_.init(isolate_, cache_obj);
                }

                internal::StringNames& names = internal::StringNames::get_singleton();

                // Populate StringNames replacement list so that classes can be lazily loaded by their exposed class name.
                if (internal::Settings::get_camel_case_bindings_enabled())
                {
                    List<StringName> exposed_class_list = internal::NamingUtil::get_exposed_original_class_list();

                    for (auto it = exposed_class_list.begin(); it != exposed_class_list.end(); ++it)
                    {
                        String exposed_name = internal::NamingUtil::get_class_name(*it);

                        if (exposed_name != *it)
                        {
                            names.add_replacement(*it, exposed_name);
                        }
                    }

                    List<Engine::Singleton> singleton_list;
                    Engine::get_singleton()->get_singletons(&singleton_list);

                    for (auto it = singleton_list.begin(); it != singleton_list.end(); ++it)
                    {
                        String exposed_name = internal::NamingUtil::get_class_name(it->name);

                        if (exposed_name != it->name)
                        {
                            names.add_replacement(it->name, exposed_name);
                        }
                    }

                    Vector<String> reserved_words = GodotJSScriptLanguage::get_singleton()->get_reserved_words();

                    List<StringName> utility_function_list;
                    Variant::get_utility_function_list(&utility_function_list);

                    for (auto it = utility_function_list.begin(); it != utility_function_list.end(); ++it)
                    {
                        String exposed_name = internal::NamingUtil::get_member_name(*it);

                        if (reserved_words.find(exposed_name) >= 0)
                        {
                            exposed_name = internal::NamingUtil::get_member_name("godot_" + exposed_name);
                        }

                        if (exposed_name != *it)
                        {
                            names.add_replacement(*it, exposed_name);
                        }
                    }

                    const int constant_count = CoreConstants::get_global_constant_count();
                    for (int index = 0; index < constant_count; ++index)
                    {
                        const StringName enum_name = CoreConstants::get_global_constant_enum(index);
                        String exposed_name = internal::NamingUtil::get_class_name(enum_name);

                        if (reserved_words.find(exposed_name) >= 0)
                        {
                            exposed_name = internal::NamingUtil::get_member_name("godot_" + exposed_name);
                        }

                        if (exposed_name != enum_name)
                        {
                            names.add_replacement(enum_name, exposed_name);
                        }
                    }
                }

#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
                Worker::register_(context, global);
#endif
                Essentials::register_(context, global);
                register_primitive_bindings(this);
            }

#if JSB_WITH_DEBUGGER
            debugger_ready_future_ = debugger_ready_promise_.get_future();
            //TODO call `start_debugger` at different stages for Editor/Game Runtimes.
#endif

            start_debugger(p_params.debugger_port);
        }
    }

    // no JS code should be executed in the destructor.
    Environment::~Environment()
    {
        //TODO not always safe
        if ((flags_ & EF_PreDispose) == 0)
        {
            JSB_LOG(Warning, "Environment is not disposed before destructing it %s", (uintptr_t) id());;
            check_internal_state();
            dispose();
        }

        JSB_LOG(Verbose, "destructing Environment %s", (uintptr_t) id());
#if JSB_WITH_ESSENTIALS
        timer_tags_.tags.clear();
        timer_manager_.clear_all();
#endif

        for (IModuleResolver* resolver : module_resolvers_)
        {
            memdelete(resolver);
        }
        module_resolvers_.clear();
        if (async_module_manager_)
        {
            memdelete(async_module_manager_);
            async_module_manager_ = nullptr;
        }

        for (KeyValue<StringName, IModuleLoader*>& pair : module_loaders_)
        {
            memdelete(pair.value);
            pair.value = nullptr;
        }

        jsb_check(object_db_.size() == 0);
        string_name_cache_.clear();

        // cleanup all class templates (must do after objects cleaned up)
        native_classes_.clear();

        isolate_->Dispose();
        isolate_ = nullptr;

        variant_allocator_.drain();
    }

    void Environment::init()
    {
        jsb::DefaultModuleResolver& resolver = this->add_module_resolver<jsb::DefaultModuleResolver>()
            .add_search_path(jsb::internal::Settings::get_jsb_out_res_path()) // default path of js source (results of compiled ts, at '.godot/GodotJS' by default)
            .add_search_path("res://") // use the root directory as custom lib path by default
            .add_search_path("res://node_modules") // so far, it's the only supported path for node_modules in GodotJS
        ;

        // load internal scripts (jsb.core, jsb.editor.main, jsb.editor.codegen)
        static constexpr char kRuntimeBundleFile[] = "jsb.runtime.bundle.js";
        jsb_ensuref(AMDModuleLoader::load_source(this, GodotJSProjectPreset::get_source_rt(kRuntimeBundleFile)) == OK,
            "the embedded '%s' not found, run 'scons' again to refresh all *.gen.cpp sources", kRuntimeBundleFile);
        static constexpr char kEditorBundleFile[] = "jsb.editor.bundle.js";
#ifdef TOOLS_ENABLED
        jsb_ensuref(AMDModuleLoader::load_source(this, GodotJSProjectPreset::get_source_ed(kEditorBundleFile)) == OK,
            "the embedded '%s' not found, run 'scons' again to refresh all *.gen.cpp sources", kEditorBundleFile);
#else
        // Users may consume editor APIs in codegen functions. However, we want to permit regular ES6 import syntax.
        // We provide a dummy module that can be imported (but not used) in runtime-only builds.
        static constexpr char kDummyModule[] = u8"(function(define){define('jsb.editor.codegen',[],function(){return{}})})";
        AMDModuleLoader::load_source(this, kDummyModule, sizeof(kDummyModule) - 1, kEditorBundleFile);
#endif

    }

    void Environment::dispose()
    {
        JSB_LOG(Verbose, "disposing Environment %s", (uintptr_t) id());

        flags_ |= EF_PreDispose;
        // destroy context
        {
            v8::Isolate* isolate = this->isolate_;
            v8::Isolate::Scope isolate_scope(isolate);
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = context_.Get(get_isolate());

            function_refs_.clear();
            while (!function_bank_.is_empty()) function_bank_.remove_last();
            // function_bank_.clear();

#if JSB_WITH_DEBUGGER
            debugger_.on_context_destroyed(context);
            debugger_.drop();
#endif
            context->SetAlignedPointerInEmbedderData(kContextEmbedderData, nullptr);

            module_cache_.deinit();
            context_.Reset();
        }

        while (!script_classes_.is_empty())
        {
            const ScriptClassID id = script_classes_.get_first_index();
            script_classes_.remove_at_checked(id);
        }

        for (int index = 0; index < Symbols::kNum; ++index)
        {
            symbols_[index].Reset();
        }

        exec_async_calls();
        _on_gc_request();

        // Cleanup all objects by forcibly invoke all callbacks not invoked by v8.
        JSB_LOG(Verbose, "cleanup %d objects", object_db_.size());
        while (void* pointer = object_db_.try_get_first_pointer())
        {
            JSB_LOG(VeryVerbose, " - %s", (uintptr_t) pointer);
            free_object(pointer, FinalizationType::Default /* Force? */);
        }

        variant_allocator_.drain();
        flags_ |= EF_PostDispose;
        EnvironmentStore::get_shared().remove(this);
    }

    void Environment::update(uint64_t p_delta_msecs)
    {
#if JSB_WITH_ESSENTIALS
        if (timer_manager_.tick(p_delta_msecs))
        {
            v8::Isolate::Scope isolate_scope(isolate_);
            v8::HandleScope handle_scope(isolate_);

            //TODO be able to handle the uncaught exceptions in env (instead of being swallowed in the timer invocation).
            //     we need to forward it to onerror (if the current env is the master of a worker)
            if (timer_manager_.invoke_timers(isolate_))
            {
                notify_microtasks_run();
            }
        }
#endif

        // handle messages from workers
        {
            std::vector<Message>& messages = inbox_.swap();
            if (!messages.empty())
            {
                v8::Isolate::Scope isolate_scope(isolate_);
                v8::HandleScope handle_scope(isolate_);
                const v8::Local<v8::Context> context = context_.Get(isolate_);

                for (const Message& message : messages)
                {
                    v8::HandleScope message_handle_scope(isolate_);
                    _on_worker_message(context, message);
                }
                messages.clear();
            }
        }

        exec_async_calls();

        // quickjs delayed the free op after all HandleScope left, we need to swap the free op list manually explicitly.
        // otherwise, object may leak until next evacuation of HandleScope.
#if JSB_WITH_QUICKJS || JSB_WITH_JAVASCRIPTCORE
        isolate_->PerformMicrotaskCheckpoint();
#else
        if (flags_ & EF_MicrotaskCheckpoint)
        {
            flags_ &= ~EF_MicrotaskCheckpoint;
            isolate_->PerformMicrotaskCheckpoint();
        }
#endif

#if JSB_WITH_DEBUGGER
        debugger_.update();
#endif
        variant_allocator_.drain();
    }

    // handle async calls (from InstanceBindingCallbacks)
    void Environment::exec_async_calls()
    {
#if JSB_THREADING
        std::vector<AsyncCall>& calls = async_calls_.swap();
        if (!calls.empty())
        {
            for (const AsyncCall& call : calls)
            {
                exec_async_call(call.type_, call.binding_);
            }
            calls.clear();
        }
#endif
    }

    void Environment::exec_async_call(AsyncCall::Type p_type, void* p_binding)
    {
        switch (p_type)
        {
        case AsyncCall::TYPE_REF:       reference_object(p_binding, true); break;
        case AsyncCall::TYPE_DEREF:     reference_object(p_binding, false); break;
        case AsyncCall::TYPE_GC_FREE:   free_object(p_binding, FinalizationType::Default); break;
        case AsyncCall::TYPE_TRANSFER_:
            {
                //TODO need a better way to control lifetime of TransferData?
                TransferData* transfer_data = (TransferData*) p_binding;
                {
                    v8::Isolate::Scope isolate_scope(isolate_);
                    v8::HandleScope handle_scope(isolate_);
                    const v8::Local<v8::Context> context = context_.Get(isolate_);
                    const v8::Context::Scope context_scope(context);
                    _on_worker_transfer(context, transfer_data);
                }
                memdelete(transfer_data);
            }
            break;
        case AsyncCall::TYPE_GC_REQUEST: _on_gc_request(); break;
        default: jsb_checkf(false, "unknown AsyncCall: %d", p_type); break;
        }
    }

    bool Environment::add_async_call(AsyncCall::Type p_type, void* p_binding)
    {
#if JSB_THREADING
        if (Thread::get_caller_id() != thread_id_)
        {
            async_calls_.add(AsyncCall(p_type, p_binding));
            return true;
        }
#endif
        exec_async_call(p_type, p_binding);
        return true;
    }

    void Environment::_on_worker_transfer(const v8::Local<v8::Context>& p_context, const TransferData* p_data)
    {
        jsb_check(p_data->source_worker_id);
        if (!object_db_.has_object(p_data->source_worker_id))
        {
            JSB_LOG(Error, "invalid worker");
            return;
        }

        //TODO 0. HOW TO HANDLE COMPLICATED SITUATIONS? SUCH AS NESTED OBJECTS?
        jsb_nop();

        transfer_in(*p_data);

        // call 'ontransfer'
        {
            ObjectHandleConstPtr handle = object_db_.try_get_object(p_data->source_worker_id);
            const v8::Local<v8::Object> worker = handle->ref_.Get(isolate_).As<v8::Object>();
            jsb_check(!worker.IsEmpty());
            handle = nullptr;

            v8::Local<v8::Value> transferred_obj;
            if (!TypeConvert::gd_var_to_js(isolate_, p_context, p_data->variant, transferred_obj) || transferred_obj.IsEmpty())
            {
                JSB_LOG(Error, "failed to convert object to JS");
                return;
            }

            v8::Local<v8::Value> callback;
            if (!worker->Get(p_context, jsb_name(this, ontransfer)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_LOG(Error, "ontransfer is not a function");
                return;
            }

            const impl::TryCatch try_catch(isolate_);
            const v8::Local<v8::Function> call = callback.As<v8::Function>();
            const v8::MaybeLocal<v8::Value> rval = call->Call(p_context, v8::Undefined(isolate_), 1, &transferred_obj);
            jsb_unused(rval);
            if (try_catch.has_caught())
            {
                JSB_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
            }
        }
    }

    void _invoke(Environment* p_env, const v8::Local<v8::Context>& p_context, const v8::Local<v8::Function>& p_callback, const Message* p_message)
    {
        v8::Isolate *isolate = p_env->get_isolate();

#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
        v8::Local<v8::Value> value;
        if (p_message)
        {
#if JSB_WITH_V8
            Serialization::VariantDeserializerDelegate delegate(p_env, p_message->get_transfers());
            v8::ValueDeserializer deserializer(isolate, p_message->get_buffer().ptr(), p_message->get_buffer().size(), &delegate);
            delegate.SetSerializer(&deserializer);
#else
            v8::ValueDeserializer deserializer(isolate, p_message->get_buffer().ptr(), p_message->get_buffer().size());
#endif

            bool ok;
            if (!deserializer.ReadHeader(p_context).To(&ok) || !ok)
            {
                JSB_LOG(Error, "failed to parse message header");
                return;
            }

            if (!deserializer.ReadValue(p_context).ToLocal(&value))
            {
                JSB_LOG(Error, "failed to parse message value");
                return;
            }
        }

        const impl::TryCatch try_catch(isolate);
        const v8::MaybeLocal<v8::Value> rval = p_message
            ? p_callback->Call(p_context, v8::Undefined(isolate), 1, &value)
            : p_callback->Call(p_context, v8::Undefined(isolate), 0, nullptr);
        jsb_unused(rval);
        if (try_catch.has_caught())
        {
            JSB_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
        }
#else
        JSB_LOG(Error, "worker message deserializer has not been implemented yet");
#endif
    }

    void Environment::_on_worker_message(const v8::Local<v8::Context>& p_context, const Message& p_message)
    {
        jsb_check(p_message.get_id());
        ObjectHandleConstPtr handle = object_db_.try_get_object(p_message.get_id());
        if (!handle)
        {
            JSB_LOG(Error, "invalid worker");
            return;
        }
        const v8::Local<v8::Object> obj = handle->ref_.Get(isolate_).As<v8::Object>();
        jsb_check(!obj.IsEmpty());
        handle = nullptr;

        v8::Local<v8::Value> callback;
        switch (p_message.get_type())
        {
        case Message::TYPE_MESSAGE:
            if (!obj->Get(p_context, jsb_name(this, onmessage)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_LOG(Error, "onmessage is not a function");
                return;
            }
            _invoke(this, p_context, callback.As<v8::Function>(), &p_message);
            break;
        case Message::TYPE_READY:
            if (!obj->Get(p_context, jsb_name(this, onready)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_LOG(Error, "onready is not a function");
                return;
            }
            _invoke(this, p_context, callback.As<v8::Function>(), nullptr);
            break;
        case Message::TYPE_ERROR:
            if (!obj->Get(p_context, jsb_name(this, onerror)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_LOG(Error, "onerror is not a function");
                return;
            }
            _invoke(this, p_context, callback.As<v8::Function>(), &p_message);
            break;
        default:
            JSB_LOG(Error, "unknown message type %d", p_message.get_type());
            return;
        }
    }

    std::shared_ptr<Environment> Environment::_access(void* p_runtime)
    {
        return EnvironmentStore::get_shared().access(p_runtime);
    }

    std::shared_ptr<Environment> Environment::_access()
    {
        return EnvironmentStore::get_shared().access();
    }

    NativeObjectID Environment::bind_godot_object(NativeClassID p_class_id, Object* p_pointer, const v8::Local<v8::Object>& p_object)
    {
        // handle the shadow instance created by asynchronous ResourceLoader
        if (ScriptInstance* si = p_pointer->get_script_instance(); si && !si->is_placeholder())
        {
            // to ensure the type of the script instance is GodotJSScriptInstanceBase
            if (si->get_language() == GodotJSScriptLanguage::get_singleton())
            {
                GodotJSScriptInstanceBase* script_instance = (GodotJSScriptInstanceBase*) si;
                if (script_instance->is_shadow())
                {
                    // need to strongly reference the owner object if it's RefCounted. we use Variant for simplicity
                    const Variant holder = p_pointer;
                    const Ref<GodotJSScript> script = script_instance->get_script();
                    jsb_check(script.is_valid());
                    JSB_LOG(Verbose, "displace a shadow script instance %s (%s)", (uintptr_t) p_pointer, script->get_path());
                    List<Pair<StringName, Variant>> state;
                    script_instance->get_property_state(state);
                    p_pointer->set_script_instance(nullptr);
                    ScriptInstance* new_script_instance = script->instance_create(p_object, p_pointer, false);
                    jsb_check(new_script_instance);
                    jsb_unused(new_script_instance);
                    for (const Pair<StringName, Variant>& pair : state)
                    {
                        new_script_instance->set(pair.first, pair.second);
                    }
                    const NativeObjectID new_id = try_get_object_id(p_pointer);
                    jsb_check(new_id);
                    return new_id;
                }
            }
        }

        // We need to increase the refcount because Godot Objects are bound as external pointer with a strong JS reference,
        // and unreference() will always be called on gc callbacks.
        int external_rc = 1;
        if (p_pointer->is_ref_counted())
        {
            RefCounted* ref_counted = (RefCounted*) p_pointer;
            if (!ref_counted->init_ref())
            {
                JSB_LOG(Error, "can not bind a dead object %d", (uintptr_t) p_pointer);
                return {};
            }
            // for a ref-counted object which instantiated by GodotJS, the external_rc will be 0.
            // then, the object will behave like a managed JS object.
            // otherwise, it will be strongly referenced in JS until all external references are released (unreference).
            external_rc = ref_counted->get_reference_count() - 1;
        }
        const NativeObjectID object_id = bind_pointer(p_class_id, NativeClassType::GodotObject, (void*) p_pointer, p_object, external_rc);

        p_pointer->get_instance_binding(this, gd_instance_binding_callbacks);
        return object_id;
    }

    NativeObjectID Environment::bind_pointer(NativeClassID p_class_id, NativeClassType::Type p_type, void* p_pointer, const v8::Local<v8::Object>& p_object, int p_external_rc)
    {
        check_internal_state();
        jsb_checkf(native_classes_.is_valid_index(p_class_id), "bad class_id");

        ObjectHandlePtr handle;
        const NativeObjectID object_id = object_db_.add_object(p_pointer, &handle);
        jsb_check(p_object->InternalFieldCount() == IF_ObjectFieldCount);
        jsb_check((uintptr_t) p_type % 2 == 0); // fake 2-byte alignment

        static int indices[]    = { IF_Pointer, IF_ClassType };
        void* internal_fields[] = { p_pointer,  (void*)(uintptr_t) p_type };
        p_object->SetAlignedPointerInInternalFields(IF_ObjectFieldCount, indices, internal_fields);

        handle->class_id = p_class_id;
#if JSB_DEBUG
        handle->pointer = p_pointer;
#endif

        jsb_v8_check(native_classes_.get_value(p_class_id).type == p_type);
        handle->ref_.Reset(isolate_, p_object);
        if (p_external_rc == 0)
        {
            handle->ref_.SetWeak(p_pointer, &object_gc_callback, v8::WeakCallbackType::kInternalFields);
        }
        else
        {
            jsb_check(p_external_rc > 0);
            handle->ref_count_ = p_external_rc;
        }
        JSB_LOG(VeryVerbose, "bind object class:%s(%d) addr:%d id:%d",
            (String) native_classes_.get_value(p_class_id).name, p_class_id,
            (uintptr_t) p_pointer, object_id);
        return object_id;
    }

    void Environment::mark_as_persistent_object(void* p_pointer)
    {
        if (!persistent_objects_.has(p_pointer))
        {
            persistent_objects_.insert(p_pointer);
            reference_object(p_pointer, true);
            return;
        }
        JSB_LOG(Error, "duplicate adding persistent object: %d", (uintptr_t) p_pointer);
    }

    void* Environment::get_verified_object(const v8::Local<v8::Object>& p_obj, NativeClassType::Type p_type) const
    {
        if (!TypeConvert::is_object(p_obj, p_type))
        {
            return nullptr;
        }
        return p_obj->GetAlignedPointerFromInternalField(IF_Pointer);
    }

    bool Environment::reference_object(void* p_pointer, bool p_is_inc)
    {
        check_internal_state();
        const ObjectHandlePtr object_handle = object_db_.try_get_object(p_pointer);
        if (jsb_unlikely(!object_handle))
        {
            JSB_LOG(Verbose, "UNEXPECTED bad pointer %d", (uintptr_t) p_pointer);
            return false;
        }

        // must not be a valuetype object
        // jsb_check(native_classes_.get_value(object_handle->class_id).type != NativeClassType::GodotPrimitive);

        // adding references
        if (p_is_inc)
        {
            if (object_handle->ref_count_ == 0)
            {
                // becomes a strong reference
                jsb_check(!object_handle->ref_.IsEmpty());
                object_handle->ref_.ClearWeak();
            }
            ++object_handle->ref_count_;
            return true;
        }

        // removing references
        jsb_checkf(!object_handle->ref_.IsEmpty(), "removing references on dead values");
        jsb_check(object_handle->ref_count_ > 0);

        --object_handle->ref_count_;
        if (object_handle->ref_count_ == 0)
        {
            object_handle->ref_.SetWeak(p_pointer, &object_gc_callback, v8::WeakCallbackType::kInternalFields);
        }
        return true;
    }

    // jsb_force_inline static void clear_internal_field(v8::Isolate* isolate, const v8::Global<v8::Object>& p_obj)
    // {
    //     v8::HandleScope handle_scope(isolate);
    //     const v8::Local<v8::Object> obj = p_obj.Get(isolate);
    //     obj->SetAlignedPointerInInternalField(IF_Pointer, nullptr);
    // }

    // the only case `free_object` called from background threads is when it's called from InstanceBindingCallbacks::free_callback
    // in this case, the only modified state is object_db_ (p_finalize is FinalizationType::None)
    // ---
    // whether the ObjectHandlePtr lock satisfies the requirement of thread safety is still unknown
    void Environment::free_object(void* p_pointer, FinalizationType p_finalize)
    {
        check_internal_state();
        ObjectHandlePtr object_handle = object_db_.try_get_object(p_pointer);

        // avoid crash in the situation that `InstanceBindingCallbacks::free_callback` is called before JS object gc callback is called,
        // which makes the pointer already erased in `object_gc_callback`
        if (jsb_unlikely(!object_handle))
        {
            return;
        }

#if JSB_DEBUG
        jsb_check(object_handle->pointer == p_pointer);
#endif
        const NativeClassID class_id = object_handle->class_id;
        // hold it in a local variable to avoid gc too early
        v8::Global<v8::Object> obj_ref = std::move(object_handle->ref_);

        //TODO do not clear the internal field if calling from JS GC
        // if (p_finalize != FinalizationType::None)
        // {
        //     //NOTE if we clear the internal field here,
        //     //     only null check is required when reading this value later
        //     //     (like the usage in '_godot_object_method')
        //     clear_internal_field(isolate_, obj_ref);
        // }

        object_handle = nullptr;
        object_db_.remove_object(p_pointer);
        obj_ref.Reset();

        if (p_finalize != FinalizationType::None)
        {
            const NativeClassInfo& class_info = native_classes_.get_value(class_id);
            const bool is_persistent = persistent_objects_.erase(p_pointer);

            JSB_LOG(VeryVerbose, "free_object class:%s(%d) addr:%d",
                (String) class_info.name, class_id,
                (uintptr_t) p_pointer);

            //NOTE Godot will call Object::_predelete to post a notification NOTIFICATION_PREDELETE which finally call `ScriptInstance::callp`
            class_info.finalizer(this, p_pointer, is_persistent ? FinalizationType::None : p_finalize);
        }
        else
        {
            jsb_check(!persistent_objects_.has(p_pointer));
            JSB_LOG(VeryVerbose, "(skip) free_object class_id:%d addr:%d", class_id, (uintptr_t) p_pointer);
        }
    }

    void Environment::start_debugger(uint16_t p_port)
    {
#if JSB_WITH_DEBUGGER
        JSB_HANDLE_SCOPE(isolate_);

        debugger_.init(isolate_, p_port);
        debugger_.on_context_created(context_.Get(isolate_));
#endif
    }

    void Environment::get_statistics(Statistics& r_stats) const
    {
        check_internal_state();
        impl::Helper::get_statistics(isolate_, r_stats.custom_fields);

        r_stats.objects = object_db_.size();
        r_stats.native_classes = native_classes_.size();
        r_stats.script_classes = script_classes_.size();
        r_stats.cached_string_names = string_name_cache_.size();
        r_stats.persistent_objects = persistent_objects_.size();
        r_stats.allocated_variants = variant_allocator_.get_allocated_num();
    }

    ObjectCacheID Environment::get_cached_function(const v8::Local<v8::Function>& p_func)
    {
        v8::Isolate* isolate = get_isolate();
        const auto& it = function_refs_.find(TWeakRef(isolate, p_func));
        if (it != function_refs_.end())
        {
            const ObjectCacheID callback_id = it->second;
            TStrongRef<v8::Function>& strong_ref = function_bank_.get_value(callback_id);
            strong_ref.ref();
            return callback_id;
        }
        const ObjectCacheID new_id = function_bank_.add(TStrongRef(isolate, p_func));
        function_refs_.insert(std::pair(TWeakRef(isolate, p_func), new_id));
        return new_id;
    }

    void Environment::scan_external_changes()
    {
        check_internal_state();
        Vector<StringName> requested_modules;
        for (const KeyValue<StringName, JavaScriptModule*>& kv : module_cache_.modules_)
        {
            JavaScriptModule* module = kv.value;
            // skip script modules which are managed by the godot editor
            if (module->script_class_id) continue;
            if (module->mark_as_reloading())
            {
                requested_modules.append(module->id);
            }
        }

        for (const StringName& id : requested_modules)
        {
            JSB_LOG(Verbose, "changed module check: %s", id);
            load(id);
        }
    }

    ModuleReloadResult::Type Environment::mark_as_reloading(const StringName& p_name)
    {
        check_internal_state();
        if (JavaScriptModule* module = module_cache_.find(p_name))
        {
            jsb_check(!module->source_info.source_filepath.is_empty());
            if (module->is_reloading() || module->mark_as_reloading())
            {
                return ModuleReloadResult::Requested;
            }
            return ModuleReloadResult::NoChanges;
        }
        return ModuleReloadResult::NoSuchModule;
    }

    JavaScriptModule* Environment::_load_module(const String& p_parent_id, const String& p_module_id)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, _load_module);
        JavaScriptModule* resolved_module = module_cache_.find(p_module_id);
        if (resolved_module && !resolved_module->is_reloading())
        {
            return resolved_module;
        }

        v8::Isolate* isolate = this->isolate_;
        v8::Local<v8::Context> context = context_.Get(isolate);

        jsb_check(isolate->GetCurrentContext().IsEmpty() || context == context_.Get(isolate));
        // find loader with the module id
        if (IModuleLoader* loader = this->find_module_loader(p_module_id))
        {
            jsb_checkf(!resolved_module, "module loader does not support reloading");
            JavaScriptModule& module = module_cache_.insert(isolate, context, p_module_id, false, false);

            //NOTE the loader should throw error if failed
            if (!loader->load(this, module))
            {
                return nullptr;
            }

            module.on_load(isolate, context);
            return &module;
        }

        // try resolve the module id
        String normalized_id;
        if (p_module_id.begins_with("./") || p_module_id.begins_with("../"))
        {
            const String combined_id = internal::PathUtil::combine(internal::PathUtil::dirname(p_parent_id), p_module_id);
            if (internal::PathUtil::extract(combined_id, normalized_id) != OK || normalized_id.is_empty())
            {
                jsb_throw(isolate, "bad path");
                return nullptr;
            }
        }
        else
        {
            normalized_id = p_module_id;
        }

        // init source module
        ModuleSourceInfo source_info;
        if (IModuleResolver* resolver = this->find_module_resolver(normalized_id, source_info))
        {
            const StringName module_id = source_info.source_filepath;

            // check again with the resolved module_id
            resolved_module = module_cache_.find(module_id);

            v8::Local<v8::Object> module_obj;

            // supported module properties: id, filename, cache, loaded, exports, children
            if (resolved_module)
            {
                if (resolved_module->is_reloading())
                {
                    jsb_check(resolved_module->id == module_id);
                    jsb_check(resolved_module->source_info.source_filepath == source_info.source_filepath);

                    JSB_LOG(VeryVerbose, "reload module %s", module_id);
                    resolved_module->mark_as_reloaded();
                    if (!resolver->load(this, source_info.source_filepath, *resolved_module))
                    {
                        return nullptr;
                    }
                    ScriptClassInfo::_parse_script_class(context, *resolved_module);
                }

                module_obj = resolved_module->module.Get(isolate);
            }
            else
            {
                JSB_LOG(Verbose, "instantiating module %s", module_id);
                JavaScriptModule& module = module_cache_.insert(isolate, context, module_id, true, false);
                v8::Local<v8::Object> exports_obj = v8::Object::New(isolate);

                // init the new module obj
                module_obj = module.module.Get(isolate);
                module_obj->Set(context, jsb_name(this, children), v8::Array::New(isolate)).Check();
                module_obj->Set(context, jsb_name(this, exports), exports_obj).Check();
                module.source_info = source_info;
                module.exports.Reset(isolate, exports_obj);

                //NOTE the resolver should throw error if failed
                //NOTE module.filename should be set in `resolve.load`
                if (!resolver->load(this, source_info.source_filepath, module))
                {
                    return nullptr;
                }

                module.on_load(isolate, context);
                {
                    const impl::TryCatch try_catch_run(isolate);
                    ScriptClassInfo::_parse_script_class(context, module);
                    if (try_catch_run.has_caught())
                    {
                        JSB_LOG(Error, "something wrong when parsing '%s'\n%s", module_id, BridgeHelper::get_exception(try_catch_run));
                    }
                }

                resolved_module = &module;
            }

            // build the module tree
            if (!p_parent_id.is_empty())
            {
                if (const JavaScriptModule* parent_ptr = module_cache_.find(p_parent_id))
                {
                    const v8::Local<v8::Object> parent_module = parent_ptr->module.Get(isolate);
                    if (v8::Local<v8::Value> temp; parent_module->Get(context, jsb_name(this, children)).ToLocal(&temp) && temp->IsArray())
                    {
                        const v8::Local<v8::Array> children = temp.As<v8::Array>();
                        const uint32_t children_num = children->Length();
                        children->Set(context, children_num, module_obj).Check();
                    }
                    else
                    {
                        JSB_LOG(Error, "can not access children on '%s'", p_parent_id);
                    }
                }
                else
                {
                    JSB_LOG(Warning, "parent module not found with the name '%s'", p_parent_id);
                }
            }

            return resolved_module;
        }

        impl::Helper::throw_error(isolate, jsb_format("unknown module: %s", normalized_id));
        return nullptr;
    }

    NativeObjectID Environment::crossbind(Object* p_this, ScriptClassID p_class_id, const Variant** p_args, int p_argcount)
    {
        this->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        // Can occur at runtime if object.set_script(...) is used, or in the editor due to hot-reloading etc.
        if (const NativeObjectID object_id = this->try_get_object_id(p_this))
        {
            JSB_LOG(Verbose, "crossbinding on previously bound object %d (addr:%d), rebind it to script class %d", object_id, (uintptr_t) p_this, p_class_id);

            //TODO may not work in this way
            _rebind(isolate, context, p_this, p_class_id);
            return object_id;
        }

        StringName js_class_name;
        v8::Local<v8::Object> class_obj;

        {
            const ScriptClassInfoPtr class_info = this->get_script_class(p_class_id);
            js_class_name = class_info->js_class_name;
            class_obj = class_info->js_class.Get(isolate);
            JSB_LOG(VeryVerbose, "crossbind %s %s(%d) %d", class_info->js_class_name, class_info->native_class_name, class_info->native_class_id, (uintptr_t) p_this);
            jsb_check(!class_obj->IsNullOrUndefined());
        }

        v8::Local<v8::Array> arguments = v8::Array::New(isolate, p_argcount);

        for (int index = 0; index < p_argcount; ++index)
        {
            v8::Local<v8::Value> argument;

            if (TypeConvert::gd_var_to_js(isolate, context, *p_args[index], argument))
            {
                arguments->Set(context, index, argument);
            }
            else
            {
                return {};
            }
        }

        const impl::TryCatch try_catch_run(isolate);

        v8::Local<v8::Value> class_prototype = class_obj->Get(context, jsb_name(this, prototype)).ToLocalChecked();
        v8::Local<v8::Function> new_target = impl::Helper::new_noop_constructor(isolate_, context);
        new_target->Set(context, jsb_name(this, prototype), class_prototype).Check();
        new_target->Set(context, jsb_symbol(this, ConstructorBindObject), v8::External::New(isolate, p_this)).Check();

        v8::Local<v8::Object> reflect = context->Global()->Get(context, jsb_name(this, Reflect)).ToLocalChecked().As<v8::Object>();
        v8::Local<v8::Function> reflect_construct = reflect->Get(context, jsb_name(this, construct)).ToLocalChecked().As<v8::Function>();

        v8::Local<v8::Value> reflect_args[] = {
                class_obj,
                arguments,
                new_target
        };

        v8::MaybeLocal<v8::Value> constructed_value = reflect_construct->Call(context, reflect, 3, reflect_args);

        if (try_catch_run.has_caught())
        {
            JSB_LOG(Error, "something went wrong when constructing '%s'\n%s", js_class_name, BridgeHelper::get_exception(try_catch_run));
            return {};
        }

        jsb_check(!constructed_value.IsEmpty());
        v8::Local<v8::Value> instance;
        if (!constructed_value.ToLocal(&instance) || !instance->IsObject())
        {
            JSB_LOG(Error, "bad instance '%s", js_class_name);
            return {};
        }

        return this->try_get_object_id(p_this);
    }

    void Environment::rebind(Object *p_this, ScriptClassID p_class_id)
    {
        //TODO a dirty but approaching solution for hot-reloading
        this->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        _rebind(isolate, context, p_this, p_class_id);
    }

    void Environment::_rebind(v8::Isolate* isolate, const v8::Local<v8::Context> context, Object *p_this, ScriptClassID p_class_id)
    {
        //TODO a dirty but approaching solution for hot-reloading
        v8::Local<v8::Object> instance;
        if (!this->try_get_object(p_this, instance))
        {
            JSB_LOG(Fatal, "bad instance");
            return;
        }

        const ScriptClassInfoPtr class_info = this->get_script_class(p_class_id);
        const StringName class_name = class_info->js_class_name;
        const v8::Local<v8::Object> class_obj = class_info->js_class.Get(isolate);
        const v8::Local<v8::Value> prototype = class_obj->Get(context, jsb_name(this, prototype)).ToLocalChecked();

        const impl::TryCatch try_catch(isolate);
        jsb_check(instance->IsObject());
        jsb_check(prototype->IsObject());
        if (instance->SetPrototype(context, prototype).IsNothing())
        {
            if (try_catch.has_caught())
            {
                JSB_LOG(Warning, "something wrong\n%s", BridgeHelper::get_exception(try_catch));
            }
        }
    }

    void Environment::_execute_class_post_bind(const StringName& p_class_name, const v8::Local<v8::Function>& p_class)
    {
        const JavaScriptModule& typeloader = *this->get_module_cache().find(jsb_string_name(godot_typeloader));
        const v8::Local<v8::Value> typeloader_exports = typeloader.exports.Get(this->get_isolate());
        jsb_check(!typeloader_exports.IsEmpty() && typeloader_exports->IsObject());
        const v8::Local<v8::Context> context = context_.Get(isolate_);
        const v8::Local<v8::Value> post_bind_val = typeloader_exports.As<v8::Object>()->Get(context, jsb_name(this, godot_postbind)).ToLocalChecked();
        jsb_check(!post_bind_val.IsEmpty() && post_bind_val->IsFunction());
        const v8::Local<v8::Function> post_bind = post_bind_val.As<v8::Function>();
        v8::Local<v8::Value> argv[] = { this->get_string_value(p_class_name), p_class };
        v8::MaybeLocal<v8::Value> rval = post_bind->Call(context, v8::Undefined(isolate_), std::size(argv), argv);
        jsb_unused(rval);
        jsb_check(rval.ToLocalChecked()->IsUndefined());
    }

    void Environment::_execute_deferred()
    {
        jsb_check(!_execution_deferred);

        if (deferred_class_post_binds_.is_empty())
        {
            return;
        }

        for (const auto& pair : deferred_class_post_binds_)
        {
            _execute_class_post_bind(pair.first, pair.second);
        }

        deferred_class_post_binds_.clear();
    }

    v8::Local<v8::Function> Environment::_new_require_func(const String& p_module_id, bool p_expose_main)
    {
        const v8::Local<v8::Context> context = context_.Get(isolate_);
        const v8::Local<v8::String> module_id = impl::Helper::new_string(isolate_, p_module_id);
        const v8::Local<v8::Function> require = JSB_NEW_FUNCTION(context, Builtins::_require, /* magic: module_id */ module_id);
        if (p_expose_main)
        {
            if (v8::Local<v8::Object> main_module; _get_main_module(&main_module))
            {
                require->Set(context, jsb_name(this, main), main_module).Check();
            }
            else
            {
                JSB_LOG(Log, "%s: require.main is not set due to main module not available", p_module_id);
                require->Set(context, jsb_name(this, main), v8::Undefined(isolate_)).Check();
            }
        }
        require->Set(context, jsb_name(this, cache), module_cache_.get_cache(isolate_)).Check();
        return require;
    }


    Error Environment::load(const String& p_name, JavaScriptModule** r_module)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, load);
        this->check_internal_state();

#if JSB_WITH_DEBUGGER
        static const auto debugger_connection_pool_duration = std::chrono::milliseconds(50);

        if (wait_for_debugger_)
        {
            JSB_LOG(Log, "Waiting for debugger to be ready...");

            do
            {
                debugger_.update(); // process incoming debugger connections

                std::future_status status = debugger_ready_future_.wait_for(debugger_connection_pool_duration);

                if (status == std::future_status::ready)
                {
                    break;
                }
            } while (wait_for_debugger_);
        }
#endif

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        const impl::TryCatch try_catch_run(isolate);
        JavaScriptModule* module = _load_module("", p_name);
        if (r_module)
        {
            *r_module = module;
        }

        // no exception should be thrown if module loaded successfully
        if (try_catch_run.has_caught())
        {
            JSB_LOG(Warning, "something went wrong on loading '%s'\n%s", p_name, BridgeHelper::get_exception(try_catch_run));
            return ERR_COMPILATION_FAILED;
        }
        return OK;
    }

    NativeClassInfoPtr Environment::expose_class(const StringName& p_type_name, NativeClassID* r_class_id)
    {
        DeferredClassRegister* class_register = class_register_map_.getptr(p_type_name);
        if (jsb_unlikely(!class_register))
        {
            if (r_class_id) *r_class_id = {};
            return nullptr;
        }

        // return cache
        if (class_register->id)
        {
            if (r_class_id) *r_class_id = class_register->id;
            NativeClassInfoPtr class_info = this->get_native_class(class_register->id);
            jsb_check(class_info->name == p_type_name);
            return class_info;
        }

        // bind and cache the class immediately
        {
            const v8::Local<v8::Function> class_ = class_register->register_func(ClassRegister {
                this,
                p_type_name,
                this->isolate_,
                this->context_.Get(this->isolate_),
            }, &class_register->id)->clazz.Get(this->isolate_);
            jsb_check(class_register->id);
            JSB_LOG(VeryVerbose, "register class %s (%d)", (String) p_type_name, class_register->id);
            if (r_class_id) *r_class_id = class_register->id;

            on_class_post_bind(p_type_name, class_);
            return get_native_class(class_register->id);
        }
    }

    NativeClassInfoPtr Environment::expose_godot_object_class(const ClassDB::ClassInfo* p_class_info, NativeClassID* r_class_id)
    {
        if (!p_class_info)
        {
            if (r_class_id) *r_class_id = {};
            return nullptr;
        }

        String class_name = internal::NamingUtil::get_class_name(p_class_info->name);

        if (const NativeClassID* it = godot_classes_index_.getptr(class_name))
        {
            if (r_class_id) *r_class_id = *it;
            NativeClassInfoPtr class_info = native_classes_.get_value_scoped(*it);
            JSB_LOG(VeryVerbose, "return cached native class %s (%d) addr:%s", class_info->name, *it, class_info.ptr());
            jsb_check(internal::NamingUtil::get_class_name(class_info->name) == class_name);
            jsb_check(!class_info->clazz.IsEmpty());
            return class_info;
        }

        NativeClassID class_id;
        const v8::Local<v8::Function> class_ = ObjectReflectBindingUtil::reflect_bind(this, p_class_info, &class_id)->clazz.Get(isolate_);
        jsb_check(class_id);
        if (r_class_id) *r_class_id = class_id;
        on_class_post_bind(class_name, class_);

        return this->get_native_class(class_id);
    }

    void Environment::on_class_post_bind(const StringName& p_class_name, const v8::Local<v8::Function>& p_class)
    {
        if (_execution_deferred)
        {
            deferred_class_post_binds_.push_back({ p_class_name, p_class });
            return;
        }

        _execute_class_post_bind(p_class_name, p_class);
    }

    JSValueMove Environment::eval_source(const char* p_source, int p_length, const String& p_filename, Error& r_err)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, eval_source);
        v8::Isolate::Scope isolate_scope(isolate_);
        v8::HandleScope handle_scope(isolate_);
        const v8::Local<v8::Context> context = context_.Get(isolate_);
        v8::Context::Scope context_scope(context);

        const impl::TryCatch try_catch_run(isolate_);
        const v8::MaybeLocal<v8::Value> maybe = impl::Helper::eval(context, p_source, p_length, p_filename);
        if (try_catch_run.has_caught())
        {
            r_err = ERR_COMPILATION_FAILED;
            JSB_LOG(Error, "failed to eval_source: %s", BridgeHelper::get_exception(try_catch_run));
            return JSValueMove();
        }

        r_err = OK;
        v8::Local<v8::Value> rval;
        if (!maybe.ToLocal(&rval))
        {
            return JSValueMove();
        }
        return JSValueMove(shared_from_this(), rval);
    }

    bool Environment::_get_main_module(v8::Local<v8::Object>* r_main_module) const
    {
        if (const JavaScriptModule* cmain_module = module_cache_.get_main())
        {
            if (r_main_module)
            {
                *r_main_module = cmain_module->module.Get(get_isolate());
            }
            return true;
        }
        return false;
    }

    bool Environment::validate_script(const String &p_path)
    {
        //TODO try to compile?
        return true;
    }

    bool Environment::release_function(ObjectCacheID p_func_id)
    {
        this->check_internal_state();
        if (function_bank_.is_valid_index(p_func_id))
        {
            TStrongRef<v8::Function>& strong_ref = function_bank_.get_value(p_func_id);
            if (strong_ref.unref())
            {
                v8::Isolate* isolate = get_isolate();
                v8::Isolate::Scope isolate_scope(isolate);
                v8::HandleScope handle_scope(isolate);
                if (jsb_likely(!strong_ref.object_.IsEmpty()))
                {
                    const size_t r = function_refs_.erase(TWeakRef(isolate, strong_ref.object_));
                    jsb_unused(r);
                    jsb_check(r != 0);
                }
                else
                {
                    JSB_LOG(Verbose, "(not an error if Environment is disposing) try to release a function which has already been disposed %s", p_func_id);
                }
                function_bank_.remove_at_checked(p_func_id);
            }
            return true;
        }
        return false;
    }

    Variant Environment::_call(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Function>& p_func, const v8::Local<v8::Value>& p_self, const Variant** p_args, int p_argcount, Callable::CallError& r_error)
    {
        using LocalValue = v8::Local<v8::Value>;
        LocalValue* argv = jsb_stackalloc(LocalValue, p_argcount);
        for (int index = 0; index < p_argcount; ++index)
        {
            memnew_placement(&argv[index], LocalValue);
            if (!TypeConvert::gd_var_to_js(isolate, context, *p_args[index], argv[index]))
            {
                // revert constructed values if error occurred
                while (index >= 0) argv[index--].~LocalValue();
                r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
                return {};
            }
        }

        const impl::TryCatch try_catch_run(isolate);
        v8::MaybeLocal<v8::Value> rval = p_func->Call(context, p_self, p_argcount, argv);

        for (int index = 0; index < p_argcount; ++index)
        {
            argv[index].~LocalValue();
        }
        if (try_catch_run.has_caught())
        {
            JSB_LOG(Error, "exception thrown in function:\n%s", BridgeHelper::get_exception(try_catch_run));
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }

        v8::Local<v8::Value> rval_checked;
        if (!rval.ToLocal(&rval_checked))
        {
            return {};
        }

        Variant rvar;
        if (!TypeConvert::js_to_gd_var(isolate, context, rval_checked, rvar))
        {
            //TODO if a function returns a Promise for godot script callbacks (such as _ready), it's safe to return as nothing without error?
            if (!rval_checked->IsPromise())
            {
                JSB_LOG(Error, "failed to translate returned value");
                r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            }
            return {};
        }
        return rvar;
    }

    bool Environment::get_script_property_value(NativeObjectID p_object_id, const ScriptPropertyInfo& p_info, Variant& r_val)
    {
        this->check_internal_state();
        if (!this->object_db_.has_object(p_object_id))
        {
            return false;
        }

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);
        const v8::Local<v8::Object> self = this->get_object(p_object_id);
        const v8::Local<v8::String> name = this->get_string_value(p_info.name);
        v8::Local<v8::Value> value;

        impl::TryCatch try_catch(isolate);
        bool get_result = self->Get(context, name).ToLocal(&value);

        if (try_catch.has_caught())
        {
            JSB_LOG(Error, "Failed to get property '%s' on a %s: %s", p_info.name, p_info.class_name, jsb::BridgeHelper::get_exception(try_catch));
            return false;
        }

        if (!get_result)
        {
            return false;
        }

        if (!TypeConvert::js_to_gd_var(isolate, context, value, p_info.type, r_val))
        {
            JSB_LOG(Error, "Failed to get property '%s' on a %s: Failed to convert result to a Godot type", p_info.name, p_info.class_name);
            return false;
        }
        return true;
    }

    bool Environment::set_script_property_value(NativeObjectID p_object_id, const ScriptPropertyInfo& p_info, const Variant& p_val)
    {
        this->check_internal_state();
        if (!this->object_db_.has_object(p_object_id))
        {
            return false;
        }

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);
        const v8::Local<v8::Object> self = this->get_object(p_object_id);
        const v8::Local<v8::String> name = this->get_string_value(p_info.name);
        v8::Local<v8::Value> value;
        if (!TypeConvert::gd_var_to_js(isolate, context, p_val, p_info.type, value))
        {
            return false;
        }

        impl::TryCatch try_catch(isolate);
        v8::Maybe<bool> set_result = self->Set(context, name, value);

        if (try_catch.has_caught())
        {
            JSB_LOG(Error, "Failed to set property '%s' on a %s: %s", p_info.name, p_info.class_name, jsb::BridgeHelper::get_exception(try_catch));
            return false;
        }

        return set_result.IsJust();
    }

    bool Environment::get_default_property_value(ScriptClassInfo& p_class_info, const StringName& p_name, Variant& r_val)
    {
        evaluate_default_values(p_class_info);
        if (const ScriptPropertyInfo* script_prop = p_class_info.properties.getptr(p_name))
        {
            r_val = script_prop->default_value;
            return true;
        }

        return false;
    }

    void Environment::evaluate_default_values(ScriptClassInfo& p_class_info)
    {
        if (p_class_info.flags & ScriptClassFlags::_Evaluated)
        {
            return;
        }

        check_internal_state();
        p_class_info.flags = (ScriptClassFlags::Type) (p_class_info.flags | ScriptClassFlags::_Evaluated);

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = get_context();
        v8::Context::Scope context_scope(context);

        {
            const v8::Local<v8::Object> class_obj = p_class_info.js_class.Get(isolate);
            const impl::TryCatch try_catch_run(isolate);
            const v8::MaybeLocal<v8::Value> constructed_value = class_obj->CallAsConstructor(context, 0, nullptr);

            if (try_catch_run.has_caught())
            {
                JSB_LOG(Error, "something wrong when constructing '%s'\n%s",
                    p_class_info.js_class_name,
                    BridgeHelper::get_exception(try_catch_run));
                return;
            }

            v8::Local<v8::Value> instance;
            if (!constructed_value.ToLocal(&instance) || !instance->IsObject())
            {
                JSB_LOG(Error, "bad instance '%s", p_class_info.js_class_name);
                return;
            }

            const v8::Local<v8::Object> class_default_object = instance.As<v8::Object>();

            // read from the class default object
            for (auto& prop_kv : p_class_info.properties)
            {
                v8::Local<v8::Value> value;
                const ScriptPropertyInfo& prop_info = prop_kv.value;

                // try read default value from CDO.
                // pretend nothing's wrong if failed by constructing a default value in-place
                if (!class_default_object->Get(context, get_string_value(prop_kv.key)).ToLocal(&value)
                    || !TypeConvert::js_to_gd_var(isolate, context, value, prop_info.type, prop_kv.value.default_value))
                {
                    JSB_LOG(Warning, "failed to get/translate default value of '%s' from CDO", prop_kv.key);
                    ::jsb::internal::VariantUtil::construct_variant(prop_kv.value.default_value, prop_info.type);
                }
            }

            Object* pointer = (Object*) get_verified_object(class_default_object, NativeClassType::GodotObject);

            if (!pointer)
            {
                JSB_LOG(Error, "failed to obtain reference to instantiated '%s' default object", p_class_info.js_class_name);
                return;
            }

            memdelete(pointer);
        }
    }

    void Environment::call_script_prelude(ScriptClassID p_script_class_id, NativeObjectID p_object_id)
    {
        this->check_internal_state();
        jsb_check(p_object_id);
        jsb_checkf(ClassDB::is_parent_class(this->get_script_class(p_script_class_id)->native_class_name, jsb_string_name(Node)), "only Node has a prelude call");

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);
        const v8::Local<v8::Object> self = this->get_object(p_object_id);

        Variant unpacked;
        if (!TypeConvert::js_to_gd_var(isolate, context, self, Variant::OBJECT, unpacked) || unpacked.is_null())
        {
            JSB_LOG(Error, "failed to access 'this'");
            return;
        }

        // handle all @onready properties
        v8::Local<v8::Value> val_test;
        if (self->Get(context, jsb_symbol(this, ClassImplicitReadyFuncs)).ToLocal(&val_test) && val_test->IsArray())
        {
            const v8::Local<v8::Array> collection = val_test.As<v8::Array>();
            const uint32_t len = collection->Length();
            const Node* node = (Node*)(Object*) unpacked;

            for (uint32_t index = 0; index < len; ++index)
            {
                const v8::Local<v8::Object> element = collection->Get(context, index).ToLocalChecked().As<v8::Object>();
                const v8::Local<v8::String> element_name = element->Get(context, jsb_name(this, name)).ToLocalChecked().As<v8::String>();
                v8::Local<v8::Value> element_value = element->Get(context, jsb_name(this, evaluator)).ToLocalChecked();

                if (element_value->IsString())
                {
                    const String node_path_str = impl::Helper::to_string(isolate, element_value);
                    Node* child_node = node->get_node(node_path_str);
                    if (!child_node)
                    {
                        self->Set(context, element_name, v8::Null(isolate)).Check();
                        return;
                    }
                    v8::Local<v8::Object> child_object;
                    if (!TypeConvert::gd_obj_to_js(isolate, context, child_node, child_object))
                    {
                        JSB_LOG(Error, "failed to evaluate onready value for %s", node_path_str);
                        return;
                    }
                    self->Set(context, element_name, child_object).Check();
                }
                else if (element_value->IsFunction())
                {
                    v8::Local<v8::Value> argv[] = { self };
                    const impl::TryCatch try_catch_run(isolate);
                    v8::MaybeLocal<v8::Value> result = element_value.As<v8::Function>()->Call(context, self, std::size(argv), argv);
                    if (try_catch_run.has_caught())
                    {
                        JSB_LOG(Warning, "something wrong when evaluating onready '%s'\n%s",
                            impl::Helper::to_string(isolate, element_name),
                            BridgeHelper::get_exception(try_catch_run));
                        return;
                    }

                    v8::Maybe<bool> assignment = result.IsEmpty()
                        ? self->Set(context, element_name, v8::Local<v8::Value>(v8::Undefined(isolate)))
                        : self->Set(context, element_name, result.ToLocalChecked());
                    if (try_catch_run.has_caught())
                    {
                        JSB_LOG(Warning, "something wrong assigning onready result to '%s'\n%s",
                            impl::Helper::to_string(isolate, element_name),
                            BridgeHelper::get_exception(try_catch_run));
                        return;
                    }
                    if (assignment.IsNothing())
                    {
                        JSB_LOG(Warning, "failed to assign onready result to '%s'\n%s",
                            impl::Helper::to_string(isolate, element_name));
                        return;
                    }
                }
            }
        }
    }

    Variant Environment::call_script_method(ScriptClassID p_script_class_id, NativeObjectID p_object_id, const StringName& p_method, const Variant** p_argv, int p_argc, Callable::CallError& r_error)
    {
        // static calls are not supported
        if (!p_object_id) return {};
        if (!is_caller_thread())
        {
            JSB_LOG(Error, "can not call script method from a different thread");
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);

        ScriptClassInfoPtr script_class_info = script_classes_.get_value_scoped(p_script_class_id);
        const internal::TypeGen<StringName, v8::Global<v8::Function>>::UnorderedMapIt it = script_class_info->method_cache.find(p_method);
        v8::Local<v8::Function> method_func;
        if (it == script_class_info->method_cache.end())
        {
            const v8::Local<v8::Object> class_obj = script_class_info->js_class.Get(isolate);
            const v8::Local<v8::Value> prototype = class_obj->Get(context, jsb_name(this, prototype)).ToLocalChecked();
            jsb_check(prototype->IsObject());
            v8::Local<v8::Value> method;
            String exposed_name = p_method;

            if (exposed_name.begins_with("_"))
            {
                exposed_name = internal::NamingUtil::get_member_name(exposed_name);
            }

            if (prototype.As<v8::Object>()->Get(context, this->get_string_value(exposed_name)).ToLocal(&method) && method->IsFunction())
            {
                method_func = method.As<v8::Function>();
                script_class_info->method_cache[p_method] = v8::Global<v8::Function>(isolate_, method_func);
            }
            else
            {
                script_class_info->method_cache[p_method] = v8::Global<v8::Function>();
                JSB_LOG(Verbose, "method not found %s.%s (%s)", script_class_info->js_class_name, exposed_name, script_class_info->module_id);
            }
        }
        else
        {
            if (!it->second.IsEmpty()) method_func = it->second.Get(isolate);
        }
        script_class_info = nullptr;

        v8::Local<v8::Object> self;
        if (!this->try_get_object(p_object_id, self))
        {
            JSB_LOG(Error, "invalid `this` for calling function");
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }

        if (p_method == SceneStringNames::get_singleton()->_ready)
        {
            call_script_prelude(p_script_class_id, p_object_id);
        }

        if (method_func.IsEmpty())
        {
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }
        return _call(isolate, context, method_func, self, p_argv, p_argc, r_error);
    }

    Variant Environment::call_function(void* p_pointer, ObjectCacheID p_func_id, const Variant** p_args, int p_argcount, Callable::CallError& r_error)
    {
        this->check_internal_state();
        if (!function_bank_.is_valid_index(p_func_id))
        {
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);

        if (p_pointer)
        {
            v8::Local<v8::Object> self;

            // if object_id is nonzero but can't be found in `objects_` registry, it usually means that this invocation originally triggered by JS GC.
            // the JS Object is disposed before the Godot Object, but Godot will post notifications (like NOTIFICATION_PREDELETE) to script instances.
            if (!this->try_get_object(p_pointer, self))
            {
                JSB_LOG(Error, "invalid `this` for calling function");
                r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
                return {};
            }
            const TStrongRef<v8::Function>& js_func = function_bank_.get_value(p_func_id);
            jsb_check(js_func);
            return _call(isolate, context, js_func.object_.Get(isolate), self, p_args, p_argcount, r_error);
        }

        // if pointer is nullptr, we just call the func with `this` as undefined (a dead object),
        // let JS throw an error if the function is actually not expected to be called without `this`
        const TStrongRef<v8::Function>& js_func = function_bank_.get_value(p_func_id);
        jsb_check(js_func);
        return _call(isolate, context, js_func.object_.Get(isolate), v8::Undefined(isolate), p_args, p_argcount, r_error);
    }

    void Environment::transfer_out(NativeObjectID p_worker_handle_id, int transfer_index, const Variant& p_variant, TransferData& r_transfer_data)
    {
        r_transfer_data.source_worker_id = p_worker_handle_id;
        r_transfer_data.transfer_index = transfer_index;

        if (p_variant.get_type() == Variant::OBJECT)
        {
            Object* obj = p_variant;
            jsb_check(obj && object_db_.has_object(obj) && jsb::compat::ObjectDB::get_instance(p_variant));

            if (ScriptInstance* script_instance = obj->get_script_instance())
            {
                jsb_check(script_instance);
                const Ref script = script_instance->get_script();
                jsb_check(script.is_valid());

                script_instance->get_property_state(r_transfer_data.state);
                r_transfer_data.script_path = script->get_path();

                obj->set_script_instance(nullptr);
            }

            free_object(obj, FinalizationType::None);
        }

        // For now, we don't do anything special with variants since Godot's variant types are thread safe and use
        // copy-on-write semantics. Technically, it may be advantageous for us to (in future?) clear the variant in the
        // source environment since Godot has optimizations in place that will skip reallocation of the underlying data
        // upon mutation if there's a single reference to that data.

        r_transfer_data.variant = p_variant;
    }

    void Environment::transfer_in(const TransferData& p_data)
    {
        if (p_data.variant.get_type() == Variant::Type::OBJECT)
        {
            const ObjectID object_id = p_data.variant;
            Object* instance = jsb::compat::ObjectDB::get_instance(object_id);

            if (!instance)
            {
                JSB_LOG(Error, "transferred object not found: %d", (uint64_t) object_id);
                return;
            }

            // restore the object state if it's a GodotJSScript
            if (!p_data.script_path.is_empty())
            {
                // 1. create a script and script instance
                // 2. attach the script & script instance to the object
                const Ref<GodotJSScript> script = ResourceLoader::load(p_data.script_path);
                jsb_check(script.is_valid());
                jsb_unused(script->can_instantiate());
                ScriptInstance* script_instance = script->instance_construct(instance, false);
                jsb_check(script_instance);

                // 3. restore the object state
                for (const Pair<StringName, Variant>& pair : p_data.state)
                {
                    script_instance->set(pair.first, pair.second);
                }
            }
        }
    }

    void Environment::transfer_to_host(Environment* p_from, Environment* p_to, NativeObjectID p_worker_handle_id, const Variant& p_variant)
    {
        if (p_variant.get_type() == Variant::OBJECT)
        {
            TransferData* transfer_data = memnew(TransferData);
            p_from->transfer_out(p_worker_handle_id, 0, p_variant, *transfer_data);
            p_to->add_async_call(AsyncCall::TYPE_TRANSFER_, transfer_data);
        }
        else
        {
            p_to->add_async_call(AsyncCall::TYPE_TRANSFER_, memnew(TransferData(p_worker_handle_id, 0, p_variant)));
        }
    }

    void Environment::_on_gc_request()
    {
        string_name_cache_.shrink();
        source_map_cache_.clear();

#if JSB_EXPOSE_GC_FOR_TESTING
        isolate_->RequestGarbageCollectionForTesting(v8::Isolate::kFullGarbageCollection);
#else
        isolate_->LowMemoryNotification();
#endif
    }

    void Environment::gc()
    {
        const auto list = EnvironmentStore::get_shared().get_list();
        for (auto& it : list)
        {
            // skip environments that are about to be disposed or already disposed
            if (it->flags_ & EF_PreDispose) continue;

            it->add_async_call(AsyncCall::TYPE_GC_REQUEST, nullptr);
        }
    }

    AsyncModuleManager& Environment::get_async_module_manager()
    {
        check_internal_state();
        if (!async_module_manager_)
        {
            async_module_manager_ = memnew(AsyncModuleManager);
        }
        return *async_module_manager_;
    }

}
