#ifndef GODOTJS_VARIANT_UTIL_H
#define GODOTJS_VARIANT_UTIL_H
#include "jsb_macros.h"

namespace jsb::internal
{
    struct VariantUtil
    {
        jsb_force_inline static void construct_variant(Variant& r_value, Variant::Type p_type)
        {
#if JSB_CONSTRUCT_DEFAULT_VARIANT_SLOW
            Callable::CallError err;
            Variant::construct(p_type, r_value, nullptr, 0, err);
#else
            static Variant dummy = {};
            r_value = VariantUtilityFunctions::type_convert(dummy, p_type);
#endif
        }

        /**
         * if a StringName represents a non-null string
         */
        jsb_force_inline static bool is_valid(const StringName& p_name)
        {
            return ((const void*) p_name) != nullptr;
        }
    };
}
#endif
