#ifndef GODOTJS_ENVIRONMENT_H
#define GODOTJS_ENVIRONMENT_H

#include "jsb_pch.h"
#include "jsb_array_buffer_allocator.h"
#include "jsb_object_handle.h"
#include "jsb_class_info.h"
#include "jsb_debugger.h"
#include "jsb_module_loader.h"
#include "jsb_module_resolver.h"
#include "jsb_timer_action.h"
#include "jsb_string_name_cache.h"
#include "../internal/jsb_sarray.h"
#include "../internal/jsb_timer_manager.h"
#include "../internal/jsb_variant_allocator.h"
#include "core/templates/ring_buffer.h"

#include "../internal/jsb_source_map_cache.h"

// get v8 string value from string name cache with the given name
#define jsb_name(env, name) (env)->get_string_value(jsb_string_name(name))

// get v8 symbol value from pre-allocated symbol registry
#define jsb_symbol(env, name) (env)->get_symbol(Symbols::name)

namespace jsb
{
    enum : uint32_t
    {
        kIsolateEmbedderData = 0,
    };

    // pre-allocated Symbols which usually used as key of Object to store some hidden info on it.
    namespace Symbols
    {
        enum Type : uint8_t
        {
            ClassId,
            ClassSignals,            // array of all @signal annotations
            ClassProperties,         // array of all @export annotations
            ClassImplicitReadyFuncs, // array of all @onready annotations
            ClassToolScript,         // @tool annotated scripts
            ClassIcon,               // @icon
            Doc,
            MemberDocMap,

            CrossBind,               // a symbol can only be used from C++ to indicate calling from cross-bind
            CDO,                     // constructing class default object for a script
            kNum,
        };
    }

    // Environment it-self is NOT thread-safe.
    class Environment : public std::enable_shared_from_this<Environment>
    {
    private:
        friend class Realm;
        friend struct InstanceBindingCallbacks;

        // symbol for class_id on FunctionTemplate of native class
        v8::Global<v8::Symbol> symbols_[Symbols::kNum];

        /*volatile*/
        Thread::ID thread_id_;

        v8::Isolate* isolate_;
        v8::Global<v8::Private> valuetype_private_;
        ArrayBufferAllocator allocator_;

        //TODO postpone the call of Global.Reset if calling from other threads
        // typedef void(*UnreferencingRequestCall)(internal::Index64);
        // Vector<UnreferencingRequestCall> request_calls_;
        // volatile bool pending_request_calls_;

        // SpinLock spin_lock_;
        // Vector<Variant*> sync_delete_;
        RingBuffer<Variant*> pending_delete_;

        // indirect lookup
        // only godot object classes are mapped
        HashMap<StringName, NativeClassID> godot_classes_index_;

        // all exposed native classes
        internal::SArray<NativeClassInfo, NativeClassID> native_classes_;

        //TODO all exported default classes inherit native godot class (directly or indirectly)
        // they're only collected on a module loaded
        internal::SArray<ScriptClassInfo, ScriptClassID> script_classes_;

        StringNameCache string_name_cache_;

        // cpp objects should be added here since the gc callback is not guaranteed by v8
        // we need to delete them on finally releasing Environment
        internal::SArray<ObjectHandle, NativeObjectID> objects_;

        // (unsafe) mapping object pointer to object_id
        HashMap<void*, NativeObjectID> objects_index_;
        HashSet<void*> persistent_objects_;

        static internal::VariantAllocator variant_allocator_;

        // module_id => loader
        HashMap<StringName, class IModuleLoader*> module_loaders_;
        Vector<IModuleResolver*> module_resolvers_;

        uint64_t last_ticks_;
        internal::TTimerManager<JavaScriptTimerAction> timer_manager_;
        bool microtasks_run_ = false;

#if JSB_WITH_DEBUGGER
        JavaScriptDebugger debugger_;
#endif

        internal::SourceMapCache _source_map_cache;

    public:
        Environment();
        ~Environment();

        void start_debugger();

