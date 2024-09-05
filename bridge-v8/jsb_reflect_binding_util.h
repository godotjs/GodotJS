#ifndef GODOTJS_REFLECT_BINDING_UTIL_H
#define GODOTJS_REFLECT_BINDING_UTIL_H
#include "jsb_object_handle.h"
#include "jsb_pch.h"
#include "jsb_realm.h"
#include "jsb_static_binding_util.h"
#include "../internal/jsb_variant_info.h"

#define GetVariantInfoCollection(p_realm) (p_realm)->get_variant_info_collection() // ::jsb::internal::VariantInfoCollection::global

namespace jsb
{
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
            info.GetReturnValue().Set(v8::Int32::New(isolate, (int32_t) value[0]));
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (!info[0]->IsInt32())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            const Variant::PTRSetter setter_func = (const Variant::PTRSetter) info.Data().As<v8::External>()->Value();

            const GDTransitionNumber value = (const GDTransitionNumber) info[0]->Int32Value(context).ToChecked();
            setter_func(ReflectThis<true>::from(info), &value);
        }

    };

    template<typename>
    struct ReflectConstructorCall
    {
        static constexpr bool is_supported(Variant::Type type) { return false; }
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info);
    };

    template<>
    struct ReflectConstructorCall<Vector2>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR2; }

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
            const int v8_argc = info.Length();
            const NativeClassID class_id = (const NativeClassID) info.Data().As<v8::Int32>()->Value();
            if (v8_argc == 0)
            {
                static Variant zero = Vector2();
                Variant* instance = Environment::alloc_variant();
                *instance = zero;
                Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                return;
            }
            else if (v8_argc == 1)
            {
                do
                {
                    Vector2 loc_0;
                    if (!StaticBindingUtil<Vector2>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    Variant* instance = Environment::alloc_variant();
                    *instance = Vector2(loc_0);
                    Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                    return;
                } while (false);
                do
                {
                    Vector2i loc_0;
                    if (!StaticBindingUtil<Vector2i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    Variant* instance = Environment::alloc_variant();
                    *instance = Vector2(loc_0);
                    Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                    return;
                } while (false);
            }
            else if (v8_argc == 2)
            {
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
                Variant* instance = Environment::alloc_variant();
                *instance = Vector2(loc_0, loc_1);
                Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

    template<>
    struct ReflectConstructorCall<Vector3>
    {
        static constexpr bool is_supported(Variant::Type type) { return type == Variant::Type::VECTOR3; }

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
            const int v8_argc = info.Length();
            const NativeClassID class_id = (const NativeClassID) info.Data().As<v8::Int32>()->Value();
            if (v8_argc == 0)
            {
                static Variant zero = Vector3();
                Variant* instance = Environment::alloc_variant();
                *instance = zero;
                Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                return;
            }
            else if (v8_argc == 1)
            {
                do
                {
                    Vector3 loc_0;
                    if (!StaticBindingUtil<Vector3>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    Variant* instance = Environment::alloc_variant();
                    *instance = Vector3(loc_0);
                    Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                    return;
                } while (false);
                do
                {
                    Vector3i loc_0;
                    if (!StaticBindingUtil<Vector3i>::get(isolate, context, info[0], loc_0))
                    {
                        break;
                    }
                    Variant* instance = Environment::alloc_variant();
                    *instance = Vector3(loc_0);
                    Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                    return;
                } while (false);
            }
            else if (v8_argc == 3)
            {
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
                Variant* instance = Environment::alloc_variant();
                *instance = Vector3(loc_0, loc_1, loc_2);
                Environment::wrap(isolate)->bind_valuetype(class_id, instance, self);
                return;
            }
            jsb_throw(isolate, "no suitable constructor");
        }
    };

}
#endif
