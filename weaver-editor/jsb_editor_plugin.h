#ifndef GODOTJS_EDITOR_PLUGINS_H
#define GODOTJS_EDITOR_PLUGINS_H

#include "jsb_editor_macros.h"
#include "editor/editor_plugin.h"

class GodotJSEditorPlugin : public EditorPlugin
{
    GDCLASS(GodotJSEditorPlugin, EditorPlugin)

private:
    enum ECategoryHint : uint8_t
    {
        CH_JAVASCRIPT = 1 << 0,
        CH_TYPESCRIPT = 1 << 1,
        CH_MISC = 1 << 2,

        CH_OPTIONAL = 1 << 7,
    };

    struct InstallFileInfo
    {
        String source_name;
        String target_dir;
        uint8_t hint;
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
