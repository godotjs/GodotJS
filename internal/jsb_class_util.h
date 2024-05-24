#ifndef GODOTJS_CLASS_UTIL_H
#define GODOTJS_CLASS_UTIL_H
#include "jsb_macros.h"
#include "jsb_variant_util.h"

namespace jsb::internal
{
    struct ClassUtil
    {
        jsb_force_inline static bool check_class(const StringName& p_class_name, const StringName& p_expected_class_name)
        {
            if (internal::VariantUtil::is_valid(p_class_name))
            {
                if (p_class_name == p_expected_class_name) return true;
                return check_class(ClassDB::get_parent_class(p_class_name), p_expected_class_name);
            }
            return false;
        }

    };
}
#endif
