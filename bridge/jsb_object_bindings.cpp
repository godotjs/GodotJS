#include "jsb_object_bindings.h"
#include "jsb_transpiler.h"
#include "jsb_type_convert.h"

namespace jsb
{
    NativeClassID ObjectReflectBindingUtil::reflect_bind(Environment* p_env, const ClassDB::ClassInfo* p_class_info)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        jsb_check(p_env->get_context() == context);
        jsb_check(p_class_info);

        const NativeClassID class_id = p_env->add_class(NativeClassType::GodotObject, p_class_info->name);
        JSB_LOG(VeryVerbose, "expose godot type %s(%d)", p_class_info->name, (uint32_t) class_id);

        // construct type template
        {

            v8::Local<v8::FunctionTemplate> function_template = ClassTemplate<Object>::create(p_env, class_id);
            v8::Local<v8::ObjectTemplate> object_template = function_template->PrototypeTemplate();

            //NOTE all singleton object will overwrite the class itself in 'godot' module, so we need make all things defined on PrototypeTemplate.
            const bool is_singleton_class = Engine::get_singleton()->has_singleton(p_class_info->name);
            v8::Local<v8::Template> template_for_static = is_singleton_class ? v8::Local<v8::Template>::Cast(object_template) : v8::Local<v8::Template>::Cast(function_template);

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
                    const int remap_index = p_env->get_variant_info_collection().properties2.size();
                    internal::FPropertyInfo2 property_info2;
                    property_info2.getter_func = getset_info._getptr;
                    property_info2.setter_func = getset_info._setptr;
                    property_info2.index = pair.value.index;
                    p_env->get_variant_info_collection().properties2.append(property_info2);

                    v8::Local<v8::FunctionTemplate> getter = getset_info._getptr
                        ? v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_get2, v8::Int32::New(isolate, remap_index))
                        : v8::Local<v8::FunctionTemplate>();
                    v8::Local<v8::FunctionTemplate> setter = getset_info._setptr
                        ? v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_set2, v8::Int32::New(isolate, remap_index))
                        : v8::Local<v8::FunctionTemplate>();
                    object_template->SetAccessorProperty(V8Helper::to_string(isolate, property_name), getter, setter);

                    // we do not exclude get/set methods in this case, because the method may not be covered by all properties
                }
                else
                {
                    // not using `property_collection_` in this case due to lower memory cost

                    v8::Local<v8::FunctionTemplate> getter = getset_info._getptr
                        ? v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_method, v8::External::New(isolate, getset_info._getptr))
                        : v8::Local<v8::FunctionTemplate>();
                    v8::Local<v8::FunctionTemplate> setter = getset_info._setptr
                        ? v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_method, v8::External::New(isolate, getset_info._setptr))
                        : v8::Local<v8::FunctionTemplate>();
                    object_template->SetAccessorProperty(V8Helper::to_string(isolate, property_name), getter, setter);

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
                MethodBind* method_bind = pair.value;
                v8::Local<v8::String> propkey_name = V8Helper::to_string(isolate, method_name); // V8Helper::to_string_ascii(isolate, method_name);
                v8::Local<v8::FunctionTemplate> propval_func = v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_method, v8::External::New(isolate, method_bind));

                if (method_bind->is_static())
                {
                    template_for_static->Set(propkey_name, propval_func);
                }
                else
                {
                    object_template->Set(propkey_name, propval_func);
                }
            }

            // class: virtual methods
