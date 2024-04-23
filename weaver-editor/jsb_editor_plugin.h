#ifndef GODOTJS_EDITOR_PLUGINS_H
#define GODOTJS_EDITOR_PLUGINS_H

#include "jsb_editor_macros.h"
#include "editor/editor_plugin.h"

class GodotJSEditorPlugin : public EditorPlugin
{
    GDCLASS(GodotJSEditorPlugin, EditorPlugin)

private:
    struct InstallFileInfo
    {
        String source_name;
        String target_dir;
        bool optional;
    };

    Vector<InstallFileInfo> install_files_;

    //TODO a custom confirmation dialog which could pick the files to overwrite
    class ConfirmationDialog* confirm_dialog_;

protected:
    static void _bind_methods();

    void _notification(int p_what);
    void _on_menu_pressed(int p_what);
    void _on_confirm_overwrite();
    static Error write_file(const String& p_target_dir, const String& p_source_name);

    void try_install_ts_project();

public:
    GodotJSEditorPlugin();
    virtual ~GodotJSEditorPlugin() override;

    static void generate_godot_dts();
    static void install_ts_project(const Vector<InstallFileInfo>& p_files);
    static void load_editor_entry_module();
};

#endif
