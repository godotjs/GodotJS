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

#include "../internal/jsb_path_util.h"
#include "../internal/jsb_class_util.h"
#include "../internal/jsb_variant_util.h"
#include "../internal/jsb_settings.h"

#include "editor/editor_settings.h"
#include "main/performance.h"

#if !JSB_WITH_STATIC_BINDINGS
#include "jsb_primitive_bindings_reflect.h"
#define register_primitive_bindings(param) register_primitive_bindings_reflect(param)
#else
#include "jsb_primitive_bindings_static.h"
#define register_primitive_bindings(param) register_primitive_bindings_static(param)
#endif

namespace jsb
{
    struct EnvironmentStore
    {
        // return a Environment shared pointer with a unknown pointer if it's a valid Environment instance.
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
            //TODO ??
            JSB_LOG(Error, "unimplemented");
            return nullptr;
        }

        static void free_callback(void* p_token, void* p_instance, void* p_binding)
        {
            if (std::shared_ptr<Environment> environment = EnvironmentStore::get_shared().access(p_token))
            {
                jsb_check(p_instance == p_binding);

                // no need to do additional finalization because `free_callback` is triggered by godot when an Object is being deleted
                constexpr bool kMakeFinalization = false;
                environment->free_object(p_binding, kMakeFinalization);
            }
        }

        static GDExtensionBool reference_callback(void* p_token, void* p_binding, GDExtensionBool p_reference)
        {
            if (std::shared_ptr<Environment> environment = EnvironmentStore::get_shared().access(p_token))
            {
                return environment->reference_object(p_binding, !!p_reference);
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

    void Environment::on_context_created(const v8::Local<v8::Context>& p_context)
    {
#if JSB_WITH_DEBUGGER
        debugger_.on_context_created(p_context);
#endif
    }

    void Environment::on_context_destroyed(const v8::Local<v8::Context>& p_context)
    {
#if JSB_WITH_DEBUGGER
        debugger_.on_context_destroyed(p_context);
#endif
    }

    Environment::Environment() : pending_delete_(nearest_shift(JSB_VARIANT_DELETION_QUEUE_SIZE - 1))
    {
        JSB_BENCHMARK_SCOPE(JSEnvironment, Construct);
        impl::GlobalInitialize::init();
        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator = &allocator_;
        // create_params.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();

        JSB_LOG(Verbose, "v8 version: %s", V8_VERSION_STRING);
        thread_id_ = Thread::get_caller_id();
        last_ticks_ = 0;
        isolate_ = v8::Isolate::New(create_params);
        isolate_->SetData(kIsolateEmbedderData, this);
        isolate_->SetPromiseRejectCallback(PromiseRejectCallback_);
        // SetBatterySaverMode
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

        native_classes_.reserve((int) ClassDB::classes.size() + JSB_INITIAL_CLASS_EXTRA_SLOTS);
        script_classes_.reserve(JSB_INITIAL_SCRIPT_SLOTS);
        objects_.reserve(JSB_INITIAL_OBJECT_SLOTS);

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
                require_func->Set(context, impl::Helper::new_string_ascii(isolate_, "cache"), cache_obj).Check();
                require_func->Set(context, impl::Helper::new_string_ascii(isolate_, "moduleId"), v8::String::Empty(isolate_)).Check();
                global->Set(context, impl::Helper::new_string_ascii(isolate_, "require"), require_func).Check();
                global->Set(context, impl::Helper::new_string_ascii(isolate_, "define"), JSB_NEW_FUNCTION(context, Builtins::_define, {})).Check();
                module_cache_.init(isolate_, cache_obj);
            }

            Builtins::register_(context, global);
            register_primitive_bindings(this);
            this->on_context_created(context);
        }

        //TODO call `start_debugger` at different stages for Editor/Game Runtimes.
        start_debugger();
    }