        jsb_force_inline void check_internal_state() const { jsb_checkf(Thread::get_caller_id() == thread_id_, "multi-threaded call not supported yet"); }

        jsb_force_inline internal::SourceMapCache& get_source_map_cache() { return _source_map_cache; }

        jsb_force_inline void notify_microtasks_run() { microtasks_run_ = true; }

        static jsb_force_inline Variant* alloc_variant(const Variant& p_templet) { jsb_check(p_templet.get_type() != Variant::OBJECT); return variant_allocator_.alloc(p_templet); }
        static jsb_force_inline Variant* alloc_variant() { return variant_allocator_.alloc(); }
        static jsb_force_inline void dealloc_variant(Variant* p_var) { variant_allocator_.free(p_var); }

        jsb_force_inline internal::TTimerManager<JavaScriptTimerAction>& get_timer_manager() { return timer_manager_; }

        jsb_force_inline StringNameCache& get_string_name_cache() { return string_name_cache_; }
        jsb_force_inline v8::Local<v8::String> get_string_value(const StringName& p_name) { return string_name_cache_.get_string_value(isolate_, p_name); }
        jsb_force_inline StringName get_string_name(const v8::Local<v8::String>& p_value) { return string_name_cache_.get_string_name(isolate_, p_value); }

        jsb_force_inline v8::Local<v8::Symbol> get_symbol(Symbols::Type p_type) const { return symbols_[p_type].Get(isolate_); }

        jsb_no_discard
        static
        jsb_force_inline
        Environment* wrap(v8::Isolate* p_isolate)
        {
            return (Environment*) p_isolate->GetData(kIsolateEmbedderData);
        }

        jsb_no_discard
        jsb_force_inline
        v8::Isolate* unwrap() const { return isolate_; }

        // [low level binding] bind a C++ `p_pointer` with a JS `p_object`
        NativeObjectID bind_pointer(NativeClassID p_class_id, void* p_pointer, const v8::Local<v8::Object>& p_object, EBindingPolicy::Type p_policy);

        template<typename TStruct>
        void bind_valuetype(NativeClassID p_class_id, TStruct* p_pointer, const v8::Local<v8::Object>& p_object)
        {
            p_object->SetAlignedPointerInInternalField(IF_Pointer, p_pointer);
            p_object->SetPrivate(isolate_->GetCurrentContext(), valuetype_private_.Get(isolate_),
                // in this way, the scavenger could gc it efficiently
                v8::ArrayBuffer::New(isolate_, v8::ArrayBuffer::NewBackingStore(p_pointer, sizeof(TStruct), [](void* data, size_t length, void* deleter_data)
                {
                    Variant* variant = (Variant*) data;
                    // `Callable/Array/Dictionary` may contain reference-based objects.
                    // executing the destructor of a reference-based object may cause crash (not thread-safe),
                    // release them in main thread for simplicity.
                    if (const Variant::Type type = variant->get_type();
                        type == Variant::CALLABLE || type == Variant::ARRAY || type == Variant::DICTIONARY)
                    {
                        // use ringbuffer here, because we reckon there is only one scavenger thread involved (or one active thread at most)
                        if (const std::shared_ptr<Environment> env = _access(deleter_data);
                            env && env->pending_delete_.write(variant) == OK)
                        {
                            JSB_LOG(VeryVerbose, "deleting possibly reference-based variant (%s:%s) space:%d thread:%s",
                                Variant::get_type_name(type), uitos((uintptr_t) variant),
                                env->pending_delete_.space_left(), uitos(Thread::get_caller_id()));
                            return;
                        }
                        JSB_LOG(Verbose, "(fallback) deleting possibly reference-based variant (%s:%s)",
                            Variant::get_type_name(type), uitos((uintptr_t) variant));
                    }
                    else
                    {
                        // JSB_LOG(VeryVerbose, "deleting valuetype variant (%s:%s)", Variant::get_type_name(type), uitos((uintptr_t) variant));
                        jsb_check(type != Variant::OBJECT);
                    }
                    Environment::dealloc_variant(variant);
                }, this))
            ).Check();
        }

