#ifndef GODOTJS_RESOURCE_CACHE_H
#define GODOTJS_RESOURCE_CACHE_H

#if 0
#include "jsb_internal_pch.h"

namespace jsb::internal
{
    class ResourceCache
    {
        // a map of PackedScene, behaves like a weak ref
        HashMap<String, ObjectID> packed_scenes;

        Mutex mutex;

    public:
        Ref<PackedScene> get_packed_scene(const String &p_path, Error &r_error);
    };
}
#endif

#endif
