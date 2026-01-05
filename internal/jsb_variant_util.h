#ifndef GODOTJS_VARIANT_UTIL_H
#define GODOTJS_VARIANT_UTIL_H
#include "jsb_internal_pch.h"
#include "jsb_string_names.h"

namespace jsb::internal
{
    template <typename T>
    struct Hasher
    {
        struct hasher
        {
            jsb_force_inline size_t operator()(const T& obj) const noexcept { return obj.hash(); }
        };
        struct equaler
        {
            jsb_force_inline bool operator()(const T& lhs, const T& rhs) const { return lhs == rhs; }
        };
    };

    template <typename K, typename V>
    struct TypeGen
    {
        typedef std::unordered_map<K, V, typename Hasher<K>::hasher, typename Hasher<K>::equaler> UnorderedMap;
        typedef typename UnorderedMap::iterator UnorderedMapIt;
        typedef typename UnorderedMap::const_iterator UnorderedMapConstIt;
    };

    struct VariantReferentialComparator
    {
        static bool compare(const Variant& p_a, const Variant& p_b)
        {
            return p_a.identity_compare(p_b);
        }
    };

    /**
     * A hasher for Variants that generates a hash based on the identity (pointers)
     * of Objects and copy-on-write types, not their contents i.e. referential
     * equality not structural. This takes advantage of the fact that our JS
     * runtime passes variants around in way that is essentially by reference.
     */
    struct VariantReferentialHasher
    {
        static uint32_t hash(const Variant& p_variant)
        {
            switch (p_variant.get_type())
            {
            case Variant::Type::OBJECT:
            {
                Object* object = p_variant;
                return HashMapHasherDefault::hash(object);
            }
            case Variant::Type::DICTIONARY:
            {
                const Dictionary& d = p_variant;
                return HashMapHasherDefault::hash(d.id());
            }
            case Variant::Type::ARRAY:
            {
                const Array& a = p_variant;
                return HashMapHasherDefault::hash(a.id());
            }
            case Variant::Type::STRING:
            {
                const String& s = p_variant;
                return HashMapHasherDefault::hash(s.ptr());
            }
            case Variant::Type::PACKED_BYTE_ARRAY:
            {
                const PackedByteArray& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_INT32_ARRAY:
            {
                const PackedInt32Array& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_INT64_ARRAY:
            {
                const PackedInt64Array& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_FLOAT32_ARRAY:
            {
                const PackedFloat32Array& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_FLOAT64_ARRAY:
            {
                const PackedFloat64Array& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_STRING_ARRAY:
            {
                const PackedStringArray& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_VECTOR2_ARRAY:
            {
                const PackedVector2Array& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_VECTOR3_ARRAY:
            {
                const PackedVector3Array& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_COLOR_ARRAY:
            {
                const PackedColorArray& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            case Variant::Type::PACKED_VECTOR4_ARRAY:
            {
                const PackedVector4Array& arr = p_variant;
                return HashMapHasherDefault::hash(arr.ptr());
            }
            default:
            {
                // Primitives use the standard value-based hash.
                return p_variant.hash();
            }
            }
        }
    };

    template <typename TValue>
    using ReferentialVariantMap = HashMap<Variant, TValue, VariantReferentialHasher, VariantReferentialComparator>;

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
                Variant::INT,     // PACKED_BYTE_ARRAY
                Variant::INT,     // PACKED_INT32_ARRAY
                Variant::INT,     // PACKED_INT64_ARRAY
                Variant::FLOAT,   // PACKED_FLOAT32_ARRAY
                Variant::FLOAT,   // PACKED_FLOAT64_ARRAY
                Variant::STRING,  // PACKED_STRING_ARRAY
                Variant::VECTOR2, // PACKED_VECTOR2_ARRAY
                Variant::VECTOR3, // PACKED_VECTOR3_ARRAY
                Variant::COLOR,   // PACKED_COLOR_ARRAY
#if GODOT_4_3_OR_NEWER
                Variant::VECTOR4, // PACKED_VECTOR4_ARRAY
#endif
            };
            static_assert(Variant::VARIANT_MAX - Variant::PACKED_BYTE_ARRAY == std::size(mappings));
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
            r_value = jsb_ext_type_convert(dummy, p_type);
#endif
        }

        /**
         * if a StringName represents a non-null string
         */
        jsb_force_inline static bool is_valid_name(const StringName& p_name)
        {
            return p_name.data_unique_pointer() != nullptr;
        }

        static Variant structured_clone(const Variant& p_variant, ReferentialVariantMap<Variant>& p_clone_map, bool& r_valid, int p_recursion_count = 0);
    };
} // namespace jsb::internal
#endif
