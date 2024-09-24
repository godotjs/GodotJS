#ifndef GODOTJS_VARIANT_UTIL_H
#define GODOTJS_VARIANT_UTIL_H
#include "jsb_internal_pch.h"
#include "jsb_string_names.h"

namespace jsb::internal
{
    struct VariantUtil
    {
        jsb_force_inline static StringName get_type_name(const Variant::Type p_type)
        {
            return StringNames::get_singleton().get_replaced_name(Variant::get_type_name(p_type));
        }

        jsb_force_inline static bool check_argc(bool p_is_vararg, int p_argc, int p_default_num, int p_expected_num)
        {
            if (p_is_vararg)
            {
                return p_argc + p_default_num >= p_expected_num;
            }
            if (p_default_num == 0)
            {
                return p_argc == p_expected_num;
            }
            return p_argc <= p_expected_num && p_argc + p_default_num >= p_expected_num;
        }

#if GODOT_4_4_OR_NEWER
    	jsb_force_inline static String to_snake_case_id(const String& p_name)
        {
        	return p_name.to_snake_case().validate_ascii_identifier();
        }

    	jsb_force_inline static String to_pascal_case_id(const String& p_name)
        {
        	return p_name.to_pascal_case().validate_ascii_identifier();
        }
#else
    	jsb_force_inline static String to_snake_case_id(const String& p_name)
        {
        	return p_name.to_snake_case().validate_identifier();
        }

    	jsb_force_inline static String to_pascal_case_id(const String& p_name)
        {
        	return p_name.to_pascal_case().validate_identifier();
        }
#endif

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
