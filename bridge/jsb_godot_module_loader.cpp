#include "jsb_godot_module_loader.h"
#include "jsb_environment.h"
#include "jsb_object_bindings.h"
#include "jsb_type_convert.h"

namespace jsb
{
    // JS function (type_name: string): type
    // it's called from JS, load godot type with the `type_name` in the `godot` module (it can be type/singleton/constant/etc.)
    // [JS] function load_type(type_name: string): Class;
    static void _load_godot_object_class(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, _load_godot_mod);

        v8::Isolate* isolate = info.GetIsolate();
        const v8::Local<v8::Value> arg0 = info[0];
        if (!arg0->IsString())
        {
            jsb_throw(isolate, "bad parameter");
            return;
        }

        const StringName type_name(impl::Helper::to_string(isolate, arg0));
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Environment* env = Environment::wrap(context);
        jsb_check(env);

        //NOTE do not break the order in `GDScriptLanguage::init()`

        // (1) singletons have the top priority (in GDScriptLanguage::init, singletons will overwrite the globals slot even if a type/const has the same name)
        //     check before getting to avoid error prints in `get_singleton_object`
        if (Engine::get_singleton()->has_singleton(type_name))
        if (Object* gd_singleton = Engine::get_singleton()->get_singleton_object(type_name))
        {
            JSB_LOG(VeryVerbose, "exposing singleton object %s", (String) type_name);
            if (v8::Local<v8::Object> rval;
                TypeConvert::gd_obj_to_js(isolate, context, gd_singleton, rval))
            {
                env->mark_as_persistent_object(gd_singleton);
                jsb_check(!rval.IsEmpty());
                info.GetReturnValue().Set(rval);
                return;
            }
            jsb_throw(isolate, "failed to bind a singleton object");
            return;
        }

        // (2) (global) utility functions.
        if (Variant::has_utility_function(type_name))
        {
            //TODO check static bindings at first, and dynamic bindings as a fallback

            // dynamic binding:
            jsb_check(sizeof(Variant::ValidatedUtilityFunction) == sizeof(void*));
            const int32_t utility_func_index = (int32_t) env->get_variant_info_collection().utility_funcs.size();
            env->get_variant_info_collection().utility_funcs.append({});
            internal::FUtilityMethodInfo& method_info = env->get_variant_info_collection().utility_funcs.write[utility_func_index];

            const int argument_count = Variant::get_utility_function_argument_count(type_name);
            method_info.argument_types.resize(argument_count);
            for (int index = 0, num = argument_count; index < num; ++index)
            {
                method_info.argument_types.write[index] = Variant::get_utility_function_argument_type(type_name, index);
            }
            //NOTE currently, utility functions have no default argument.
            // method_info.default_arguments = ...
            method_info.return_type = Variant::get_utility_function_return_type(type_name);
            method_info.is_vararg = Variant::is_utility_function_vararg(type_name);
            method_info.set_debug_name(type_name);
            method_info.utility_func = Variant::get_validated_utility_function(type_name);
            jsb_check(method_info.utility_func);
            JSB_LOG(VeryVerbose, "expose godot utility function %s (%d)", type_name, utility_func_index);

            info.GetReturnValue().Set(JSB_NEW_FUNCTION(context, ObjectReflectBindingUtil::_godot_utility_func, v8::Int32::New(isolate, utility_func_index)));
            return;
        }

        // (3) global_constants
        if (CoreConstants::is_global_constant(type_name))
        {
            const int constant_index = CoreConstants::get_global_constant_index(type_name);
            const int64_t constant_value = CoreConstants::get_global_constant_value(constant_index);
            info.GetReturnValue().Set(impl::Helper::new_integer(isolate, constant_value));
            return;
        }

        // (4) classes in ClassDB/PrimitiveTypes
        {
            if (const NativeClassInfoPtr class_info = env->expose_class(type_name))
            {
                jsb_check(class_info->name == type_name);
                jsb_check(!class_info->clazz.IsEmpty());
                info.GetReturnValue().Set(class_info->clazz.Get(isolate));
                return;
            }

            // dynamic binding: godot class types
            if (const NativeClassInfoPtr class_info = env->expose_godot_object_class(ClassDB::classes.getptr(type_name)))
            {
                jsb_check(class_info->name == type_name);
                jsb_check(!class_info->clazz.IsEmpty());
                info.GetReturnValue().Set(class_info->clazz.Get(isolate));
                return;
            }
        }

