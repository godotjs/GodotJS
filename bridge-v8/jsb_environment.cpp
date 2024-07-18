#include "jsb_environment.h"

#if JSB_WITH_DEBUGGER
#   include "jsb_debugger.h"
#endif

#include "jsb_bridge_module_loader.h"
#include "jsb_godot_module_loader.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"
#include "editor/editor_settings.h"
#include "main/performance.h"

namespace jsb
{
    struct GlobalInitialize
    {
        std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();

        GlobalInitialize()
        {
#if JSB_EXPOSE_GC_FOR_TESTING
            constexpr char args[] = "--expose-gc";
            v8::V8::SetFlagsFromString(args, std::size(args) - 1);
#endif
            v8::V8::InitializePlatform(platform.get());
            v8::V8::Initialize();
        }
    };

    struct EnvironmentStore
    {
        // return a Environment shared pointer with a unknown pointer if it's a valid Environment instance.
        std::shared_ptr<Environment> access(void* p_runtime)
        {
            std::shared_ptr<Environment> rval;
            lock_.lock();
            if (all_runtimes_.has(p_runtime))
            {
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
                environment->unbind_pointer(p_binding);
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
            const v8::Isolate::Scope isolate_scope(isolate);
            const v8::HandleScope handle_scope(isolate);

            const v8::Local<v8::Value> value = message.GetValue();
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();

            const v8::MaybeLocal<v8::String> maybe = value->ToString(context);
            v8::Local<v8::String> str;
            if (maybe.ToLocal(&str) && str->Length() != 0)
            {
                const v8::String::Utf8Value str_utf8_value(isolate, str);
                const size_t len = str_utf8_value.length();
                const String temp_str(*str_utf8_value, (int) len);

                //TODO get the 'stack' property
                JSB_LOG(Error, "Unhandled promise rejection: %s", temp_str);
            }
        }
    }

    void Environment::on_context_created(const v8::Local<v8::Context>& p_context)
    {
#if JSB_WITH_DEBUGGER
        debugger_->on_context_created(p_context);
#endif
    }

    void Environment::on_context_destroyed(const v8::Local<v8::Context>& p_context)
    {
#if JSB_WITH_DEBUGGER
        debugger_->on_context_destroyed(p_context);
#endif
    }

    Environment::Environment() : pending_delete_(nearest_shift(JSB_VARIANT_DELETION_QUEUE_SIZE - 1))
    {
        JSB_BENCHMARK_SCOPE(JSEnvironment, Construct);
        static GlobalInitialize global_initialize;
        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator = &allocator_;
        // create_params.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();

#if JSB_WITH_V8
        JSB_LOG(Verbose, "v8 version: %s", V8_VERSION_STRING);
#endif
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
            valuetype_private_.Reset(isolate_, v8::Private::New(isolate_));
        }

        native_classes_.reserve((int) ClassDB::classes.size() + JSB_INITIAL_CLASS_EXTRA_SLOTS);
        script_classes_.reserve(JSB_INITIAL_SCRIPT_SLOTS);
        objects_.reserve(JSB_INITIAL_OBJECT_SLOTS);

        module_loaders_.insert("godot", memnew(GodotModuleLoader));
        module_loaders_.insert("godot-jsb", memnew(BridgeModuleLoader));
        EnvironmentStore::get_shared().add(this);

        //TODO call `start_debugger` at different stages for Editor/Game Runtimes.
        start_debugger();
    }

