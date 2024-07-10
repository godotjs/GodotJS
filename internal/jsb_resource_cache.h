#ifndef GODOTJS_RESOURCE_CACHE_H
#define GODOTJS_RESOURCE_CACHE_H

#include "jsb_macros.h"
#include "scene/resources/packed_scene.h"

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
