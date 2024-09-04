#ifndef GODOTJS_CLASS_UTIL_H
#define GODOTJS_CLASS_UTIL_H
#include "jsb_internal_pch.h"

namespace jsb::internal
{
    struct ClassUtil
    {
        // jsb_force_inline static bool check_class(const StringName& p_class_name, const StringName& p_expected_class_name)
        // {
        //     return ClassDB::is_parent_class(p_class_name, p_expected_class_name);
        // }

        // static const MethodInfo& get_method_info_recursively(const ClassDB::ClassInfo& p_class_info, const StringName& method_name)
        // {
        //     const HashMap<StringName, MethodInfo>::ConstIterator method_it = p_class_info.virtual_methods_map.find(method_name);
        //     if (method_it != p_class_info.virtual_methods_map.end()) return method_it->value;
        //     jsb_check(p_class_info.inherits_ptr);
        //     return get_method_info_recursively(*p_class_info.inherits_ptr, method_name);
        // }

    };
}
#endif
