#ifndef GODOTJS_ENVIRONMENT_H
#define GODOTJS_ENVIRONMENT_H

#include "jsb_pch.h"
#include "jsb_array_buffer_allocator.h"
#include "jsb_object_handle.h"
#include "jsb_class_info.h"
#include "jsb_module_loader.h"
#include "jsb_module_resolver.h"
#include "jsb_primitive_bindings.h"
#include "jsb_timer_action.h"
#include "jsb_string_name_cache.h"
#include "../internal/jsb_sarray.h"
#include "../internal/jsb_timer_manager.h"

#if JSB_WITH_SOURCEMAP
#include "../internal/jsb_source_map_cache.h"
#endif

namespace jsb
{
    enum : uint32_t
    {
        kIsolateEmbedderData = 0,
    };

    namespace Symbols
    {
        enum Type : uint8_t
        {
            ClassId,
            ClassSignals,    // array of all @signal annotations
            ClassProperties, // array of all @export annotations
            kNum,
        };
    }

    // Environment it-self is NOT thread-safe.
    class Environment : public std::enable_shared_from_this<Environment>
    {
    private:
        friend class Realm;

        // symbol for class_id on FunctionTemplate of native class
        v8::Global<v8::Symbol> symbols_[Symbols::kNum];

        /*volatile*/
        Thread::ID thread_id_;

        v8::Isolate* isolate_;
        ArrayBufferAllocator allocator_;

        //TODO postpone the call of Global.Reset if calling from other threads
        // typedef void(*UnreferencingRequestCall)(internal::Index64);
        // Vector<UnreferencingRequestCall> request_calls_;
        // volatile bool pending_request_calls_;

        //TODO lock on 'objects_' when referencing?
        // lock;

        // indirect lookup
        // only godot object classes are mapped
        HashMap<StringName, NativeClassID> godot_classes_index_;

        // all exposed native classes
        internal::SArray<NativeClassInfo, NativeClassID> native_classes_;

        //TODO all exported default classes inherit native godot class (directly or indirectly)
        // they're only collected on a module loaded
        internal::SArray<GodotJSClassInfo, GodotJSClassID> gdjs_classes_;

        // internal::SArray<StringName, StringNameID> stringnames_;
        // HashMap<StringName, StringNameID> stringnames_index_;
        StringNameCache string_name_cache_;

        // cpp objects should be added here since the gc callback is not guaranteed by v8
        // we need to delete them on finally releasing Environment
        internal::SArray<ObjectHandle, NativeObjectID> objects_;

        // (unsafe) mapping object pointer to object_id
        HashMap<void*, NativeObjectID> objects_index_;
        HashSet<void*> persistent_objects_;

#if JSB_WITH_VARIANT_POOL
        PagedAllocator<Variant, false> variants_pool_;
#endif

        // module_id => loader
        HashMap<StringName, class IModuleLoader*> module_loaders_;
        Vector<IModuleResolver*> module_resolvers_;

        uint64_t last_ticks_;
        internal::TTimerManager<JavaScriptTimerAction> timer_manager_;

#if JSB_WITH_DEBUGGER
        std::unique_ptr<class JavaScriptDebugger> debugger_;
#endif

#if JSB_WITH_SOURCEMAP
        internal::SourceMapCache _source_map_cache;
#endif

    public:
        Environment();
        ~Environment();

        // replace position in the stacktrace with source map
        String handle_source_map(const String& p_stacktrace);

#if JSB_WITH_VARIANT_POOL
        jsb_force_inline Variant* alloc_variant(const Variant& p_templet)
        {
            Variant* rval = variants_pool_.alloc();
            *rval = p_templet;
            return rval;
            // if (const int n = variants_pool_.size())
            // {
            //     Variant* ru = variants_pool_[n - 1];
            //     variants_pool_.remove_at(n - 1);
            //     *ru = p_templet;
            //     return ru;
            // }
            // return memnew(Variant(p_templet));
        }

        jsb_force_inline Variant* alloc_variant()
        {
            return variants_pool_.alloc();
            // if (const int n = variants_pool_.size())
            // {
            //     Variant* ru = variants_pool_[n - 1];
            //     variants_pool_.remove_at(n - 1);
            //     return ru;
            // }
            // return memnew(Variant);
        }

        jsb_force_inline void dealloc_variant(Variant* p_var)
        {
            // VariantInternal::clear(p_var);
            // variants_pool_.append(p_var);
            variants_pool_.free(p_var);
        }
#else
        jsb_force_inline Variant* alloc_variant(const Variant& p_templet) { return memnew(Variant(p_templet)); }
        jsb_force_inline Variant* alloc_variant() { return memnew(Variant); }
        jsb_force_inline void dealloc_variant(Variant* p_var) { memdelete(p_var); }
#endif

        jsb_force_inline v8::Local<v8::Symbol> get_symbol(Symbols::Type p_type) const
        {
            return symbols_[p_type].Get(isolate_);
        }

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

        jsb_no_discard
        jsb_force_inline
        bool check(v8::Isolate* p_isolate) const { return p_isolate == isolate_; }

