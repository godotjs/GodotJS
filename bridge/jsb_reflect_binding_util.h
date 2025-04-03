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
    struct TransitionNumber;

    /**
     * Godot represents int32_t with int64_t in pointer function calls 
     * see variant_setget.h
     * SETGET_NUMBER_STRUCT(Vector2i, int64_t, x)
     */
    template<> struct TransitionNumber<int32_t> { using Type = int64_t; };
    
    /**
     * Godot represents float with double in pointer function calls
     * see variant_setget.h
     * SETGET_NUMBER_STRUCT(Vector2, double, x)
     */
    template<> struct TransitionNumber<float> { using Type = double; };

    template<typename T>
    using GDTransitionNumber = typename TransitionNumber<T>::Type;
    
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
            class_builder.Instance().Method(internal::NamingUtil::get_member_name("to_array_buffer"), &_to_array_buffer);
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

    // fallback version of get_opaque_pointer for any Variant
    template<typename OwnerT>
    struct TVariantOpaquePointer
    {
        static void* from(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            return VariantInternal::get_opaque_pointer((Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer));
        }
    };

#define JSB_DEFINE_VARIANT_OPAQUE_POINTER(OwnerT, FuncName) \
    template<>\
    struct TVariantOpaquePointer<OwnerT>\
    {\
        jsb_force_inline static void* from(const v8::FunctionCallbackInfo<v8::Value>& info)\
        {\
            return VariantInternal::FuncName((Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer));\
        }\
    };

    // all specialized versions of get_opaque_pointer (no variant.get_type() check)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Vector2, get_vector2)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Vector2i, get_vector2i)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Rect2, get_rect2)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Rect2i, get_rect2i)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Vector3, get_vector3)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Vector3i, get_vector3i)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Vector4, get_vector4)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Vector4i, get_vector4i)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Transform2D, get_transform2d)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Plane, get_plane)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Quaternion, get_quaternion)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(::AABB, get_aabb)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Basis, get_basis)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Transform3D, get_transform)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Projection, get_projection)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Color, get_color)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(StringName, get_string_name)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(NodePath, get_node_path)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(RID, get_rid)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Callable, get_callable)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Signal, get_signal)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Dictionary, get_dictionary)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(Array, get_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedByteArray, get_byte_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedInt32Array, get_int32_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedInt64Array, get_int64_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedFloat32Array, get_float32_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedFloat64Array, get_float64_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedStringArray, get_string_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedVector2Array, get_vector2_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedVector3Array, get_vector3_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedColorArray, get_color_array)
    JSB_DEFINE_VARIANT_OPAQUE_POINTER(PackedVector4Array, get_vector4_array)

    // not supported
    template<typename OwnerT, typename ReturnT, typename... Ts>
    struct ReflectBuiltinMethodPointerCall
    {
        static constexpr bool is_supported(Variant::Type return_type) { return false; }

        template<bool IsInstanceCallT>
        static void call(const v8::FunctionCallbackInfo<v8::Value>& info);
    };

    // specialized for: void call();
    template<typename OwnerT>
    struct ReflectBuiltinMethodPointerCall<OwnerT, void>
    {
        static constexpr bool is_supported(Variant::Type return_type) { return true; }

        template<bool IsInstanceCallT>
        static void call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            if constexpr (IsInstanceCallT) func(TVariantOpaquePointer<OwnerT>::from(info), nullptr, nullptr, 0);
            else func(nullptr, nullptr, nullptr, 0);
        }
    };

    // specialized for: void call(real_t);
    template<typename OwnerT>
    struct ReflectBuiltinMethodPointerCall<OwnerT, void, real_t>
    {
        static constexpr bool is_supported(Variant::Type return_type) { return true; }
        
        template<bool IsInstanceCallT>
        static void call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            real_t loc_0;
            if (!StaticBindingUtil<real_t>::get(isolate, isolate->GetCurrentContext(), info[0], loc_0))
            {
                jsb_throw(isolate, "bad param at 0");
                return;
            }
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            const void* args[] = { &loc_0 };
            if constexpr (IsInstanceCallT) func(TVariantOpaquePointer<OwnerT>::from(info), args, nullptr, 0);
            else func(nullptr, args, nullptr, 0);
        }
    };

    // specialized for: real_t call();
    template<typename OwnerT>
    struct ReflectBuiltinMethodPointerCall<OwnerT, real_t>
    {
        static constexpr bool is_supported(Variant::Type return_type) { return Variant::Type::FLOAT == return_type; }

        template<bool IsInstanceCallT>
        static void call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            GDTransitionNumber<real_t> value = 0;
            if constexpr (IsInstanceCallT) func(TVariantOpaquePointer<OwnerT>::from(info), nullptr, &value, 0);
            else func(nullptr, nullptr, &value, 0);
            info.GetReturnValue().Set(v8::Number::New(isolate, value));
        }
    };

    // specialized for: int32_t call();
    template<typename OwnerT>
    struct ReflectBuiltinMethodPointerCall<OwnerT, int32_t>
    {
        static constexpr bool is_supported(Variant::Type return_type) { return Variant::Type::INT == return_type; }

        template<bool IsInstanceCallT>
        static void call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            GDTransitionNumber<int32_t> value = 0;
            if constexpr (IsInstanceCallT) func(TVariantOpaquePointer<OwnerT>::from(info), nullptr, &value, 0);
            else func(nullptr, nullptr, &value, 0);
            info.GetReturnValue().Set(impl::Helper::new_integer(isolate, value));
        }
    };

    // specialized for: bool call();
    template<typename OwnerT>
    struct ReflectBuiltinMethodPointerCall<OwnerT, bool>
    {
        static constexpr bool is_supported(Variant::Type return_type) { return Variant::Type::BOOL == return_type; }

        template<bool IsInstanceCallT>
        static void call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            bool value = false;
            if constexpr (IsInstanceCallT) func(TVariantOpaquePointer<OwnerT>::from(info), nullptr, &value, 0);
            else func(nullptr, nullptr, &value, 0);
            info.GetReturnValue().Set(v8::Boolean::New(isolate, value));
        }
    };

    // specialized for: real_t call(real_t);
    template<typename OwnerT>
    struct ReflectBuiltinMethodPointerCall<OwnerT, real_t, real_t>
    {
        static constexpr bool is_supported(Variant::Type return_type) { return Variant::Type::FLOAT == return_type; }

        template<bool IsInstanceCallT>
        static void call(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            real_t loc_0;
            if (!StaticBindingUtil<real_t>::get(isolate, isolate->GetCurrentContext(), info[0], loc_0))
            {
                jsb_throw(isolate, "bad param at 0");
                return;
            }
            const Variant::PTRBuiltInMethod func = (const Variant::PTRBuiltInMethod) info.Data().As<v8::External>()->Value();
            const void* args[] = { &loc_0 };
            GDTransitionNumber<real_t> value = 0;
            if constexpr (IsInstanceCallT) func(TVariantOpaquePointer<OwnerT>::from(info), args, &value, 0);
            else func(nullptr, args, &value, 0);
            info.GetReturnValue().Set(v8::Number::New(isolate, value));
        }
    };

    template<typename OwnerT, typename PropertyT>
    struct TReflectGetSetPointerCall
    {
        static constexpr bool is_supported(Variant::Type member_type) { return false; }

        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info);  // no use
        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info);  // no use
    };

    template<typename OwnerT>
    struct TReflectGetSetPointerCall<OwnerT, real_t>
    {
        static constexpr bool is_supported(Variant::Type member_type) { return Variant::Type::FLOAT == member_type; }

        // approx. 30% faster than plain reflection version of _getter/_setter
        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRGetter getter_func = (const Variant::PTRGetter) info.Data().As<v8::External>()->Value();

            GDTransitionNumber<real_t> value[] = { 0 };
            getter_func(TVariantOpaquePointer<OwnerT>::from(info), &value);
            info.GetReturnValue().Set(v8::Number::New(isolate, value[0]));
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const Variant::PTRSetter setter_func = (const Variant::PTRSetter) info.Data().As<v8::External>()->Value();
            GDTransitionNumber<real_t> value;
            if (!StaticBindingUtil<GDTransitionNumber<real_t>>::get(isolate, context, info[0], value))
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            setter_func(TVariantOpaquePointer<OwnerT>::from(info), &value);
        }

    };

    template<typename OwnerT>
    struct TReflectGetSetPointerCall<OwnerT, int32_t>
    {
        static constexpr bool is_supported(Variant::Type member_type) { return member_type == Variant::Type::INT; }

        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const Variant::PTRGetter getter_func = (const Variant::PTRGetter) info.Data().As<v8::External>()->Value();

            GDTransitionNumber<int32_t> value[] = { 0 };
            getter_func(TVariantOpaquePointer<OwnerT>::from(info), &value);
            info.GetReturnValue().Set(impl::Helper::new_integer(isolate, value[0]));
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            GDTransitionNumber<int32_t> value;
            if (!StaticBindingUtil<GDTransitionNumber<int32_t>>::get(info[0], value))
            {
                jsb_throw(info.GetIsolate(), "bad param");
                return;
            }
            const Variant::PTRSetter setter_func = (const Variant::PTRSetter) info.Data().As<v8::External>()->Value();
            setter_func(TVariantOpaquePointer<OwnerT>::from(info), &value);
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
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(info[1], loc_1))
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
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(info[1], loc_1))
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
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                real_t loc_2;
                if (!StaticBindingUtil<real_t>::get(info[2], loc_2))
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
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                int32_t loc_2;
                if (!StaticBindingUtil<int32_t>::get(info[2], loc_2))
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
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                real_t loc_2;
                if (!StaticBindingUtil<real_t>::get(info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                real_t loc_3;
                if (!StaticBindingUtil<real_t>::get(info[3], loc_3))
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
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                int32_t loc_2;
                if (!StaticBindingUtil<int32_t>::get(info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                int32_t loc_3;
                if (!StaticBindingUtil<int32_t>::get(info[3], loc_3))
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
                real_t loc_0;
                if (!StaticBindingUtil<real_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                real_t loc_1;
                if (!StaticBindingUtil<real_t>::get(info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                real_t loc_2;
                if (!StaticBindingUtil<real_t>::get(info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                real_t loc_3;
                if (!StaticBindingUtil<real_t>::get(info[3], loc_3))
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
                int32_t loc_0;
                if (!StaticBindingUtil<int32_t>::get(info[0], loc_0))
                {
                    jsb_throw(isolate, "bad param at 0");
                    return;
                }
                int32_t loc_1;
                if (!StaticBindingUtil<int32_t>::get(info[1], loc_1))
                {
                    jsb_throw(isolate, "bad param at 1");
                    return;
                }
                int32_t loc_2;
                if (!StaticBindingUtil<int32_t>::get(info[2], loc_2))
                {
                    jsb_throw(isolate, "bad param at 2");
                    return;
                }
                int32_t loc_3;
                if (!StaticBindingUtil<int32_t>::get(info[3], loc_3))
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
