#include "jsb_editor_plugin.h"

#include "jsb_project_preset.h"
#include "jsb_repl.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"
#include "../weaver/jsb_gdjs_lang.h"

#include "core/config/project_settings.h"
#include "scene/gui/popup_menu.h"
#include "editor/editor_settings.h"
#include "editor/gui/editor_toaster.h"

enum
{
    MENU_ID_INSTALL_TS_PROJECT,
    MENU_ID_GENERATE_GODOT_DTS,
};

void GodotJSEditorPlugin::_bind_methods()
{

}

void GodotJSEditorPlugin::_notification(int p_what)
{
    // switch (p_what)
    // {
    // case NOTIFICATION_APPLICATION_FOCUS_IN: break;
    // default: break;
    // }
}

void GodotJSEditorPlugin::_on_menu_pressed(int p_what)
{
    switch (p_what)
    {
    case MENU_ID_INSTALL_TS_PROJECT: try_install_ts_project(); break;
    case MENU_ID_GENERATE_GODOT_DTS: generate_godot_dts(); break;
    default: break;
    }
}

GodotJSEditorPlugin::GodotJSEditorPlugin()
{
    // jsb::internal::Settings::on_editor_init();
    PopupMenu *menu = memnew(PopupMenu);
    add_tool_submenu_item(TTR("GodotJS"), menu);
    menu->add_item(TTR("Install TS Project"), MENU_ID_INSTALL_TS_PROJECT);
    menu->add_item(TTR("Generate Godot d.ts"), MENU_ID_GENERATE_GODOT_DTS);
    menu->connect("id_pressed", callable_mp(this, &GodotJSEditorPlugin::_on_menu_pressed));

    confirm_dialog_ = memnew(InstallGodotJSPresetConfirmationDialog);
    confirm_dialog_->set_autowrap(true);
    add_child(confirm_dialog_);
    confirm_dialog_->connect("confirmed", callable_mp(this, &GodotJSEditorPlugin::_on_confirm_overwrite));

    add_control_to_bottom_panel(memnew(GodotJSREPL), TTR("GodotJS"));

    // config files
    install_files_.push_back({ "tsconfig.json", "res://typescripts", jsb::CH_TYPESCRIPT });
    install_files_.push_back({ "package.json", "res://typescripts", jsb::CH_TYPESCRIPT });
    install_files_.push_back({ ".gdignore", "res://typescripts", jsb::CH_TYPESCRIPT });

    // type declaration files
    install_files_.push_back({ "godot.minimal.d.ts", "res://typescripts/typings", jsb::CH_TYPESCRIPT });

    // ts source files
    install_files_.push_back({ "jsb.core.ts", "res://typescripts/src/jsb", jsb::CH_TYPESCRIPT });
    install_files_.push_back({ "jsb.editor.codegen.ts", "res://typescripts/src/jsb", jsb::CH_TYPESCRIPT });
    install_files_.push_back({ "jsb.editor.main.ts", "res://typescripts/src/jsb", jsb::CH_TYPESCRIPT });

    // files which could be generated from ts source with tsc by the user
    install_files_.push_back({ "jsb.core.js.map", "res://javascripts/jsb", jsb::CH_TYPESCRIPT | jsb::CH_OPTIONAL });
    install_files_.push_back({ "jsb.editor.codegen.js.map", "res://javascripts/jsb", jsb::CH_TYPESCRIPT | jsb::CH_OPTIONAL });
    install_files_.push_back({ "jsb.editor.main.js.map", "res://javascripts/jsb", jsb::CH_TYPESCRIPT | jsb::CH_OPTIONAL });

    // files which could be generated from ts source with tsc by the user
    install_files_.push_back({ "jsb.core.js", "res://javascripts/jsb", jsb::CH_JAVASCRIPT });
    install_files_.push_back({ "jsb.editor.codegen.js", "res://javascripts/jsb", jsb::CH_JAVASCRIPT });
    install_files_.push_back({ "jsb.editor.main.js", "res://javascripts/jsb", jsb::CH_JAVASCRIPT });

    install_files_.push_back({ "filetype-js.svg", "res://javascripts/icon", jsb::CH_MISC | jsb::CH_OPTIONAL });
}

GodotJSEditorPlugin::~GodotJSEditorPlugin()
{
    JSB_LOG(VeryVerbose, "~GodotJSEditorPlugin");
}