//             for (const KeyValue<StringName, MethodInfo>& pair : p_class_info->virtual_methods_map)
//             {
// #if JSB_EXCLUDE_GETSET_METHODS
//                 if (omitted_methods.has(pair.key)) continue;
// #endif
//                 const StringName& method_name = pair.key;
//                 const MethodInfo& method_bind = pair.value;
//                 int method_index = ...;
//                 v8::Local<v8::String> propkey_name = V8Helper::to_string(isolate, method_name); // V8Helper::to_string_ascii(isolate, method_name);
//                 v8::Local<v8::FunctionTemplate> propval_func = v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_virtual_method, v8::Int32::New(isolate, method_index));
//
//                 jsb_check((method_bind.flags & METHOD_FLAG_STATIC) == 0);
//                 object_template->Set(propkey_name, propval_func);
//             }

            if (p_class_info->name == jsb_string_name(Object))
            {
                // class: special methods
                object_template->Set(jsb_name(p_env, free), v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_free));
            }

            // class: signals
            for (const KeyValue<StringName, MethodInfo>& pair : p_class_info->signal_map)
            {
                const StringName& name_str = pair.key;
                v8::Local<v8::String> propkey_name = V8Helper::to_string(isolate, name_str);
                const StringNameID string_id = p_env->get_string_name_cache().get_string_id(name_str);
                v8::Local<v8::FunctionTemplate> propval_func = v8::FunctionTemplate::New(isolate, ObjectReflectBindingUtil::_godot_object_signal, v8::Uint32::NewFromUnsigned(isolate, (uint32_t) string_id));
                object_template->SetAccessorProperty(propkey_name, propval_func);
            }

            // class: enum (nested in class)
            HashSet<StringName> enum_consts;
            for (const KeyValue<StringName, ClassDB::ClassInfo::EnumInfo>& pair : p_class_info->enum_map)
            {
                template_for_static->Set(
                    V8Helper::to_string(isolate, pair.key),
                    V8Helper::to_template_enum(isolate, context, pair.value, p_class_info->constant_map, &enum_consts));
            }

            // class: constants
            for (const KeyValue<StringName, int64_t>& pair : p_class_info->constant_map)
            {
                if (enum_consts.has(pair.key)) continue;
                const String& const_name_str = (String) pair.key;
                jsb_not_implemented(const_name_str.contains("."), "hierarchically nested definition is currently not supported");
                jsb_verify_int64(pair.value, "%s.%s %s", p_class_info->name, pair.key, uitos(pair.value));

                template_for_static->Set(
                    V8Helper::to_string(isolate, const_name_str),
                    V8Helper::to_int32(isolate, pair.value));
            }

            // set `class_id` on the exposed godot native class for the convenience when finding it from any subclasses in javascript.
            function_template->Set(jsb_symbol(p_env, ClassId), v8::Uint32::NewFromUnsigned(isolate, class_id));

            // build the prototype chain (inherit)
            if (const NativeClassID super_class_id = p_env->_expose_godot_class(p_class_info->inherits_ptr))
            {
                v8::Local<v8::FunctionTemplate> base_template = p_env->get_native_class(super_class_id).template_.Get(isolate);
                jsb_check(!base_template.IsEmpty());
                function_template->Inherit(base_template);
                JSB_LOG(VeryVerbose, "%s (%d) extends %s (%d)", p_class_info->name, (uint32_t) class_id, p_class_info->inherits_ptr->name, (uint32_t) super_class_id);
            }

            {
                auto class_info = p_env->_get_native_class(class_id);
                jsb_check(function_template == class_info->template_);

                class_info->set_function(isolate, function_template->GetFunction(context).ToLocalChecked());
                JSB_LOG(VeryVerbose, "class info ready %s (%d)", p_class_info->name, (uint32_t) class_id);
            }
        } // end type template

        return class_id;
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
        const int known_argc = method_info.argument_types.size();
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
                v8::Local<v8::String> error_message = V8Helper::to_string(isolate, jsb_errorf("bad argument: %d", index));
                while (index >= 0) { args[index--].~Variant(); }
                isolate->ThrowError(error_message);
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
        if (!internal::VariantUtil::check_argc(method_bind->is_vararg(), argc, method_bind->get_default_argument_count(), method_bind->get_argument_count()))
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
            Variant::Type type = method_bind->get_argument_type(index);
            if (!TypeConvert::js_to_gd_var(isolate, context, info[index], type, args[index]))
            {
                // revert all constructors
                v8::Local<v8::String> error_message = V8Helper::to_string(isolate, jsb_errorf("bad argument: %d", index));
                while (index >= 0) { args[index--].~Variant(); }
                isolate->ThrowError(error_message);
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
            isolate->ThrowError("failed to call");
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
        isolate->ThrowError("failed to translate godot variant to v8 value");
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
            isolate->ThrowError("failed to call");
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
        isolate->ThrowError("failed to translate godot variant to v8 value");
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
            isolate->ThrowError("failed to call");
            return;
        }
    }

}
