#ifndef GODOTJS_VARIANT_UTIL_H
#define GODOTJS_VARIANT_UTIL_H
#include "jsb_macros.h"

namespace jsb::internal
{
    struct VariantUtil
    {
        jsb_force_inline static Variant::Type get_element_type(Variant::Type p_type)
        {
            static Variant::Type mappings[] = {
                Variant::INT,       // PACKED_BYTE_ARRAY
                Variant::INT,       // PACKED_INT32_ARRAY
                Variant::INT,       // PACKED_INT64_ARRAY
                Variant::FLOAT,     // PACKED_FLOAT32_ARRAY
                Variant::FLOAT,     // PACKED_FLOAT64_ARRAY
                Variant::STRING,    // PACKED_STRING_ARRAY
                Variant::VECTOR2,   // PACKED_VECTOR2_ARRAY
                Variant::VECTOR3,   // PACKED_VECTOR3_ARRAY
                Variant::COLOR,     // PACKED_COLOR_ARRAY
            };
            jsb_check(p_type - Variant::PACKED_BYTE_ARRAY >= 0 && p_type - Variant::PACKED_BYTE_ARRAY < ::std::size(mappings));
            return mappings[p_type - Variant::PACKED_BYTE_ARRAY];
        }

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
        jsb_force_inline static bool is_valid_name(const StringName& p_name)
        {
            return ((const void*) p_name) != nullptr;
        }
    };
}
#endif
