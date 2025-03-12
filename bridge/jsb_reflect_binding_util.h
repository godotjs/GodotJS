#ifndef GODOTJS_REFLECT_BINDING_UTIL_H
#define GODOTJS_REFLECT_BINDING_UTIL_H
#include "jsb_object_handle.h"
#include "jsb_bridge_pch.h"
#include "jsb_environment.h"
#include "jsb_static_binding_util.h"
#include "../internal/jsb_variant_info.h"

#define GetVariantInfoCollection(env) (env)->get_variant_info_collection() // ::jsb::internal::VariantInfoCollection::global

namespace jsb
{
    template<typename ForType>
    struct ReflectAdditionalMethodRegister
    {
        static void register_(impl::ClassBuilder& class_builder) {}
    };

    template<>
    struct ReflectAdditionalMethodRegister<PackedByteArray>
    {
        static void register_(impl::ClassBuilder& class_builder)
        {
            class_builder.Instance().Method("to_array_buffer", &_to_array_buffer);
        }

        static void _to_array_buffer(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const v8::Local<v8::Object> self = info.This();
            Variant var;
            if (!TypeConvert::js_to_gd_var(isolate, context, self, Variant::PACKED_BYTE_ARRAY, var))
            {
                jsb_throw(isolate, "this is not PackedByteArray");
                return;
            }
            info.GetReturnValue().Set(impl::Helper::to_array_buffer(isolate, var));
        }
    };

    template<bool IsInstancedT = false>
    struct ReflectThis
    {
        static void* from(const v8::FunctionCallbackInfo<v8::Value>& info) { return nullptr; }
    };

    template<>
    struct ReflectThis<true>
    {
        static void* from(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            // jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            return VariantInternal::get_opaque_pointer((Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer));
        }
    };

    template<typename ReturnT>
    struct ReflectBuiltinMethodPointerCall
    {
        static constexpr bool is_supported(Variant::Type return_type) { return false; }

        template<bool, Variant::Type... Ts>
        static void _call(const v8::FunctionCallbackInfo<v8::Value>& info);
    };

    template<>
    struct ReflectBuiltinMethodPointerCall<void>
    {
        typedef double GDTransitionNumber;
        static constexpr bool is_supported(Variant::Type return_type) { return true; }

