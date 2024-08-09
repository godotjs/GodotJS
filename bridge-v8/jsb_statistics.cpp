#include "jsb_statistics.h"

namespace jsb
{
    Variant Statistics::to_dictionary() const
    {
        Dictionary dict;

        dict["used_global_handles_size"] = used_global_handles_size;
        dict["total_global_handles_size"] = total_global_handles_size;
        dict["used_heap_size"] = used_heap_size;
        dict["total_heap_size"] = total_heap_size;

        // num of traced objects
        dict["objects"] = objects;

        // num of registered native classes
        dict["native_classes"] = native_classes;

        // num of registered script classes
        dict["script_classes"] = script_classes;

        dict["cached_string_names"] = cached_string_names;
        dict["persistent_objects"] = persistent_objects;
        dict["allocated_variants"] = allocated_variants;

        return dict;
    }

}
