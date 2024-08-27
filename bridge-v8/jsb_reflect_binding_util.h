#ifndef GODOTJS_REFLECT_BINDING_UTIL_H
#define GODOTJS_REFLECT_BINDING_UTIL_H
#include "jsb_object_handle.h"
#include "jsb_pch.h"
#include "jsb_realm.h"
#include "../internal/jsb_variant_info.h"

#define RegisterPrimitiveType(TypeName) add_class_register(GetTypeInfo<TypeName>::VARIANT_TYPE, &VariantBind<TypeName>::reflect_bind)
#define GetVariantInfoCollection(p_realm) (p_realm)->get_variant_info_collection() // ::jsb::internal::VariantInfoCollection::global

namespace jsb
{
    template<typename T>
    struct ReflectGetSetPointerCall
    {
        enum { is_supported = 0 };
        static constexpr Variant::Type member_type = Variant::Type::NIL;       // no use
        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info);  // no use
        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info);  // no use
    };

#if JSB_EXPERIMENTAL_REFLECT_FAST
    template<>
    struct ReflectGetSetPointerCall<real_t>
    {
        enum { is_supported = 1 };
        static constexpr Variant::Type member_type = Variant::Type::FLOAT;

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
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            const Variant* p_self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const Variant::PTRGetter getter_func = (const Variant::PTRGetter) info.Data().As<v8::External>()->Value();

            GDTransitionNumber value[] = { 0 };
            getter_func(VariantInternal::get_opaque_pointer(p_self), &value);
            info.GetReturnValue().Set(v8::Number::New(isolate, value[0]));
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            if (!info[0]->IsNumber())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Variant* p_self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const Variant::PTRSetter setter_func = (const Variant::PTRSetter) info.Data().As<v8::External>()->Value();

            const GDTransitionNumber value = (const GDTransitionNumber) info[0]->NumberValue(context).ToChecked();
            setter_func(VariantInternal::get_opaque_pointer(p_self), &value);
        }

    };

    template<>
    struct ReflectGetSetPointerCall<int32_t>
    {
        enum { is_supported = 1 };
        static constexpr Variant::Type member_type = Variant::Type::INT;

        /**
         * Godot uses int64_t in pointer function calls
         * see variant_setget.h
         * SETGET_NUMBER_STRUCT(Vector2i, int64_t, x)
         */
        typedef int64_t GDTransitionNumber;

        static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            const Variant* p_self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const Variant::PTRGetter getter_func = (const Variant::PTRGetter) info.Data().As<v8::External>()->Value();

            GDTransitionNumber value[] = { 0 };
            getter_func(VariantInternal::get_opaque_pointer(p_self), &value);
            info.GetReturnValue().Set(v8::Int32::New(isolate, (int32_t) value[0]));
        }

        static void _setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            jsb_check(info.This()->InternalFieldCount() == IF_VariantFieldCount);
            if (!info[0]->IsInt32())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Variant* p_self = (Variant*) info.This()->GetAlignedPointerFromInternalField(IF_Pointer);
            const Variant::PTRSetter setter_func = (const Variant::PTRSetter) info.Data().As<v8::External>()->Value();

            const GDTransitionNumber value = (const GDTransitionNumber) info[0]->Int32Value(context).ToChecked();
            setter_func(VariantInternal::get_opaque_pointer(p_self), &value);
        }

    };
#endif

}
#endif