        // no arg
        template<bool IsInstanceCallT>
        static void _call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            func(ReflectThis<IsInstanceCallT>::from(info), nullptr, nullptr, 0);
        }
    };

    template<>
    struct ReflectBuiltinMethodPointerCall<real_t>
    {
        typedef double GDTransitionNumber;
        static constexpr bool is_supported(Variant::Type return_type) { return Variant::Type::FLOAT == return_type; }

        // no arg
        template<bool IsInstanceCallT>
        static void _call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            GDTransitionNumber value = 0;
            func(ReflectThis<IsInstanceCallT>::from(info), nullptr, &value, 0);
            info.GetReturnValue().Set(v8::Number::New(isolate, value));
        }

        // template<bool IsInstanceCallT, Variant::Type A1>
        // static void _call(const v8::FunctionCallbackInfo<v8::Value>& info)
        // {
        //     v8::Isolate* isolate = info.GetIsolate();
        //     v8::Local<v8::Context> context = isolate->GetCurrentContext();
        //     const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
        //     GDTransitionNumber value = 0;
        //     Variant args[] = { {} };
        //     if (!Realm::js_to_gd_var(isolate, context, info[0], A1, args[0]))
        //     {
        //         jsb_throw(isolate, "bad param");
        //         return;
        //     }
        //     const void* argv[] = { VariantInternal::get_opaque_pointer(&args[0]) };
        //     func(ReflectThis<IsInstanceCallT>::from(info), &argv[0], &value, 1);
        //     info.GetReturnValue().Set(v8::Number::New(isolate, value));
        // }
        //
        // template<bool IsInstanceCallT, Variant::Type A1, Variant::Type A2>
        // static void _call(const v8::FunctionCallbackInfo<v8::Value>& info)
        // {
        //     v8::Isolate* isolate = info.GetIsolate();
        //     v8::Local<v8::Context> context = isolate->GetCurrentContext();
        //     const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
        //     GDTransitionNumber value = 0;
        //     Variant args[] = { {}, {} };
        //     if (!Realm::js_to_gd_var(isolate, context, info[0], A1, args[0])
        //         || !Realm::js_to_gd_var(isolate, context, info[1], A2, args[1]))
        //     {
        //         jsb_throw(isolate, "bad param");
        //         return;
        //     }
        //     const void* argv[] = { VariantInternal::get_opaque_pointer(&args[0]), VariantInternal::get_opaque_pointer(&args[1]) };
        //     func(ReflectThis<IsInstanceCallT>::from(info), &argv[0], &value, 2);
        //     info.GetReturnValue().Set(v8::Number::New(isolate, value));
        // }
    };

    template<typename>
    struct ReflectGetSetPointerCall
    {
        static constexpr bool is_supported(Variant::Type member_type) { return false; }

        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info);  // no use
        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info);  // no use
    };

    template<>
    struct ReflectGetSetPointerCall<real_t>
    {
        static constexpr bool is_supported(Variant::Type member_type) { return Variant::Type::FLOAT == member_type; }

        /**
         * Godot uses double in pointer function calls
         * see variant_setget.h
         * SETGET_NUMBER_STRUCT(Vector2, double, x)
         */
        typedef double GDTransitionNumber;

        // approx. 30% faster than plain reflection version of _getter/_setter
        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRGetter getter_func = (const Variant::PTRGetter) info.Data().As<v8::External>()->Value();

            GDTransitionNumber value[] = { 0 };
            getter_func(ReflectThis<true>::from(info), &value);
            info.GetReturnValue().Set(v8::Number::New(isolate, value[0]));
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (!info[0]->IsNumber())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            const Variant::PTRSetter setter_func = (const Variant::PTRSetter) info.Data().As<v8::External>()->Value();
            const GDTransitionNumber value = (const GDTransitionNumber) info[0]->NumberValue(context).ToChecked();
            setter_func(ReflectThis<true>::from(info), &value);
        }

    };

    template<>
    struct ReflectGetSetPointerCall<int32_t>
    {
        static constexpr bool is_supported(Variant::Type member_type) { return member_type == Variant::Type::INT; }

        /**
         * Godot uses int64_t in pointer function calls
         * see variant_setget.h
         * SETGET_NUMBER_STRUCT(Vector2i, int64_t, x)
         */
        typedef int64_t GDTransitionNumber;

        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRGetter getter_func = (const Variant::PTRGetter) info.Data().As<v8::External>()->Value();

            GDTransitionNumber value[] = { 0 };
            getter_func(ReflectThis<true>::from(info), &value);
            info.GetReturnValue().Set(impl::Helper::new_integer(isolate, value[0]));
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            // loose int32 check
            if (!info[0]->IsNumber())
            {
                jsb_throw(info.GetIsolate(), "bad param");
                return;
            }
            const Variant::PTRSetter setter_func = (const Variant::PTRSetter) info.Data().As<v8::External>()->Value();
            const GDTransitionNumber value = (const GDTransitionNumber) info[0].As<v8::Int32>()->Value();
            setter_func(ReflectThis<true>::from(info), &value);
        }

    };

    template<typename>
    struct ReflectConstructorCall
    {
        static constexpr bool is_supported(Variant::Type type) { return false; }
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info);
    };

    template<typename TStruct>
    struct ReflectConstructorCallValueBinder
    {
        jsb_force_inline static void bind_valuetype(v8::Isolate* isolate, const v8::Local<v8::Object>& p_object, const TStruct& p_value)
        {
            static_assert(GetTypeInfo<TStruct>::VARIANT_TYPE != Variant::VARIANT_MAX);
            Environment* env = Environment::wrap(isolate);
            Variant* pointer = env->alloc_variant();
            *pointer = p_value;
            env->bind_valuetype(pointer, p_object);
        }

        jsb_force_inline static void bind_valuetype(v8::Isolate* isolate, const v8::Local<v8::Object>& p_object, const TStruct& p_value, const NativeClassID p_class_id)
        {
            static_assert(GetTypeInfo<TStruct>::VARIANT_TYPE != Variant::VARIANT_MAX);
            Environment* env = Environment::wrap(isolate);
            Variant* pointer = env->alloc_variant();
            *pointer = p_value;
            env->bind_valuetype(pointer, p_object);
        }
    };

    template<>
    struct ReflectConstructorCall<Vector2> : ReflectConstructorCallValueBinder<Vector2>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR2; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            const v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            //TODO ClassID temporarily not used for possibly better performance in constructor (by avoiding info.Data())
            // const NativeClassID class_id = (NativeClassID) info.Data().As<v8::Uint32>()->Value();

            if (v8_argc == 0)
            {
                static const Vector2 zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Vector2 loc_0;
                    if (!StaticBindingUtil<Vector2>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
                do
                {
                    Vector2i loc_0;
                    if (!StaticBindingUtil<Vector2i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Vector2(loc_0));
                    return;
                } while (false);
            }
            else if (v8_argc == 2)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                bind_valuetype(isolate, self, Vector2(loc_0, loc_1));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Vector2i> : ReflectConstructorCallValueBinder<Vector2i>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR2I; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            if (v8_argc == 0)
            {
                static const Vector2i zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Vector2 loc_0;
                    if (!StaticBindingUtil<Vector2>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Vector2i(loc_0));
                    return;
                } while (false);
                do
                {
                    Vector2i loc_0;
                    if (!StaticBindingUtil<Vector2i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
            }
            else if (v8_argc == 2)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                bind_valuetype(isolate, self, Vector2i(loc_0, loc_1));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Vector3> : ReflectConstructorCallValueBinder<Vector3>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR3; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            if (v8_argc == 0)
            {
                static const Vector3 zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Vector3 loc_0;
                    if (!StaticBindingUtil<Vector3>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
                do
                {
                    Vector3i loc_0;
                    if (!StaticBindingUtil<Vector3i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Vector3(loc_0));
                    return;
                } while (false);
            }
            else if (v8_argc == 3)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                real_t loc_2;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                bind_valuetype(isolate, self, Vector3(loc_0, loc_1, loc_2));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Vector3i> : ReflectConstructorCallValueBinder<Vector3i>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR3I; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            if (v8_argc == 0)
            {
                static const Vector3i zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Vector3 loc_0;
                    if (!StaticBindingUtil<Vector3>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Vector3i(loc_0));
                    return;
                } while (false);
                do
                {
                    Vector3i loc_0;
                    if (!StaticBindingUtil<Vector3i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
            }
            else if (v8_argc == 3)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                int32_t loc_2;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                bind_valuetype(isolate, self, Vector3i(loc_0, loc_1, loc_2));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Vector4> : ReflectConstructorCallValueBinder<Vector4>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR4; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            if (v8_argc == 0)
            {
                static const Vector4 zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Vector4 loc_0;
                    if (!StaticBindingUtil<Vector4>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
                do
                {
                    Vector4i loc_0;
                    if (!StaticBindingUtil<Vector4i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Vector4(loc_0));
                    return;
                } while (false);
            }
            else if (v8_argc == 4)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                real_t loc_2;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                real_t loc_3;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[3], loc_3))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                bind_valuetype(isolate, self, Vector4(loc_0, loc_1, loc_2, loc_3));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Vector4i> : ReflectConstructorCallValueBinder<Vector4i>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR4I; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            if (v8_argc == 0)
            {
                static const Vector4i zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Vector4 loc_0;
                    if (!StaticBindingUtil<Vector4>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Vector4i(loc_0));
                    return;
                } while (false);
                do
                {
                    Vector4i loc_0;
                    if (!StaticBindingUtil<Vector4i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
            }
            else if (v8_argc == 4)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                int32_t loc_2;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                int32_t loc_3;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[3], loc_3))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                bind_valuetype(isolate, self, Vector4i(loc_0, loc_1, loc_2, loc_3));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Rect2> : ReflectConstructorCallValueBinder<Rect2>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::RECT2; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            if (v8_argc == 0)
            {
                static const Rect2 zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Rect2 loc_0;
                    if (!StaticBindingUtil<Rect2>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
                do
                {
                    Rect2i loc_0;
                    if (!StaticBindingUtil<Rect2i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Rect2(loc_0));
                    return;
                } while (false);
            }
            else if (v8_argc == 2)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                Vector2 loc_0;
                if (!StaticBindingUtil<Vector2>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                Vector2 loc_1;
                if (!StaticBindingUtil<Vector2>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                bind_valuetype(isolate, self, Rect2(loc_0, loc_1));
                return;
            }
            else if (v8_argc == 4)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                real_t loc_2;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                real_t loc_3;
                if (!StaticBindingUtil<real_t>::get(isolate, context, info[3], loc_3))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                bind_valuetype(isolate, self, Rect2(loc_0, loc_1, loc_2, loc_3));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Rect2i> : ReflectConstructorCallValueBinder<Rect2i>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::RECT2I; }

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            if (!info.IsConstructCall())
            {
                jsb_throw(isolate, "bad constructor call");
                return;
            }
            v8::Local<v8::Object> self = info.This();
            const int v8_argc = info.Length();
            if (v8_argc == 0)
            {
                static const Rect2i zero;
                bind_valuetype(isolate, self, zero);
                return;
            }
            else if (v8_argc == 1)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                do
                {
                    Rect2 loc_0;
                    if (!StaticBindingUtil<Rect2>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, Rect2i(loc_0));
                    return;
                } while (false);
                do
                {
                    Rect2i loc_0;
                    if (!StaticBindingUtil<Rect2i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    bind_valuetype(isolate, self, loc_0);
                    return;
                } while (false);
            }
            else if (v8_argc == 2)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                Vector2i loc_0;
                if (!StaticBindingUtil<Vector2i>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                Vector2i loc_1;
                if (!StaticBindingUtil<Vector2i>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                bind_valuetype(isolate, self, Rect2i(loc_0, loc_1));
                return;
            }
            else if (v8_argc == 4)
            {
                const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                int32_t loc_2;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                int32_t loc_3;
                if (!StaticBindingUtil<int32_t>::get(isolate, context, info[3], loc_3))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                bind_valuetype(isolate, self, Rect2i(loc_0, loc_1, loc_2, loc_3));
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

}
#endif
