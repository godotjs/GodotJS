#ifndef GODOTJS_ENVIRONMENT_H
#define GODOTJS_ENVIRONMENT_H

#include "jsb_bridge_pch.h"
#include "jsb_module.h"
#include "jsb_message.h"
#include "jsb_object_db.h"
#include "jsb_debugger.h"
#include "jsb_class_info.h"
#include "jsb_value_move.h"
#include "jsb_statistics.h"
#include "jsb_timer_action.h"
#include "jsb_object_handle.h"
#include "jsb_module_loader.h"
#include "jsb_module_resolver.h"
#include "jsb_string_name_cache.h"
#include "jsb_array_buffer_allocator.h"

#include "../internal/jsb_internal.h"

// get v8 string value from string name cache with the given name
#define jsb_name(env, name) (env)->get_string_value(jsb_string_name(name))

// get v8 symbol value from pre-allocated symbol registry
#define jsb_symbol(env, name) (env)->get_symbol(Symbols::name)

namespace jsb
{
    enum : uint32_t { kIsolateEmbedderData = 0, };
    enum : uint32_t { kContextEmbedderData = 0, };

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
            ClassRPCConfig,          // @rpc annotation for rpc functions
            Doc,
            MemberDocMap,

            CrossBind,               // a symbol can only be used from C++ to indicate calling from cross-bind
            CDO,                     // constructing class default object for a script
            kNum,
        };
    }

    struct TransferData
    {
        virtual ~TransferData() = default;
    };

    // Environment it-self is NOT thread-safe.
    class Environment : public std::enable_shared_from_this<Environment>
    {
    private:
        struct AsyncCall
        {
            enum Type : uint8_t
            {
                TYPE_NONE,

                // no finalization: no need to do additional finalization because `free_callback` is triggered by godot when an Object is being deleted
                TYPE_FREE,

                // should only be used in gc callback
                TYPE_GC,

                TYPE_REF,
                TYPE_DEREF,

                TYPE_TRANSFER_,
            };

            Type type_;

            void* binding_;

            AsyncCall(Type p_type, void* p_binding)
                : type_(p_type), binding_(p_binding)
            {}
            ~AsyncCall() = default;

            AsyncCall(AsyncCall&&) noexcept = default;
            AsyncCall& operator=(AsyncCall&&) noexcept = default;
        };

        friend class Builtins;
        friend struct InstanceBindingCallbacks;
        friend struct ClassRegister;

        //TODO remove this later
        friend struct ScriptClassInfo;

        // symbol for class_id on FunctionTemplate of native class
        v8::Global<v8::Symbol> symbols_[Symbols::kNum];

        /*volatile*/
        Thread::ID thread_id_;

        v8::Isolate* isolate_;
        v8::Global<v8::Context> context_;

        ArrayBufferAllocator allocator_;

        internal::DoubleBuffered<Message> inbox_;

#if JSB_THREADING
        internal::DoubleBuffered<AsyncCall> async_calls_;
#endif

        // indirect lookup
        // only godot object classes are mapped
        HashMap<StringName, NativeClassID> godot_classes_index_;

        // all exposed native classes
        internal::SArray<NativeClassInfo, NativeClassID> native_classes_;

        //TODO all exported default classes inherit native godot class (directly or indirectly)
        // they're only collected on a module loaded
        internal::SArray<ScriptClassInfo, ScriptClassID> script_classes_;

        StringNameCache string_name_cache_;

        ObjectDB object_db_;
        HashSet<void*> persistent_objects_;

        static internal::VariantAllocator variant_allocator_;

        // module_id => loader
        HashMap<StringName, class IModuleLoader*> module_loaders_;
        Vector<IModuleResolver*> module_resolvers_;

        internal::TTimerManager<JavaScriptTimerAction> timer_manager_;
        bool microtasks_run_ = false;

#if JSB_WITH_DEBUGGER
        JavaScriptDebugger debugger_;
#endif

        internal::SourceMapCache _source_map_cache;

        internal::CFunctionPointers function_pointers_;

        JavaScriptModuleCache module_cache_;

        std::unordered_map<TWeakRef<v8::Function>, internal::Index32, TWeakRef<v8::Function>::hasher, TWeakRef<v8::Function>::equaler> function_refs_; // backlink
        internal::SArray<TStrongRef<v8::Function>, internal::Index32> function_bank_;

        struct DeferredClassRegister
        {
            NativeClassID id = {};

            // see VariantBind::reflect_bind
            ClassRegisterFunc register_func = nullptr;
        };

        HashMap<StringName, DeferredClassRegister> class_register_map_;
        StringName godot_primitive_map_[Variant::VARIANT_MAX];

        internal::VariantInfoCollection variant_info_collection_;

    public:
        struct CreateParams
        {
            int initial_class_slots = 0;
            int initial_object_slots = 0;
            int initial_script_slots = 0;

            // Port for the debugger. Disable if zero.
            uint16_t debugger_port = 0;

            Thread::ID thread_id = 0;
        };

        Environment(const CreateParams& p_params);
        ~Environment();

        // standard init
        void init();

        // In general use cases, the lifetime of Environment is explicitly managed by ScriptLanguage,
        // and it must be disposed with the ScriptLanguage finished.
        //
        // At the same time, as a shared_ptr, the underlying `Isolate` in Environment will be eventually disposed/deleted until there
        // is no critical references exist (such as Global handles) to avoid crashes.
        // Should avoid any script execution during this phase (after disposed before destructed).
        void dispose();

        jsb_force_inline static Environment* wrap(v8::Isolate* p_isolate)
        {
            Environment* env = (Environment*) p_isolate->GetData(kIsolateEmbedderData);
            // jsb_check(env && env->thread_id_ == Thread::get_caller_id());
            return env;
        }
        jsb_force_inline static Environment* wrap(const v8::Local<v8::Context>& p_context)
        {
            Environment* env = (Environment*) p_context->GetAlignedPointerFromEmbedderData(kContextEmbedderData);
            // jsb_check(env && env->thread_id_ == Thread::get_caller_id());
            return env;
        }

        jsb_force_inline v8::Isolate* get_isolate() const { return isolate_; }
        jsb_force_inline v8::Local<v8::Context> get_context() const { return context_.Get(isolate_); }
        jsb_force_inline EnvironmentID id() const { return (EnvironmentID) this; }

        jsb_force_inline internal::VariantInfoCollection& get_variant_info_collection() { return variant_info_collection_; }

        void add_class_register(const Variant::Type p_type, const ClassRegisterFunc p_func)
        {
            jsb_check(!internal::VariantUtil::is_valid_name(godot_primitive_map_[p_type]));
            const StringName type_name = Variant::get_type_name(p_type);
            godot_primitive_map_[p_type] = type_name;
            add_class_register(type_name, p_func);
        }

        void add_class_register(const StringName& p_type_name, const ClassRegisterFunc p_func)
        {
            jsb_check(internal::VariantUtil::is_valid_name(p_type_name));
            jsb_check(!class_register_map_.has(p_type_name));
            class_register_map_.insert(p_type_name, { {}, p_func });
        }

        //TODO temp, get C++ function pointer (include class methods)
        jsb_force_inline static uint8_t* get_function_pointer(const v8::Local<v8::Context>& p_context, uint32_t p_offset)
        {
            return wrap(p_context)->function_pointers_[p_offset];
        }

        ObjectCacheID get_cached_function(const v8::Local<v8::Function>& p_func);
        bool release_function(ObjectCacheID p_func_id);
        Variant call_function(NativeObjectID p_object_id, ObjectCacheID p_func_id, const Variant **p_args, int p_argcount, Callable::CallError &r_error);

        /**
         * This method will not throw any JS exception.
         */
        Variant call_script_method(ScriptClassID p_script_class_id, NativeObjectID p_object_id, const StringName& p_method, const Variant** p_argv, int p_argc, Callable::CallError& r_error);

        // [EXPERIMENTAL] transfer object between environments.
        // call this method of the source environment in the source environment thread.
        // [pseudo] transfer_object(worker, master, worker_handle, scene->instantiate());
        static void transfer_object(Environment* p_from, Environment* p_to, NativeObjectID p_worker_handle_id, Object* p_object);

        bool get_script_property_value(NativeObjectID p_object_id, const ScriptPropertyInfo& p_info, Variant& r_val);
        bool set_script_property_value(NativeObjectID p_object_id, const ScriptPropertyInfo& p_info, const Variant& p_val);

        // Get default property value of a script class.
        // Potential side effects: This procedure may construct a new CDO instance (the reason why an `Environment` is required).
        bool get_default_property_value(ScriptClassInfo& p_class_info, const StringName& p_name, Variant& r_val);

        void evaluate_default_values(ScriptClassInfo& p_class_info);

        jsb_force_inline const JavaScriptModuleCache& get_module_cache() const { return module_cache_; }
        jsb_force_inline JavaScriptModuleCache& get_module_cache() { return module_cache_; }

        //NOTE AVOID USING THIS CALL, CONSIDERING REMOVING IT.
        //     eval from source
        JSValueMove eval_source(const char* p_source, int p_length, const String& p_filename, Error& r_err);

        /**
         * \brief load a module script
         * \param p_name module_id
         * \param r_module internal module info, DO NOT STORE IT OUTSIDE OF REALM.
         * \return OK if compiled and run with no error
         */
        Error load(const String& p_name, JavaScriptModule** r_module = nullptr);

        //TODO is there a simple way to compile (validate) the script without any side effect?
        bool validate_script(const String& p_path);

        NativeObjectID crossbind(Object* p_this, ScriptClassID p_class_id);

        void rebind(Object* p_this, ScriptClassID p_class_id);

        v8::Local<v8::Function> _new_require_func(const String& p_module_id);

        bool _get_main_module(v8::Local<v8::Object>* r_main_module) const;

        // return nullptr if no register for `p_type_name`
        NativeClassInfoPtr expose_class(const StringName& p_type_name, NativeClassID* r_class_id = nullptr);

        NativeClassInfoPtr expose_godot_object_class(const ClassDB::ClassInfo* p_class_info, NativeClassID* r_class_id = nullptr);

        NativeClassInfoPtr expose_godot_primitive_class(const Variant::Type p_type, NativeClassID* r_class_id = nullptr)
        {
            jsb_check(internal::VariantUtil::is_valid_name(godot_primitive_map_[p_type]));
            return expose_class(godot_primitive_map_[p_type], r_class_id);
        }

        NativeClassID get_godot_primitive_class_id(const Variant::Type p_type) const
        {
            return class_register_map_.get(godot_primitive_map_[p_type]).id;
        }

        // return false if something wrong with an exception thrown
        // caller should handle the exception if it's not called from js
        JavaScriptModule* _load_module(const String& p_parent_id, const String& p_module_id);

        // manually scan changes of modules,
        // will reload IMMEDIATELY
        // (modules not attached with GodotJS script are not automatically reloaded by resource manager)
        void scan_external_changes();

        // request to reload a module,
        // will reload until next load.
        ModuleReloadResult::Type mark_as_reloading(const StringName& p_name);

        void start_debugger(uint16_t p_port);

        jsb_force_inline bool is_caller_thread() const { return Thread::get_caller_id() == thread_id_; }
        jsb_force_inline void check_internal_state() const { jsb_checkf(is_caller_thread(), "multi-threaded call not supported yet"); }

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

        NativeObjectID bind_godot_object(NativeClassID p_class_id, Object* p_pointer, const v8::Local<v8::Object>& p_object);

        // [low level binding] bind a C++ `p_pointer` with a JS `p_object`
        // p_type is redundant (could retrieve from class registry with p_class_id), but it's faster to pass it directly
        // p_pointer must be 2-byte aligned (v8 requirement)
        NativeObjectID bind_pointer(NativeClassID p_class_id, NativeClassType::Type p_type, void* p_pointer, const v8::Local<v8::Object>& p_object, int p_external_rc);

        // An optimized binder for Variant. All variant values are not registered in `env`, and completely managed by JS.
        // The real `p_class_id` of `p_pointer` is unnecessary as an input parameter since `Variant` is used as the underlying type for any `TStruct` (primitive type).
        // May change in the future.
        jsb_force_inline void bind_valuetype(Variant* p_pointer, const v8::Local<v8::Object>& p_object)
        {
            p_object->SetAlignedPointerInInternalField(IF_Pointer, p_pointer);
            impl::Helper::SetDeleter(p_pointer, p_object, _valuetype_deleter, this);
        }

        jsb_force_inline NativeObjectID get_object_id(void* p_pointer) const { return object_db_.try_get_object_id(p_pointer); }

        // whether the `p_pointer` registered in the object binding map
        // return true, and the corresponding JS value if `p_pointer` is valid
        template <typename T>
        jsb_force_inline bool try_get_object(T p_key, v8::Local<v8::Object>& r_unwrap) const
        {
            if (const ObjectHandleConstPtr ptr = object_db_.try_get_object(p_key))
            {
                r_unwrap = ptr->ref_.Get(isolate_);
                return true;
            }
            return false;
        }

        // Get JS object, will crash if object_id is invalid
        jsb_force_inline v8::Local<v8::Object> get_object(const NativeObjectID& p_object_id) const
        {
            const ObjectHandleConstPtr ptr = object_db_.get_object(p_object_id);
            jsb_check(native_classes_.get_value(ptr->class_id).type != NativeClassType::GodotPrimitive);
            return ptr->ref_.Get(isolate_);
        }

        jsb_force_inline const NativeClassInfo* find_object_class(void* p_pointer) const
        {
            if (const ObjectHandleConstPtr ptr = object_db_.try_get_object(p_pointer))
            {
                return &native_classes_.get_value(ptr->class_id);
            }
            return nullptr;
        }

        // whether the pointer registered in the object binding map
        jsb_force_inline bool verify_object(void* p_pointer) const
        {
            return jsb_likely(p_pointer) && object_db_.has_object(p_pointer);
        }

        void* get_verified_object(const v8::Local<v8::Object>& p_obj, NativeClassType::Type p_type) const;

        // return true if operation is successful
        bool reference_object(void* p_pointer, bool p_is_inc);
        void mark_as_persistent_object(void* p_pointer);

        // request a full garbage collection
        void gc();
        void set_battery_save_mode(bool p_enabled);

        void update(uint64_t p_delta_msecs);

        // [thread safe] it's OK to call this method before the evn inited.
        void post_message(Message&& p_message)
        {
            JSB_LOG(VeryVerbose, "inbox message %d: %d", p_message.get_id(), p_message.get_buffer().size());
            inbox_.add(std::move(p_message));
        }

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

        class IModuleResolver* find_module_resolver(const String& p_module_id, ModuleSourceInfo& r_source_info) const
        {
            for (IModuleResolver* resolver : module_resolvers_)
            {
                if (resolver->get_source_info(p_module_id, r_source_info))
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
        NativeClassID add_native_class(const NativeClassType::Type p_type, const StringName& p_class_name)
        {
            jsb_check(Thread::get_caller_id() == thread_id_);
            const NativeClassID class_id = native_classes_.add(NativeClassInfo());
            NativeClassInfo& class_info = native_classes_.get_value(class_id);
            class_info.type = p_type;
            class_info.name = p_class_name;
            if (p_type == NativeClassType::GodotObject)
            {
                jsb_check(!godot_classes_index_.has(p_class_name));
                godot_classes_index_.insert(p_class_name, class_id);
            }
            JSB_LOG(VeryVerbose, "new class %s (%d)", p_class_name, class_id);
            return class_id;
        }

        // [unsafe, lowlevel, experimental] call a tweak function on the class
        void on_class_post_bind(const NativeClassInfoPtr& p_class_info);

        // [unsafe]
        // It's dangerous to hold the `NativeClassInfo` reference/pointer because the address is not ensured stable.
        // All `get_` methods will crash if `p_class_id` is invalid
        jsb_force_inline NativeClassInfoPtr get_native_class(const NativeClassID p_class_id) { return native_classes_.get_value_scoped(p_class_id); }
        jsb_force_inline NativeClassInfoConstPtr get_native_class(const NativeClassID p_class_id) const { return native_classes_.get_value_scoped(p_class_id); }

        jsb_force_inline ScriptClassInfoPtr add_script_class(ScriptClassID& r_class_id)
        {
            r_class_id = script_classes_.add({});
            return script_classes_.get_value_scoped(r_class_id);
        }
        jsb_force_inline ScriptClassInfoPtr get_script_class(const ScriptClassID p_class_id) { return script_classes_.get_value_scoped(p_class_id); }
        jsb_force_inline ScriptClassInfoConstPtr get_script_class(const ScriptClassID p_class_id) const { return script_classes_.get_value_scoped(p_class_id); }
        jsb_force_inline ScriptClassInfoPtr find_script_class(const ScriptClassID p_class_id) { return script_classes_.is_valid_index(p_class_id) ? script_classes_.get_value_scoped(p_class_id) : nullptr; }

        void get_statistics(Statistics& r_stats) const;

        static std::shared_ptr<Environment> _access(void* p_runtime);

        // [unsafe] get the environment from the current thread
        static std::shared_ptr<Environment> _access();

        static void exec_sync_delete()
        {
            variant_allocator_.drain();
        }

    private:
        void exec_async_calls();
        void exec_async_call(AsyncCall::Type p_type, void* p_binding);

        /**
         * @note execution order is not guaranteed
         */
        bool add_async_call(AsyncCall::Type p_type, void* p_binding);

        void _on_worker_transfer(const v8::Local<v8::Context>& p_context, const struct TransferObjectData* p_data);
        void _on_worker_message(const v8::Local<v8::Context>& p_context, const Message& p_message);

        void _rebind(v8::Isolate* isolate, const v8::Local<v8::Context> context, Object* p_this, ScriptClassID p_class_id);

        Variant _call(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Function>& p_func,
            const v8::Local<v8::Value>& p_self, const Variant** p_args, int p_argcount, Callable::CallError& r_error);

        /**
         * Setup `onready` fields (this method must be called before `_ready`).
         * This method will not throw any JS exception.
         */
        void call_script_prelude(ScriptClassID p_script_class_id, NativeObjectID p_object_id);

        // callback from v8 gc (not 100% guaranteed called)
        jsb_force_inline static void object_gc_callback(const v8::WeakCallbackInfo<void>& info)
        {
            Environment* env = wrap(info.GetIsolate());
            env->add_async_call(AsyncCall::TYPE_GC, info.GetParameter());
        }

        // only for quickjs.impl
        static void _valuetype_deleter(const v8::WeakCallbackInfo<void>& info)
        {
            _valuetype_deleter(info.GetInternalField(IF_Pointer), sizeof(Variant), info.GetParameter());
        }

        static void _valuetype_deleter(void* data, size_t length, void* deleter_data)
        {
            Variant* variant = (Variant*) data;

            // valuetype deleter is run in a background thread in v8.impl and jsc.impl
#if JSB_WITH_V8 || JSB_WITH_JAVASCRIPTCORE
            // `Callable/Array/Dictionary` may contain reference-based objects.
            // executing the destructor of a reference-based object may cause crash (not thread-safe),
            // release them in main thread for simplicity.
            if (const Variant::Type type = variant->get_type();
                type == Variant::CALLABLE || type == Variant::ARRAY || type == Variant::DICTIONARY)
            {
                Environment::variant_allocator_.free_safe(variant);
                JSB_LOG(VeryVerbose, "deleting possibly reference-based variant (%s:%d) thread:%s",
                    Variant::get_type_name(type), (uintptr_t) variant,
                    uitos(Thread::get_caller_id()));
                return;
            }
            else
            {
                // JSB_LOG(VeryVerbose, "deleting valuetype variant (%s:%d)", Variant::get_type_name(type), (uintptr_t) variant);
                jsb_check(type != Variant::OBJECT);
            }
#endif
            Environment::dealloc_variant(variant);
        }

        void free_object(void* p_pointer, FinalizationType p_finalize);
    };
}

#endif
