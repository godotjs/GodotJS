#include "jsb_editor_plugin.h"
#include "jsb_docked_panel.h"
#include "jsb_export_plugin.h"

#define JSB_TYPE_ROOT "typings"

enum
{
    MENU_ID_INSTALL_TS_PROJECT,
    MENU_ID_GENERATE_TYPES,
    MENU_ID_CLEANUP_INVALID_FILES,
};

namespace
{
    GodotJSEditorPlugin* singleton_ = nullptr;
}

void GodotJSEditorPlugin::_bind_methods()
{

}

jsb::internal::PresetSource GodotJSEditorPlugin::get_preset_source(const String& p_filename)
{
    jsb::internal::PresetSource preset = GodotJSProjectPreset::get_source_rt(p_filename);
    if (preset.is_valid()) return preset;
    return GodotJSProjectPreset::get_source_ed(p_filename);
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
    case NOTIFICATION_PREDELETE:
        {
            jsb_check(singleton_ == this);
            singleton_ = nullptr;
        }
        break;
    case NOTIFICATION_READY:
        singleton_ = this;
        // stupid self watching, but there is no other way which work both in module and gdextension
    	// EditorPlugin::notify_scene_saved() is not virtual, and not exposed to gdextension :(
        connect("scene_saved", callable_mp(this, &GodotJSEditorPlugin::_on_scene_saved));
        connect("resource_saved", callable_mp(this, &GodotJSEditorPlugin::_on_resource_saved));
        EditorFileSystem::get_singleton()->connect("resources_reimported", callable_mp(this, &GodotJSEditorPlugin::_generate_imported_resource_dts));
        break;
    default: break;
    }
}

void GodotJSEditorPlugin::_on_menu_pressed(int p_what)
{
    switch (p_what)
    {
    case MENU_ID_INSTALL_TS_PROJECT: try_install_ts_project(); break;
    case MENU_ID_GENERATE_TYPES: generate_godot_dts(); break;
    case MENU_ID_CLEANUP_INVALID_FILES: cleanup_invalid_files(); break;
    default: break;
    }
}

