#include "jsb_variant_util.h"
#include "core/variant/array.h"
#include "core/variant/container_type_validate.h"
#include "core/variant/dictionary.h"

namespace jsb::internal
{
    Variant VariantUtil::structured_clone(const Variant& p_variant, ReferentialVariantMap<Variant>& p_clone_map, bool& r_valid, int p_recursion_count)
    {
        if (p_recursion_count == 0)
        {
            r_valid = true;
        }

        Variant* existing_clone = p_clone_map.getptr(p_variant);

        if (existing_clone)
        {
            return *existing_clone;
        }

        Variant clone;

        switch (p_variant.get_type())
        {
            case Variant::Type::OBJECT:
                ERR_PRINT("Structured clone cannot clone Godot Objects. Godot Objects must be transferred");
                r_valid = false;
                clone = Variant();
                break;
            case Variant::Type::DICTIONARY:
            {
                Dictionary original = p_variant;
                Dictionary dict_clone;
                dict_clone.set_typed(original.get_key_type(), original.get_value_type());

                if (p_recursion_count > MAX_RECURSION)
                {
                    ERR_PRINT("Max recursion reached");
                    r_valid = false;
                    return dict_clone;
                }

                p_recursion_count++;

#if GODOT_4_5_OR_NEWER
                for (const KeyValue<Variant, Variant>& entry : original)
                {
                    dict_clone[structured_clone(entry.key, p_clone_map, r_valid, p_recursion_count)] =
                            structured_clone(entry.value, p_clone_map, r_valid, p_recursion_count);
                }
#else
                List<Variant> keys;
                original.get_key_list(&keys);

                List<Variant>::Element *E = keys.front();
                for (; E; E = E->next())
                {
                    Variant key = E->get();
                    dict_clone[structured_clone(key, p_clone_map, r_valid, p_recursion_count)] =
                        structured_clone(original[key], p_clone_map, r_valid, p_recursion_count);
                }
#endif

                clone = dict_clone;
                break;
            }
            case Variant::Type::ARRAY:
            {
                Array original = p_variant;
                Array arr_clone;
                arr_clone.set_typed(original.get_element_type());

                if (p_recursion_count > MAX_RECURSION)
                {
                    ERR_PRINT("Max recursion reached");
                    r_valid = false;
                    return arr_clone;
                }

                p_recursion_count++;

                int element_count = original.size();
                arr_clone.resize(element_count);

                for (int i = 0; i < element_count; i++)
                {
                    arr_clone.set(i, structured_clone(original.get(i), p_clone_map, r_valid, p_recursion_count));
                }

                clone = arr_clone;
                break;
            }
            case Variant::Type::PACKED_BYTE_ARRAY:
                clone = p_variant.operator Vector<uint8_t>().duplicate();
                break;
            case Variant::Type::PACKED_INT32_ARRAY:
                clone = p_variant.operator Vector<int32_t>().duplicate();
                break;
            case Variant::Type::PACKED_INT64_ARRAY:
                clone = p_variant.operator Vector<int64_t>().duplicate();
                break;
            case Variant::Type::PACKED_FLOAT32_ARRAY:
                clone = p_variant.operator Vector<float>().duplicate();
                break;
            case Variant::Type::PACKED_FLOAT64_ARRAY:
                clone = p_variant.operator Vector<double>().duplicate();
                break;
            case Variant::Type::PACKED_STRING_ARRAY:
                clone = p_variant.operator Vector<String>().duplicate();
                break;
            case Variant::Type::PACKED_VECTOR2_ARRAY:
                clone = p_variant.operator Vector<Vector2>().duplicate();
                break;
            case Variant::Type::PACKED_VECTOR3_ARRAY:
                clone = p_variant.operator Vector<Vector3>().duplicate();
                break;
            case Variant::Type::PACKED_COLOR_ARRAY:
                clone = p_variant.operator Vector<Color>().duplicate();
                break;
            case Variant::Type::PACKED_VECTOR4_ARRAY:
                clone = p_variant.operator Vector<Vector4>().duplicate();
                break;
            default:
                clone = p_variant;
        }

        p_clone_map[p_variant] = clone;
        return clone;
    }
}
