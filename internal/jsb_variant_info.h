#ifndef GODOTJS_VARIANT_INFO_H
#define GODOTJS_VARIANT_INFO_H
#include "jsb_macros.h"

namespace jsb::internal
{
    struct FMethodInfo
    {
        StringName name;
        Vector<Variant::Type> argument_types;
        Vector<Variant> default_arguments;
        Variant::Type return_type;

        bool is_vararg;

        jsb_force_inline bool check_argc(int argc) const
        {
            return check_argc(is_vararg, argc, default_arguments.size(), argument_types.size());
        }

        jsb_force_inline static bool check_argc(bool is_vararg, int argc, int default_num, int expected_num)
        {
            if (is_vararg)
            {
                return argc + default_num >= expected_num;
            }

            if (default_num == 0)
            {
                return argc == expected_num;
            }
            return argc <= expected_num && argc + default_num >= expected_num;
        }

        FMethodInfo& operator=(const MethodInfo& p_method_info)
        {
            name = p_method_info.name;
            argument_types.resize(p_method_info.arguments.size());
            for (int index = 0, num = p_method_info.arguments.size(); index < num; ++index)
            {
                argument_types.write[index] = p_method_info.arguments[index].type;
            }
            default_arguments.resize(p_method_info.default_arguments.size());
            for (int index = 0, num = p_method_info.default_arguments.size(); index < num; ++index)
            {
                default_arguments.write[index] = p_method_info.default_arguments[index];
            }
            return_type = p_method_info.return_val.type;
            is_vararg = (p_method_info.flags & METHOD_FLAG_VARARG) != 0;
            return *this;
        }
    };

    struct FGetSetInfo
    {
        Variant::ValidatedSetter setter_func;
        Variant::ValidatedGetter getter_func;
        Variant::Type type;
    };

    struct VariantInfoCollection
    {
        Vector<FMethodInfo> methods;
        Vector<FGetSetInfo> getsets;

        jsb_force_inline const FGetSetInfo& get_setter(int p_index)
        {
            jsb_check(p_index >= 0 && p_index < getsets.size());
            return getsets[p_index];
        }

        jsb_force_inline const FMethodInfo& get_method(int p_index)
        {
            jsb_check(p_index >= 0 && p_index < methods.size());
            return methods[p_index];
        }
    };
}
#endif

