#include "jsb_object_bindings.h"
#include "jsb_transpiler.h"
#include "jsb_type_convert.h"

namespace jsb
{
    NativeClassInfoPtr ObjectReflectBindingUtil::reflect_bind(Environment* p_env, const ClassDB::ClassInfo* p_class_info, NativeClassID* r_class_id)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        v8::HandleScope handle_scope(isolate);

        jsb_check(p_class_info);

        const NativeClassID class_id = p_env->add_native_class(NativeClassType::GodotObject, p_class_info->name);
        JSB_LOG(VeryVerbose, "expose godot type %s(%d)", p_class_info->name, class_id);

        // construct type template
        {

            impl::ClassBuilder class_builder = ClassTemplate<Object>::create(p_env, class_id);

            //NOTE all singleton object will overwrite the class itself in 'godot' module, so we need make all things defined on PrototypeTemplate.
            const bool is_singleton_class = Engine::get_singleton()->has_singleton(p_class_info->name);
            auto static_builder = is_singleton_class ? class_builder.Instance() : class_builder.Static();

#if JSB_EXCLUDE_GETSET_METHODS
            HashSet<StringName> omitted_methods;
#endif
            // class: properties (getset)
            for (const KeyValue<StringName, ::ClassDB::PropertySetGet>& pair : p_class_info->property_setget)
            {
                if (internal::StringNames::get_singleton().is_ignored(pair.key)) continue;

                const StringName& property_name = pair.key;
                const ::ClassDB::PropertySetGet& getset_info = pair.value;

                if (pair.value.index >= 0)
                {
                    const int remap_index = (int) p_env->get_variant_info_collection().properties2.size();
                    internal::FPropertyInfo2 property_info2;
                    property_info2.getter_func = getset_info._getptr;
                    property_info2.setter_func = getset_info._setptr;
                    property_info2.index = pair.value.index;
                    p_env->get_variant_info_collection().properties2.append(property_info2);

                    class_builder.Instance().Property(property_name,
                        getset_info._getptr ? _godot_object_get2 : nullptr,
                        getset_info._setptr ? _godot_object_set2 : nullptr, remap_index);
                    // we do not exclude get/set methods in this case, because the method may not be covered by all properties
                }
                else
                {
                    // not using `property_collection_` in this case due to lower memory cost
                    class_builder.Instance().Property(property_name,
                        getset_info._getptr ? _godot_object_method : nullptr, (void*) getset_info._getptr,
                        getset_info._setptr ? _godot_object_method : nullptr, (void*) getset_info._setptr);

#if JSB_EXCLUDE_GETSET_METHODS
                    if (internal::VariantUtil::is_valid_name(getset_info.getter)) omitted_methods.insert(getset_info.getter);
                    if (internal::VariantUtil::is_valid_name(getset_info.setter)) omitted_methods.insert(getset_info.setter);
#endif
                }
            }

            // class: methods
            for (const KeyValue<StringName, MethodBind*>& pair : p_class_info->method_map)
            {
#if JSB_EXCLUDE_GETSET_METHODS
                if (omitted_methods.has(pair.key)) continue;
#endif
                const StringName& method_name = pair.key;
                const MethodBind* method_bind = pair.value;

                if (method_bind->is_static())
                {
                    static_builder.Method(method_name, _godot_object_method, (void*) method_bind);
                }
                else
                {
                    class_builder.Instance().Method(method_name, _godot_object_method, (void*) method_bind);
                }
            }

             if (p_class_info->name == jsb_string_name(Object))
             {
                 // class: special methods
                 class_builder.Instance().Method(jsb_literal(free), _godot_object_free);
             }

             // class: signals
             for (const KeyValue<StringName, MethodInfo>& pair : p_class_info->signal_map)
             {
                 const StringName& name_str = pair.key;
                 const StringNameID string_id = p_env->get_string_name_cache().get_string_id(name_str);
                 class_builder.Instance().Property(pair.key, _godot_object_signal, *string_id);
             }

             HashSet<StringName> enum_consts;

             // class: enum (nested in class)
             for (const KeyValue<StringName, ClassDB::ClassInfo::EnumInfo>& pair : p_class_info->enum_map)
             {
                 v8::HandleScope handle_scope_for_enum(isolate);
                 impl::ClassBuilder::EnumDeclaration enumeration = static_builder.Enum(pair.key);
                 for (const StringName& enum_name : pair.value.constants)
                 {
                     const String& enum_name_str = (String) enum_name;
                     jsb_not_implemented(enum_name_str.contains("."), "hierarchically nested definition is currently not supported");
                     const auto& const_it = p_class_info->constant_map.find(enum_name);
                     jsb_check(const_it);
                     enumeration.Value(enum_name_str, const_it->value);
                     enum_consts.insert(enum_name);
                 }
             }

             // class: constants
             for (const KeyValue<StringName, int64_t>& pair : p_class_info->constant_map)
             {
                 if (enum_consts.has(pair.key)) continue;
                 const String& const_name_str = (String) pair.key;
                 jsb_not_implemented(const_name_str.contains("."), "hierarchically nested definition is currently not supported");

                 static_builder.Value(pair.key, pair.value);
             }

            // set `class_id` on the exposed godot native class for the convenience when finding it from any subclasses in javascript.
            class_builder.Static().Value(jsb_symbol(p_env, ClassId), *class_id);

            // build the prototype chain (inherit)
            if (NativeClassID super_class_id;
                const NativeClassInfoPtr super_class_info = p_env->expose_godot_object_class(p_class_info->inherits_ptr, &super_class_id))
            {
                // It's safe to expect that the base class is fully built,
                // because single inheritance is used in Godot (which means a reflect_bind class will only be accessed until it's fully built).
                class_builder.Inherit(super_class_info->clazz);
                JSB_LOG(VeryVerbose, "%s (%d) extends %s (%d)", p_class_info->name, class_id, p_class_info->inherits_ptr->name, super_class_id);
            }

            // preparation for return
            {
                NativeClassInfoPtr class_info = p_env->get_native_class(class_id);

                class_info->clazz = class_builder.Build();
                jsb_check(!class_info->clazz.IsEmpty());
                jsb_check(class_info->name == p_class_info->name);
                JSB_LOG(VeryVerbose, "build class info %s (%d) addr: %s", class_info->name, class_id, class_info.ptr());
                if (r_class_id) *r_class_id = class_id;
                return class_info;
            }
        } // end type template block scope
    }

    void ObjectReflectBindingUtil::_godot_object_signal(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        Environment* environment = Environment::wrap(isolate);
        const StringName name = environment->get_string_name_cache().get_string_name((const StringNameID) info.Data().As<v8::Uint32>()->Value());

        v8::Local<v8::Object> self = info.This();
        void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
        jsb_check(environment->check_object(pointer));

        // signal must be instance-owned
        const Object* gd_object = (Object*) pointer;
        if (v8::Local<v8::Value> rval; TypeConvert::gd_var_to_js(isolate, context, Signal(gd_object, name), rval))
        {
            info.GetReturnValue().Set(rval);
            return;
        }
        jsb_throw(isolate, "bad signal");
    }

    void ObjectReflectBindingUtil::_godot_object_free(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Object* gd_object;
        if (!TypeConvert::js_to_gd_obj(isolate, context, info.This(), gd_object) || !gd_object)
        {
            jsb_throw(isolate, "bad this");
            return;
        }

        Callable::CallError err;
        Variant dummy = gd_object->callp(jsb_string_name(free), nullptr, 0, err);
        jsb_check(dummy.get_type() == Variant::NIL);
        if (jsb_unlikely(err.error != Callable::CallError::CALL_OK))
        {
            jsb_throw(isolate, "bad free");
            return;
        }
    }

    void ObjectReflectBindingUtil::_godot_utility_func(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        const internal::FUtilityMethodInfo& method_info = Environment::wrap(context)->get_variant_info_collection().utility_funcs[info.Data().As<v8::Int32>()->Value()];
        const int argc = info.Length();

        // prepare argv
        if (!method_info.check_argc(argc))
        {
            jsb_throw(isolate, "num of arguments does not meet the requirement");
            return;
        }
        const Variant** argv = jsb_stackalloc(const Variant*, argc);
        const int known_argc = (int) method_info.argument_types.size();
        Variant* args = jsb_stackalloc(Variant, argc);
        for (int index = 0; index < argc; ++index)
        {
            memnew_placement(&args[index], Variant);
            argv[index] = &args[index];
            if (index < known_argc
                ? !TypeConvert::js_to_gd_var(isolate, context, info[index], method_info.argument_types[index], args[index])
                : !TypeConvert::js_to_gd_var(isolate, context, info[index], args[index]))
            {
                // revert all constructors
                const String error_message = jsb_errorf("bad argument: %d", index);
                while (index >= 0) { args[index--].~Variant(); }
                impl::Helper::throw_error(isolate, error_message);
                return;
            }
        }

        // call godot method
        Variant crval;
        method_info.utility_func(&crval, argv, argc);

        // don't forget to destruct all stack allocated variants
        for (int index = 0; index < argc; ++index)
        {
            args[index].~Variant();
        }

        v8::Local<v8::Value> jrval;
        if (TypeConvert::gd_var_to_js(isolate, context, crval, jrval))
        {
            info.GetReturnValue().Set(jrval);
            return;
        }
        jsb_throw(isolate, "failed to translate godot variant to v8 value");
    }

    void ObjectReflectBindingUtil::_godot_object_method(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        jsb_check(info.Data()->IsExternal());
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        const MethodBind* method_bind = (MethodBind*) info.Data().As<v8::External>()->Value();
        const int argc = info.Length();

        jsb_check(method_bind);
        Environment::wrap(isolate)->check_internal_state();
        Object* gd_object = nullptr;
        if (!method_bind->is_static())
        {
            if (!TypeConvert::js_to_gd_obj(isolate, context, info.This(), gd_object) || !gd_object)
            {
                jsb_throw(isolate, "bad this");
                return;
            }
        }

        // prepare argv
        const int method_argc = method_bind->get_argument_count();
        const bool method_is_vararg = method_bind->is_vararg();
        if (!internal::VariantUtil::check_argc(method_is_vararg, argc, method_bind->get_default_argument_count(), method_argc))
        {
            jsb_throw(isolate, "num of arguments does not meet the requirement");
            return;
        }
        const Variant** argv = jsb_stackalloc(const Variant*, argc);
        Variant* args = jsb_stackalloc(Variant, argc);
        for (int index = 0; index < argc; ++index)
        {
            memnew_placement(&args[index], Variant);
            argv[index] = &args[index];
            const Variant::Type type = index >= method_argc
                ? Variant::Type::NIL
                : method_bind->get_argument_type(index);
#if defined(DEBUG_ENABLED)
            if (method_bind->get_argument_type(index) != type)
            {
                JSB_LOG(Verbose, "[WARNING] unexpected return value of get_argument_type:%d (expected:%d)", method_bind->get_argument_type(index) , type);
            }
#endif
            if (!TypeConvert::js_to_gd_var(isolate, context, info[index], type, args[index]))
            {
                // revert all constructors
                const String error_message = jsb_errorf("bad argument: %d", index);
                while (index >= 0) { args[index--].~Variant(); }
                impl::Helper::throw_error(isolate, error_message);
                return;
            }
        }

        // call godot method
        Callable::CallError error;
        Variant crval = method_bind->call(gd_object, argv, argc, error);

        // don't forget to destruct all stack allocated variants
        for (int index = 0; index < argc; ++index)
        {
            args[index].~Variant();
        }

        if (error.error != Callable::CallError::CALL_OK)
        {
            jsb_throw(isolate, "failed to call");
            return;
        }
        v8::Local<v8::Value> jrval;
        const Variant::Type return_type = method_bind->get_argument_type(-1);
        jsb_check(return_type == method_bind->get_return_info().type);
        if (TypeConvert::gd_var_to_js(isolate, context, crval, return_type, jrval))
        {
            info.GetReturnValue().Set(jrval);
            return;
        }
        jsb_throw(isolate, "failed to translate godot variant to v8 value");
    }

    void ObjectReflectBindingUtil::_godot_object_get2(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        jsb_check(info.Data()->IsInt32());
        v8::Isolate* isolate = info.GetIsolate();
        Environment* env = Environment::wrap(isolate);
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        const internal::FPropertyInfo2& property_info = env->get_variant_info_collection().properties2[info.Data().As<v8::Int32>()->Value()];
        env->check_internal_state();
        // prepare argv
        if (info.Length() != 0)
        {
            jsb_throw(isolate, "num of arguments does not meet the requirement");
            return;
        }

        Object* gd_object = nullptr;
        if (!property_info.getter_func->is_static() && (!TypeConvert::js_to_gd_obj(isolate, context, info.This(), gd_object) || !gd_object))
        {
            jsb_throw(isolate, "bad this");
            return;
        }

        Variant args[] = { property_info.index };
        const Variant* argv[] = { &args[0] };

        // call godot method
        Callable::CallError error;
        Variant crval = property_info.getter_func->call(gd_object, argv, ::std::size(argv), error);

        if (error.error != Callable::CallError::CALL_OK)
        {
            jsb_throw(isolate, "failed to call");
            return;
        }
        v8::Local<v8::Value> jrval;
        const Variant::Type return_type = property_info.getter_func->get_argument_type(-1);
        jsb_check(return_type == property_info.getter_func->get_return_info().type);
        if (TypeConvert::gd_var_to_js(isolate, context, crval, return_type, jrval))
        {
            info.GetReturnValue().Set(jrval);
            return;
        }
        jsb_throw(isolate, "failed to translate godot variant to v8 value");
    }

    void ObjectReflectBindingUtil::_godot_object_set2(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        jsb_check(info.Data()->IsInt32());
        v8::Isolate* isolate = info.GetIsolate();
        Environment* env = Environment::wrap(isolate);
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        const internal::FPropertyInfo2& property_info = env->get_variant_info_collection().properties2[info.Data().As<v8::Int32>()->Value()];
        env->check_internal_state();
        // prepare argv
        if (info.Length() != 1)
        {
            jsb_throw(isolate, "num of arguments does not meet the requirement");
            return;
        }

        Object* gd_object = nullptr;
        if (!property_info.setter_func->is_static() && (!TypeConvert::js_to_gd_obj(isolate, context, info.This(), gd_object) || !gd_object))
        {
            jsb_throw(isolate, "bad this");
            return;
        }

        Variant cvar;
        if (!TypeConvert::js_to_gd_var(isolate, context, info[0], property_info.setter_func->get_argument_type(1), cvar))
        {
            jsb_throw(isolate, "bad argument");
            return;
        }

        Variant args[] = { property_info.index, cvar };
        const Variant* argv[] = { &args[0], &args[1] };

        // call godot method
        Callable::CallError error;
        property_info.setter_func->call(gd_object, argv, ::std::size(argv), error);

        if (error.error != Callable::CallError::CALL_OK)
        {
            jsb_throw(isolate, "failed to call");
            return;
        }
    }

}
