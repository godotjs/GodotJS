#ifndef GODOTJS_VARIANT_INFO_H
#define GODOTJS_VARIANT_INFO_H
#include "jsb_macros.h"

namespace jsb::internal
{
    struct FMethodInfo
    {
        StringName name;
        Vector<Variant::Type> argument_types;
        Variant::Type return_type;
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

