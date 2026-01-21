#ifndef GODOTJS_STATISTICS_H
#define GODOTJS_STATISTICS_H

#include "jsb_bridge_pch.h"
#include "../impl/shared/jsb_custom_field.h"

namespace jsb
{
    struct Statistics
    {
        // num of traced objects
        int objects;

        // num of registered native classes
        int native_classes;

        // num of registered script classes
        int script_classes;

        int cached_string_names;
        uint32_t persistent_objects;

        // allocated num of Variants in pool (only valid in debug mode)
        uint32_t allocated_variants;

        // impl-specific fields
        Vector<impl::CustomField> custom_fields;

        impl::CustomField get_custom_field(const String& name) const
        {
            for (const impl::CustomField& it : custom_fields)
            {
                if (it.name == name)
                {
                    return it;
                }
            }
            return {};
        }
    };
} // namespace jsb
#endif