Error GodotJSEditorPlugin::write_file(const jsb::InstallFileInfo &p_file)
{
    Error err;
    size_t size;
    const char* data = GodotJSPorjectPreset::get_source(p_file.source_name, size);
    ERR_FAIL_COND_V_MSG(size == 0 || data == nullptr, ERR_FILE_NOT_FOUND, "bad data");
    err = DirAccess::make_dir_recursive_absolute(p_file.target_dir);
    ERR_FAIL_COND_V_MSG(err != OK, err, "failed to make dir");
    const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
    const Ref<FileAccess> outfile = FileAccess::open(target_name, FileAccess::WRITE, &err);
    ERR_FAIL_COND_V_MSG(err != OK, err, "failed to open output file");
    outfile->store_buffer((const uint8_t*) data, size);
    return OK;
}

void GodotJSEditorPlugin::on_successfully_installed()
{
    const String toast_message = TTR("TS project installed, place your ts code in res://typescripts and compile with tsc command under `typescripts` directory.");
    EditorToaster::get_singleton()->popup_str(toast_message, EditorToaster::SEVERITY_INFO);
}

void GodotJSEditorPlugin::try_install_ts_project()
{
    Vector<String> modified;
    if (verify_files(install_files_, modified))
    {
        on_successfully_installed();
        return;
    }

    jsb_check(!modified.is_empty());
    const String heading = "\n    * ";
    String modified_file_list;
    for (const String& item : modified)
    {
        modified_file_list += heading + item;
    }
    confirm_dialog_->source_names_ = modified;
    confirm_dialog_->set_text(TTR("Found existing/missing files, re-installing TS project will overwrite:") + modified_file_list);
    confirm_dialog_->popup_centered();
}

bool GodotJSEditorPlugin::verify_file(const jsb::InstallFileInfo& p_file)
{
    size_t size;
    const char* data = GodotJSPorjectPreset::get_source(p_file.source_name, size);
    if (size == 0 || data == nullptr) return false;
    const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
    Error err;
    if (!FileAccess::exists(target_name)) return false;
    const Ref<FileAccess> access = FileAccess::open(target_name, FileAccess::READ, &err);
    if (err != OK || access.is_null()) return false;
    const size_t file_len = access->get_length();
    if (file_len != size) return false;
    Vector<uint8_t> file_data;
    jsb_check(size == (size_t)(int) size);
    if (file_data.resize((int) size) != OK) return false;
    if (access->get_buffer(file_data.ptrw(), size) != size) return false;
    return memcmp(data, file_data.ptr(), size) == 0;
}

bool GodotJSEditorPlugin::verify_files(const Vector<jsb::InstallFileInfo>& p_files, Vector<String>& r_modified)
{
    for (const jsb::InstallFileInfo& info: p_files)
    {
        if (!verify_file(info))
        {
            r_modified.append(info.source_name);
        }
    }
    return r_modified.is_empty();
}

void GodotJSEditorPlugin::install_ts_project(const Vector<jsb::InstallFileInfo>& p_files)
{
    for (const jsb::InstallFileInfo& info: p_files)
    {
        const Error err = write_file(info);
        if (err != OK)
        {
            JSB_LOG(Warning, "failed to write file '%s' to '%s'", info.source_name, info.target_dir);
            if ((info.hint & jsb::CH_OPTIONAL) == 0)
            {
                return;
            }
        }
        JSB_LOG(Verbose, "install file '%s' to '%s'", info.source_name, info.target_dir);
    }

    generate_godot_dts();
    load_editor_entry_module();
    on_successfully_installed();
}

void GodotJSEditorPlugin::generate_godot_dts()
{
    ERR_FAIL_COND_MSG(!FileAccess::exists("res://javascripts/jsb/jsb.editor.codegen.js"), "install and compile ts source at first");

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    Error err;
    lang->eval_source(R"--((function(){const mod = require("jsb/jsb.editor.codegen"); (new mod.default("./typescripts/typings")).emit();})())--", err).ignore();
    ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.codegen");

    const String toast_message = TTR("godot.d.ts generated successfully");
    EditorToaster::get_singleton()->popup_str(toast_message, EditorToaster::SEVERITY_INFO);
}

void GodotJSEditorPlugin::load_editor_entry_module()
{
    ERR_FAIL_COND_MSG(!FileAccess::exists("res://javascripts/jsb/jsb.editor.main.js"), "install and compile ts source at first");

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    const Error err = lang->get_context()->load("jsb/jsb.editor.main");
    ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.main");
}

void GodotJSEditorPlugin::_on_confirm_overwrite()
{
    Vector<jsb::InstallFileInfo> pending_files;
    for (const jsb::InstallFileInfo& file_info : install_files_)
    {
        if (confirm_dialog_->source_names_.has(file_info.source_name))
        {
            pending_files.append(file_info);
        }
    }
    if (pending_files.is_empty())
    {
        JSB_LOG(Warning, "empty pending file list to install");
        return;
    }
    install_ts_project(pending_files);
}