        NativeObjectID bind_godot_object(NativeClassID p_class_id, Object* p_pointer, const v8::Local<v8::Object>& p_object);

        // whether the pointer registered in the object binding map
        jsb_force_inline bool check_object(void* p_pointer) const { return get_object_id(p_pointer).is_valid(); }
        jsb_force_inline NativeObjectID get_object_id(void* p_pointer) const
        {
            const NativeObjectID* it = objects_index_.getptr(p_pointer);
            return it ? *it : NativeObjectID();
        }

        // whether the `p_pointer` registered in the object binding map
        // return true, and the corresponding JS value if `p_pointer` is valid
        jsb_force_inline bool get_object(void* p_pointer, v8::Local<v8::Object>& r_unwrap) const
        {
            if (const NativeObjectID* entry = objects_index_.getptr(p_pointer))
            {
                const ObjectHandle& handle = objects_.get_value(*entry);
                jsb_check(get_object_class(p_pointer).type != NativeClassType::GodotPrimitive);
                r_unwrap = handle.ref_.Get(isolate_);
                return true;
            }
            return false;
        }

        jsb_force_inline v8::Local<v8::Object> get_object(void* p_pointer) const
        {
            const NativeObjectID* entry = objects_index_.getptr(p_pointer);
            jsb_check(entry);
            return get_object(*entry);
        }

        jsb_force_inline v8::Local<v8::Object> get_object(const NativeObjectID& p_object_id) const
        {
            const ObjectHandle& handle = objects_.get_value(p_object_id);
            jsb_check(native_classes_.get_value(handle.class_id).type != NativeClassType::GodotPrimitive);
            return handle.ref_.Get(isolate_);
        }

        jsb_force_inline const NativeClassInfo& get_object_class(void* p_pointer) const
        {
            const NativeClassInfo* class_info = find_object_class(p_pointer);
            jsb_check(class_info);
            return *class_info;
        }

        jsb_force_inline const NativeClassInfo* find_object_class(void* p_pointer) const
        {
            if (const NativeObjectID* it = objects_index_.getptr(p_pointer))
            {
                const ObjectHandle& handle = objects_.get_value(*it);
                jsb_check(native_classes_.is_valid_index(handle.class_id));
                return &native_classes_.get_value(handle.class_id);
            }
            return nullptr;
        }

        /**
         * Check if the type of `p_pointer` is NativeClassType::GodotObject.
         * \note the return value does not stand for an alive object.
         * \note return true if the pointer is null, since null can be treated as any null Object.
         */
        jsb_force_inline static bool verify_godot_object(v8::Isolate* isolate, void* p_pointer)
        {
#if JSB_VERIFY_GODOT_OBJECT
            if (jsb_likely(p_pointer))
            {
                if (const NativeClassInfo* class_info = wrap(isolate)->find_object_class(p_pointer);
                    !class_info || class_info->type != NativeClassType::GodotObject)
                {
                    return false;
                }
            }
#endif
            return true;
        }

        jsb_force_inline NativeClassType::Type get_object_type(void* p_pointer) const
        {
            if (const NativeClassInfo* class_info = find_object_class(p_pointer)) return class_info->type;
            return NativeClassType::None;
        }

        // return true if can die
        bool reference_object(void* p_pointer, bool p_is_inc);
        void mark_as_persistent_object(void* p_pointer);

        // request a full garbage collection
        void gc();
        void set_battery_save_mode(bool p_enabled);

        void update();

        class IModuleLoader* find_module_loader(const StringName& p_module_id) const
        {
            const HashMap<StringName, class IModuleLoader*>::ConstIterator it = module_loaders_.find(p_module_id);
            if (it != module_loaders_.end())
            {
                return it->value;
            }
            return nullptr;
        }

