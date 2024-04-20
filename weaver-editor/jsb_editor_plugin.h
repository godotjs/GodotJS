#ifndef JAVASCRIPT_EDITOR_PLUGINS_H
#define JAVASCRIPT_EDITOR_PLUGINS_H

#include "jsb_editor_macros.h"
#include "editor/editor_plugin.h"

class GodotJSEditorPlugin : public EditorPlugin
{
    GDCLASS(GodotJSEditorPlugin, EditorPlugin)

private:

protected:
    static void _bind_methods();

    void _notification(int p_what);
    void _on_menu_pressed(int p_what);
    static Error write_file(const String& p_target_name, const String& p_source_name);

public:
    GodotJSEditorPlugin();
    virtual ~GodotJSEditorPlugin() override;

    static void generate_godot_dts();
    static void install_ts_project();
    static void load_editor_entry_module();
};

#endif
