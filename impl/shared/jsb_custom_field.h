#ifndef GODOTJS_CUSTOM_FIELD_H
#define GODOTJS_CUSTOM_FIELD_H

#include <cstdint>
#include "core/variant/variant.h"
#include "core/string/ustring.h"

namespace jsb::impl
{
    struct CustomField
    {
        enum Type : uint8_t
        {
            TYPE_UINT_VALUE = 2,
            TYPE_UINT_CAP = 3,

            TYPE_INT_VALUE = 4,
            TYPE_INT_CAP = 5,
        };

        enum HintFlags : uint8_t
        {
            HINT_NONE = 0,
            HINT_SIZE = 1,
        };

        String name;

        union
        {
            uint64_t u64;
            uint64_t u64_cap[2];
            int64_t i64;
            int64_t i64_cap[2];
        } u;

        Type type;
        HintFlags hint;

        static CustomField value_u64(const String& p_name, const uint64_t p_value, const HintFlags p_flags = HINT_NONE)
        {
            CustomField cf;
            cf.name = p_name;
            cf.type = TYPE_UINT_VALUE;
            cf.hint = p_flags;
            cf.u.u64 = p_value;
            return cf;
        }

        static CustomField cap_u64(const String& p_name, const uint64_t p_used, const uint64_t p_max, const HintFlags p_flags = HINT_NONE)
        {
            CustomField cf;
            cf.name = p_name;
            cf.type = TYPE_UINT_CAP;
            cf.hint = p_flags;
            cf.u.u64_cap[0] = p_used;
            cf.u.u64_cap[1] = p_max;
            return cf;
        }

        static CustomField value_i64(const String& p_name, const int64_t p_value, const HintFlags p_flags = HINT_NONE)
        {
            CustomField cf;
            cf.name = p_name;
            cf.type = TYPE_INT_VALUE;
            cf.hint = p_flags;
            cf.u.i64 = p_value;
            return cf;
        }

        static CustomField cap_i64(const String& p_name, const int64_t p_used, const int64_t p_max, const HintFlags p_flags = HINT_NONE)
        {
            CustomField cf;
            cf.name = p_name;
            cf.type = TYPE_INT_CAP;
            cf.hint = p_flags;
            cf.u.i64_cap[0] = p_used;
            cf.u.i64_cap[1] = p_max;
            return cf;
        }
    };
} // namespace jsb::impl
#endif
