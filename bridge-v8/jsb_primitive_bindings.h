#ifndef GODOTJS_PRIMITIVE_BINDINGS_H
#define GODOTJS_PRIMITIVE_BINDINGS_H
#include "jsb_pch.h"

#ifndef JSB_WITH_STATIC_PRIMITIVE_TYPE_BINDINGS
#   define JSB_WITH_STATIC_PRIMITIVE_TYPE_BINDINGS 0
#endif

#if JSB_WITH_STATIC_PRIMITIVE_TYPE_BINDINGS
#   error "NOT SUPPORTED YET"
#endif

#define JSB_CONSTRUCT_DEFAULT_VARIANT_SLOW 0

#define JSB_OPERATOR_NAME(op_code) #op_code

namespace jsb
{
    struct FBindingEnv
    {
        class Environment* environment;
        class Realm* realm;
        StringName type_name;

        v8::Isolate* isolate;
        const v8::Local<v8::Context>& context;

        internal::CFunctionPointers& function_pointers;
    };

    typedef NativeClassID (*PrimitiveTypeRegisterFunc)(const FBindingEnv& p_env);

    jsb_force_inline void construct_variant(Variant& r_value, Variant::Type p_type)
    {
#if JSB_CONSTRUCT_DEFAULT_VARIANT_SLOW
        Callable::CallError err;
        Variant::construct(p_type, r_value, nullptr, 0, err);
#else
        static Variant dummy = {};
        r_value = VariantUtilityFunctions::type_convert(dummy, p_type);
#endif
    }

    void register_primitive_bindings(class Realm* p_realm);
}
#endif
