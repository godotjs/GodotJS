#include "jsb_editor_helper.h"

#include "editor/gui/editor_toaster.h"
#include "scene/resources/packed_scene.h"

Dictionary GodotJSEditorHelper::_build_node_path_map(Node *node)
{
    Dictionary map;
    Dictionary children;
    map["class"] = node->get_class_name();
    map["children"] = children;

    int cc = node->get_child_count(true);

    for (int i = 0; i < cc; i++)
    {
        Node *child = node->get_child(i, true);
        children[child->get_name()] = _build_node_path_map(child);
    }

    return map;
}

// Similar logic to EditorNode::_dialog_display_load_error.
void GodotJSEditorHelper::_log_scene_load_error(const String& p_file, Error p_error)
{
    if (p_error)
    {
        switch (p_error)
        {
            case ERR_CANT_OPEN:
            {
                JSB_LOG(Error, "Can't open file '%s'. The file could have been moved or deleted.", p_file.get_file());
                break;
            }
            case ERR_PARSE_ERROR:
            {
                JSB_LOG(Error, "Error while parsing file '%s'.", p_file.get_file());
                break;
            }
            case ERR_FILE_CORRUPT:
            {
                JSB_LOG(Error, "Scene file '%s' appears to be invalid/corrupt.", p_file.get_file());
                break;
            }
            case ERR_FILE_NOT_FOUND:
            {
                JSB_LOG(Error, "Missing file '%s' or one of its dependencies.", p_file.get_file());
                break;
            }
            case ERR_FILE_UNRECOGNIZED:
            {
                JSB_LOG(Error, "File '%s' is saved in a format that is newer than the formats supported by this version of Godot, so it can't be opened.", p_file.get_file());
                break;
            }
            default:
            {
                JSB_LOG(Error, "Error while loading file '%s'.", p_file.get_file());
                break;
            }
        }
    }
}

void GodotJSEditorHelper::_bind_methods()
{
    ClassDB::bind_static_method(jsb_typename(GodotJSEditorHelper), D_METHOD("show_toast", "text", "severity"), &GodotJSEditorHelper::show_toast);
    ClassDB::bind_static_method(jsb_typename(GodotJSEditorHelper), D_METHOD("get_scene_nodes", "scene_path"), &GodotJSEditorHelper::get_scene_nodes);
}

Dictionary GodotJSEditorHelper::get_scene_nodes(const String& p_path)
{
    Error err;
    Ref<PackedScene> scene_data = ResourceLoader::load(p_path, "", ResourceFormatLoader::CACHE_MODE_REPLACE, &err);

    if (scene_data.is_null())
    {
        _log_scene_load_error(p_path, err);
        return Dictionary();
    }

    Node* instantiated_scene = scene_data->instantiate(PackedScene::GEN_EDIT_STATE_INSTANCE);

    if (!instantiated_scene)
    {
        JSB_LOG(Error, "Error instantiating scene from %s", p_path);
        return Dictionary();
    }

    const Dictionary rval = _build_node_path_map(instantiated_scene);
    instantiated_scene->queue_free();
    return rval;
}

void GodotJSEditorHelper::show_toast(const String& p_text, int p_severity)
{
    EditorToaster::get_singleton()->popup_str(p_text, (EditorToaster::Severity) p_severity);
}