        template<typename T, typename... ArgumentTypes>
        T& add_module_loader(const StringName& p_module_id, ArgumentTypes&&... p_args)
        {
            if (const HashMap<StringName, IModuleLoader*>::Iterator& it = module_loaders_.find(p_module_id))
            {
                JSB_LOG(Warning, "duplicated module loader %s", p_module_id);
                memdelete(it->value);
                module_loaders_.remove(it);
            }
            T* loader = memnew(T(std::forward<ArgumentTypes>(p_args)...));
            module_loaders_.insert(p_module_id, loader);
            return *loader;
        }

        class IModuleResolver* find_module_resolver(const String& p_module_id, String& r_asset_path) const
        {
            for (IModuleResolver* resolver : module_resolvers_)
            {
                if (resolver->get_source_info(p_module_id, r_asset_path))
                {
                    return resolver;
                }
            }

            return nullptr;
        }

        template<typename T, typename... ArgumentTypes>
        T& add_module_resolver(ArgumentTypes... p_args)
        {
            T* resolver = memnew(T(p_args...));
            module_resolvers_.append(resolver);
            return *resolver;
        }

        /**
         * \brief
         * \param p_type category of the class, a GodotObject class is also registered in `godot_classes_index` map
         * \param p_class_name class_name must be unique if it's a GodotObject class
         * \return
         */
        NativeClassID add_class(NativeClassType::Type p_type, const StringName& p_class_name)
        {
            const NativeClassID class_id = native_classes_.add(NativeClassInfo());
            NativeClassInfo& class_info = native_classes_.get_value(class_id);
            class_info.type = p_type;
            class_info.name = p_class_name;
            if (p_type == NativeClassType::GodotObject)
            {
                jsb_check(!godot_classes_index_.has(p_class_name));
                godot_classes_index_.insert(p_class_name, class_id);
            }
            JSB_LOG(VeryVerbose, "new class %s (%d)", p_class_name, (uint32_t) class_id);
            return class_id;
        }

        jsb_force_inline const NativeClassInfo* find_godot_class(const StringName& p_name, NativeClassID& r_class_id) const
        {
            if (const NativeClassID* it = godot_classes_index_.getptr(p_name))
            {
                r_class_id = *it;
                return &native_classes_.get_value(r_class_id);
            }
            return nullptr;
        }

        /**
         * [unsafe] it's dangerous to hold the `NativeClassInfo` reference/pointer because the address is not ensured stable.
         */
        jsb_force_inline NativeClassInfo& get_native_class(NativeClassID p_class_id) { return native_classes_.get_value(p_class_id); }
        jsb_force_inline internal::SArray<NativeClassInfo, NativeClassID>::ScopedPointer _get_native_class(NativeClassID p_class_id) { return native_classes_.get_value_scoped(p_class_id); }
        jsb_force_inline const NativeClassInfo& get_native_class(NativeClassID p_class_id) const { return native_classes_.get_value(p_class_id); }

        jsb_force_inline ScriptClassInfo& add_script_class(ScriptClassID& r_class_id)
        {
            r_class_id = script_classes_.add({});
            return script_classes_.get_value(r_class_id);
        }
        jsb_force_inline ScriptClassInfo& get_script_class(ScriptClassID p_class_id) { return script_classes_.get_value(p_class_id); }
        jsb_force_inline ScriptClassInfo* find_script_class(ScriptClassID p_class_id) { return script_classes_.is_valid_index(p_class_id) ? &script_classes_.get_value(p_class_id) : nullptr; }

    private:
        void on_context_created(const v8::Local<v8::Context>& p_context);
        void on_context_destroyed(const v8::Local<v8::Context>& p_context);

        static std::shared_ptr<Environment> _access(void* p_runtime);
        void exec_sync_delete();

        // [low level binding] unbind a raw pointer from javascript object lifecycle
        void unbind_pointer(void* p_pointer);

        // callback from v8 gc (not 100% guaranteed called)
        jsb_force_inline static void object_gc_callback(const v8::WeakCallbackInfo<void>& info)
        {
            Environment* environment = wrap(info.GetIsolate());
            environment->free_object(info.GetParameter(), true);
        }

        void free_object(void* p_pointer, bool p_free);
    };
}

#endif
