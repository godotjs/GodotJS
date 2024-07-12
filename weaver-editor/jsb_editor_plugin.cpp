#include "jsb_editor_plugin.h"

#include "jsb_project_preset.h"
#include "jsb_repl.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"
#include "../weaver/jsb_gdjs_lang.h"

#include "core/config/project_settings.h"
#include "editor/editor_node.h"
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
    switch (p_what)
    {
    case NOTIFICATION_APPLICATION_FOCUS_IN:
        _scan_external_changes();
        break;
    default: break;
    }
}

void GodotJSEditorPlugin::_scan_external_changes()
{
    //TODO manually scan changes if not using internal ScriptEditor
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

    const String tsc_out_path = jsb::internal::Settings::get_jsb_out_res_path();

    // config files
    install_files_.push_back({ "tsconfig.json", "res://", jsb::CH_TYPESCRIPT | jsb::CH_CREATE_ONLY | jsb::CH_REPLACE_VARS });
    install_files_.push_back({ "package.json", "res://", jsb::CH_TYPESCRIPT | jsb::CH_CREATE_ONLY });
    install_files_.push_back({ ".gdignore", "res://node_modules", jsb::CH_TYPESCRIPT });
    install_files_.push_back({ ".gdignore", "res://typings", jsb::CH_TYPESCRIPT });

    // type declaration files
    install_files_.push_back({ "godot.minimal.d.ts", "res://typings", jsb::CH_TYPESCRIPT });

    // ts source files
    install_files_.push_back({ "jsb.core.ts", "res://jsb", jsb::CH_TYPESCRIPT });
    install_files_.push_back({ "jsb.editor.codegen.ts", "res://jsb", jsb::CH_TYPESCRIPT });
    install_files_.push_back({ "jsb.editor.main.ts", "res://jsb", jsb::CH_TYPESCRIPT });

    // files which could be generated from ts source with tsc by the user
    install_files_.push_back({ "jsb.core.js.map", tsc_out_path, jsb::CH_TYPESCRIPT | jsb::CH_OPTIONAL });
    install_files_.push_back({ "jsb.editor.codegen.js.map", tsc_out_path, jsb::CH_TYPESCRIPT | jsb::CH_OPTIONAL });
    install_files_.push_back({ "jsb.editor.main.js.map", tsc_out_path, jsb::CH_TYPESCRIPT | jsb::CH_OPTIONAL });

    // files which could be generated from ts source with tsc by the user
    install_files_.push_back({ "jsb.core.js", tsc_out_path, jsb::CH_JAVASCRIPT });
    install_files_.push_back({ "jsb.editor.codegen.js", tsc_out_path, jsb::CH_JAVASCRIPT });
    install_files_.push_back({ "jsb.editor.main.js", tsc_out_path, jsb::CH_JAVASCRIPT });
}

GodotJSEditorPlugin::~GodotJSEditorPlugin()
{
    if (tsc_)
    {
        tsc_->stop();
        tsc_.reset();
    }
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
    if ((p_file.hint & jsb::CH_REPLACE_VARS) != 0)
    {
        String parsed;
        parsed.parse_utf8(data, size);
        parsed = parsed.replacen("__OUT_DIR__", jsb::internal::Settings::get_jsb_out_dir_name());
        outfile->store_string(parsed);
        return OK;
    }
    outfile->store_buffer((const uint8_t*) data, size);
    return OK;
}

void GodotJSEditorPlugin::on_successfully_installed()
{
    const String toast_message = TTR("TS project installed, write your ts code in the project and compile with tsc command under the project root directory.");
    EditorToaster::get_singleton()->popup_str(toast_message, EditorToaster::SEVERITY_INFO);
}

void GodotJSEditorPlugin::try_install_ts_project()
{
    Vector<jsb::InstallFileInfo> modified;
    if (verify_files(install_files_, true, &modified))
    {
        on_successfully_installed();
        return;
    }

    jsb_check(!modified.is_empty());
    const String leading_symbol = "\n    - ";
    String modified_file_list;
    for (const jsb::InstallFileInfo& item : modified)
    {
        modified_file_list += leading_symbol + item.target_dir.path_join(item.source_name);
    }
    confirm_dialog_->pending_installs_ = modified;
    confirm_dialog_->set_text(TTR("Found existing/missing files, re-installing TS project will overwrite:") + modified_file_list);
    confirm_dialog_->popup_centered();
}

