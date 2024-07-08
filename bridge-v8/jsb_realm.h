#ifndef GODOTJS_REALM_H
#define GODOTJS_REALM_H

#include "jsb_ref.h"
#include "jsb_pch.h"
#include "jsb_environment.h"
#include "jsb_module.h"
#include "jsb_primitive_bindings.h"
#include "jsb_value_move.h"
#include "../internal/jsb_variant_info.h"

#include <unordered_map>

namespace jsb
{
    enum : uint32_t
    {
        kContextEmbedderData = 0,
    };

    /**
     * a sandbox-like execution context for scripting (NOT thread-safe)
     * \note members starting with '_' are assumed the a v8 scope already existed in the caller
     */
    class Realm : public std::enable_shared_from_this<Realm>
    {
    private:
        friend class JavaScriptLanguage;
        friend class Builtins;

        static internal::SArray<Realm*, RealmID> realms_;

        RealmID id_;

        // hold a reference to Environment which ensure runtime being destructed after context
        std::shared_ptr<class Environment> environment_;
        v8::Global<v8::Context> context_;

        internal::CFunctionPointers function_pointers_;

        JavaScriptModuleCache module_cache_;

        std::unordered_map<TWeakRef<v8::Function>, internal::Index32, TWeakRef<v8::Function>::hasher, TWeakRef<v8::Function>::equaler> function_refs_; // backlink
        internal::SArray<TStrongRef<v8::Function>, internal::Index32> function_bank_;

        struct GodotPrimitiveImport
        {
            NativeClassID id = {};
            StringName type_name;
            PrimitiveTypeRegisterFunc register_func = nullptr;
        };

        //TODO
        GodotPrimitiveImport godot_primitive_index_[Variant::VARIANT_MAX] = {};
        HashMap<StringName, Variant::Type> godot_primitive_map_;

        internal::VariantInfoCollection variant_info_collection_;

    public:
        Realm(const std::shared_ptr<class Environment>& runtime);
        ~Realm();

        jsb_force_inline RealmID id() const { return id_; }

        jsb_force_inline internal::VariantInfoCollection& get_variant_info_collection() { return variant_info_collection_; }

        const std::shared_ptr<Environment>& get_environment() const { return environment_; }

        static std::shared_ptr<Realm> get_realm(const RealmID p_realm_id)
        {
            // return contexts_[p_realm_id]->shared_from_this();
            Realm* ptr;
            return realms_.try_get_value(p_realm_id, ptr) ? ptr->shared_from_this() : nullptr;
        }

        void register_primitive_binding(Variant::Type p_type, PrimitiveTypeRegisterFunc p_func)
        {
            const StringName type_name = Variant::get_type_name(p_type);
            godot_primitive_map_.insert(type_name, p_type);
            godot_primitive_index_[p_type] = { {}, type_name, p_func };
        }

        jsb_force_inline static Realm* wrap(const v8::Local<v8::Context>& p_context)
        {
            return (Realm*) p_context->GetAlignedPointerFromEmbedderData(kContextEmbedderData);
        }

        jsb_force_inline v8::Local<v8::Context> unwrap() const
        {
            return context_.Get(environment_->isolate_);
        }

        jsb_force_inline bool check(const v8::Local<v8::Context>& p_context) const
        {
            return context_ == p_context;
        }

        //TODO temp
        jsb_force_inline const GodotJSClassInfo& get_gdjs_class_info(GodotJSClassID p_class_id) const
        {
            return environment_->get_gdjs_class(p_class_id);
        }

        //TODO temp, get C++ function pointer (include class methods)
        jsb_force_inline static uint8_t* get_function_pointer(const v8::Local<v8::Context>& p_context, uint32_t p_offset)
        {
            return wrap(p_context)->function_pointers_[p_offset];
        }

        //TODO temp, js function (cached in `function_bank_`)
        ObjectCacheID retain_function(NativeObjectID p_object_id, const StringName& p_method);
        bool release_function(ObjectCacheID p_func_id);

        /**
         * This method will not throw any exception.
         */
        Variant call_function(NativeObjectID p_object_id, ObjectCacheID p_func_id, const Variant **p_args, int p_argcount, Callable::CallError &r_error);

        /**
         * Setup `onready` fields (this method must be called before `_ready`).
         * This method will not throw any exception.
         */
        void call_prelude(GodotJSClassID p_gdjs_class_id, NativeObjectID p_object_id);
        bool get_script_default_property_value(GodotJSClassID p_gdjs_class_id, const StringName& p_name, Variant& r_val);
        bool get_script_property_value(NativeObjectID p_object_id, const GodotJSPropertyInfo& p_info, Variant& r_val);
        bool set_script_property_value(NativeObjectID p_object_id, const GodotJSPropertyInfo& p_info, const Variant& p_val);

