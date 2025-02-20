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

#include "editor/editor_settings.h"
#include "main/performance.h"

//TODO remove this
#include "../weaver/jsb_script.h"

#if !JSB_WITH_STATIC_BINDINGS
#include "jsb_primitive_bindings_reflect.h"
#define register_primitive_bindings(param) register_primitive_bindings_reflect(param)
#else
#include "jsb_primitive_bindings_static.h"
#define register_primitive_bindings(param) register_primitive_bindings_static(param)
#endif

namespace jsb
{
    struct TransferObjectData : TransferData
    {
        NativeObjectID worker_id;
        Variant target;
        String script_path;
        List<Pair<StringName, Variant>> state;

        TransferObjectData(NativeObjectID p_worker_id, const Variant& p_target, const String& p_script_path, const List<Pair<StringName, Variant>>& p_state)
            : worker_id(p_worker_id), target(p_target), script_path(p_script_path), state(p_state)
        {}

        virtual ~TransferObjectData() override = default;
    };

    struct EnvironmentStore
    {
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

        std::shared_ptr<Environment> access()
        {
            std::shared_ptr<Environment> rval;
            lock_.lock();
            for (void* ptr : all_runtimes_)
            {
                //TODO check if it's not removed from `all_runtimes_` but being destructed already (consider remove it from the list immediately on destructor called)
                Environment* env = (Environment*) ptr;
                if (env->is_caller_thread())
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
                    env->add_async_call(Environment::AsyncCall::TYPE_FREE, p_binding);
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

        isolate_ = v8::Isolate::New(create_params);
        isolate_->SetData(kIsolateEmbedderData, this);
        isolate_->SetPromiseRejectCallback(PromiseRejectCallback_);
#if JSB_PRINT_GC_TIME
        isolate_->AddGCPrologueCallback(&OnPreGCCallback);
        isolate_->AddGCEpilogueCallback(&OnPostGCCallback);
#endif
        {
            v8::HandleScope handle_scope(isolate_);
            for (int index = 0; index < Symbols::kNum; ++index)
            {
                symbols_[index].Reset(isolate_, v8::Symbol::New(isolate_));
            }
        }

        native_classes_.reserve(p_params.initial_class_slots);
        script_classes_.reserve(p_params.initial_script_slots);

        module_loaders_.insert("godot", memnew(GodotModuleLoader));
        module_loaders_.insert("godot-jsb", memnew(BridgeModuleLoader));
        EnvironmentStore::get_shared().add(this);

        // create context
        {
            JSB_BENCHMARK_SCOPE(JSRealm, Construct);

            v8::Isolate::Scope isolate_scope(isolate_);
            v8::HandleScope handle_scope(isolate_);

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

#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
            Worker::register_(context, global);
#endif
            Essentials::register_(context, global);
            register_primitive_bindings(this);
        }

        //TODO call `start_debugger` at different stages for Editor/Game Runtimes.
        start_debugger(p_params.debugger_port);
    }

    Environment::~Environment()
    {
        JSB_LOG(Verbose, "destructing Environment");
#if JSB_WITH_ESSENTIALS
        timer_tags_.tags.clear();
        timer_manager_.clear_all();
#endif

        for (IModuleResolver* resolver : module_resolvers_)
        {
            memdelete(resolver);
        }
        module_resolvers_.clear();

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
    }

    void Environment::init()
    {
        jsb::DefaultModuleResolver& resolver = this->add_module_resolver<jsb::DefaultModuleResolver>()
            .add_search_path(jsb::internal::Settings::get_jsb_out_res_path()) // default path of js source (results of compiled ts, at '.godot/GodotJS' by default)
            .add_search_path("res://") // use the root directory as custom lib path by default
            .add_search_path("res://node_modules") // so far, it's only for editor scripting
        ;

        for (const String& path : jsb::internal::Settings::get_additional_search_paths())
        {
            resolver.add_search_path(path);
        }

        // load internal scripts (jsb.core, jsb.editor.main, jsb.editor.codegen)
        static constexpr char kRuntimeBundleFile[] = "jsb.runtime.bundle.js";
        jsb_ensuref(AMDModuleLoader::load_source(this, kRuntimeBundleFile, GodotJSProjectPreset::get_source_rt) == OK,
            "the embedded '%s' not found, run 'scons' again to refresh all *.gen.cpp sources", kRuntimeBundleFile);
#ifdef TOOLS_ENABLED
        static constexpr char kEditorBundleFile[] = "jsb.editor.bundle.js";
        jsb_ensuref(AMDModuleLoader::load_source(this, kEditorBundleFile, GodotJSProjectPreset::get_source_ed) == OK,
            "the embedded '%s' not found, run 'scons' again to refresh all *.gen.cpp sources", kEditorBundleFile);
#endif

    }

    void Environment::dispose()
    {
        JSB_LOG(Verbose, "disposing Environment");
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
        gc();

        // Cleanup all objects by forcibly invoke all callbacks not invoked by v8.
        JSB_LOG(Verbose, "cleanup %d objects", object_db_.size());
        while (void* pointer = object_db_.try_get_first_pointer())
        {
            JSB_LOG(VeryVerbose, " - %s", (uintptr_t) pointer);
            free_object(pointer, FinalizationType::Default /* Force? */);
        }

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
                microtasks_run_ = true;
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
        if (microtasks_run_)
        {
            microtasks_run_ = false;
            isolate_->PerformMicrotaskCheckpoint();
        }
#endif

#if JSB_WITH_DEBUGGER
        debugger_.update();
#endif
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
        case AsyncCall::TYPE_FREE:      free_object(p_binding, FinalizationType::None); break;
        case AsyncCall::TYPE_GC:        free_object(p_binding, FinalizationType::Default); break;
        case AsyncCall::TYPE_TRANSFER_:
            {
                //TODO need a better way to control lifetime of TransferObjectData?
                TransferObjectData* transfer_data = (TransferObjectData*) p_binding;
                {
                    v8::Isolate::Scope isolate_scope(isolate_);
                    v8::HandleScope handle_scope(isolate_);
                    const v8::Local<v8::Context> context = context_.Get(isolate_);
                    _on_worker_transfer(context, transfer_data);
                }
                memdelete(transfer_data);
            }
            break;
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

    void Environment::_on_worker_transfer(const v8::Local<v8::Context>& p_context, const TransferObjectData* p_data)
    {
        jsb_check(p_data->worker_id);
        if (!object_db_.has_object(p_data->worker_id))
        {
            JSB_LOG(Error, "invalid worker");
            return;
        }

        //TODO 0. HOW TO HANDLE COMPLICATED SITUATIONS? SUCH AS NESTED OBJECTS?
        jsb_nop();

        if (p_data->target.get_type() == Variant::Type::OBJECT)
        {
            const ObjectID target_id = p_data->target;
            Object* instance = ::ObjectDB::get_instance(target_id);
            if (!instance)
            {
                JSB_LOG(Error, "transferred object not found: %d", (uint64_t) target_id);
                return;
            }

            // restore the object state if it's a GodotJSScript
            if (!p_data->script_path.is_empty())
            {
                // 1. create a script and script instance
                // 2. attach the script & script instance to the object
                const Ref<GodotJSScript> script = ResourceLoader::load(p_data->script_path, "", ResourceFormatLoader::CACHE_MODE_IGNORE_DEEP);
                jsb_check(script.is_valid());
                jsb_unused(script->can_instantiate());
                ScriptInstance* script_instance = script->instance_create(instance);
                jsb_check(script_instance);

                // 3. restore the object state
                for (const Pair<StringName, Variant>& pair : p_data->state)
                {
                    script_instance->set(pair.first, pair.second);
                }
            }
        }

        // call 'ontransfer'
        {
            ObjectHandleConstPtr handle = object_db_.try_get_object(p_data->worker_id);
            const v8::Local<v8::Object> worker = handle->ref_.Get(isolate_).As<v8::Object>();
            jsb_check(!worker.IsEmpty());
            handle = nullptr;

            v8::Local<v8::Value> transferred_obj;
            if (!TypeConvert::gd_var_to_js(isolate_, p_context, p_data->target, transferred_obj) || transferred_obj.IsEmpty())
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

    void _invoke(v8::Isolate* p_isolate, const v8::Local<v8::Context>& p_context, const v8::Local<v8::Function>& p_callback, const Message* p_message)
    {
        v8::Local<v8::Value> value;
        if (p_message)
        {
            v8::ValueDeserializer deserializer(p_isolate, p_message->get_buffer().ptr(), p_message->get_buffer().size());
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

        const impl::TryCatch try_catch(p_isolate);
        const v8::MaybeLocal<v8::Value> rval = p_message
            ? p_callback->Call(p_context, v8::Undefined(p_isolate), 1, &value)
            : p_callback->Call(p_context, v8::Undefined(p_isolate), 0, nullptr);
        jsb_unused(rval);
        if (try_catch.has_caught())
        {
            JSB_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
        }
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
            _invoke(isolate_, p_context, callback.As<v8::Function>(), &p_message);
            break;
        case Message::TYPE_READY:
            if (!obj->Get(p_context, jsb_name(this, onready)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_LOG(Error, "onready is not a function");
                return;
            }
            _invoke(isolate_, p_context, callback.As<v8::Function>(), nullptr);
            break;
        case Message::TYPE_ERROR:
            if (!obj->Get(p_context, jsb_name(this, onerror)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_LOG(Error, "onerror is not a function");
                return;
            }
            _invoke(isolate_, p_context, callback.As<v8::Function>(), &p_message);
            break;
        default:
            JSB_LOG(Error, "unknown message type %d", p_message.get_type());
            return;
        }
    }

    void Environment::gc()
    {
        check_internal_state();
        string_name_cache_.clear();
        _source_map_cache.clear();

#if JSB_EXPOSE_GC_FOR_TESTING
        isolate_->RequestGarbageCollectionForTesting(v8::Isolate::kFullGarbageCollection);
#else
        isolate_->LowMemoryNotification();
#endif
    }

    void Environment::set_battery_save_mode(bool p_enabled)
    {
        isolate_->SetBatterySaverMode(p_enabled);
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
        jsb_checkf(Thread::get_caller_id() == thread_id_, "multi-threaded call not supported yet");
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
        if (!TypeConvert::is_object(p_obj, p_type)
            || (NativeClassType::Type) (uintptr_t) p_obj->GetAlignedPointerFromInternalField(IF_ClassType) != p_type)
        {
            return nullptr;
        }
        return p_obj->GetAlignedPointerFromInternalField(IF_Pointer);
    }

    bool Environment::reference_object(void* p_pointer, bool p_is_inc)
    {
        jsb_check(Thread::get_caller_id() == thread_id_);
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
    // in this case, the only modified state is object_db_ (p_finalize is false)
    // ---
    // whether the ObjectHandlePtr lock satisfies the requirement of thread safety is still unknown
    void Environment::free_object(void* p_pointer, FinalizationType p_finalize)
    {
        jsb_check(Thread::get_caller_id() == thread_id_);
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
            if (!module->is_loaded() || module->mark_as_reloading())
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
        JavaScriptModule* existing_module = module_cache_.find(p_module_id);
        if (existing_module && existing_module->is_loaded())
        {
            return existing_module;
        }

        v8::Isolate* isolate = this->isolate_;
        v8::Local<v8::Context> context = context_.Get(isolate);

        jsb_check(isolate->GetCurrentContext().IsEmpty() || context == context_.Get(isolate));
        // find loader with the module id
        if (IModuleLoader* loader = this->find_module_loader(p_module_id))
        {
            jsb_checkf(!existing_module, "module loader does not support reloading");
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
            const StringName& module_id = source_info.source_filepath;

            // check again with the resolved module_id
            existing_module = module_cache_.find(module_id);
            if (existing_module && existing_module->is_loaded())
            {
                return existing_module;
            }

            // supported module properties: id, filename, cache, loaded, exports, children
            if (existing_module)
            {
                jsb_check(existing_module->id == module_id);
                jsb_check(existing_module->source_info.source_filepath == source_info.source_filepath);

                JSB_LOG(VeryVerbose, "reload module %s", module_id);
                existing_module->mark_as_reloaded();
                if (!resolver->load(this, source_info.source_filepath, *existing_module))
                {
                    return nullptr;
                }
                ScriptClassInfo::_parse_script_class(context, *existing_module);
                return existing_module;
            }
            else
            {
                JSB_LOG(Verbose, "instantiating module %s", module_id);
                JavaScriptModule& module = module_cache_.insert(isolate, context, module_id, true, false);
                v8::Local<v8::Object> exports_obj = v8::Object::New(isolate);
                v8::Local<v8::Object> module_obj = module.module.Get(isolate);

                // init the new module obj
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

                module.on_load(isolate, context);
                {
                    const impl::TryCatch try_catch_run(isolate);
                    ScriptClassInfo::_parse_script_class(context, module);
                    if (try_catch_run.has_caught())
                    {
                        JSB_LOG(Error, "something wrong when parsing '%s'\n%s", module_id, BridgeHelper::get_exception(try_catch_run));
                    }
                }
                return &module;
            }
        }

        impl::Helper::throw_error(isolate, jsb_format("unknown module: %s", normalized_id));
        return nullptr;
    }

    NativeObjectID Environment::crossbind(Object* p_this, ScriptClassID p_class_id)
    {
        this->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        // In Editor, the script can be attached to an Object after it created in JS (e.g. 'enter_tree' as a child node of a script attached parent node)
        if (const NativeObjectID object_id = this->try_get_object_id(p_this))
        {
            JSB_LOG(Verbose, "crossbinding on a binded object %d (addr:%d), rebind it to script class %d", object_id, (uintptr_t) p_this, p_class_id);

            //TODO may not work in this way
            _rebind(isolate, context, p_this, p_class_id);
            return object_id;
        }

        StringName js_class_name;
        NativeClassID native_class_id;
        v8::Local<v8::Object> class_obj;

        {
            const ScriptClassInfoPtr class_info = this->get_script_class(p_class_id);
            js_class_name = class_info->js_class_name;
            native_class_id = class_info->native_class_id;
            class_obj = class_info->js_class.Get(isolate);
            JSB_LOG(VeryVerbose, "crossbind %s %s(%d) %d", class_info->js_class_name, class_info->native_class_name, class_info->native_class_id, (uintptr_t) p_this);
            jsb_check(!class_obj->IsNullOrUndefined());
        }

        const impl::TryCatch try_catch_run(isolate);
        v8::Local<v8::Value> identifier = jsb_symbol(this, CrossBind);
        const v8::MaybeLocal<v8::Value> constructed_value = class_obj->CallAsConstructor(context, 1, &identifier);
        if (try_catch_run.has_caught())
        {
            JSB_LOG(Error, "something wrong when constructing '%s'\n%s", js_class_name, BridgeHelper::get_exception(try_catch_run));
            return {};
        }

        jsb_check(!constructed_value.IsEmpty());
        v8::Local<v8::Value> instance;
        if (!constructed_value.ToLocal(&instance) || !instance->IsObject())
        {
            JSB_LOG(Error, "bad instance '%s", js_class_name);
            return {};
        }
        const NativeObjectID object_id = this->bind_godot_object(native_class_id, p_this, instance.As<v8::Object>());
        return object_id;
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

    v8::Local<v8::Function> Environment::_new_require_func(const String &p_module_id)
    {
        const v8::Local<v8::Context> context = context_.Get(isolate_);
        const v8::Local<v8::String> module_id = impl::Helper::new_string(isolate_, p_module_id);
        const v8::Local<v8::Function> require = JSB_NEW_FUNCTION(context, Builtins::_require, /* magic: module_id */ module_id);
        if (v8::Local<v8::Object> main_module; _get_main_module(&main_module))
        {
            require->Set(context, jsb_name(this, main), main_module).Check();
        }
        else
        {
            JSB_LOG(Log, "%s: require.main is not set due to main module not available", p_module_id);
            require->Set(context, jsb_name(this, main), v8::Undefined(isolate_)).Check();
        }
        require->Set(context, jsb_name(this, cache), module_cache_.get_cache(isolate_)).Check();
        return require;
    }


    Error Environment::load(const String& p_name, JavaScriptModule** r_module)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, load);
        this->check_internal_state();
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
            NativeClassInfoPtr class_info = class_register->register_func(ClassRegister {
                this,
                p_type_name,
                this->isolate_,
                this->context_.Get(this->isolate_),
            }, &class_register->id);
            jsb_check(class_register->id);
            JSB_LOG(VeryVerbose, "register class %s (%d)", (String) p_type_name, class_register->id);
            if (r_class_id) *r_class_id = class_register->id;

            on_class_post_bind(class_info);
            return class_info;
        }
    }

    NativeClassInfoPtr Environment::expose_godot_object_class(const ClassDB::ClassInfo* p_class_info, NativeClassID* r_class_id)
    {
        if (!p_class_info)
        {
            if (r_class_id) *r_class_id = {};
            return nullptr;
        }

        if (const NativeClassID* it = godot_classes_index_.getptr(p_class_info->name))
        {
            if (r_class_id) *r_class_id = *it;
            NativeClassInfoPtr class_info = native_classes_.get_value_scoped(*it);
            JSB_LOG(VeryVerbose, "return cached native class %s (%d) addr:%s", class_info->name, *it, class_info.ptr());
            jsb_check(class_info->name == p_class_info->name);
            jsb_check(!class_info->clazz.IsEmpty());
            return class_info;
        }

        NativeClassInfoPtr class_ = ObjectReflectBindingUtil::reflect_bind(this, p_class_info, r_class_id);

        on_class_post_bind(class_);
        return class_;
    }

    void Environment::on_class_post_bind(const NativeClassInfoPtr& p_class_info)
    {
        const JavaScriptModule& typeloader = *this->get_module_cache().find(jsb_string_name(godot_typeloader));
        const v8::Local<v8::Value> typeloader_exports = typeloader.exports.Get(this->get_isolate());
        jsb_check(!typeloader_exports.IsEmpty() && typeloader_exports->IsObject());
        const v8::Local<v8::Context> context = context_.Get(isolate_);
        const v8::Local<v8::Value> post_bind_val = typeloader_exports.As<v8::Object>()->Get(context, jsb_name(this, godot_postbind)).ToLocalChecked();
        jsb_check(!post_bind_val.IsEmpty() && post_bind_val->IsFunction());
        const v8::Local<v8::Function> post_bind = post_bind_val.As<v8::Function>();
        v8::Local<v8::Value> argv[] = { this->get_string_value(p_class_info->name), p_class_info->clazz.Get(isolate_) };
        v8::MaybeLocal<v8::Value> rval = post_bind->Call(context, v8::Undefined(isolate_), std::size(argv), argv);
        jsb_unused(rval);
        jsb_check(rval.ToLocalChecked()->IsUndefined());
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
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);
        const v8::Local<v8::Object> self = this->get_object(p_object_id);
        const v8::Local<v8::String> name = this->get_string_value(p_info.name);
        v8::Local<v8::Value> value;
        if (!self->Get(context, name).ToLocal(&value))
        {
            return false;
        }
        if (!TypeConvert::js_to_gd_var(isolate, context, value, p_info.type, r_val))
        {
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

        self->Set(context, name, value).Check();
        return true;
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
            v8::Local<v8::Value> identifier = jsb_symbol(this, CDO);
            const v8::Local<v8::Object> class_obj = p_class_info.js_class.Get(isolate);
            const impl::TryCatch try_catch_run(isolate);
            const v8::MaybeLocal<v8::Value> constructed_value = class_obj->CallAsConstructor(context, 1, &identifier);

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
                    jsb_not_implemented(true, "function evaluator not implemented yet");
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
                    if (!result.IsEmpty())
                    {
                        self->Set(context, element_name, result.ToLocalChecked()).Check();
                    }
                }
            }
        }
    }

    Variant Environment::call_script_method(ScriptClassID p_script_class_id, NativeObjectID p_object_id, const StringName& p_method, const Variant** p_argv, int p_argc, Callable::CallError& r_error)
    {
        // static calls are not supported
        if (!p_object_id) return {};

        this->check_internal_state();
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
            if (prototype.As<v8::Object>()->Get(context, this->get_string_value(p_method)).ToLocal(&method) && method->IsFunction())
            {
                method_func = method.As<v8::Function>();
                script_class_info->method_cache[p_method] = v8::Global<v8::Function>(isolate_, method_func);
            }
            else
            {
                script_class_info->method_cache[p_method] = v8::Global<v8::Function>();
                JSB_LOG(Verbose, "method not found %s.%s (%s)", script_class_info->js_class_name, p_method, script_class_info->module_id);
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

    void Environment::transfer_object(Environment* p_from, Environment* p_to, NativeObjectID p_worker_handle_id, const Variant& p_target)
    {
        if (p_target.get_type() == Variant::OBJECT)
        {
            Object* obj = p_target;
            jsb_check(obj && p_from->object_db_.has_object(obj) && ::ObjectDB::get_instance(p_target));

            String script_path;
            List<Pair<StringName, Variant>> state;
            if (ScriptInstance* script_instance = obj->get_script_instance())
            {
                jsb_check(script_instance);
                const Ref script = script_instance->get_script();
                jsb_check(script.is_valid());

                script_instance->get_property_state(state);
                script_path = script->get_path();

                obj->set_script_instance(nullptr);
            }

            // break the link in the host environment
            p_from->free_object(obj, FinalizationType::None);
            p_to->add_async_call(AsyncCall::TYPE_TRANSFER_, memnew(TransferObjectData(p_worker_handle_id, p_target, script_path, state)));
        }
        else
        {
            p_to->add_async_call(AsyncCall::TYPE_TRANSFER_, memnew(TransferObjectData(p_worker_handle_id, p_target, {}, {})));
        }
    }

#pragma region Static Fields
    internal::VariantAllocator Environment::variant_allocator_;
#pragma endregion
}