bool GodotJSEditorPlugin::verify_file(const jsb::InstallFileInfo& p_file, bool p_verify_content)
{
    size_t size;
    const char* data = GodotJSPorjectPreset::get_source(p_file.source_name, size);
    if (size == 0 || data == nullptr) return false;
    const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
    Error err;
    if (!FileAccess::exists(target_name)) return false;
    if ((p_file.hint & jsb::CH_CREATE_ONLY) != 0) return true;
    if (p_verify_content)
    {
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
    return true;
}

bool GodotJSEditorPlugin::verify_ts_project() const
{
    return verify_files(install_files_, false, nullptr);
}

bool GodotJSEditorPlugin::verify_files(const Vector<jsb::InstallFileInfo>& p_files, bool p_verify_content, Vector<jsb::InstallFileInfo>* r_modified)
{
    bool verified = true;
    for (const jsb::InstallFileInfo& info: p_files)
    {
        if (!verify_file(info, p_verify_content))
        {
            verified = false;
            if (r_modified)
            {
                r_modified->append(info);
            }
        }
    }
    return verified;
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
    ERR_FAIL_COND_MSG(!FileAccess::exists(jsb::internal::Settings::get_jsb_out_res_path().path_join("jsb/jsb.editor.codegen.js")), "install and compile ts source at first");

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    Error err;
    lang->eval_source(R"--((function(){const mod = require("jsb/jsb.editor.codegen"); (new mod.default("./typings")).emit();})())--", err).ignore();
    ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.codegen");

    const String toast_message = TTR("godot.d.ts generated successfully");
    EditorToaster::get_singleton()->popup_str(toast_message, EditorToaster::SEVERITY_INFO);
}

void GodotJSEditorPlugin::load_editor_entry_module()
{
    ERR_FAIL_COND_MSG(!FileAccess::exists(jsb::internal::Settings::get_jsb_out_res_path().path_join("jsb/jsb.editor.main.js")), "install and compile ts source at first");

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    const Error err = lang->get_context()->load("jsb/jsb.editor.main");
    ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.main");
}

void GodotJSEditorPlugin::_on_confirm_overwrite()
{
    if (confirm_dialog_->pending_installs_.is_empty())
    {
        JSB_LOG(Warning, "empty pending file list to install");
        return;
    }
    install_ts_project(confirm_dialog_->pending_installs_);
}

bool GodotJSEditorPlugin::is_tsc_watching()
{
    return tsc_ && tsc_->is_running();
}

void GodotJSEditorPlugin::start_tsc_watch()
{
    if (tsc_ && tsc_->is_running())
    {
        JSB_LOG(Error, "tsc is already running, please stop it before starting a new one.");
        return;
    }
    if (!FileAccess::exists("res://node_modules/typescript/bin/tsc"))
    {
        JSB_LOG(Error, "typescript not installed propertly, please run 'npm i' to install all essential npm packages at first.");
        return;
    }

    List<String> args;
    args.push_back("./node_modules/typescript/bin/tsc");
    args.push_back("-w");

#ifdef WINDOWS_ENABLED
    const String exe_path = "node.exe";
#else
    //TODO not tested
    const String exe_path = "node";
#endif
    //TODO no console output in this way, implement pipes here
    tsc_ = jsb::internal::Process::create("tsc", exe_path, args);
    if (!tsc_ || !tsc_->is_running())
    {
        kill_tsc();
        JSB_LOG(Error, "failed to start tsc process");
        return;
    }
    JSB_LOG(Verbose, "tsc watching...");
}

void GodotJSEditorPlugin::kill_tsc()
{
    if (tsc_)
    {
        tsc_->stop();
        tsc_.reset();
    }

}

GodotJSEditorPlugin* GodotJSEditorPlugin::get_singleton()
{
    if (EditorNode* editor_node = EditorNode::get_singleton())
    {
        return reinterpret_cast<GodotJSEditorPlugin*>(editor_node->get_node(NodePath(jsb_typename(GodotJSEditorPlugin))));
    }
    return nullptr;
}