        jsb_force_inline const JavaScriptModuleCache& get_module_cache() const { return module_cache_; }
        jsb_force_inline JavaScriptModuleCache& get_module_cache() { return module_cache_; }

        //NOTE AVOID USING THIS CALL, CONSIDERING REMOVING IT.
        //     eval from source
        JSValueMove eval_source(const CharString& p_source, const String& p_filename, Error& r_err);

        /**
         * \brief load a module script
         * \param p_name module_id
         * \param r_module internal module info, DO NOT STORE IT OUTSIDE OF REALM.
         * \return OK if compiled and run with no error
         */
        Error load(const String& p_name, JavaScriptModule** r_module = nullptr);

        //TODO is there a simple way to compile (validate) the script without any side effect?
        bool validate_script(const String& p_path, struct JavaScriptExceptionInfo* r_err = nullptr);

        NativeObjectID crossbind(Object* p_this, GodotJSClassID p_class_id);

        void rebind(Object* p_this, GodotJSClassID p_class_id);

        jsb_force_inline v8::Isolate* get_isolate() const { jsb_check(environment_); return environment_->isolate_; }

        /**
         * \brief run  and return a value from source
         * \param p_source source bytes (utf-8 encoded)
         * \param p_source_len length of source
         * \param p_filename SourceOrigin (compile the code snippet without ScriptOrigin if `p_filename` is empty)
         * \return js rval
         */
        v8::MaybeLocal<v8::Value> _compile_run(const char* p_source, int p_source_len, const String& p_filename);
        v8::Local<v8::Function> _new_require_func(const String& p_module_id);

        bool _get_main_module(v8::Local<v8::Object>* r_main_module) const;

        // JS function (type_name: string): type
        // it's called from JS, load godot type with the `type_name` in the `godot` module (it can be type/singleton/constant/etc.)
        static void _load_godot_mod(const v8::FunctionCallbackInfo<v8::Value>& info);

        NativeClassID _expose_godot_class(const ClassDB::ClassInfo* p_class_info);
        NativeClassID _expose_godot_class(const StringName& p_class_name)
        {
            const HashMap<StringName, ClassDB::ClassInfo>::ConstIterator& it = ClassDB::classes.find(p_class_name);
            return it != ClassDB::classes.end() ? _expose_godot_class(&it->value) : NativeClassID();
        }

        const NativeClassInfo* _expose_godot_primitive_class(Variant::Type p_type, NativeClassID* r_class_id = nullptr);
        const NativeClassInfo* _expose_godot_primitive_class(const StringName& p_type_name, NativeClassID* r_class_id = nullptr)
        {
            const HashMap<StringName, Variant::Type>::ConstIterator& it = godot_primitive_map_.find(p_type_name);
            return it != godot_primitive_map_.end() ? _expose_godot_primitive_class(it->value, r_class_id) : nullptr;
        }

        // return false if something wrong with an exception thrown
        // caller should handle the exception if it's not called from js
        JavaScriptModule* _load_module(const String& p_parent_id, const String& p_module_id);

        // request to reload a module
        bool reload_module(const StringName& p_module_id);

        /**
         * Translate a Godot object into a javascript object. The type of `p_object_obj` will be automatically exposed to the context if not existed.
         */
        static bool gd_obj_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, Object* p_godot_obj, v8::Local<v8::Object>& r_jval);
        static bool js_to_gd_obj(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Object*& r_godot_obj);

        jsb_force_inline static bool gd_var_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& p_cvar, v8::Local<v8::Value>& r_jval) { return gd_var_to_js(isolate, context, p_cvar, p_cvar.get_type(), r_jval); }
        static bool gd_var_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& p_cvar, Variant::Type p_type, v8::Local<v8::Value>& r_jval);
        static bool js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant::Type p_type, Variant& r_cvar);

        //TODO not fully implemented
        /**
         * Translate js val into gd variant without any type hint
         */
        static bool js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant& r_cvar);

        /**
         * Check if a javascript value `p_val` could be converted into the expected primitive type `p_type`
         */
        static bool can_convert_strict(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val, Variant::Type p_type);

        ObjectCacheID get_cached_function(const v8::Local<v8::Function>& p_func);

    private:
        static void _godot_object_free(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_method(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_signal(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_utility_func(const v8::FunctionCallbackInfo<v8::Value>& info);

        static void _parse_script_class(Realm* p_realm, const v8::Local<v8::Context>& p_context, JavaScriptModule& p_module);
        static void _parse_script_class_iterate(Realm* p_realm, const v8::Local<v8::Context>& p_context, GodotJSClassInfo& p_class_info);

        Variant _call(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Function>& p_func, const v8::Local<v8::Value>& p_self, const Variant** p_args, int p_argcount, Callable::CallError& r_error);
    };
}

#endif