        // (5) global_enums
        if (CoreConstants::is_global_enum(type_name))
        {
            HashMap<StringName, int64_t> enum_values;
            CoreConstants::get_enum_values(type_name, &enum_values);
            info.GetReturnValue().Set(BridgeHelper::to_global_enum(isolate, context, enum_values));
            return;
        }

        // (6) special case: `Variant` (`Variant` is not exposed as it-self in js, but we still need to access the nested enums in it)
        // seealso: core/variant/binder_common.h
        //          VARIANT_ENUM_CAST(Variant::Type);
        //          VARIANT_ENUM_CAST(Variant::Operator);
        // they are exposed as `Variant.Type` in global constants in godot
        if (type_name == jsb_string_name(Variant))
        {
            v8::Local<v8::Object> obj = v8::Object::New(isolate);
            obj->Set(context, impl::Helper::new_string(isolate, "Type"), BridgeHelper::to_global_enum(isolate, context, "Variant.Type")).Check();
            obj->Set(context, impl::Helper::new_string(isolate, "Operator"), BridgeHelper::to_global_enum(isolate, context, "Variant.Operator")).Check();
            info.GetReturnValue().Set(obj);
            return;
        }

        impl::Helper::throw_error(isolate, jsb_format("godot class not found '%s'", type_name));
    }

    v8::Local<v8::Object> GodotModuleLoader::_get_loader_proxy(Environment* p_env)
    {
        if (!loader_.IsEmpty()) return loader_.Get(p_env->get_isolate());

        // load_type_impl: function(name)
        static constexpr char on_demand_loader_source[] = ""
            "(function (type_loader_func) {"
            "    return new Proxy({}, {"
            "        set: function (target, prop_name, value) {"
            "            if (typeof prop_name !== 'string') {"
            "                throw new Error(`only string key is allowed`);"
            "            }"
            "            if (typeof target[prop_name] !== 'undefined') {"
            "                console.warn('overwriting existing value', prop_name);"
            "            }"
            "            target[prop_name] = value;"
            "        },"
            "        get: function (target, prop_name) {"
            "            let o = target[prop_name];"
            "            if (typeof o === 'undefined' && typeof prop_name === 'string') {"
            "                o = target[prop_name] = type_loader_func(prop_name);"
            "            }"
            "            return o;"
            "        }"
            "    });"
            "})"
            "";
        const v8::MaybeLocal<v8::Value> func_maybe_local = p_env->_compile_run(on_demand_loader_source, std::size(on_demand_loader_source) - 1, "on_demand_loader_source");
        if (v8::Local<v8::Value> func_local; func_maybe_local.ToLocal(&func_local))
        {
            jsb_check(func_local->IsFunction());
            const v8::Local<v8::Function> loader = func_local.As<v8::Function>();

            v8::Isolate* isolate = p_env->get_isolate();
            const v8::Local<v8::Context> context = p_env->get_context();
            v8::Local<v8::Value> argv[] = { JSB_NEW_FUNCTION(context, _load_godot_object_class, {}) };
            const v8::MaybeLocal<v8::Value> result = loader->Call(context, v8::Undefined(isolate), std::size(argv), argv);

            if (v8::Local<v8::Value> proxy; result.ToLocal(&proxy))
            {
#if JSB_WITH_V8
                jsb_check(proxy->IsProxy());
#endif
                loader_.Reset(p_env->get_isolate(), proxy.As<v8::Object>());
                return proxy.As<v8::Object>();
            }
            // empty means error thrown in Call()
        }

        // empty means error thrown in _compile_run()
        return {};
    }

    bool GodotModuleLoader::load(Environment* p_env, JavaScriptModule& p_module)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = p_env->get_context();
        v8::Context::Scope context_scope(context);

        const v8::Local<v8::Object> loader = _get_loader_proxy(p_env);
        if (loader.IsEmpty())
        {
            return false;
        }

        // it's a proxy object which will load godot type on-demand until it's actually accessed in a script
        p_module.exports.Reset(isolate, loader);
        return true;
    }

}
