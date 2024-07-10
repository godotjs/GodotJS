#include "jsb_resource_cache.h"

namespace jsb::internal
{
    Ref<PackedScene> ResourceCache::get_packed_scene(const String& p_path, Error& r_error)
    {
        MutexLock lock(mutex);

        const String path = p_path.begins_with("uid://")
            ? ResourceUID::get_singleton()->get_id_path(ResourceUID::get_singleton()->text_to_id(p_path))
            : p_path;

        if (ObjectID* object_id = packed_scenes.getptr(path))
        {
            if (Object* obj = ObjectDB::get_instance(*object_id))
            {
                PackedScene* scene = Object::cast_to<PackedScene>(obj);
                jsb_check(scene);
                return { scene };
            }
            JSB_LOG(Verbose, "cache expired (%s)", p_path);
        }

        // see GDScriptCache::get_packed_scene
        if (Ref<PackedScene> scene = ::ResourceCache::get_ref(path); scene.is_valid())
        {
            packed_scenes[path] = scene->get_instance_id();
            return scene;
        }

        // fresh load
        {
            Ref<PackedScene> scene;
            scene.instantiate();
            if (path.is_empty())
            {
                r_error = ERR_FILE_BAD_PATH;
                return scene;
            }
            scene->set_path(path);
            packed_scenes[path] = scene->get_instance_id();
            scene->reload_from_file();
            r_error = OK;
            return scene;
        }
    }

}
