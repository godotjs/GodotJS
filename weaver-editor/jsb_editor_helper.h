#ifndef GODOTJS_EDITOR_HELPER_H
#define GODOTJS_EDITOR_HELPER_H
#include "jsb_editor_pch.h"

class GodotJSEditorHelper : public Object
{
    GDCLASS(GodotJSEditorHelper, Object);

private:

    static Dictionary _build_node_path_map(Node *node);
    static void _log_scene_load_error(const String& p_file, Error p_error);

protected:
    static void _bind_methods();

public:
    virtual ~GodotJSEditorHelper() override = default;

    static Dictionary get_scene_nodes(const String &p_path);
    static void show_toast(const String& p_text, int p_severity);
};

#endif
