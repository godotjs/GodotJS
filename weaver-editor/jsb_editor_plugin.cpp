#include "jsb_editor_plugin.h"
#include "jsb_docked_panel.h"

#include "editor/editor_file_system.h"
#include "editor/editor_node.h"
#include "scene/gui/popup_menu.h"
#include "editor/gui/editor_toaster.h"

#define JSB_TYPE_ROOT "typings"

enum
{
    MENU_ID_INSTALL_TS_PROJECT,
    MENU_ID_GENERATE_GODOT_DTS,
    MENU_ID_CLEANUP_INVALID_FILES,
};

void GodotJSEditorPlugin::_bind_methods()
{

}

bool GodotJSEditorPlugin::is_preset_source_valid(const String& p_filename)
{
    size_t size;
    return get_preset_source(p_filename, size) && size > 0;
}

const char* GodotJSEditorPlugin::get_preset_source(const String& p_filename, size_t& r_len)
{
    if (const char* res = GodotJSProjectPreset::get_source_rt(p_filename, r_len)) return res;
#ifdef TOOLS_ENABLED
    return GodotJSProjectPreset::get_source_ed(p_filename, r_len);
#else
    return nullptr;
#endif
}

void GodotJSEditorPlugin::_notification(int p_what)
{
    switch (p_what)
    {
    case NOTIFICATION_APPLICATION_FOCUS_IN:
        if (GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton())
        {
            lang->scan_external_changes();
        }
        break;
    default: break;
    }
}

