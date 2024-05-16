#include "jsb_environment.h"

#if JSB_WITH_DEBUGGER
#include "jsb_debugger.h"
#endif

#include "../internal/jsb_path_util.h"
#include "jsb_module_loader.h"
#include "editor/editor_settings.h"
#include "modules/GodotJS/internal/jsb_settings.h"

namespace jsb
{
    struct GlobalInitialize
    {
        std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();

        GlobalInitialize()
        {
#if JSB_DEBUG
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
                rval = ((Environment*) p_runtime)->shared_from_this();
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
                environment->unbind_object(p_binding);
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
        void PromiseRejectCallback_(v8::PromiseRejectMessage message)
        {
            if (message.GetEvent() != v8::kPromiseRejectWithNoHandler)
            {
                return;
            }

            const v8::Local<v8::Promise> promise = message.GetPromise();
            v8::Isolate* isolate = promise->GetIsolate();
            const v8::Isolate::Scope isolateScope(isolate);
            const v8::HandleScope handleScope(isolate);

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

    Environment::Environment()
    {
        static GlobalInitialize global_initialize;
        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator = &allocator_;

        thread_id_ = Thread::get_caller_id();
        isolate_ = v8::Isolate::New(create_params);
        isolate_->SetData(kIsolateEmbedderData, this);
        isolate_->SetPromiseRejectCallback(PromiseRejectCallback_);

        {
            v8::HandleScope handle_scope(isolate_);
            for (int index = 0; index < Symbols::kNum; ++index)
            {
                symbols_[index].Reset(isolate_, v8::Symbol::New(isolate_));
            }
        }
        module_loaders_.insert("godot", memnew(GodotModuleLoader));
        EnvironmentStore::get_shared().add(this);

        //TODO call `start_debugger` at different stages for Editor/Game Runtimes.
        start_debugger();
    }

    Environment::~Environment()
    {
        while (!gdjs_classes_.is_empty())
        {
            const GodotJSClassID id = gdjs_classes_.get_first_index();
            // JavaScriptClassInfo& class_info = gdjs_classes_[id];
            // class_info.xxx.Reset();
            gdjs_classes_.remove_at(id);
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
        while (!objects_.is_empty())
        {
            const internal::Index64 first_index = objects_.get_first_index();
            {
                jsb_address_guard(objects_, address_guard);
                ObjectHandle& handle = objects_.get_value(first_index);
                const bool is_persistent = persistent_objects_.has(handle.pointer);
                const NativeClassInfo& class_info = native_classes_.get_value(handle.class_id);

                JSB_LOG(Verbose, "deleting %s(%d) %s", (String) class_info.name, (uint32_t) handle.class_id, uitos((uintptr_t) handle.pointer));
                class_info.finalizer(this, handle.pointer, is_persistent);
                handle.ref_.Reset();
                objects_index_.erase(handle.pointer);
                if (is_persistent) persistent_objects_.erase(handle.pointer);
            }
            objects_.remove_at(first_index);
        }

        string_name_cache_.clear();

        // cleanup all class templates
        native_classes_.clear();

        isolate_->Dispose();
        isolate_ = nullptr;

        // // cleanup variant pool
        // for (int pool_index = variants_pool_.size() - 1; pool_index >= 0; --pool_index)
        // {
        //     memdelete(variants_pool_[pool_index]);
        //     variants_pool_.remove_at(pool_index);
        // }
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

            timer_manager_.invoke_timers(isolate_);
        }
        isolate_->PerformMicrotaskCheckpoint();
#if JSB_WITH_DEBUGGER
        debugger_->update();
#endif
    }

    void Environment::gc()
    {
#if JSB_DEBUG
        isolate_->RequestGarbageCollectionForTesting(v8::Isolate::kFullGarbageCollection);
#else
        isolate_->LowMemoryNotification();
#endif
    }

    NativeObjectID Environment::bind_godot_object(NativeClassID p_class_id, Object* p_pointer, const v8::Local<v8::Object>& p_object)
    {
        const NativeObjectID object_id = bind_object(p_class_id, (void*) p_pointer, p_object, false);
        p_pointer->set_instance_binding(this, p_pointer, gd_instance_binding_callbacks);
        return object_id;
    }

    NativeObjectID Environment::bind_object(NativeClassID p_class_id, void* p_pointer, const v8::Local<v8::Object>& p_object, bool p_weakref)
    {
        jsb_checkf(Thread::get_caller_id() == thread_id_, "multi-threaded call not supported yet");
        jsb_checkf(native_classes_.is_valid_index(p_class_id), "bad class_id");
        jsb_checkf(!objects_index_.has(p_pointer), "duplicated bindings");

        const NativeObjectID object_id = objects_.add({});
        ObjectHandle& handle = objects_.get_value(object_id);

        handle.class_id = p_class_id;
        handle.pointer = p_pointer;
        handle.ref_.Reset(isolate_, p_object);
        objects_index_.insert(p_pointer, object_id);
        p_object->SetAlignedPointerInInternalField(kObjectFieldPointer, p_pointer);
        if (p_weakref)
        {
            handle.ref_.SetWeak(p_pointer, &object_gc_callback, v8::WeakCallbackType::kInternalFields);
        }
        else
        {
            handle.ref_count_ = 1;
        }
        JSB_LOG(Verbose, "bind object %s (id: %s) with class %s (%d)", uitos((uintptr_t) p_pointer), uitos((uint64_t) object_id), (String) native_classes_.get_value(p_class_id).name, (uint32_t) p_class_id);
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

    void Environment::unbind_object(void* p_pointer)
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
            JSB_LOG(Warning, "bad pointer %s", uitos((uintptr_t) p_pointer));
            return true;
        }
        const internal::Index64 object_id = it->value;
        ObjectHandle& object_handle = objects_.get_value(object_id);

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
        obj->SetAlignedPointerInInternalField(kObjectFieldPointer, nullptr);
    }

    void Environment::free_object(void* p_pointer, bool p_free)
    {
        jsb_check(Thread::get_caller_id() == thread_id_);
        const HashMap<void*, internal::Index64>::Iterator it = objects_index_.find(p_pointer);
        ERR_FAIL_COND_MSG(it == objects_index_.end(), "bad pointer");
        const internal::Index64 object_id = it->value;

        ObjectHandle& object_handle = objects_.get_value(object_id);
        jsb_check(object_handle.pointer == p_pointer);
        const NativeClassID class_id = object_handle.class_id;
        const bool is_persistent = persistent_objects_.has(p_pointer);

        // remove index at first to make `free_object` safely reentrant
        if (is_persistent) persistent_objects_.erase(p_pointer);
        objects_index_.erase(p_pointer);
        if (!p_free)
        {
            //NOTE if we clear the internal field here, only null check is required when reading this value later (like the usage in '_godot_object_method')
            clear_internal_field(isolate_, object_handle.ref_);
        }
        object_handle.ref_.Reset();

        //NOTE DO NOT USE `object_handle` after this statement since it becomes invalid after `remove_at`
        // At this stage, the JS Object is being garbage collected, we'd better to break the link between JS Object & C++ Object before `finalizer` to avoid accessing the JS Object unexpectedly.
        objects_.remove_at(object_id);

        if (p_free)
        {
            const NativeClassInfo& class_info = native_classes_.get_value(class_id);

            JSB_LOG(Verbose, "deleting %s(%d) addr:%s", (String) class_info.name, (uint32_t) class_id, uitos((uintptr_t) p_pointer));
            //NOTE Godot will call Object::_predelete to post a notification NOTIFICATION_PREDELETE which finally call `ScriptInstance::callp`
            class_info.finalizer(this, p_pointer, is_persistent);
        }
        else
        {
            JSB_LOG(Verbose, "unbinding %s(%d) addr:%s", (String) native_classes_.get_value(class_id).name, (uint32_t) class_id, uitos((uintptr_t) p_pointer));
        }
    }

    String Environment::handle_source_map(const String& p_stacktrace)
    {
#if JSB_WITH_SOURCEMAP
        if (internal::Settings::get_sourcemap_enabled())
        {
            return _source_map_cache.handle_source_map(p_stacktrace);
        }
#endif
        return p_stacktrace;
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

}
