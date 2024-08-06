#ifndef GODOTJS_VARIANT_INFO_H
#define GODOTJS_VARIANT_INFO_H
#include "jsb_macros.h"

namespace jsb::internal
{
    struct FMethodInfoBase
    {
        bool is_vararg;
        Variant::Type return_type;
        Vector<Variant::Type> argument_types;
    };

    //TODO avoid unnecessary runtime lookup, use the version with validated function pointer of variant
    struct FMethodInfo : FMethodInfoBase
    {
        StringName name;
        Vector<Variant> default_arguments;

        jsb_force_inline bool check_argc(int p_argc) const
        {
            return check_argc(is_vararg, p_argc, default_arguments.size(), argument_types.size());
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
    };

    struct FUtilityMethodInfo : FMethodInfoBase
    {
        Variant::ValidatedUtilityFunction utility_func;

        jsb_force_inline bool check_argc(int p_argc) const
        {
            return check_argc(is_vararg, p_argc, argument_types.size());
        }

        jsb_force_inline static bool check_argc(bool p_is_vararg, int p_argc, int p_expected_num)
        {
            return p_is_vararg ? p_argc >= p_expected_num : p_argc == p_expected_num;
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
        Vector<FUtilityMethodInfo> utility_funcs;
        Vector<FMethodInfo> methods;
        Vector<FGetSetInfo> getsets;
    };
}
#endif

