#include "jsb_primitive_bindings_reflect.h"
#if !JSB_WITH_STATIC_BINDINGS
#include "jsb_reflect_binding_util.h"
#include "jsb_class_register.h"
#include "jsb_class_info.h"
#include "jsb_transpiler.h"
#include "jsb_bridge_helper.h"
#include "jsb_type_convert.h"
#include "../internal/jsb_variant_info.h"
#include "../internal/jsb_variant_util.h"

#define JSB_DEFINE_OPERATOR2(op_code) class_builder.Static().\
    Method(JSB_OPERATOR_NAME(op_code), BinaryOperator::invoke, (int32_t) Variant::OP_##op_code);\
    JSB_LOG(VeryVerbose, "generate %d: %s", Variant::OP_##op_code, JSB_OPERATOR_NAME(op_code));

#define JSB_DEFINE_OPERATOR1(op_code) class_builder.Static().\
    Method(JSB_OPERATOR_NAME(op_code), UnaryOperator::invoke, (int32_t) Variant::OP_##op_code);\
    JSB_LOG(VeryVerbose, "generate %d: %s", Variant::OP_##op_code, JSB_OPERATOR_NAME(op_code));

#if JSB_FAST_REFLECTION
#define JSB_DEFINE_FAST_GETSET(ForMemberType, ForType, PropName) \
    if (ReflectGetSetPointerCall<ForType>::is_supported(ForMemberType))\
    {\
        class_builder.Instance().Property(PropName,\
            ReflectGetSetPointerCall<ForType>::_getter, (void*) Variant::get_member_ptr_getter(TYPE, PropName),\
            ReflectGetSetPointerCall<ForType>::_setter, (void*) Variant::get_member_ptr_setter(TYPE, PropName)\
        );\
        continue;\
    } (void) 0
#define JSB_DEFINE_FAST_CONSTRUCTOR(ForType, ClassID) \
    if constexpr (ReflectConstructorCall<ForType>::is_supported(TYPE))\
    {\
        return impl::ClassBuilder::New<IF_VariantFieldCount>(p_env.isolate, &ReflectConstructorCall<ForType>::constructor, *(ClassID));\
    } (void) 0
#else
#define JSB_DEFINE_FAST_GETSET(ForMemberType, ForType, PropName) (void) 0
#define JSB_DEFINE_FAST_CONSTRUCTOR(ForType, ClassID) (void) 0
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
        static void generate(impl::ClassBuilder& class_builder)\
        {\
            JSB_LOG(VeryVerbose, "expose primitive type " #InType);

#define JSB_TYPE_END() \
        }\
    };

namespace jsb
{
    struct BinaryOperator
    {
        static void invoke(const v8::FunctionCallbackInfo<v8::Value>& info)
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
        static void invoke(const v8::FunctionCallbackInfo<v8::Value>& info)
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
        static void generate(impl::ClassBuilder& class_builder) {}
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
            const StringName constant = impl::Helper::to_string(isolate, name);
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

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
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
            const internal::FConstructorInfo& constructor_info = GetVariantInfoCollection(env).constructors[info.Data().As<v8::Uint32>()->Value()];

            const int argc = info.Length();

            const int constructor_count = (int) constructor_info.variants.size();
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
                        const String error_message = jsb_errorf("bad argument: %d", argument_index);
                        while (argument_index >= 0) { args[argument_index--].~Variant(); }
                        impl::Helper::throw_error(isolate, error_message);
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

        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
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

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
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

        static void _set_indexed(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            const Variant::Type element_type = Variant::get_indexed_element_type(TYPE);
            if (info.Length() != 2
                || !info[0]->IsNumber() // loose int32 check
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

        static void _get_indexed(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            if (info.Length() != 1 || !info[0]->IsNumber()) // loose int32 check
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

        static void _set_keyed(const v8::FunctionCallbackInfo<v8::Value>& info)
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

        static void _get_keyed(const v8::FunctionCallbackInfo<v8::Value>& info)
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
            const v8::FunctionCallbackInfo<v8::Value>& info, v8::Isolate* isolate, const v8::Local<v8::Context>& context)
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
                        const int default_index = index - (int) (known_argc - method_info.default_arguments.size());
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
                const String error_message = jsb_errorf("bad argument: %d", index);
                while (index >= 0) { args[index--].~Variant(); }
                impl::Helper::throw_error(isolate, error_message);
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
        static void _instance_method(const v8::FunctionCallbackInfo<v8::Value>& info)
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
        static void _static_method(const v8::FunctionCallbackInfo<v8::Value>& info)
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
        //                 function_template->Set(BridgeHelper::to_string(p_env.isolate, name),
        //                     v8::FunctionTemplate::New(p_env.isolate, &ReflectBuiltinMethodPointerCall<ReturnTypeT>::_call<false>,
        //                         v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
        //             }
        //             else
        //             {
        //                 prototype_template->Set(BridgeHelper::to_string(p_env.isolate, name),
        //                     v8::FunctionTemplate::New(p_env.isolate, &ReflectBuiltinMethodPointerCall<ReturnTypeT>::_call<true>,
        //                         v8::External::New(p_env.isolate, (void*) Variant::get_ptr_builtin_method(TYPE, name))));
        //             }
        //             return true;
        //         }
        //     }
        //     return false;
        // }

        static impl::ClassBuilder get_class_builder(const ClassRegister& p_env, const NativeClassID p_class_id)
        {
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector2, p_class_id);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector2i, p_class_id);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector3, p_class_id);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector3i, p_class_id);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector4, p_class_id);
            JSB_DEFINE_FAST_CONSTRUCTOR(Vector4i, p_class_id);
            JSB_DEFINE_FAST_CONSTRUCTOR(Rect2, p_class_id);
            JSB_DEFINE_FAST_CONSTRUCTOR(Rect2i, p_class_id);

            // fallback
            {
                const uint32_t constructor_index = (uint32_t) GetVariantInfoCollection(p_env.env).constructors.size();
                GetVariantInfoCollection(p_env.env).constructors.append({});
                internal::FConstructorInfo& constructor_info = GetVariantInfoCollection(p_env.env).constructors.write[constructor_index];
                const int count = Variant::get_constructor_count(TYPE);
                constructor_info.variants.resize_zeroed(count);
                constructor_info.class_id = p_class_id; // needed only if not using V8
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
                return impl::ClassBuilder::New<IF_VariantFieldCount>(p_env.isolate, &constructor, constructor_index);
            }
        }

        // called in Environment::expose_class
        static NativeClassInfoPtr reflect_bind(const ClassRegister& p_env, NativeClassID* r_class_id = nullptr)
        {
            const StringName& class_name = p_env.type_name;
            const NativeClassID class_id = p_env->add_native_class(NativeClassType::GodotPrimitive, class_name);
            impl::ClassBuilder class_builder = get_class_builder(p_env, class_id);

            class_builder.SetClassName(p_env->get_string_value(class_name));

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

                    class_builder.Instance().Property(name, _getter, _setter, collection_index);
                }
            }

            // indexed accessor
            if (Variant::has_indexing(TYPE))
            {
                class_builder.Instance().Method("set_indexed", _set_indexed);
                class_builder.Instance().Method("get_indexed", _get_indexed);
            }

            // keyed accessor
            if (Variant::is_keyed(TYPE))
            {
                class_builder.Instance().Method("set_keyed", _set_keyed);
                class_builder.Instance().Method("get_keyed", _get_keyed);
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
                    if (!Variant::is_builtin_method_vararg(TYPE, name))
                    {
                        if (has_return_value)
                        {
                            if (ReflectBuiltinMethodPointerCall<real_t>::is_supported(return_type))
                            {
                                if (argument_count == 0)
                                {
                                    if (Variant::is_builtin_method_static(TYPE, name))
                                    {
                                        class_builder.Static().Method(name, ReflectBuiltinMethodPointerCall<real_t>::_call<false>, (void*) Variant::get_ptr_builtin_method(TYPE, name));
                                    }
                                    else
                                    {
                                        class_builder.Instance().Method(name, ReflectBuiltinMethodPointerCall<real_t>::_call<true>, (void*) Variant::get_ptr_builtin_method(TYPE, name));
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
                                    class_builder.Static().Method(name, ReflectBuiltinMethodPointerCall<void>::_call<false>, (void*) Variant::get_ptr_builtin_method(TYPE, name));
                                }
                                else
                                {
                                    class_builder.Instance().Method(name, ReflectBuiltinMethodPointerCall<void>::_call<true>, (void*) Variant::get_ptr_builtin_method(TYPE, name));
                                }
                                continue;
                            }
                        }
                    }
#endif

                    // convert method info, and store
                    const int collection_index = (int) GetVariantInfoCollection(p_env.env).methods.size();
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
                            class_builder.Static().Method(name, _static_method<true>, collection_index);
                        }
                        else
                        {
                            class_builder.Instance().Method(name, _instance_method<true>, collection_index);
                        }
                    }
                    else
                    {
                        if (Variant::is_builtin_method_static(TYPE, name))
                        {
                            class_builder.Static().Method(name, _static_method<false>, collection_index);
                        }
                        else
                        {
                            class_builder.Instance().Method(name, _instance_method<false>, collection_index);
                        }
                    }
                }
            }

            // operators
            {
                OperatorRegister<T>::generate(class_builder);
            }

            // enums
            HashSet<StringName> enum_constants;
            {
                List<StringName> enums;
                Variant::get_enums_for_type(TYPE, &enums);
                for (const StringName& enum_name : enums)
                {
                    List<StringName> enumerations;
                    auto enum_decl = class_builder.Static().Enum(enum_name);
                    Variant::get_enumerations_for_enum(TYPE, enum_name, &enumerations);
                    for (const StringName& enumeration : enumerations)
                    {
                        bool r_valid;
                        const int enum_value = Variant::get_enum_value(TYPE, enum_name, enumeration, &r_valid);
                        jsb_check(r_valid);
                        enum_decl.Value(enumeration, enum_value);
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
                    class_builder.Static().LazyProperty(constant, _get_constant_value_lazy);
                }
            }

            {
                if (r_class_id) *r_class_id = class_id;

                NativeClassInfoPtr class_info = p_env.env->get_native_class(class_id);
                class_info->finalizer = &finalizer;
                class_info->clazz = class_builder.Build(p_env.context);
                jsb_check(!class_info->clazz.IsEmpty());
                return class_info;
            }
        }
    };

    void register_primitive_bindings_reflect(Environment* p_env)
    {
#pragma push_macro("DEF")
#   undef   DEF
#   define  DEF(TypeName) p_env->add_class_register(GetTypeInfo<TypeName>::VARIANT_TYPE, &VariantBind<TypeName>::reflect_bind);
#   include "jsb_primitive_types.def.h"
#pragma pop_macro("DEF")

    }
}

#endif