void GodotJSEditorPlugin::_on_menu_pressed(int p_what)
{
    switch (p_what)
    {
    case MENU_ID_INSTALL_TS_PROJECT: try_install_ts_project(); break;
    case MENU_ID_GENERATE_GODOT_DTS: generate_godot_dts(); break;
    case MENU_ID_CLEANUP_INVALID_FILES: cleanup_invalid_files(); break;
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
    menu->add_separator();
    menu->add_item(TTR("Cleanup invalid files"), MENU_ID_CLEANUP_INVALID_FILES);
    menu->connect("id_pressed", callable_mp(this, &GodotJSEditorPlugin::_on_menu_pressed));

    confirm_dialog_ = memnew(InstallGodotJSPresetConfirmationDialog);
    confirm_dialog_->set_autowrap(true);
    add_child(confirm_dialog_);
    confirm_dialog_->connect("confirmed", callable_mp(this, &GodotJSEditorPlugin::_on_confirm_overwrite));

    add_control_to_bottom_panel(memnew(GodotJSDockedPanel), TTR("GodotJS"));

    // config files
    add_install_file({ "tsconfig.json", "res://", jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_REPLACE_VARS });
    add_install_file({ "package.json", "res://", jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_CREATE_ONLY });
    add_install_file({ ".gdignore", "res://node_modules", jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_GDIGNORE | jsb::weaver::CH_NODE_MODULES });
    add_install_file({ ".gdignore", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_GDIGNORE | jsb::weaver::CH_D_TS });

    // type declaration files
    add_install_file({ "godot.minimal.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });
    add_install_file({ "godot.mix.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });
    add_install_file({ "jsb.editor.bundle.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });
    add_install_file({ "jsb.runtime.bundle.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });

    // write `.gdignore` in the `node_modules` folder anyway to avoid scanning in the situation that `node_modules` is generated externally before starting the Godot engine.
    if (DirAccess::exists("res://node_modules") && !FileAccess::exists("res://node_modules/.gdignore"))
    {
        _ignore_node_modules();
    }
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

void GodotJSEditorPlugin::add_install_file(jsb::weaver::InstallFileInfo&& p_install_file)
{
    jsb_check(is_preset_source_valid(p_install_file.source_name));
    install_files_.push_back(std::move(p_install_file));
}

bool GodotJSEditorPlugin::delete_file(const String &p_file)
{
    Ref<FileAccess> fa = FileAccess::open(p_file, FileAccess::READ);
    if (fa.is_null()) return false;
    const String& path = fa->get_path_absolute();
    fa.unref();

    JSB_LOG(Verbose, "delete file %s", path);
    return jsb::internal::PathUtil::delete_file(path);
}

Error GodotJSEditorPlugin::write_file(const jsb::weaver::InstallFileInfo &p_file)
{
    Error err;
    size_t size;
    const char* data = get_preset_source(p_file.source_name, size);
    ERR_FAIL_COND_V_MSG(size == 0 || data == nullptr, ERR_FILE_NOT_FOUND, "bad data");
    err = DirAccess::make_dir_recursive_absolute(p_file.target_dir);
    ERR_FAIL_COND_V_MSG(err != OK, err, "failed to make dir");
    const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
    const Ref<FileAccess> outfile = FileAccess::open(target_name, FileAccess::WRITE, &err);
    ERR_FAIL_COND_V_MSG(err != OK, err, "failed to open output file");
    if ((p_file.hint & jsb::weaver::CH_REPLACE_VARS) != 0)
    {
        String parsed;
        parsed.parse_utf8(data, (int) size);
        parsed = parsed.replacen("__OUT_DIR__", jsb::internal::Settings::get_jsb_out_dir_name());
        parsed = parsed.replacen("__BUILD_INFO_FILE__", jsb::internal::Settings::get_tsbuildinfo_path());
        parsed = parsed.replacen("__SRC_DIR__", "../../../");  // locate typescripts at the project root path for better dev experience
        parsed = parsed.replacen("__NEW_LINE__", "crlf");
        parsed = parsed.replacen("__MODULE__", "CommonJS"); // CommonJS is the only option currently supported
        parsed = parsed.replacen("__TYPE_ROOTS__", String(",").join({ R"("./node_modules/@types")", "\"./" JSB_TYPE_ROOT "\"" }));
        outfile->store_string(parsed);
    }
    else
    {
        outfile->store_buffer((const uint8_t*) data, size);
    }
    EditorFileSystem::get_singleton()->update_file(target_name);
    return OK;
}

void GodotJSEditorPlugin::on_successfully_installed()
{
    const String toast_message = TTR("TS project installed, write your ts code in the project and compile with tsc command under the project root directory.");
    EditorToaster::get_singleton()->popup_str(toast_message, EditorToaster::SEVERITY_INFO);
}

void GodotJSEditorPlugin::remove_obsolete_files()
{
    delete_file("res://jsb/jsb.core.ts");
    delete_file("res://jsb/jsb.editor.main.ts");
    delete_file("res://jsb/jsb.editor.codegen.ts");
}

void GodotJSEditorPlugin::try_install_ts_project()
{
    remove_obsolete_files();
    Vector<jsb::weaver::InstallFileInfo> modified;
    if (verify_files(install_files_, true, &modified))
    {
        on_successfully_installed();
        return;
    }

    jsb_check(!modified.is_empty());
    const String leading_symbol = "\n    - ";
    String modified_file_list;
    for (const jsb::weaver::InstallFileInfo& item : modified)
    {
        modified_file_list += leading_symbol + item.target_dir.path_join(item.source_name);
    }
    confirm_dialog_->pending_installs_ = modified;
    confirm_dialog_->set_text(TTR("Found existing/missing files, re-installing TS project will overwrite:") + modified_file_list);
    confirm_dialog_->popup_centered();
}

bool GodotJSEditorPlugin::verify_file(const jsb::weaver::InstallFileInfo& p_file, bool p_verify_content)
{
    //TODO skip all d.ts files during the INSTALL phase (do it in the GENERATE phase)
    // if ((p_file.hint & jsb::weaver::CH_D_TS) != 0) return true;

    size_t size;
    const char* data = get_preset_source(p_file.source_name, size);
    if (size == 0 || data == nullptr) return false;
    const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
    Error err;
    if (!FileAccess::exists(target_name)) return false;
    if ((p_file.hint & jsb::weaver::CH_CREATE_ONLY) != 0) return true;
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

bool GodotJSEditorPlugin::verify_files(const Vector<jsb::weaver::InstallFileInfo>& p_files, bool p_verify_content, Vector<jsb::weaver::InstallFileInfo>* r_modified)
{
    bool verified = true;
    for (const jsb::weaver::InstallFileInfo& info: p_files)
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

Vector<jsb::weaver::InstallFileInfo> GodotJSEditorPlugin::filter_files(const Vector<jsb::weaver::InstallFileInfo>& p_files, int p_hint)
{
    Vector<jsb::weaver::InstallFileInfo> results;
    for (const jsb::weaver::InstallFileInfo& info: p_files)
    {
        if ((info.hint & p_hint) != 0 && !verify_file(info, true))
        {
            results.append(info);
        }
    }
    return results;
}

bool GodotJSEditorPlugin::install_files(const Vector<jsb::weaver::InstallFileInfo>& p_files)
{
    for (const jsb::weaver::InstallFileInfo& info: p_files)
    {
        if (const Error err = write_file(info); err != OK)
        {
            JSB_LOG(Warning, "failed to write file '%s' to '%s': %s", info.source_name, info.target_dir, VariantUtilityFunctions::error_string(err));
            if ((info.hint & jsb::weaver::CH_OPTIONAL) == 0)
            {
                return false;
            }
        }
        JSB_LOG(Verbose, "install file '%s' to '%s'", info.source_name, info.target_dir);
    }
    return true;
}

void GodotJSEditorPlugin::install_ts_project(const Vector<jsb::weaver::InstallFileInfo>& p_files)
{
    if (!install_files(p_files)) return;
    generate_godot_dts();
    load_editor_entry_module();
    ensure_tsc_installed();
    on_successfully_installed();
}

void GodotJSEditorPlugin::_ignore_node_modules()
{
    install_files(filter_files(install_files_, jsb::weaver::CH_NODE_MODULES));
}

void GodotJSEditorPlugin::ignore_node_modules()
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        editor_plugin->_ignore_node_modules();
    }
}

void GodotJSEditorPlugin::collect_invalid_files(Vector<String>& r_invalid_files)
{
    collect_invalid_files(jsb::internal::Settings::get_jsb_out_res_path(), r_invalid_files);
}

void GodotJSEditorPlugin::collect_invalid_files(const String& p_path, Vector<String>& r_invalid_files)
{
    const Ref<DirAccess> dir = DirAccess::open(p_path);
    if (dir.is_null()) return;

    dir->list_dir_begin();
    String it = dir->_get_next();
    while (it != "")
    {
        const String it_path = p_path.path_join(it);
        if (dir->current_is_dir())
        {
            collect_invalid_files(it_path, r_invalid_files);
        }
        else
        {
            if (!it_path.ends_with("." JSB_JAVASCRIPT_EXT) || !FileAccess::exists(jsb::internal::PathUtil::convert_javascript_path(it_path)))
            {
                // invalid if it's not a source map file, or no corresponding .js file exist
                if (!it_path.ends_with("." JSB_JAVASCRIPT_EXT ".map") || !FileAccess::exists(it_path.substr(0, it_path.length() - 4)))
                {
                    r_invalid_files.append(it_path);
                }
            }
        }
        it = dir->_get_next();
    }
}

void GodotJSEditorPlugin::cleanup_invalid_files()
{
    int deleted_num = 0;
    Vector<String> invalid_files;
    collect_invalid_files(invalid_files);
    for (const String& invalid_file: invalid_files)
    {
        deleted_num += delete_file(invalid_file);
        deleted_num += delete_file(invalid_file + ".map");
    }
    JSB_LOG(Log, "%d files are deleted", deleted_num);
}

void GodotJSEditorPlugin::generate_godot_dts()
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        install_files(filter_files(editor_plugin->install_files_, jsb::weaver::CH_GDIGNORE | jsb::weaver::CH_D_TS));
    }

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    Error err;
    const String code = jsb_format(R"--((function(){const mod = require("jsb.editor.codegen"); (new mod.default("%s")).emit();})())--", "./" JSB_TYPE_ROOT);
    lang->eval_source(code, err).ignore();
    ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.codegen");

    const String toast_message = TTR("godot.d.ts generated successfully");
    EditorToaster::get_singleton()->popup_str(toast_message, EditorToaster::SEVERITY_INFO);
}

void GodotJSEditorPlugin::load_editor_entry_module()
{
    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    const Error err = lang->get_environment()->load("jsb.editor.main");
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

void GodotJSEditorPlugin::ensure_tsc_installed()
{
    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);

    Error err;
    lang->eval_source(R"--(require("jsb.editor.main").run_npm_install())--", err);
}