        // jsb_force_inline StringNameID add_string_name(const StringName& p_string_name)
        // {
        //     if (const HashMap<StringName, StringNameID>::Iterator& it = stringnames_index_.find(p_string_name); it != stringnames_index_.end())
        //     {
        //         return it->value;
        //     }
        //     const StringNameID id = stringnames_.add(p_string_name);
        //     stringnames_index_.insert(p_string_name, id);
        //     return id;
        // }
        // jsb_force_inline const StringName& get_string_name(const StringNameID& p_string_name_id) const { return stringnames_[p_string_name_id]; }

        /**
         * \brief bind a C++ `p_pointer` with a JS `p_object`
         * \param p_class_id
         * \param p_persistent keep a strong reference on pointer, usually used on binding singleton objects which are manually managed by native codes.
         */
        NativeObjectID bind_object(NativeClassID p_class_id, void* p_pointer, const v8::Local<v8::Object>& p_object, bool p_weakref = true);

        //TODO move this into Realm, change the token for set_instance_binding to context
        //TODO store all context instead of runtimes into a global array
        NativeObjectID bind_godot_object(NativeClassID p_class_id, Object* p_pointer, const v8::Local<v8::Object>& p_object);
        void unbind_object(void* p_pointer);

        // whether the pointer registered in the object binding map
        jsb_force_inline bool check_object(void* p_pointer) const { return get_object_id(p_pointer).is_valid(); }
        jsb_force_inline NativeObjectID get_object_id(void* p_pointer) const
        {
            const HashMap<void*, internal::Index64>::ConstIterator& it = objects_index_.find(p_pointer);
            return it != objects_index_.end() ? it->value : NativeObjectID();
        }

        // whether the `p_pointer` registered in the object binding map
        // return true, and the corresponding JS value if `p_pointer` is valid
        jsb_force_inline bool get_object(void* p_pointer, v8::Local<v8::Object>& r_unwrap) const
        {
            const HashMap<void*, internal::Index64>::ConstIterator& it = objects_index_.find(p_pointer);
            if (it != objects_index_.end())
            {
                const ObjectHandle& handle = objects_.get_value(it->value);
                r_unwrap = handle.ref_.Get(isolate_);
                return true;
            }
            return false;
        }

        jsb_force_inline const NativeClassInfo* get_object_class(void* p_pointer) const
        {
            const HashMap<void*, internal::Index64>::ConstIterator& it = objects_index_.find(p_pointer);
            if (it == objects_index_.end())
            {
                return nullptr;
            }
            const ObjectHandle& handle = objects_.get_value(it->value);
            if (!native_classes_.is_valid_index(handle.class_id))
            {
                return nullptr;
            }
            return &native_classes_.get_value(handle.class_id);
        }

        // return true if can die
        bool reference_object(void* p_pointer, bool p_is_inc);
        void mark_as_persistent_object(void* p_pointer);

        // request a garbage collection
        void gc();

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
            jsb_ensure(!module_loaders_.has(p_module_id));
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
         * \param r_class_id
         * \return
         */
        NativeClassInfo& add_class(NativeClassType::Type p_type, const StringName& p_class_name, NativeClassID* r_class_id = nullptr)
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
            if (r_class_id)
            {
                *r_class_id = class_id;
            }
            JSB_LOG(Verbose, "new class %s (%d)", p_class_name, (uint32_t) class_id);
            return class_info;
        }

        jsb_force_inline const NativeClassInfo* find_godot_class(const StringName& p_name, NativeClassID& r_class_id) const
        {
            if (const HashMap<StringName, NativeClassID>::ConstIterator it = godot_classes_index_.find(p_name); it != godot_classes_index_.end())
            {
                r_class_id = it->value;
                return &native_classes_[r_class_id];
            }
            return nullptr;
        }

        // [unsafe]
        jsb_force_inline NativeClassInfo& get_native_class(NativeClassID p_class_id) { return native_classes_.get_value(p_class_id); }
        jsb_force_inline const NativeClassInfo& get_native_class(NativeClassID p_class_id) const { return native_classes_.get_value(p_class_id); }

        jsb_force_inline GodotJSClassInfo& add_gdjs_class(GodotJSClassID& r_class_id)
        {
            r_class_id = gdjs_classes_.add({});
            return gdjs_classes_[r_class_id];
        }
        jsb_force_inline GodotJSClassInfo& get_gdjs_class(GodotJSClassID p_class_id) { return gdjs_classes_[p_class_id]; }
        jsb_force_inline GodotJSClassInfo* find_gdjs_class(GodotJSClassID p_class_id) { return gdjs_classes_.is_valid_index(p_class_id) ? &gdjs_classes_[p_class_id] : nullptr; }
        // jsb_force_inline const GodotJSClassInfo& get_gdjs_class(GodotJSClassID p_class_id) const { return gdjs_classes_[p_class_id]; }

    private:
        void on_context_created(const v8::Local<v8::Context>& p_context);
        void on_context_destroyed(const v8::Local<v8::Context>& p_context);

        jsb_force_inline static void object_gc_callback(const v8::WeakCallbackInfo<void>& info)
        {
            Environment* environment = wrap(info.GetIsolate());
            environment->free_object(info.GetParameter(), true);
        }

        void free_object(void* p_pointer, bool p_free);
    };
}

#endif
