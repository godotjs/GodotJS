#include "jsb_primitive_bindings_reflect.h"
#if !JSB_WITH_STATIC_BINDINGS
#include "jsb_reflect_binding_util.h"
#include "jsb_binding_env.h"
#include "jsb_class_info.h"
#include "jsb_transpiler.h"
#include "jsb_v8_helper.h"
#include "jsb_type_convert.h"
#include "../internal/jsb_variant_info.h"
#include "../internal/jsb_variant_util.h"

#define JSB_DEFINE_OPERATOR2(op_code) function_template->\
    Set(V8Helper::to_string(p_env.isolate, JSB_OPERATOR_NAME(op_code)), v8::FunctionTemplate::New(p_env.isolate, BinaryOperator::invoke, v8::Int32::New(p_env.isolate, Variant::OP_##op_code)));\
    JSB_LOG(VeryVerbose, "generate %d: %s", Variant::OP_##op_code, JSB_OPERATOR_NAME(op_code));

#define JSB_DEFINE_OPERATOR1(op_code) function_template->\
    Set(V8Helper::to_string(p_env.isolate, JSB_OPERATOR_NAME(op_code)), v8::FunctionTemplate::New(p_env.isolate, UnaryOperator::invoke, v8::Int32::New(p_env.isolate, Variant::OP_##op_code)));\
    JSB_LOG(VeryVerbose, "generate %d: %s", Variant::OP_##op_code, JSB_OPERATOR_NAME(op_code));

#if JSB_FAST_REFLECTION
#define JSB_DEFINE_FAST_GETSET(ForMemberType, ForType, PropName) \
    if (ReflectGetSetPointerCall<ForType>::is_supported(ForMemberType))\
    {\
        prototype_template->SetAccessorProperty(V8Helper::to_string(p_env.isolate, PropName),\
            v8::FunctionTemplate::New(p_env.isolate, ReflectGetSetPointerCall<ForType>::_getter, v8::External::New(p_env.isolate, (void*) Variant::get_member_ptr_getter(TYPE, PropName))),\
            v8::FunctionTemplate::New(p_env.isolate, ReflectGetSetPointerCall<ForType>::_setter, v8::External::New(p_env.isolate, (void*) Variant::get_member_ptr_setter(TYPE, PropName))));\
        continue;\
    } (void) 0
#define JSB_DEFINE_FAST_CONSTRUCTOR(ForType) \
    if constexpr (ReflectConstructorCall<ForType>::is_supported(TYPE))\
    {\
        return v8::FunctionTemplate::New(p_env.isolate, &ReflectConstructorCall<ForType>::constructor);\
    } (void) 0
#else
#define JSB_DEFINE_FAST_GETSET(ForMemberType, ForType, PropName) (void) 0
#define JSB_DEFINE_FAST_CONSTRUCTOR(ForType) (void) 0
#endif

#define JSB_DEFINE_OVERLOADED_BINARY_BEGIN(op_code) JSB_DEFINE_OPERATOR2(op_code)
#define JSB_DEFINE_OVERLOADED_BINARY_END()

#define JSB_DEFINE_BINARY_OVERLOAD(R, A, B)
#define JSB_DEFINE_UNARY(op_code) JSB_DEFINE_OPERATOR1(op_code)
#define JSB_DEFINE_COMPARATOR(op_code) JSB_DEFINE_OPERATOR2(op_code)

#define JSB_TYPE_BEGIN(InType) \
    template<>\
    struct OperatorRegister<InType>\
    {\
        typedef InType CurrentType;\
        static void generate(const FBindingEnv& p_env, const v8::Local<v8::FunctionTemplate>& function_template, const v8::Local<v8::ObjectTemplate>& prototype_template)\
        {\
            JSB_LOG(VeryVerbose, "expose primitive type " #InType);

#define JSB_TYPE_END() \
        }\
    };

namespace jsb
{
    struct BinaryOperator
    {
        static void invoke(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const Variant::Operator op = (Variant::Operator) info.Data().As<v8::Int32>()->Value();
            if (info.Length() != 2)
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Variant left, right;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], left) || !TypeConvert::js_to_gd_var(isolate, context, info[1], right))
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
            internal::VariantUtil::construct_variant(ret, return_type);
            func(&left, &right, &ret);
            if (ret.get_type() != return_type)
            {
                jsb_throw(isolate, "bad return");
                return;
            }

            v8::Local<v8::Value> rval;
            if (!TypeConvert::gd_var_to_js(isolate, context, ret, rval))
            {
                jsb_throw(isolate, "bad translation");
                return;
            }
            info.GetReturnValue().Set(rval);
        }
    };

    struct UnaryOperator
    {
        static void invoke(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const Variant::Operator op = (Variant::Operator) info.Data().As<v8::Int32>()->Value();
            if (info.Length() != 1)
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Variant left;
            const Variant right; // it's not really used
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], left))
            {
                jsb_throw(isolate, "bad translation");
                return;
            }
            const Variant::Type left_type = left.get_type();
            constexpr Variant::Type right_type = Variant::NIL;
            const Variant::ValidatedOperatorEvaluator func = Variant::get_validated_operator_evaluator(op, left_type, right_type);
            if (!func)
            {
                jsb_throw(isolate, "bad type (no operator)");
                return;
            }
            Variant ret;
            const Variant::Type return_type = Variant::get_operator_return_type(op, left_type, right_type);
            internal::VariantUtil::construct_variant(ret, return_type);
            func(&left, &right, &ret);
            if (ret.get_type() != return_type)
            {
                jsb_throw(isolate, "bad return");
                return;
            }

            v8::Local<v8::Value> rval;
            if (!TypeConvert::gd_var_to_js(isolate, context, ret, rval))
            {
                jsb_throw(isolate, "bad translation");
                return;
            }
            info.GetReturnValue().Set(rval);
        }
    };

    template<typename TypeName>
    struct OperatorRegister
    {
        static void generate(const FBindingEnv& p_env, const v8::Local<v8::FunctionTemplate>& function_template, const v8::Local<v8::ObjectTemplate>& prototype_template) {}
    };

    #define Number double
    #include "../internal/jsb_primitive_operators.def.h"
    #undef Number

    template<typename T>
    struct VariantBind
    {
        static constexpr Variant::Type TYPE = GetTypeInfo<T>::VARIANT_TYPE;

        static void _get_constant_value_lazy(v8::Local<v8::Name> name, const v8::PropertyCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const StringName constant = V8Helper::to_string(isolate, name);
            bool r_valid;
            const Variant constant_value = Variant::get_constant_value(TYPE, constant, &r_valid);
            jsb_check(r_valid);
            v8::Local<v8::Value> rval;
            if (!TypeConvert::gd_var_to_js(isolate, context, constant_value, rval))
            {
                jsb_throw(isolate, "bad translate");
                return;
            }
            info.GetReturnValue().Set(rval);
        }

        static void constructor(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            Environment* env = Environment::wrap(isolate);
            const internal::FConstructorInfo& constructor_info = GetVariantInfoCollection(env).constructors[info.Data().As<v8::Int32>()->Value()];
            jsb_check(constructor_info.class_id.is_valid());

            const int argc = info.Length();

            const int constructor_count = constructor_info.variants.size();
            for (int constructor_index = 0; constructor_index < constructor_count; ++constructor_index)
            {
                const internal::FConstructorVariantInfo& constructor_variant = constructor_info.variants[constructor_index];
                if (constructor_variant.argument_types.size() != argc) continue;
                bool argument_type_match = true;
                for (int argument_index = 0; argument_index < argc; ++argument_index)
                {
                    const Variant::Type argument_type = constructor_variant.argument_types[argument_index];
                    if (!TypeConvert::can_convert_strict(isolate, context, info[argument_index], argument_type))
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
                for (int argument_index = 0; argument_index < argc; ++argument_index)
                {
                    memnew_placement(&args[argument_index], Variant);
                    argv[argument_index] = &args[argument_index];
                    const Variant::Type argument_type = constructor_variant.argument_types[argument_index];
                    if (!TypeConvert::js_to_gd_var(isolate, context, info[argument_index], argument_type, args[argument_index]))
                    {
                        // revert all constructors
                        v8::Local<v8::String> error_message = V8Helper::to_string(isolate, jsb_errorf("bad argument: %d", argument_index));
                        while (argument_index >= 0) { args[argument_index--].~Variant(); }
                        isolate->ThrowError(error_message);
                        return;
                    }

                    jsb_checkf(Variant::can_convert_strict(args[argument_index].get_type(), argument_type),
                        "Realm::can_convert_strict returned inconsistent type %s while %s is expected",
                        Variant::get_type_name(args[argument_index].get_type()),
                        Variant::get_type_name(argument_type));
                }

                // we only need to alloc a dummy instance here because the validated constructor will cast it to the expected type by itself
                // BE CAUTIOUS: DON'T FORGET TO call `Environment::dealloc_variant(instance)` if `bind_valuetype` is not eventually called
                Variant* instance = Environment::alloc_variant();
                constructor_variant.ctor_func(instance, argv);

                // don't forget to destruct all stack allocated variants
                for (int index = 0; index < argc; ++index)
                {
                    args[index].~Variant();
                }

                env->bind_valuetype(constructor_info.class_id, instance, self);
                return;
            }

            jsb_throw(isolate, "no suitable constructor");
        }

        //NOTE should never be called any more, since all valuetype bindings exist without a normal gc callback (object_gc_callback)
        static void finalizer(Environment* environment, void* pointer, bool p_persistent)
        {
            jsb_check(false);
            Variant* self = (Variant*) pointer;
            jsb_checkf(Variant::can_convert(self->get_type(), TYPE), "variant type can't convert to %s from %s", Variant::get_type_name(TYPE), Variant::get_type_name(self->get_type()));
            if (!p_persistent)
            {
                Environment::dealloc_variant(self);
            }
        }

        static void _getter(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            const Variant* p_self = (Variant*)info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const internal::FGetSetInfo& getset = GetVariantInfoCollection(Environment::wrap(context)).getsets[info.Data().As<v8::Int32>()->Value()];

            Variant value;
            internal::VariantUtil::construct_variant(value, getset.type);

            //NOTE the getter function will not touch the type of `Variant`, so we must set it properly before use in the above code
            getset.getter_func(p_self, &value);
            v8::Local<v8::Value> rval;
            if (!TypeConvert::gd_var_to_js(isolate, context, value, rval))
            {
                jsb_throw(isolate, "bad translate");
                return;
            }
            info.GetReturnValue().Set(rval);
        }

        static void _setter(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            Variant* p_self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const internal::FGetSetInfo& getset = GetVariantInfoCollection(Environment::wrap(context)).getsets[info.Data().As<v8::Int32>()->Value()];

            Variant value;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], getset.type, value))
            {
                jsb_throw(isolate, "bad translate");
                return;
            }
            getset.setter_func(p_self, &value);
        }

        static void _set_indexed(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            const Variant::Type element_type = Variant::get_indexed_element_type(TYPE);
            if (info.Length() != 2
                || !info[0]->IsInt32()
                || !TypeConvert::can_convert_strict(isolate, context, info[1], element_type))
            {
                jsb_throw(isolate, "bad params");
                return;
            }
            const int32_t index = info[0].As<v8::Int32>()->Value();
            Variant value;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[1], element_type, value))
            {
                jsb_throw(isolate, "bad value");
                return;
            }
            bool r_valid, r_oob;
            Variant* self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            self->set_indexed(index, value, r_valid, r_oob);
            if (!r_valid || r_oob)
            {
                jsb_throw(isolate, "invalid or out of bound");
                return;
            }
        }

        static void _get_indexed(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            if (info.Length() != 1
                || !info[0]->IsInt32())
            {
                jsb_throw(isolate, "bad params");
                return;
            }
            const int32_t index = info[0].As<v8::Int32>()->Value();
            bool r_valid, r_oob;
            const Variant* self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const Variant value = self->get_indexed(index, r_valid, r_oob);
            if (!r_valid || r_oob)
            {
                jsb_throw(isolate, "invalid or out of bound");
                return;
            }
            v8::Local<v8::Value> r_val;
            // nil type is treated as any type
            if (const Variant::Type element_type = Variant::get_indexed_element_type(TYPE);
                !TypeConvert::gd_var_to_js(isolate, context, value, element_type, r_val))
            {
                jsb_throw(isolate, "bad translation");
                return;
            }
            info.GetReturnValue().Set(r_val);
        }

        static void _set_keyed(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            if (info.Length() != 2)
            {
                jsb_throw(isolate, "bad params");
                return;
            }

            //TODO it's restricted since we don't know anything about the type
            Variant key;
            Variant value;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], key)
                || !TypeConvert::js_to_gd_var(isolate, context, info[1], value))
            {
                jsb_throw(isolate, "bad value");
                return;
            }
            bool r_valid;
            Variant* self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            self->set_keyed(key, value, r_valid);
            if (!r_valid)
            {
                jsb_throw(isolate, "invalid call");
                return;
            }
        }

        static void _get_keyed(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            if (info.Length() != 1)
            {
                jsb_throw(isolate, "bad params");
                return;
            }
            Variant key;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], key))
            {
                jsb_throw(isolate, "bad value");
                return;
            }
            bool r_valid;
            const Variant* self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const Variant value = self->get_keyed(key, r_valid);
            if (!r_valid)
            {
                jsb_throw(isolate, "invalid key?");
                return;
            }
            v8::Local<v8::Value> r_val;
            if (!TypeConvert::gd_var_to_js(isolate, context, value, r_val))
            {
                jsb_throw(isolate, "bad translation");
                return;
            }
            info.GetReturnValue().Set(r_val);
        }

        template<bool HasReturnValueT>
        static void call_builtin_function(Variant* self, const internal::FBuiltinMethodInfo& method_info,
            const vm::FunctionCallbackInfo& info, v8::Isolate* isolate, const v8::Local<v8::Context>& context)
        {
            const int argc = info.Length();
            if (!method_info.check_argc(argc))
            {
                jsb_throw(isolate, "num of arguments does not meet the requirement");
                return;
            }

            // prepare argv
            const int known_argc = method_info.argument_types.size();
            const int allocated_argc = MAX(known_argc, argc);
            const Variant** argv = jsb_stackalloc(const Variant*, allocated_argc);
            Variant* args = jsb_stackalloc(Variant, allocated_argc);
            for (int index = 0; index < allocated_argc; ++index)
            {
                memnew_placement(&args[index], Variant);
                argv[index] = &args[index];
                if (index < known_argc)
                {
                    if (index < argc)
                    {
                        if (TypeConvert::js_to_gd_var(isolate, context, info[index], method_info.argument_types[index], args[index]))
                        {
                            continue;
                        }
                    }
                    else
                    {
                        // identical to: i - p_argcount + (dvs - missing)
                        const int default_index = index - (known_argc - method_info.default_arguments.size());
                        if (default_index >= 0)
                        {
                            args[index] = method_info.default_arguments[default_index];
                            continue;
                        }
                    }
                }
                else
                {
                    if (TypeConvert::js_to_gd_var(isolate, context, info[index], args[index]))
                    {
                        continue;
                    }
                }

                // revert all constructors
                v8::Local<v8::String> error_message = V8Helper::to_string(isolate, jsb_errorf("bad argument: %d", index));
                while (index >= 0) { args[index--].~Variant(); }
                isolate->ThrowError(error_message);
                return;
            }

            // call godot method
            if constexpr (HasReturnValueT)
            {
                Variant crval;
                internal::VariantUtil::construct_variant(crval, method_info.return_type);
                method_info.builtin_func(self, argv, allocated_argc, &crval);

                // don't forget to destruct all stack allocated variants
                for (int index = 0; index < allocated_argc; ++index)
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
            else
            {
                method_info.builtin_func(self, argv, allocated_argc, nullptr);

                // don't forget to destruct all stack allocated variants
                for (int index = 0; index < allocated_argc; ++index)
                {
                    args[index].~Variant();
                }

            }
        }

        template<bool HasReturnValueT>
        static void _instance_method(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const internal::FBuiltinMethodInfo& method_info = GetVariantInfoCollection(Environment::wrap(context)).methods[info.Data().As<v8::Int32>()->Value()];
            Variant* self = info.This()->InternalFieldCount() == IF_VariantFieldCount
                ? (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer)
                : nullptr;
            if (!self)
            {
                jsb_throw(isolate, "no bound this");
                return;
            }

            call_builtin_function<HasReturnValueT>(self, method_info, info, isolate, context);
        }

        template<bool HasReturnValueT>
        static void _static_method(const vm::FunctionCallbackInfo& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const internal::FBuiltinMethodInfo& method_info = GetVariantInfoCollection(Environment::wrap(context)).methods[info.Data().As<v8::Int32>()->Value()];

            call_builtin_function<HasReturnValueT>(nullptr, method_info, info, isolate, context);
        }

        // template<typename ReturnTypeT>
        // static constexpr bool bind_fast_method(const FBindingEnv& p_env, Variant::Type return_type, const StringName& name,
        //     v8::Local<v8::FunctionTemplate> function_template,
        //     v8::Local<v8::ObjectTemplate> prototype_template)
        // {
        //     // if (argument_count == 0)
        //     {
        //         if (ReflectBuiltinMethodPointerCall<ReturnTypeT>::is_supported && return_type == ReflectBuiltinMethodPointerCall<ReturnTypeT>::return_type)
        //         {
        //             if (Variant::is_builtin_method_static(TYPE, name))
        //             {
        //                 function_template->Set(V8Helper::to_string(p_env.isolate, name),
        //                     v8::FunctionTemplate::New(p_env.isolate, &ReflectBuiltinMethodPointerCall<ReturnTypeT>::_call<false>,
        //                         v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
        //             }
        //             else
        //             {
        //                 prototype_template->Set(V8Helper::to_string(p_env.isolate, name),
        //                     v8::FunctionTemplate::New(p_env.isolate, &ReflectBuiltinMethodPointerCall<ReturnTypeT>::_call<true>,
        //                         v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
        //             }
        //             return true;
        //         }
        //     }
        //     return false;
        // }

        static v8::Local<v8::FunctionTemplate> get_template(const FBindingEnv& p_env, const NativeClassID p_class_id)
        {
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector2);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector2i);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector3);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector3i);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector4);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector4i);
            JSB_DEFINE_FAST_CONSTRUCTOR(Rect2);
            JSB_DEFINE_FAST_CONSTRUCTOR(Rect2i);

            // fallback
            {
                const int constructor_index = GetVariantInfoCollection(p_env.env).constructors.size();
                GetVariantInfoCollection(p_env.env).constructors.append({});
                internal::FConstructorInfo& constructor_info = GetVariantInfoCollection(p_env.env).constructors.write[constructor_index];
                constructor_info.class_id = p_class_id;
                const int count = Variant::get_constructor_count(TYPE);
                constructor_info.variants.resize_zeroed(count);
                for (int index = 0; index < count; ++index)
                {
                    internal::FConstructorVariantInfo& variant_info = constructor_info.variants.write[index];
                    variant_info.ctor_func = Variant::get_validated_constructor(TYPE, index);
                    const int arg_count = Variant::get_constructor_argument_count(TYPE, index);
                    variant_info.argument_types.resize(arg_count);
                    for (int arg_index = 0; arg_index < arg_count; ++arg_index)
                    {
                        variant_info.argument_types.write[arg_index] = Variant::get_constructor_argument_type(TYPE, index, arg_index);
                    }
                }
                return v8::FunctionTemplate::New(p_env.isolate, &constructor, v8::Int32::New(p_env.isolate, constructor_index));
            }
        }

        static NativeClassID reflect_bind(const FBindingEnv& p_env)
        {
            const StringName& class_name = p_env.type_name;
            const NativeClassID class_id = p_env->add_class(NativeClassType::GodotPrimitive, class_name);

            v8::Local<v8::FunctionTemplate> function_template = get_template(p_env, class_id);
            function_template->InstanceTemplate()->SetInternalFieldCount(IF_VariantFieldCount);
            function_template->SetClassName(p_env->get_string_value(class_name));
            v8::Local<v8::ObjectTemplate> prototype_template = function_template->PrototypeTemplate();

        	// properties (getset)
            {
                List<StringName> members;
                Variant::get_member_list(TYPE, &members);
                for (const StringName& name : members)
                {
                	const Variant::Type member_type = Variant::get_member_type(TYPE, name);

                    JSB_DEFINE_FAST_GETSET(member_type, real_t, name);
                    JSB_DEFINE_FAST_GETSET(member_type, int32_t, name);

                    // fallback to reflection invocation
                    const int collection_index = (int) GetVariantInfoCollection(p_env.env).getsets.size();
                    GetVariantInfoCollection(p_env.env).getsets.append({
                       Variant::get_member_validated_setter(TYPE, name),
                       Variant::get_member_validated_getter(TYPE, name),
                       member_type});
                    const v8::Local<v8::Integer> index = v8::Int32::New(p_env.isolate, collection_index);
                    prototype_template->SetAccessorProperty(V8Helper::to_string(p_env.isolate, name),
                        v8::FunctionTemplate::New(p_env.isolate, _getter, index),
                        v8::FunctionTemplate::New(p_env.isolate, _setter, index));
                }
            }

            // indexed accessor
            if (Variant::has_indexing(TYPE))
            {
                prototype_template->Set(V8Helper::to_string(p_env.isolate, "set_indexed"), v8::FunctionTemplate::New(p_env.isolate, _set_indexed));
                prototype_template->Set(V8Helper::to_string(p_env.isolate, "get_indexed"), v8::FunctionTemplate::New(p_env.isolate, _get_indexed));
            }

            // keyed accessor
            if (Variant::is_keyed(TYPE))
            {
                prototype_template->Set(V8Helper::to_string(p_env.isolate, "set_keyed"), v8::FunctionTemplate::New(p_env.isolate, _set_keyed));
                prototype_template->Set(V8Helper::to_string(p_env.isolate, "get_keyed"), v8::FunctionTemplate::New(p_env.isolate, _get_keyed));
            }

            // methods
            {
                List<StringName> methods;
                Variant::get_builtin_method_list(TYPE, &methods);
                for (const StringName& name : methods)
                {
                    const int argument_count = Variant::get_builtin_method_argument_count(TYPE, name);
                    const bool has_return_value = Variant::has_builtin_method_return_value(TYPE, name);
                    const Variant::Type return_type = Variant::get_builtin_method_return_type(TYPE, name);

#if JSB_FAST_REFLECTION
                    if (has_return_value)
                    {
                        if (ReflectBuiltinMethodPointerCall<real_t>::is_supported(return_type))
                        {
                            if (argument_count == 0)
                            {
                                if (Variant::is_builtin_method_static(TYPE, name))
                                {
                                    function_template->Set(V8Helper::to_string(p_env.isolate, name),
                                        v8::FunctionTemplate::New(p_env.isolate, ReflectBuiltinMethodPointerCall<real_t>::_call<false>,
                                            v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
                                }
                                else
                                {
                                    prototype_template->Set(V8Helper::to_string(p_env.isolate, name),
                                        v8::FunctionTemplate::New(p_env.isolate, ReflectBuiltinMethodPointerCall<real_t>::_call<true>,
                                            v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
                                }
                                continue;
                            }
                        }
                    }
                    else if (ReflectBuiltinMethodPointerCall<void>::is_supported(return_type))
                    {
                        if (argument_count == 0)
                        {
                            if (Variant::is_builtin_method_static(TYPE, name))
                            {
                                function_template->Set(V8Helper::to_string(p_env.isolate, name),
                                    v8::FunctionTemplate::New(p_env.isolate, ReflectBuiltinMethodPointerCall<void>::_call<false>,
                                        v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
                            }
                            else
                            {
                                prototype_template->Set(V8Helper::to_string(p_env.isolate, name),
                                    v8::FunctionTemplate::New(p_env.isolate, ReflectBuiltinMethodPointerCall<void>::_call<true>,
                                        v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
                            }
                            continue;
                        }
                    }
#endif

                    // convert method info, and store
                    const int collection_index = GetVariantInfoCollection(p_env.env).methods.size();
                    GetVariantInfoCollection(p_env.env).methods.append({});
                    internal::FBuiltinMethodInfo& method_info = GetVariantInfoCollection(p_env.env).methods.write[collection_index];
                    method_info.set_debug_name(name);
                    method_info.builtin_func = Variant::get_validated_builtin_method(TYPE, name);
                    method_info.return_type = return_type;
                    method_info.default_arguments = Variant::get_builtin_method_default_arguments(TYPE, name);
                    method_info.argument_types.resize_zeroed(argument_count);
                    method_info.is_vararg = Variant::is_builtin_method_vararg(TYPE, name);
                    for (int argument_index = 0; argument_index < argument_count; ++argument_index)
                    {
                        const Variant::Type type = Variant::get_builtin_method_argument_type(TYPE, name, argument_index);
                        method_info.argument_types.write[argument_index] = type;
                    }

                    // function wrapper
                    if (has_return_value)
                    {
                        if (Variant::is_builtin_method_static(TYPE, name))
                        {
                            function_template->Set(V8Helper::to_string(p_env.isolate, name),
                                v8::FunctionTemplate::New(p_env.isolate, _static_method<true>, v8::Int32::New(p_env.isolate, collection_index)));
                        }
                        else
                        {
                            prototype_template->Set(V8Helper::to_string(p_env.isolate, name),
                                v8::FunctionTemplate::New(p_env.isolate, _instance_method<true>, v8::Int32::New(p_env.isolate, collection_index)));
                        }
                    }
                    else
                    {
                        if (Variant::is_builtin_method_static(TYPE, name))
                        {
                            function_template->Set(V8Helper::to_string(p_env.isolate, name),
                                v8::FunctionTemplate::New(p_env.isolate, _static_method<false>, v8::Int32::New(p_env.isolate, collection_index)));
                        }
                        else
                        {
                            prototype_template->Set(V8Helper::to_string(p_env.isolate, name),
                                v8::FunctionTemplate::New(p_env.isolate, _instance_method<false>, v8::Int32::New(p_env.isolate, collection_index)));
                        }
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

            {
                NativeClassInfo& class_info = p_env.env->get_native_class(class_id);
                class_info.finalizer = &finalizer;
                class_info.template_.Reset(p_env.isolate, function_template);
                class_info.set_function(p_env.isolate, function_template->GetFunction(p_env.context).ToLocalChecked());
                jsb_check(class_info.template_ == function_template);
                jsb_check(!class_info.template_.IsEmpty());
            }
            return class_id;
        }
    };

    void register_primitive_bindings_reflect(class Environment* p_env)
    {
#pragma push_macro("DEF")
#   undef   DEF
#   define  DEF(TypeName) p_env->add_class_register(GetTypeInfo<TypeName>::VARIANT_TYPE, &VariantBind<TypeName>::reflect_bind);
#   include "jsb_primitive_types.def.h"
#pragma pop_macro("DEF")

    }
}

#endif