GodotJSEditorPlugin::GodotJSEditorPlugin()
{
    //NOTE EditorPlugin::add_export_plugin() is the only available API to add ExportPlugin in gdextension
    add_export_plugin(memnew(GodotJSExportPlugin));

    // jsb::internal::Settings::on_editor_init();
    PopupMenu *menu = memnew(PopupMenu);
    add_tool_submenu_item(TTR("GodotJS"), menu);
    menu->add_item(TTR("Install Preset Files"), MENU_ID_INSTALL_TS_PROJECT);
    menu->add_item(TTR("Generate Types"), MENU_ID_GENERATE_TYPES);
    menu->add_separator();
    menu->add_item(TTR("Cleanup Invalid Files"), MENU_ID_CLEANUP_INVALID_FILES);
    menu->connect("id_pressed", callable_mp(this, &GodotJSEditorPlugin::_on_menu_pressed));

    confirm_dialog_ = memnew(InstallGodotJSPresetConfirmationDialog);
    confirm_dialog_->set_autowrap(true);
    add_child(confirm_dialog_);
    confirm_dialog_->connect("confirmed", callable_mp(this, &GodotJSEditorPlugin::_on_confirm_overwrite));

    add_control_to_bottom_panel(memnew(GodotJSDockedPanel), TTR("GodotJS"));

    // config files
#if JSB_USE_TYPESCRIPT
    add_install_file({ "tsconfig.json", "res://", jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_REPLACE_VARS });
#else
    add_install_file({ "jsconfig.json", "res://", jsb::weaver::CH_JAVASCRIPT | jsb::weaver::CH_REPLACE_VARS });
#endif
    add_install_file({ "package.json", "res://", jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_CREATE_ONLY });
    add_install_file({ ".gdignore", "res://node_modules", jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_GDIGNORE | jsb::weaver::CH_NODE_MODULES });
    add_install_file({ ".gdignore", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_GDIGNORE | jsb::weaver::CH_D_TS });
    add_install_file({ ".gdignore", "res://" + jsb::internal::Settings::get_autogen_path(), jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_GDIGNORE | jsb::weaver::CH_D_TS });

    // type declaration files
    // VSCode treats the directory containing the jsconfig.json file as the root of a javascript project, and reads type declarations from d.ts.
    add_install_file({ "godot.minimal.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });
    add_install_file({ "godot.mix.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });
#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
    add_install_file({ "godot.worker.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });
#endif
    add_install_file({ "jsb.editor.bundle.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });
    add_install_file({ "jsb.runtime.bundle.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS });

    // obsolete files (for upgrading from old versions)
    add_install_file({ "jsb.bundle.d.ts", "res://" JSB_TYPE_ROOT, jsb::weaver::CH_TYPESCRIPT | jsb::weaver::CH_D_TS | jsb::weaver::CH_OBSOLETE});

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
    jsb_check((p_install_file.hint & jsb::weaver::CH_OBSOLETE) != 0 || is_preset_source_valid(p_install_file.source_name));
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

String GodotJSEditorPlugin::mutate_types(const String& p_content)
{
    // Regex obviously isn't the best tool for the job and this regex will, for example, match some generic parameter
    // names. However, for now, it does the job.
    RegEx type_regex("(?m)(?:=>|[:|&<=,{]|\\s+(?:type|enum|extends)\\s+|\\s+(?:class|interface)(?:<[^>]+>)?\\s+)\\s*([A-Z]\\w+)(?:\\.([A-Z]\\w+))*");
    TypedArray<RegExMatch> type_matches = type_regex.search_all(p_content);
    String result = p_content;
    for (int match_index = type_matches.size() - 1; match_index >= 0; match_index--)
    {
        Ref<RegExMatch> match = type_matches[match_index];
        String identifier;
        String replacement;
        int start;
        int end;

        if (!match->get_string(2).is_empty())
        {
            // Whilst PCRE2 supports repeated capture groups, only the last match for a repeated group is stored. We
            // need to replace all matches.
            start = match->get_end(1) + 1;
            end = match->get_end(0);
            String component_str = result.substr(start, end - start);
            Vector<String> components = component_str.split(".");
            for (int i = components.size() - 1; i >= 0; i--)
            {
                String component = components[i];
                start = end - component.length();
                identifier = result.substr(start, end - start);
                replacement = jsb::internal::NamingUtil::get_class_name(identifier);
                if (replacement != identifier)
                {
                    result = result.substr(0, start) + replacement + result.substr(end);
                }
                end = start - 1;
            }
        }

        start = match->get_start(1);
        end = match->get_end(1);
        identifier = result.substr(start, end - start);
        replacement = jsb::internal::NamingUtil::get_class_name(identifier);
        if (replacement != identifier && identifier != "Array") // Godot Array is already GArray, Array is the JS type.
        {
            result = result.substr(0, start) + replacement + result.substr(end);
        }
    }

    // Remove references
    RegEx reference_regex("(?m)^///\\s*<reference\\spath=.+$");
    TypedArray<RegExMatch> reference_matches = reference_regex.search_all(result);
    for (int match_index = reference_matches.size() - 1; match_index >= 0; match_index--)
    {
        Ref<RegExMatch> match = reference_matches[match_index];
        int start = match->get_start(0);
        int end = match->get_end(0);
        result = result.substr(0, start) + result.substr(end + 1);
    }

    return result;
}

Error GodotJSEditorPlugin::apply_file(const jsb::weaver::InstallFileInfo &p_file)
{
    const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
    if ((p_file.hint & jsb::weaver::CH_OBSOLETE) != 0)
    {
        return delete_file(target_name) ? OK : ERR_FILE_CANT_OPEN;
    }
    Error err;
    size_t size;
    const char* data = get_preset_source(p_file.source_name).get_data(size);
    ERR_FAIL_COND_V_MSG(size == 0 || data == nullptr, ERR_FILE_NOT_FOUND, "bad data");
    err = DirAccess::make_dir_recursive_absolute(p_file.target_dir);
    ERR_FAIL_COND_V_MSG(err != OK, err, "failed to make dir");
    const Ref<FileAccess> outfile = FileAccess::open(target_name, FileAccess::WRITE, &err);
    ERR_FAIL_COND_V_MSG(err != OK, err, "failed to open output file");
    if ((p_file.hint & jsb::weaver::CH_REPLACE_VARS) != 0)
    {
        String parsed;
#if GODOT_4_5_OR_NEWER
        parsed.append_utf8(data, (int) size);
#else
        parsed.parse_utf8(data, (int) size);
#endif
        parsed = parsed.replacen("__OUT_DIR__", jsb::internal::Settings::get_jsb_out_dir_name());
        parsed = parsed.replacen("__BUILD_INFO_FILE__", jsb::internal::Settings::get_tsbuildinfo_path());
        parsed = parsed.replacen("__SRC_DIR__", "../../../");  // locate typescripts at the project root path for better dev experience
        parsed = parsed.replacen("__NEW_LINE__", "crlf");
        parsed = parsed.replacen("__MODULE__", "CommonJS"); // CommonJS is the only option currently supported
        parsed = parsed.replacen("__TYPE_ROOTS__", String(",").join({ R"("./node_modules/@types")", "\"./" JSB_TYPE_ROOT "\"" }));
        outfile->store_string(parsed);
    }
    else if ((p_file.hint & jsb::weaver::CH_D_TS) != 0 && target_name.ends_with(".d.ts"))
    {
        String parsed;
#if GODOT_4_5_OR_NEWER
        parsed.append_utf8(data, (int) size);
#else
        parsed.parse_utf8(data, (int) size);
#endif
        outfile->store_string(mutate_types(parsed));
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
        if ((item.hint & jsb::weaver::CH_OBSOLETE) != 0)
        {
            modified_file_list += " (delete)";
        }
    }
    confirm_dialog_->pending_installs_ = modified;
    confirm_dialog_->set_text(TTR("Found existing/missing files, re-installing presets will overwrite:") + modified_file_list);
    confirm_dialog_->popup_centered();
}

bool GodotJSEditorPlugin::verify_file(const jsb::weaver::InstallFileInfo& p_file, bool p_verify_content)
{
    //TODO skip all d.ts files during the INSTALL phase (do it in the GENERATE phase)
    // if ((p_file.hint & jsb::weaver::CH_D_TS) != 0) return true;
    if ((p_file.hint & jsb::weaver::CH_OBSOLETE) != 0)
    {
        // return false if obsolete file exists
        const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
        if (FileAccess::exists(target_name)) return false;
        return true;
    }

    size_t size;
    const char* data = get_preset_source(p_file.source_name).get_data(size);
    if (size == 0 || data == nullptr) return false;
    const String target_name = jsb::internal::PathUtil::combine(p_file.target_dir, p_file.source_name);
    if (!FileAccess::exists(target_name)) return false;
    if ((p_file.hint & jsb::weaver::CH_CREATE_ONLY) != 0) return true;
    if (p_verify_content)
    {
        Error err;
        const Ref<FileAccess> access = FileAccess::open(target_name, FileAccess::READ, &err);
        if (err != OK || access.is_null()) return false;
        const size_t file_len = access->get_length();
        String mutated_data;
        if ((p_file.hint & jsb::weaver::CH_D_TS) != 0 && target_name.ends_with(".d.ts"))
        {
            String parsed;
#if GODOT_4_5_OR_NEWER
            parsed.append_utf8(data, (int) size);
#else
            parsed.parse_utf8(data, (int) size);
#endif
            mutated_data = mutate_types(parsed);
            size = mutated_data.length();
        }
        if (file_len != size) return false;
        Vector<uint8_t> file_data;
        jsb_check(size == (size_t)(int) size);
        if (file_data.resize((int) size) != OK) return false;
        if (access->get_buffer(file_data.ptrw(), size) != size) return false;
        return memcmp(mutated_data.is_empty() ? data : mutated_data.utf8().ptr(), file_data.ptr(), size) == 0;
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
        if (const Error err = apply_file(info); err != OK)
        {
            JSB_LOG(Warning, "failed to write file '%s' to '%s': %s", info.source_name, info.target_dir, jsb_ext_error_string(err));
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
            if (!(it_path.ends_with("." JSB_JAVASCRIPT_EXT) || it_path.ends_with("." JSB_COMMONJS_EXT) || it_path.ends_with("." JSB_MODULE_EXT)) || !FileAccess::exists(jsb::internal::PathUtil::convert_javascript_path(it_path)))
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

void GodotJSEditorPlugin::_on_scene_saved(const String& p_path)
{
    if (!jsb::internal::Settings::get_autogen_scene_dts_on_save()) return;

    Vector<String> paths = { p_path };
    generate_scene_nodes_types(paths);

    // Curiously, the "resource_saved" signal is not emitted for scenes even though they're resources. So we implement
    // resource saved logic here too.

    if (!jsb::internal::Settings::get_autogen_resource_dts_on_save()) return;

    generate_resource_types(paths);
}

void GodotJSEditorPlugin::_on_resource_saved(const Ref<Resource>& p_resource)
{
    if (!jsb::internal::Settings::get_autogen_resource_dts_on_save()) return;

    Vector<String> paths = { p_resource->get_path() };
    generate_resource_types(paths);
}

void GodotJSEditorPlugin::_generate_imported_resource_dts(const Vector<String>& p_resource)
{
    if (!jsb::internal::Settings::get_autogen_resource_dts_on_save()) return;

    generate_resource_types(p_resource);
}

bool GodotJSEditorPlugin::_is_path_matchn(const PackedStringArray& p_wildcards, const String& p_path)
{
    for (const String& wildcard: p_wildcards)
    {
        if ((wildcard.contains_char('*') || wildcard.contains_char('?')) && p_path.match(wildcard))
        {
            return true;
        }
        else
        {
            const String& lower_case_path = p_path.to_lower();
            String lower_case_wildcard = wildcard.to_lower();
            if (lower_case_path == lower_case_wildcard){
                return true; // Exact match file.
            }
            else
            {
                if (!lower_case_wildcard.ends_with("/"))
                {
                    // Cheat as directory.
                    lower_case_wildcard += "/";
                }

                if (lower_case_path.begins_with(lower_case_wildcard))
                {
                    return true; // Match directory.
                }
            }
        }
    }

    return false;
}

Vector<String> GodotJSEditorPlugin::_filter_resource_paths(const PackedStringArray& p_exclude_wildcards, const PackedStringArray& p_include_wildcards, const Vector<String>& p_paths)
{
    Vector<String> filtered_paths;
    if (!p_include_wildcards.is_empty())
    {
        for (const String& path: p_paths)
        {
            if (!p_exclude_wildcards.is_empty() && _is_path_matchn(p_exclude_wildcards, path))
            {
                continue;
            }
    
            if (_is_path_matchn(p_include_wildcards, path))
            {
                filtered_paths.push_back(path);
            }
        }
    }

    return filtered_paths;
}

void GodotJSEditorPlugin::generate_godot_dts()
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        install_files(filter_files(editor_plugin->install_files_, jsb::weaver::CH_D_TS));

        GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
        jsb_check(lang);
        Error err;
        const bool use_project_settings = jsb::internal::Settings::get_codegen_use_project_settings();
        const String code = jsb_format(
            R"--((function(){const mod = require("jsb.editor.codegen"); (new mod.TSDCodeGen("%s", %s)).emit();})())--",
            "./" JSB_TYPE_ROOT,
            use_project_settings ? "true" : "false"
        );
        lang->eval_source(code, err).ignore();
        ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.codegen");

        String autogen_url =  "res://" + jsb::internal::Settings::get_autogen_path();

        // In case the user does something strange with their get_autogen_path, don't delete their project.
        if (autogen_url.length() > 6 && FileAccess::exists(autogen_url.path_join(".gdignore")))
        {
            DirAccess::open(autogen_url)->erase_contents_recursive();
            install_files(filter_files(editor_plugin->install_files_, jsb::weaver::CH_GDIGNORE));
        }

        generate_all_scene_nodes_types();
        generate_all_resource_types();
    }
}

void GodotJSEditorPlugin::get_all_scenes(EditorFileSystemDirectory* p_dir, Vector<String>& r_list)
{
    for (int i = 0; i < p_dir->get_file_count(); i++)
    {
        if (p_dir->get_file_type(i) == SNAME("PackedScene"))
        {
            r_list.push_back(p_dir->get_file_path(i));
        }
    }

    for (int i = 0; i < p_dir->get_subdir_count(); i++)
    {
        get_all_scenes(p_dir->get_subdir(i), r_list);
    }
}

void GodotJSEditorPlugin::get_all_resources(EditorFileSystemDirectory* p_dir, Vector<String>& r_list)
{
    for (int i = 0; i < p_dir->get_file_count(); i++)
    {
        String path = p_dir->get_file_path(i);

        if (!ResourceLoader::get_resource_type(path).is_empty() && !GodotJSExportPlugin::get_ignored_paths().has(path))
        {
            r_list.push_back(p_dir->get_file_path(i));
        }
    }

    for (int i = 0; i < p_dir->get_subdir_count(); i++)
    {
        get_all_resources(p_dir->get_subdir(i), r_list);
    }
}

void GodotJSEditorPlugin::generate_scene_nodes_types(const Vector<String>& p_paths)
{
    if (!jsb::internal::Settings::get_gen_scene_dts()) return;

    if (p_paths.size() == 0)
    {
        JSB_LOG(Log, "generate_scene_nodes_dts: No scenes detected");
        return;
    }

    PackedStringArray exclude_wildcards = jsb::internal::Settings::get_scene_dts_exclude_path_wildcards();
    PackedStringArray include_wildcards = jsb::internal::Settings::get_scene_dts_include_path_wildcards();
    Vector<String> filtered_paths = _filter_resource_paths(exclude_wildcards, include_wildcards, p_paths);
    if (filtered_paths.is_empty())
    {
        return;
    }

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    Error err;

    const String code = jsb_format(
        R"--((function(){const mod = require("jsb.editor.codegen"); (new mod.SceneTSDCodeGen("%s", ["%s"])).emit();})())--",
        "./" + jsb::internal::Settings::get_autogen_path(),
        String("\", \"").join(filtered_paths)
    );
    lang->eval_source(code, err).ignore();
    ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.codegen");
}

void GodotJSEditorPlugin::generate_resource_types(const Vector<String>& p_paths)
{
    if (!jsb::internal::Settings::get_gen_resource_dts()) return;

    if (p_paths.size() == 0)
    {
        JSB_LOG(Log, "generate_resource_dts: No resources detected");
        return;
    }

    PackedStringArray exclude_wildcards = jsb::internal::Settings::get_resource_dts_exclude_path_wildcards();
    PackedStringArray include_wildcards = jsb::internal::Settings::get_resource_dts_include_path_wildcards();
    Vector<String> filtered_paths = _filter_resource_paths(exclude_wildcards, include_wildcards, p_paths);
    if (filtered_paths.is_empty())
    {
        return;
    }

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    Error err;

    const String code = jsb_format(
        R"--((function(){const mod = require("jsb.editor.codegen"); (new mod.ResourceTSDCodeGen("%s", ["%s"])).emit();})())--",
        "./" + jsb::internal::Settings::get_autogen_path(),
        String("\", \"").join(filtered_paths)
    );
    lang->eval_source(code, err).ignore();
    ERR_FAIL_COND_MSG(err != OK, "failed to evaluate jsb.editor.codegen");
}

void GodotJSEditorPlugin::generate_all_scene_nodes_types()
{
    Vector<String> paths;
    get_all_scenes(EditorFileSystem::get_singleton()->get_filesystem(), paths);
    generate_scene_nodes_types(paths);
}

void GodotJSEditorPlugin::generate_all_resource_types()
{
    Vector<String> paths;
    get_all_resources(EditorFileSystem::get_singleton()->get_filesystem(), paths);
    generate_resource_types(paths);
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
    // we'd better not rely on EditorNode for better compat (e.g. gdextension build)
    return singleton_;
}

void GodotJSEditorPlugin::ensure_tsc_installed()
{
    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);

    Error err;
    lang->eval_source(R"--(require("jsb.editor.main").run_npm_install())--", err);
}