    Environment::~Environment()
    {
        // destroy context
        {
            v8::Isolate* isolate = this->isolate_;
            v8::Isolate::Scope isolate_scope(isolate);
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = context_.Get(get_isolate());

            function_bank_.clear();
            function_refs_.clear();

            this->on_context_destroyed(context);
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

#if JSB_WITH_DEBUGGER
        debugger_.drop();
#endif
        EnvironmentStore::get_shared().remove(this);
        timer_manager_.clear_all();

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

        // cleanup weak callbacks not invoked by v8
        jsb_check((uint32_t) objects_.size() == objects_index_.size());
        JSB_LOG(VeryVerbose, "cleanup %d objects", objects_.size());
        while (!objects_index_.is_empty())
        {
            free_object(objects_index_.begin()->key, true);
        }
        jsb_check(objects_.size() == 0);
        jsb_check(objects_index_.size() == 0);

        string_name_cache_.clear();

        // cleanup all class templates (must do after objects cleaned up)
        native_classes_.clear();

        isolate_->Dispose();
        isolate_ = nullptr;

        exec_sync_delete();

    }

    void Environment::exec_sync_delete()
    {
        while (pending_delete_.data_left())
        {
            Variant* variant = pending_delete_.read();
            JSB_LOG(Verbose, "exec_sync_delete variant (%s:%d)", Variant::get_type_name(variant->get_type()), (uintptr_t) variant);
            dealloc_variant(variant);
        }
    }

    void Environment::update()
    {
        const uint64_t base_ticks = Engine::get_singleton()->get_frame_ticks();
        const uint64_t elapsed_milli = (base_ticks - last_ticks_) / 1000; // milliseconds

        last_ticks_ = base_ticks;
        if (timer_manager_.tick(elapsed_milli))
        {
            v8::Isolate::Scope isolate_scope(isolate_);
            v8::HandleScope handle_scope(isolate_);

            if (timer_manager_.invoke_timers(isolate_))
            {
                microtasks_run_ = true;
            }
        }

        if (microtasks_run_)
        {
            microtasks_run_ = false;
            isolate_->PerformMicrotaskCheckpoint();
        }
#if JSB_WITH_DEBUGGER
        debugger_.update();
#endif
        if (pending_delete_.data_left())
        {
            exec_sync_delete();
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

    NativeObjectID Environment::bind_godot_object(NativeClassID p_class_id, Object* p_pointer, const v8::Local<v8::Object>& p_object)
    {
        const NativeObjectID object_id = bind_pointer(p_class_id, (void*) p_pointer, p_object, EBindingPolicy::External);
        p_pointer->set_instance_binding(this, p_pointer, gd_instance_binding_callbacks);
        return object_id;
    }

    NativeObjectID Environment::bind_pointer(NativeClassID p_class_id, void* p_pointer, const v8::Local<v8::Object>& p_object, EBindingPolicy::Type p_policy)
    {
        jsb_checkf(Thread::get_caller_id() == thread_id_, "multi-threaded call not supported yet");
        jsb_checkf(native_classes_.is_valid_index(p_class_id), "bad class_id");
        jsb_checkf(!objects_index_.has(p_pointer), "duplicated bindings");

        const NativeObjectID object_id = objects_.add({});
        ObjectHandle& handle = objects_.get_value(object_id);

        objects_index_.insert(p_pointer, object_id);
        p_object->SetAlignedPointerInInternalField(IF_Pointer, p_pointer);

        handle.class_id = p_class_id;
        handle.pointer = p_pointer;

        // must not be a valuetype object (v8 only)
        jsb_v8_check(native_classes_.get_value(p_class_id).type != NativeClassType::GodotPrimitive);
        handle.ref_.Reset(isolate_, p_object);
        if (p_policy == EBindingPolicy::Managed)
        {
            handle.ref_.SetWeak(p_pointer, &object_gc_callback, v8::WeakCallbackType::kInternalFields);
        }
        else
        {
            handle.ref_count_ = 1;
        }
        JSB_LOG(VeryVerbose, "bind object class:%s(%d) addr:%d id:%d",
            (String) native_classes_.get_value(p_class_id).name, p_class_id,
            (uintptr_t) p_pointer, object_id);
        return object_id;
    }

    void Environment::mark_as_persistent_object(void* p_pointer)
    {
        if (const HashMap<void*, internal::Index64>::Iterator it = objects_index_.find(p_pointer); it != objects_index_.end())
        {
            jsb_checkf(!persistent_objects_.has(p_pointer), "duplicate adding persistent object");
            reference_object(p_pointer, true);
            persistent_objects_.insert(p_pointer);
            return;
        }
        JSB_LOG(Error, "failed to mark as persistent due to invalid pointer");
    }

    bool Environment::reference_object(void* p_pointer, bool p_is_inc)
    {
        //TODO temp code
        //TODO thread-safety issues on objects_* access
        jsb_check(Thread::get_caller_id() == thread_id_);

        const internal::Index64* object_id = objects_index_.getptr(p_pointer);
        if (!object_id)
        {
            JSB_LOG(VeryVerbose, "bad pointer %d", (uintptr_t) p_pointer);
            return true;
        }
        ObjectHandlePtr object_handle = objects_.get_value_scoped(*object_id);

        // must not be a valuetype object
        jsb_check(native_classes_.get_value(object_handle->class_id).type != NativeClassType::GodotPrimitive);

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
            return false;
        }

        // removing references
        jsb_checkf(!object_handle->ref_.IsEmpty(), "removing references on dead values");
        if (object_handle->ref_count_ == 0)
        {
            return true;
        }

        --object_handle->ref_count_;
        if (object_handle->ref_count_ == 0)
        {
            // with quickjs.impl, we must leave the ObjectHandle scope because SetWeak() may trigger the object finalization immediately.
            object_handle.escape()->ref_.SetWeak(p_pointer, &object_gc_callback, v8::WeakCallbackType::kInternalFields);
            return true;
        }
        return false;
    }

    jsb_force_inline static void clear_internal_field(v8::Isolate* isolate, const v8::Global<v8::Object>& p_obj)
    {
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Object> obj = p_obj.Get(isolate);
        obj->SetAlignedPointerInInternalField(IF_Pointer, nullptr);
    }

    void Environment::free_object(void* p_pointer, bool p_finalize)
    {
        jsb_check(Thread::get_caller_id() == thread_id_);

        const internal::Index64* object_id = objects_index_.getptr(p_pointer);

        // avoid crash in the situation that `InstanceBindingCallbacks::free_callback` is called before JS object gc callback is called,
        // which makes the pointer already erased in `object_gc_callback`
        if (jsb_unlikely(!object_id))
        {
            return;
        }

        NativeClassID class_id;
        bool is_persistent;

        {
            ObjectHandle& object_handle = objects_.get_value(*object_id);
            jsb_check(object_handle.pointer == p_pointer);
            class_id = object_handle.class_id;

            // remove index at first to make `free_object` safely reentrant
            is_persistent = persistent_objects_.erase(p_pointer);
            objects_index_.erase(p_pointer);
            if (!p_finalize)
            {
                //NOTE if we clear the internal field here, only null check is required when reading this value later (like the usage in '_godot_object_method')
                clear_internal_field(isolate_, object_handle.ref_);
            }

            v8::Global<v8::Object> obj_ref = std::move(object_handle.ref_);

            //NOTE DO NOT USE `object_handle` after this statement since it becomes invalid after `remove_at`
            // At this stage, the JS Object is being garbage collected, we'd better to break the link between JS Object & C++ Object before `finalizer` to avoid accessing the JS Object unexpectedly.
            objects_.remove_at_checked(*object_id);

            obj_ref.Reset();
        }

        if (p_finalize)
        {
            const NativeClassInfo& class_info = native_classes_.get_value(class_id);

            JSB_LOG(VeryVerbose, "free_object class:%s(%d) addr:%d id:%d",
                (String) class_info.name, class_id,
                (uintptr_t) p_pointer, object_id);

            //NOTE Godot will call Object::_predelete to post a notification NOTIFICATION_PREDELETE which finally call `ScriptInstance::callp`
            class_info.finalizer(this, p_pointer, is_persistent);
        }
        else
        {
            JSB_LOG(VeryVerbose, "(skip) free_object class:%s(%d) addr:%d id:%d",
                (String) native_classes_.get_value(class_id).name, class_id,
                (uintptr_t) p_pointer, object_id);
        }
    }

    void Environment::start_debugger()
    {
#if JSB_WITH_DEBUGGER
        debugger_.init(isolate_, internal::Settings::get_debugger_port());
#endif
    }

    void Environment::get_statistics(Statistics& r_stats) const
    {
        v8::HeapStatistics v8_statistics;
        isolate_->GetHeapStatistics(&v8_statistics);

        r_stats.used_global_handles_size = v8_statistics.used_global_handles_size();
        r_stats.total_global_handles_size = v8_statistics.total_global_handles_size();
        r_stats.used_heap_size = v8_statistics.used_heap_size();
        r_stats.total_heap_size = v8_statistics.total_heap_size();
        r_stats.peak_malloced_memory = v8_statistics.peak_malloced_memory();
        r_stats.malloced_memory = v8_statistics.malloced_memory();
        r_stats.external_memory = v8_statistics.external_memory();

        r_stats.objects = objects_.size();
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

    EReloadResult::Type Environment::mark_as_reloading(const StringName& p_name)
    {
        if (JavaScriptModule* module = module_cache_.find(p_name))
        {
            jsb_check(!module->source_info.source_filepath.is_empty());
            if (!module->is_loaded() || module->mark_as_reloading())
            {
                return EReloadResult::Requested;
            }
            return EReloadResult::NoChanges;
        }
        return EReloadResult::NoSuchModule;
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
#if JSB_SUPPORT_RELOAD
                existing_module->reload_requested = false;
#endif
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
        if (const NativeObjectID object_id = this->get_object_id(p_this))
        {
            JSB_LOG(Verbose, "crossbinding on a binded object %d (addr:%d), rebind it to script class %d", object_id, (uintptr_t) p_this, p_class_id);

            //TODO may not work in this way
            _rebind(isolate, context, p_this, p_class_id);
            return object_id;
        }

        StringName class_name;
        NativeClassID native_class_id;
        v8::Local<v8::Object> class_obj;

        {
            const ScriptClassInfoPtr class_info = this->get_script_class(p_class_id);
            class_name = class_info->js_class_name;
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
            JSB_LOG(Error, "something wrong when constructing '%s'\n%s", class_name, BridgeHelper::get_exception(try_catch_run));
            return {};
        }

        jsb_check(!constructed_value.IsEmpty());
        v8::Local<v8::Value> instance;
        if (!constructed_value.ToLocal(&instance) || !instance->IsObject())
        {
            JSB_LOG(Error, "bad instance '%s", class_name);
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
            JSB_LOG(Warning, "invalid main module");
            require->Set(context, jsb_name(this, main), v8::Undefined(isolate_)).Check();
        }
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

        return ObjectReflectBindingUtil::reflect_bind(this, p_class_info, r_class_id);
    }

    JSValueMove Environment::eval_source(const char* p_source, int p_length, const String& p_filename, Error& r_err)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, eval_source);
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Context::Scope context_scope(context_.Get(isolate));

        const impl::TryCatch try_catch_run(isolate);
        const v8::MaybeLocal<v8::Value> maybe = _compile_run(p_source, p_length, p_filename);
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

    ObjectCacheID Environment::retain_function(NativeObjectID p_object_id, const StringName& p_method)
    {
        this->check_internal_state();
        if (const ObjectHandlePtr handle = this->objects_.try_get_value_scoped(p_object_id))
        {
            v8::Isolate* isolate = this->isolate_;
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = context_.Get(isolate);
            const v8::Local<v8::Object> obj = handle->ref_.Get(isolate);
            if (v8::Local<v8::Value> find;
                obj->Get(context, this->get_string_value(p_method)).ToLocal(&find) && find->IsFunction())
            {
                return get_cached_function(find.As<v8::Function>());
            }
        }
        return {};
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
                const size_t r = function_refs_.erase(TWeakRef(isolate, strong_ref.object_));
                jsb_check(r != 0);
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

    bool Environment::get_script_default_property_value(ScriptClassInfo& p_script_class_info, const StringName& p_name, Variant& r_val)
    {
        this->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);

        if (const auto& it = p_script_class_info.properties.find(p_name))
        {
            v8::Local<v8::Value> instance;
            if (p_script_class_info.js_default_object.IsEmpty())
            {
                v8::Local<v8::Value> identifier = jsb_symbol(this, CDO);
                const v8::Local<v8::Object> class_obj = p_script_class_info.js_class.Get(isolate);
                const impl::TryCatch try_catch_run(isolate);
                const v8::MaybeLocal<v8::Value> constructed_value = class_obj->CallAsConstructor(context, 1, &identifier);
                if (try_catch_run.has_caught())
                {
                    JSB_LOG(Error, "something wrong when constructing '%s'\n%s",
                        p_script_class_info.js_class_name,
                        BridgeHelper::get_exception(try_catch_run));
                    p_script_class_info.js_default_object.Reset(isolate, v8::Null(isolate));
                    return false;
                }
                if (!constructed_value.ToLocal(&instance))
                {
                    JSB_LOG(Error, "bad instance '%s", p_script_class_info.js_class_name);
                    p_script_class_info.js_default_object.Reset(isolate, v8::Null(isolate));
                    return false;
                }
                p_script_class_info.js_default_object.Reset(isolate, instance);
            }
            else
            {
                instance = p_script_class_info.js_default_object.Get(isolate);
            }

            if (!instance->IsObject())
            {
                JSB_LOG(Error, "bad instance '%s", p_script_class_info.js_class_name);
                return false;
            }

            // try read default value from CDO.
            // pretend nothing's wrong if failed by constructing a default value in-place
            v8::Local<v8::Object> cdo = instance.As<v8::Object>();
            v8::Local<v8::Value> value;
            if (!cdo->Get(context, this->get_string_value(p_name)).ToLocal(&value)
                || !TypeConvert::js_to_gd_var(isolate, context, value, it->value.type, r_val))
            {
                JSB_LOG(Warning, "failed to get/translate default value of '%s' from CDO", p_name);
                ::jsb::internal::VariantUtil::construct_variant(r_val, it->value.type);
            }
            return true;
        }
        // JSB_LOG(Warning, "unknown property %s", p_name);
        return false;
    }

    bool Environment::get_script_property_value(NativeObjectID p_object_id, const ScriptPropertyInfo& p_info, Variant& r_val)
    {
        this->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        if (!this->objects_.is_valid_index(p_object_id))
        {
            return false;
        }

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
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        if (!this->objects_.is_valid_index(p_object_id))
        {
            return false;
        }

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

    void Environment::call_prelude(ScriptClassID p_script_class_id, NativeObjectID p_object_id)
    {
        this->check_internal_state();
        jsb_check(p_object_id);
        jsb_checkf(ClassDB::is_parent_class(this->get_script_class(p_script_class_id)->native_class_name, jsb_string_name(Node)), "only Node has a prelude call");

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = this->get_context();
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
            v8::Local<v8::Array> collection = val_test.As<v8::Array>();
            const uint32_t len = collection->Length();
            const Node* node = (Node*)(Object*) unpacked;

            for (uint32_t index = 0; index < len; ++index)
            {
                v8::Local<v8::Object> element = collection->Get(context, index).ToLocalChecked().As<v8::Object>();
                v8::Local<v8::String> element_name = element->Get(context, jsb_name(this, name)).ToLocalChecked().As<v8::String>();
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

    Variant Environment::call_function(NativeObjectID p_object_id, ObjectCacheID p_func_id, const Variant** p_args, int p_argcount, Callable::CallError& r_error)
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
        v8::Local<v8::Context> context = this->get_context();
        v8::Context::Scope context_scope(context);

        if (p_object_id)
        {
            // if object_id is nonzero but can't be found in `objects_` registry, it usually means that this invocation originally triggered by JS GC.
            // the JS Object is disposed before the Godot Object, but Godot will post notifications (like NOTIFICATION_PREDELETE) to script instances.
            if (!this->objects_.is_valid_index(p_object_id))
            {
                JSB_LOG(Error, "invalid `this` for calling function");
                r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
                return {};
            }
            const TStrongRef<v8::Function>& js_func = function_bank_.get_value(p_func_id);
            jsb_check(js_func);
            const v8::Local<v8::Object> self = this->get_object(p_object_id);
            return _call(isolate, context, js_func.object_.Get(isolate), self, p_args, p_argcount, r_error);
        }

        const TStrongRef<v8::Function>& js_func = function_bank_.get_value(p_func_id);
        jsb_check(js_func);
        return _call(isolate, context, js_func.object_.Get(isolate), v8::Undefined(isolate), p_args, p_argcount, r_error);
    }

#pragma region Static Fields
    internal::VariantAllocator Environment::variant_allocator_;
#pragma endregion
}
