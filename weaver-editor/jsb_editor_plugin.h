#ifndef GODOTJS_EDITOR_PLUGINS_H
#define GODOTJS_EDITOR_PLUGINS_H

#include "jsb_editor_pch.h"

namespace jsb::weaver
{
    enum ECategoryHint : uint16_t
    {
        CH_JAVASCRIPT = 1 << 0,
        CH_TYPESCRIPT = 1 << 1,
        CH_MISC = 1 << 2,
        CH_GDIGNORE = 1 << 3,
        CH_NODE_MODULES = 1 << 4,

        // only write file if not existed since some files would be modified in projects, such as package.json, by users
        CH_CREATE_ONLY = 1 << 5,
        CH_REPLACE_VARS = 1 << 6,

        CH_D_TS = 1 << 7,
        CH_OPTIONAL = 1 << 8,
    };

    struct InstallFileInfo
    {
        String source_name;
        String target_dir;

        // ECategoryHint
        uint8_t hint;
    };

}

class InstallGodotJSPresetConfirmationDialog : public ConfirmationDialog
{
    GDCLASS(InstallGodotJSPresetConfirmationDialog, ConfirmationDialog);

public:
    Vector<jsb::weaver::InstallFileInfo> pending_installs_;
};

// essential editor utilities for GodotJS, such as menu entries in the editor (Install Presets, Generate d.ts)
class GodotJSEditorPlugin : public EditorPlugin
{
    GDCLASS(GodotJSEditorPlugin, EditorPlugin)

private:
    Vector<jsb::weaver::InstallFileInfo> install_files_;
    InstallGodotJSPresetConfirmationDialog* confirm_dialog_;

    std::shared_ptr<jsb::internal::Process> tsc_;

protected:
    static void _bind_methods();

    void _notification(int p_what);
    void _on_menu_pressed(int p_what);
    void _on_confirm_overwrite();

    static Error write_file(const jsb::weaver::InstallFileInfo& p_file);
    static bool install_files(const Vector<jsb::weaver::InstallFileInfo>& p_files);
    static Vector<jsb::weaver::InstallFileInfo> filter_files(const Vector<jsb::weaver::InstallFileInfo>& p_files, int p_hint);
    static bool delete_file(const String& p_file);

public:
    GodotJSEditorPlugin();
    virtual ~GodotJSEditorPlugin() override;

    void start_tsc_watch();
    bool is_tsc_watching();
    void kill_tsc();

    void remove_obsolete_files();
    void try_install_ts_project();
    bool verify_ts_project() const;
    void _ignore_node_modules();
    void cleanup_invalid_files();

    // not really a singleton, but always get from `EditorNode` which assumed unique
    static GodotJSEditorPlugin* get_singleton();

    static void generate_godot_dts();
    static void ignore_node_modules();
    static void collect_invalid_files(Vector<String>& r_invalid_files);
    static void collect_invalid_files(const String& p_path, Vector<String>& r_invalid_files);
    static void install_ts_project(const Vector<jsb::weaver::InstallFileInfo>& p_files);
    static const char* get_preset_source(const String& p_filename, size_t& r_len);

    static void ensure_tsc_installed();

    /**
     * return true if everything is identical to the expected version.
     * otherwise return false with changed files in `r_modified`.
     */
    static bool verify_files(const Vector<jsb::weaver::InstallFileInfo>& p_files, bool p_verify_content, Vector<jsb::weaver::InstallFileInfo>* r_modified);
    static bool verify_file(const jsb::weaver::InstallFileInfo& p_file, bool p_verify_content);

    static void on_successfully_installed();

    static void load_editor_entry_module();
};

#endif