    Environment::~Environment()
    {
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
        debugger_.reset();
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

        valuetype_private_.Reset();
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
            JSB_LOG(Verbose, "exec_sync_delete variant (%s:%s)", Variant::get_type_name(variant->get_type()), uitos((uintptr_t) variant));
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
        debugger_->update();
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

        // must not be a valuetype object
        jsb_check(native_classes_.get_value(p_class_id).type != NativeClassType::GodotPrimitive);
        handle.ref_.Reset(isolate_, p_object);
        if (p_policy == EBindingPolicy::Managed)
        {
            handle.ref_.SetWeak(p_pointer, &object_gc_callback, v8::WeakCallbackType::kInternalFields);
        }
        else
        {
            handle.ref_count_ = 1;
        }
        JSB_LOG(VeryVerbose, "bind object class:%s(%d) addr:%s id:%s",
            (String) native_classes_.get_value(p_class_id).name, (uint32_t) p_class_id,
            uitos((uintptr_t) p_pointer), uitos((uint64_t) object_id));
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

    void Environment::unbind_pointer(void* p_pointer)
    {
        //TODO thread-safety issues on objects_* access
        jsb_check(Thread::get_caller_id() == thread_id_);
        if (objects_index_.has(p_pointer))
        {
            free_object(p_pointer, false);
        }
    }

    bool Environment::reference_object(void* p_pointer, bool p_is_inc)
    {
        //TODO temp code
        //TODO thread-safety issues on objects_* access
        jsb_check(Thread::get_caller_id() == thread_id_);

        const HashMap<void*, internal::Index64>::Iterator it = objects_index_.find(p_pointer);
        if (it == objects_index_.end())
        {
            JSB_LOG(VeryVerbose, "bad pointer %s", uitos((uintptr_t) p_pointer));
            return true;
        }
        jsb_address_guard(objects_, address_guard);
        const internal::Index64 object_id = it->value;
        ObjectHandle& object_handle = objects_.get_value(object_id);

        // must not be a valuetype object
        jsb_check(native_classes_.get_value(object_handle.class_id).type != NativeClassType::GodotPrimitive);

        // adding references
        if (p_is_inc)
        {
            if (object_handle.ref_count_ == 0)
            {
                // becomes a strong reference
                jsb_check(!object_handle.ref_.IsEmpty());
                object_handle.ref_.ClearWeak();
            }
            ++object_handle.ref_count_;
            return false;
        }

        // removing references
        jsb_checkf(!object_handle.ref_.IsEmpty(), "removing references on dead values");
        if (object_handle.ref_count_ == 0)
        {
            return true;
        }
        // jsb_checkf(object_handle.ref_count_ > 0, "unexpected behaviour");

        --object_handle.ref_count_;
        if (object_handle.ref_count_ == 0)
        {
            object_handle.ref_.SetWeak(p_pointer, &object_gc_callback, v8::WeakCallbackType::kInternalFields);
            return true;
        }
        return false;
    }

    jsb_force_inline static void clear_internal_field(v8::Isolate* isolate, const v8::Global<v8::Object>& p_obj)
    {
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Object> obj = p_obj.Get(isolate);
        obj->SetAlignedPointerInInternalField(IF_Pointer, nullptr);
    }

    void Environment::free_object(void* p_pointer, bool p_free)
    {
        jsb_check(Thread::get_caller_id() == thread_id_);
        jsb_check(objects_index_.has(p_pointer));
        const internal::Index64 object_id = objects_index_.get(p_pointer);
        jsb_checkf(object_id, "bad pointer");
        NativeClassID class_id;
        bool is_persistent;

        {
            {
                jsb_address_guard(objects_, address_guard);
                ObjectHandle& object_handle = objects_.get_value(object_id);
                jsb_check(object_handle.pointer == p_pointer);
                class_id = object_handle.class_id;
                is_persistent = persistent_objects_.has(p_pointer);

                // remove index at first to make `free_object` safely reentrant
                if (is_persistent) persistent_objects_.erase(p_pointer);
                objects_index_.erase(p_pointer);
                if (!p_free)
                {
                    //NOTE if we clear the internal field here, only null check is required when reading this value later (like the usage in '_godot_object_method')
                    clear_internal_field(isolate_, object_handle.ref_);
                }
                object_handle.ref_.Reset();
            }

            //NOTE DO NOT USE `object_handle` after this statement since it becomes invalid after `remove_at`
            // At this stage, the JS Object is being garbage collected, we'd better to break the link between JS Object & C++ Object before `finalizer` to avoid accessing the JS Object unexpectedly.
            objects_.remove_at_checked(object_id);
        }

        if (p_free)
        {
            const NativeClassInfo& class_info = native_classes_.get_value(class_id);

            JSB_LOG(VeryVerbose, "free_object class:%s(%d) addr:%s id:%s",
                (String) class_info.name, (uint32_t) class_id,
                uitos((uintptr_t) p_pointer), uitos(object_id));
            //NOTE Godot will call Object::_predelete to post a notification NOTIFICATION_PREDELETE which finally call `ScriptInstance::callp`
            class_info.finalizer(this, p_pointer, is_persistent);
        }
        else
        {
            JSB_LOG(VeryVerbose, "(skip) free_object class:%s(%d) addr:%s id:%s",
                (String) native_classes_.get_value(class_id).name, (uint32_t) class_id,
                uitos((uintptr_t) p_pointer), uitos(object_id));
        }
    }

    void Environment::print_statistics()
    {
        v8::HeapStatistics statistics;
        isolate_->GetHeapStatistics(&statistics);

        JSB_LOG(Verbose, "Global Handles: %s/%s", uitos(statistics.used_global_handles_size()), uitos(statistics.total_global_handles_size()));
        JSB_LOG(Verbose, "Heap: %s/%s", uitos(statistics.used_heap_size()), uitos(statistics.total_heap_size()));
        JSB_LOG(Verbose, "Malloc: %s", uitos(statistics.malloced_memory()));
        JSB_LOG(Verbose, "External: %s", uitos(statistics.external_memory()));
        JSB_LOG(Verbose, "jsb.traced_objects: %d", objects_.size());
        JSB_LOG(Verbose, "jsb.classes: %d", native_classes_.size());
        JSB_LOG(Verbose, "jsb.scripts: %d", script_classes_.size());
        JSB_LOG(Verbose, "jsb.string_name_cache: %d", string_name_cache_.size());
        JSB_LOG(Verbose, "jsb.persistent_objects: %d", persistent_objects_.size());
        JSB_LOG(Verbose, "jsb.alive_variants: %s", uitos(variant_allocator_.get_allocated_num()));
    }

    void Environment::start_debugger()
    {
#if JSB_WITH_DEBUGGER
        if (debugger_)
        {
            return;
        }
        debugger_ = JavaScriptDebugger::create(isolate_, internal::Settings::get_debugger_port());
#endif
    }

#pragma region Static Fields
    internal::VariantAllocator Environment::variant_allocator_;
#pragma endregion
}
