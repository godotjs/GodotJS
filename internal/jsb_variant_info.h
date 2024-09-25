#ifndef GODOTJS_VARIANT_INFO_H
#define GODOTJS_VARIANT_INFO_H
#include "jsb_macros.h"
#include "jsb_variant_util.h"

namespace jsb::internal
{
    struct FMethodInfoBase
    {
        bool is_vararg;
        Variant::Type return_type;
        Vector<Variant::Type> argument_types;

#if JSB_DEBUG
        // only for debug
        StringName name_;
        jsb_force_inline void set_debug_name(const StringName& p_name) { name_ = p_name; }
#else
        jsb_force_inline void set_debug_name(const StringName& p_name) {}
#endif
    };

    struct FBuiltinMethodInfo : FMethodInfoBase
    {
        Variant::ValidatedBuiltInMethod builtin_func;
        Vector<Variant> default_arguments;

        jsb_force_inline bool check_argc(int p_argc) const
        {
            return VariantUtil::check_argc(is_vararg, p_argc, default_arguments.size(), argument_types.size());
        }

    };

    struct FUtilityMethodInfo : FMethodInfoBase
    {
        Variant::ValidatedUtilityFunction utility_func;

        jsb_force_inline bool check_argc(int p_argc) const
        {
            return is_vararg ? p_argc >= argument_types.size() : p_argc == argument_types.size();
        }
    };

    struct FGetSetInfo
    {
        Variant::ValidatedSetter setter_func;
        Variant::ValidatedGetter getter_func;
        Variant::Type type;
    };

    struct FConstructorVariantInfo
    {
        Variant::ValidatedConstructor ctor_func;
        Vector<Variant::Type> argument_types;
    };

    struct FConstructorInfo
    {
        Vector<FConstructorVariantInfo> variants;
    };

    struct FPropertyInfo2
    {
        MethodBind* getter_func;
        MethodBind* setter_func;

        // extra parameter at the first position for getter/setter (getter2/setter2)
        int index;
    };

    // necessary reflection info for JS func callback (transferred as index with info.Data)
    struct VariantInfoCollection
    {
        Vector<FConstructorInfo> constructors;
        Vector<FUtilityMethodInfo> utility_funcs;
        Vector<FBuiltinMethodInfo> methods;
        Vector<FGetSetInfo> getsets;

        // for godot properties which have an implicit parameter for getter/setter calls
        Vector<FPropertyInfo2> properties2;

    };
}
#endif

