#ifndef GODOTJS_STATISTICS_H
#define GODOTJS_STATISTICS_H
#include "jsb_bridge_pch.h"

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
        uint32_t allocated_variants;

        size_t used_global_handles_size;
        size_t total_global_handles_size;
        size_t used_heap_size;
        size_t total_heap_size;

        size_t peak_malloced_memory;
        size_t malloced_memory;
        size_t external_memory;
    };
}
#endif
