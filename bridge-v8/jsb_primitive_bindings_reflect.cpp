#include "jsb_primitive_bindings.h"
#if !JSB_WITH_STATIC_PRIMITIVE_TYPE_BINDINGS

#include "jsb_class_info.h"
#include "jsb_transpiler.h"
#include "jsb_v8_helper.h"
#include "../internal/jsb_variant_info.h"

#define RegisterPrimitiveType(TypeName) register_primitive_binding(GetTypeInfo<TypeName>::VARIANT_TYPE, &VariantBind<TypeName>::reflect_bind)
#define GlobalVariantInfoCollection ::jsb::internal::VariantInfoCollection::global

namespace jsb
{
    struct OperatorEvaluator2
    {
        static void invoke(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const Variant::Operator op = (Variant::Operator) info.Data().As<v8::Int32>()->Value();
            if (info.Length() != 2)
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Variant left, right;
            if (!Realm::js_to_gd_var(isolate, context, info[0], left) || !Realm::js_to_gd_var(isolate, context, info[1], right))
            {
                jsb_throw(isolate, "bad translation");
                return;
            }
            const Variant::Type left_type = left.get_type();
            const Variant::Type right_type = right.get_type();
            const Variant::ValidatedOperatorEvaluator func = Variant::get_validated_operator_evaluator(op, left_type, right_type);
            if (!func)
            {
                jsb_throw(isolate, "bad type (no operator)");
                return;
            }
            Variant ret;
            const Variant::Type return_type = Variant::get_operator_return_type(op, left_type, right_type);
            construct_variant(ret, return_type);
            func(&left, &right, &ret);
            if (ret.get_type() != return_type)
            {
                jsb_throw(isolate, "bad return");
                return;
            }

            v8::Local<v8::Value> rval;
            if (!Realm::gd_var_to_js(isolate, context, ret, rval))
            {
                jsb_throw(isolate, "bad translation");
                return;
            }
            info.GetReturnValue().Set(rval);
        }
    };

#define JSB_DEFINE_OPERATOR2(op_code) function_template->\
    Set(V8Helper::to_string(p_env.isolate, JSB_OPERATOR_NAME(op_code)), v8::FunctionTemplate::New(p_env.isolate, OperatorEvaluator2::invoke, v8::Int32::New(p_env.isolate, Variant::OP_##op_code)));\
    JSB_LOG(Verbose, "generate %d: %s", Variant::OP_##op_code, JSB_OPERATOR_NAME(op_code));

#define JSB_TYPE_OPERATORS_BEGIN(TypeName) \
    template<>\
    struct OperatorRegister<TypeName>\
    {\
        static void generate(const FBindingEnv& p_env, const v8::Local<v8::FunctionTemplate>& function_template, const v8::Local<v8::ObjectTemplate>& prototype_template)\
        {
#define JSB_TYPE_OPERATORS_END() \
        }\
    };


    template<typename T>
    struct OperatorRegister
    {
        static void generate(const FBindingEnv& p_env, const v8::Local<v8::FunctionTemplate>& function_template, const v8::Local<v8::ObjectTemplate>& prototype_template) {}
    };

    #include "jsb_primitive_operators.def.h"

    template<>
    struct OperatorRegister<Dictionary>
    {
        static void set_named(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            //TODO dictionary operator[] write
        }

        static void get_named(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            //TODO dictionary operator[] read
        }

        static void generate(const FBindingEnv& p_env, const v8::Local<v8::FunctionTemplate>& function_template, const v8::Local<v8::ObjectTemplate>& prototype_template)
        {
            JSB_DEFINE_OPERATOR2(EQUAL);
            JSB_DEFINE_OPERATOR2(NOT_EQUAL);
            prototype_template->Set(V8Helper::to_string(p_env.isolate, "set_named"), v8::FunctionTemplate::New(p_env.isolate, set_named));
            prototype_template->Set(V8Helper::to_string(p_env.isolate, "get_named"), v8::FunctionTemplate::New(p_env.isolate, get_named));
        }
    };

    template<typename T>
    struct VariantBind
    {
        constexpr static Variant::Type TYPE = GetTypeInfo<T>::VARIANT_TYPE;

        jsb_force_inline static int register_getset_method(const StringName& p_name)
        {
            const int collection_index = GlobalVariantInfoCollection.getsets.size();
            GlobalVariantInfoCollection.getsets.append({
                Variant::get_member_validated_setter(TYPE, p_name),
                Variant::get_member_validated_getter(TYPE, p_name),
                Variant::get_member_type(TYPE, p_name)});
            return collection_index;
        }

        jsb_force_inline static int register_builtin_method(const StringName& p_name)
        {
            const int collection_index = GlobalVariantInfoCollection.methods.size();
            GlobalVariantInfoCollection.methods.append({});
            internal::FMethodInfo& method_info = GlobalVariantInfoCollection.methods.write[collection_index];
            method_info.name = p_name;
            method_info.return_type = Variant::get_builtin_method_return_type(TYPE, p_name);
            const int argument_count = Variant::get_builtin_method_argument_count(TYPE, p_name);
            method_info.argument_types.resize_zeroed(argument_count);
            for (int argument_index = 0; argument_index < argument_count; ++argument_index)
            {
                const Variant::Type type = Variant::get_builtin_method_argument_type(TYPE, p_name, argument_index);
                method_info.argument_types.write[argument_index] = type;
            }
            return collection_index;
        }

        static void _get_constant_value_lazy(v8::Local<v8::Name> name, const v8::PropertyCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const StringName constant = V8Helper::to_string(isolate, name);
            bool r_valid;
            const Variant constant_value = Variant::get_constant_value(TYPE, constant, &r_valid);
            jsb_check(r_valid);
            v8::Local<v8::Value> rval;
            if (!Realm::gd_var_to_js(isolate, context, constant_value, rval))
            {
                jsb_throw(isolate, "bad translate");
                return;
            }
            info.GetReturnValue().Set(rval);
        }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Isolate::Scope isolate_scope(isolate);
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());
            Environment* environment = Environment::wrap(isolate);

            const int argc = info.Length();

            const int constructor_count = Variant::get_constructor_count(TYPE);
            for (int constructor_index = 0; constructor_index < constructor_count; ++constructor_index)
            {
                if (Variant::get_constructor_argument_count(TYPE, constructor_index) != argc) continue;
                bool argument_type_match = true;
                for (int argument_index = 0; argument_index < argc; ++argument_index)
                {
                    const Variant::Type argument_type = Variant::get_constructor_argument_type(TYPE, constructor_index, argument_index);
                    if (!V8Helper::can_convert_strict(info[argument_index], argument_type))
                    {
                        argument_type_match = false;
                        break;
                    }
                }

                if (!argument_type_match)
                {
                    continue;
                }

                const Variant** argv = jsb_stackalloc(const Variant*, argc);
                Variant* args = jsb_stackalloc(Variant, argc);
                for (int index = 0; index < argc; ++index)
                {
                    memnew_placement(&args[index], Variant);
                    argv[index] = &args[index];
                    const Variant::Type argument_type = Variant::get_constructor_argument_type(TYPE, constructor_index, index);
                    if (!Realm::js_to_gd_var(isolate, context, info[index], argument_type, args[index]))
                    {
                        // revert all constructors
                        v8::Local<v8::String> error_message = V8Helper::to_string(isolate, jsb_errorf("bad argument: %d", index));
                        while (index >= 0) { args[index--].~Variant(); }
                        isolate->ThrowError(error_message);
                        return;
                    }
                }

                Variant* instance = environment->alloc_variant();
                Callable::CallError err;
                Variant::construct(TYPE, *instance, argv, argc, err);

                // don't forget to destruct all stack allocated variants
                for (int index = 0; index < argc; ++index)
                {
                    args[index].~Variant();
                }

                if (err.error != Callable::CallError::CALL_OK)
                {
                    environment->dealloc_variant(instance);
                    jsb_throw(isolate, "bad call");
                    return;
                }

                environment->bind_object(class_id, instance, self);
                return;
            }

            jsb_throw(isolate, "bad params");
        }

        static void finalizer(Environment* environment, void* pointer, bool p_persistent)
        {
            Variant* self = (Variant*) pointer;
            jsb_check(self->get_type() == TYPE);
            if (!p_persistent)
            {
                environment->dealloc_variant(self);
            }
        }

        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const Variant* p_self = (Variant*) info.This().As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            const internal::FGetSetInfo& getset = GlobalVariantInfoCollection.get_setter(info.Data().As<v8::Int32>()->Value());

            Variant value;
            construct_variant(value, getset.type);

            //NOTE the getter function will not touch the type of `Variant`, so we must set it properly before use in the above code
            getset.getter_func(p_self, &value);
            v8::Local<v8::Value> rval;
            if (!Realm::gd_var_to_js(isolate, context, value, rval))
            {
                jsb_throw(isolate, "bad translate");
                return;
            }
            info.GetReturnValue().Set(rval);
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            Variant* p_self = (Variant*) info.This().As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            const internal::FGetSetInfo& getset = GlobalVariantInfoCollection.get_setter(info.Data().As<v8::Int32>()->Value());

            Variant value;
            if (!Realm::js_to_gd_var(isolate, context, info[0], getset.type, value))
            {
                jsb_throw(isolate, "bad translate");
                return;
            }
            getset.setter_func(p_self, &value);
        }

        static void _instance_method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            Variant* self = (Variant*) info.This().As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            const internal::FMethodInfo& method_info = GlobalVariantInfoCollection.get_method(info.Data().As<v8::Int32>()->Value());
            const int argc = info.Length();

            // prepare argv
            jsb_check(argc <= method_info.argument_types.size());
            const Variant** argv = jsb_stackalloc(const Variant*, argc);
            Variant* args = jsb_stackalloc(Variant, argc);
            for (int index = 0; index < argc; ++index)
            {
                memnew_placement(&args[index], Variant);
                argv[index] = &args[index];
                if (!Realm::js_to_gd_var(isolate, context, info[index], method_info.argument_types[index], args[index]))
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
            Variant crval;
            self->callp(method_info.name, argv, argc, crval, error);

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
            if (Realm::gd_var_to_js(isolate, context, crval, jrval))
            {
                info.GetReturnValue().Set(jrval);
                return;
            }
            jsb_throw(isolate, "failed to translate godot variant to v8 value");
        }

        static void _static_method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const internal::FMethodInfo& method_info = GlobalVariantInfoCollection.get_method(info.Data().As<v8::Int32>()->Value());
            const int argc = info.Length();

            // prepare argv
            jsb_check(argc <= method_info.argument_types.size());
            const Variant** argv = jsb_stackalloc(const Variant*, argc);
            Variant* args = jsb_stackalloc(Variant, argc);
            for (int index = 0; index < argc; ++index)
            {
                memnew_placement(&args[index], Variant);
                argv[index] = &args[index];
                const Variant::Type type = method_info.argument_types[index];
                if (!Realm::js_to_gd_var(isolate, context, info[index], type, args[index]))
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
            Variant crval;
            Variant::call_static(TYPE, method_info.name, argv, argc, crval, error);

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
            if (Realm::gd_var_to_js(isolate, context, crval, jrval))
            {
                info.GetReturnValue().Set(jrval);
                return;
            }
            jsb_throw(isolate, "failed to translate godot variant to v8 value");
        }

        static NativeClassID reflect_bind(const FBindingEnv& p_env)
        {
            NativeClassID class_id;
            const StringName& class_name = p_env.type_name;
            NativeClassInfo& class_info = p_env.environment->add_class(NativeClassType::GodotPrimitive, class_name, &class_id);

            v8::Local<v8::FunctionTemplate> function_template = v8::FunctionTemplate::New(p_env.isolate, &constructor, v8::Uint32::NewFromUnsigned(p_env.isolate, class_id));
            function_template->InstanceTemplate()->SetInternalFieldCount(kObjectFieldCount);
            class_info.finalizer = &finalizer;
            class_info.template_.Reset(p_env.isolate, function_template);
            function_template->SetClassName(V8Helper::to_string(p_env.isolate, class_info.name));
            v8::Local<v8::ObjectTemplate> prototype_template = function_template->PrototypeTemplate();

            // getsets
            {
                List<StringName> members;
                Variant::get_member_list(TYPE, &members);
                for (const StringName& name : members)
                {
                    const v8::Local<v8::Integer> index = v8::Int32::New(p_env.isolate, register_getset_method(name));
                    prototype_template->SetAccessorProperty(V8Helper::to_string(p_env.isolate, name),
                        v8::FunctionTemplate::New(p_env.isolate, _getter, index),
                        v8::FunctionTemplate::New(p_env.isolate, _setter, index));
                }
            }

            // methods
            {
                List<StringName> methods;
                Variant::get_builtin_method_list(TYPE, &methods);
                for (const StringName& name : methods)
                {
                    const int index = register_builtin_method(name);
                    if (Variant::is_builtin_method_static(TYPE, name))
                    {
                        function_template->Set(V8Helper::to_string(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, _static_method, v8::Int32::New(p_env.isolate, index)));
                    }
                    else
                    {
                        prototype_template->Set(V8Helper::to_string(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, _instance_method, v8::Int32::New(p_env.isolate, index)));
                    }
                }
            }

            // operators
            {
                OperatorRegister<T>::generate(p_env, function_template, prototype_template);
            }

            // enums
            HashSet<StringName> enum_constants;
            {
                List<StringName> enums;
                Variant::get_enums_for_type(TYPE, &enums);
                for (const StringName& enum_name : enums)
                {
                    List<StringName> enumerations;
                    v8::Local<v8::ObjectTemplate> enum_obj = v8::ObjectTemplate::New(p_env.isolate);
                    function_template->Set(V8Helper::to_string(p_env.isolate, enum_name), enum_obj);
                    Variant::get_enumerations_for_enum(TYPE, enum_name, &enumerations);
                    for (const StringName& enumeration : enumerations)
                    {
                        bool r_valid;
                        const int enum_value = Variant::get_enum_value(TYPE, enum_name, enumeration, &r_valid);
                        jsb_check(r_valid);
                        enum_obj->Set(V8Helper::to_string(p_env.isolate, enumeration), v8::Int32::New(p_env.isolate, enum_value));
                        enum_constants.insert(enumeration);
                    }
                }
            }

            // constants
            {
                List<StringName> constants;
                Variant::get_constants_for_type(TYPE, &constants);
                for (const StringName& constant : constants)
                {
                    // exclude all enum constants
                    if (enum_constants.has(constant)) continue;
                    function_template->SetLazyDataProperty(V8Helper::to_string(p_env.isolate, constant), _get_constant_value_lazy);
                }
            }

            jsb_check(class_info.template_ == function_template);
            class_info.function_.Reset(p_env.isolate, function_template->GetFunction(p_env.context).ToLocalChecked());
            jsb_check(!class_info.template_.IsEmpty());
            jsb_check(!class_info.function_.IsEmpty());
            return class_id;
        }
    };

    void register_primitive_bindings(class Realm* p_realm)
    {
        p_realm->RegisterPrimitiveType(Vector2);
        p_realm->RegisterPrimitiveType(Vector2i);
        p_realm->RegisterPrimitiveType(Rect2);
        p_realm->RegisterPrimitiveType(Rect2i);
        p_realm->RegisterPrimitiveType(Vector3);
        p_realm->RegisterPrimitiveType(Vector3i);
        p_realm->RegisterPrimitiveType(Transform2D);
        p_realm->RegisterPrimitiveType(Vector4);
        p_realm->RegisterPrimitiveType(Vector4i);
        p_realm->RegisterPrimitiveType(Plane);
        p_realm->RegisterPrimitiveType(Quaternion);
        p_realm->RegisterPrimitiveType(AABB);
        p_realm->RegisterPrimitiveType(Basis);
        p_realm->RegisterPrimitiveType(Transform3D);
        p_realm->RegisterPrimitiveType(Projection);
        p_realm->RegisterPrimitiveType(Color);
        // - StringName
        p_realm->RegisterPrimitiveType(NodePath);
        p_realm->RegisterPrimitiveType(RID);
        // - Object
        p_realm->RegisterPrimitiveType(Callable);
        p_realm->RegisterPrimitiveType(Signal);
        p_realm->RegisterPrimitiveType(Dictionary);
        p_realm->RegisterPrimitiveType(Array);
        p_realm->RegisterPrimitiveType(PackedByteArray);
        p_realm->RegisterPrimitiveType(PackedInt32Array);
        p_realm->RegisterPrimitiveType(PackedInt64Array);
        p_realm->RegisterPrimitiveType(PackedFloat32Array);
        p_realm->RegisterPrimitiveType(PackedFloat64Array);
        p_realm->RegisterPrimitiveType(PackedStringArray);
        p_realm->RegisterPrimitiveType(PackedVector2Array);
        p_realm->RegisterPrimitiveType(PackedVector3Array);
        p_realm->RegisterPrimitiveType(PackedColorArray);
    }
}
#endif
