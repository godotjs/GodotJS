#include "jsb_editor_plugin.h"
#include "jsb_docked_panel.h"
#include "jsb_export_plugin.h"

#if GODOT_4_7_OR_NEWER
#include "core/object/callable_mp.h"
#endif

#define JSB_TYPE_ROOT "typings"

enum
{
    MENU_ID_INSTALL_PROJECT_FILES,
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

        if (OS::get_singleton()->get_cmdline_args().find("--generate-types") != nullptr)
        {
            // Delay until idle so the editor plugin and JS runtime are fully entered.
            callable_mp(this, &GodotJSEditorPlugin::_generate_types_from_cmdline).call_deferred();
        }

        break;
    default: break;
    }
}

void GodotJSEditorPlugin::_generate_types_from_cmdline()
{
    generate_types([](auto success)
    {
        if (success)
        {
            JSB_LOG(Log, "Type generation complete.");
        }
        else
        {
            JSB_LOG(Error, "Type generation failed.");
        }

        if (DisplayServer::get_singleton()->get_name() == "headless")
        {
            SceneTree::get_singleton()->quit(success ? 0 : -1);
        }
    });
}

void GodotJSEditorPlugin::_on_menu_pressed(int p_what)
{
    switch (p_what)
    {
    case MENU_ID_INSTALL_PROJECT_FILES: try_install_project_files(); break;
    case MENU_ID_GENERATE_TYPES: generate_types(); break;
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
    menu->add_item(TTR("Install Project Files"), MENU_ID_INSTALL_PROJECT_FILES);
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
#if !JSB_WITH_WEB
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
    auto should_ignore_identifier = [](const String& p_identifier) -> bool
    {
        // Internal utility types are double underscore prefixed
        return p_identifier.begins_with("__");
    };

    // Regex obviously isn't the best tool for the job and this regex will, for example, match some generic parameter
    // names. However, for now, it does the job.
    RegEx type_regex("(?m)(?:=>|[:|&<=,{\\[]|\\b(?:type|enum|extends|keyof|infer|typeof|implements|as|is|in|satisfies)\\s+|\\s+(?:class|interface)(?:<[^>]+>)?\\s+)\\s*([A-Z]\\w+)(?:\\.([A-Z]\\w+))*");
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

                if (should_ignore_identifier(identifier))
                {
                    end = start - 1;
                    continue;
                }

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

        if (should_ignore_identifier(identifier))
        {
            continue;
        }

        replacement = jsb::internal::NamingUtil::get_class_name(identifier);
        if (replacement != identifier && identifier != "Array") // Godot Array is already GArray, Array is the JS type.
        {
            result = result.substr(0, start) + replacement + result.substr(end);
        }
    }

    RegEx function_regex("(?m)\\b(?!(?:if|for|while|switch|catch|return|new|super|this)\\b)([a-zA-Z_]\\w*)\\s*(?:<[^>]+>)?\\s*\\(");
    RegEx parameter_regex("(?m)\\b([a-zA-Z_]\\w*)\\s*(?:\\?|)\\s*:");
    TypedArray<RegExMatch> func_matches = function_regex.search_all(result);
    for (int match_index = func_matches.size() - 1; match_index >= 0; match_index--)
    {
        Ref<RegExMatch> func_match = func_matches[match_index];

        int func_name_start = func_match->get_start(1);
        int func_name_end = func_match->get_end(1);
        String func_identifier = result.substr(func_name_start, func_name_end - func_name_start);

        int param_list_start = func_match->get_end(0);
        int param_list_end = param_list_start;
        int depth = 1;

        for (int i = param_list_start; i < result.length(); i++)
        {
            if (result[i] == '(') depth++;
            else if (result[i] == ')') depth--;

            if (depth == 0)
            {
                param_list_end = i;
                break;
            }
        }

        if (depth == 0 && param_list_end > param_list_start)
        {
            String param_str = result.substr(param_list_start, param_list_end - param_list_start);
            TypedArray<RegExMatch> param_matches = parameter_regex.search_all(param_str);

            for (int p_index = param_matches.size() - 1; p_index >= 0; p_index--)
            {
                Ref<RegExMatch> p_match = param_matches[p_index];

                int p_start = param_list_start + p_match->get_start(1);
                int p_end = param_list_start + p_match->get_end(1);
                String p_identifier = result.substr(p_start, p_end - p_start);

                if (should_ignore_identifier(p_identifier))
                {
                    continue;
                }

                String p_replacement = jsb::internal::NamingUtil::get_parameter_name(p_identifier);
                if (p_replacement != p_identifier)
                {
                    result = result.substr(0, p_start) + p_replacement + result.substr(p_end);
                }
            }
        }

        if (!should_ignore_identifier(func_identifier))
        {
            String func_replacement = jsb::internal::NamingUtil::get_member_name(func_identifier);
            if (func_replacement != func_identifier)
            {
                result = result.substr(0, func_name_start) + func_replacement + result.substr(func_name_end);
            }
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
        parsed = parsed.replacen("__MODULE__", "node16"); // CommonJS with sane ESM default import handling
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

void GodotJSEditorPlugin::install_project_files(std::function<void(bool)> complete, const Vector<jsb::weaver::InstallFileInfo>& p_files)
{
    if (!install_files(p_files)) return;
    load_editor_entry_module();
    ensure_tsc_installed();
    on_successfully_installed();
    generate_types(complete);
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

void GodotJSEditorPlugin::_on_scene_saved(const String& p_path)
{
    if (!jsb::internal::Settings::get_autogen_scene_dts_on_save()) return;

    Vector<String> paths = { p_path };
    generate_scene_nodes_types({}, paths);

    // Curiously, the "resource_saved" signal is not emitted for scenes even though they're resources. So we implement
    // resource saved logic here too.

    if (!jsb::internal::Settings::get_autogen_resource_dts_on_save()) return;

    generate_resource_types({}, paths);
}

void GodotJSEditorPlugin::_on_resource_saved(const Ref<Resource>& p_resource)
{
    if (!jsb::internal::Settings::get_autogen_resource_dts_on_save()) return;

    Vector<String> paths = { p_resource->get_path() };
    generate_resource_types({}, paths);
}

void GodotJSEditorPlugin::_generate_imported_resource_dts(const Vector<String>& p_resource)
{
    if (!jsb::internal::Settings::get_autogen_resource_dts_on_save()) return;

    generate_resource_types({}, p_resource);
}

void GodotJSEditorPlugin::_on_generate_completed(const v8::FunctionCallbackInfo<v8::Value>& info)
{
    bool success = info.Length() >= 1 && info[0]->IsBoolean() && info[0].As<v8::Boolean>()->Value();

    if (!info.Data()->IsExternal())
    {
        JSB_LOG(Error, "_on_generate_completed called without valid External data.");
        return;
    }

    std::function<void(bool)>* callback = static_cast<std::function<void(bool)>*>(info.Data().As<v8::External>()->Value());

    if (callback != nullptr)
    {
        if (*callback)
        {
            (*callback)(success);
        }

        delete callback;
    }
}

void GodotJSEditorPlugin::generate_types(std::function<void(bool)> complete, bool skip_static_types)
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        if (!skip_static_types)
        {
            bool static_types_success = false;
            install_static_types([&](bool success)
            {
                static_types_success = success;
            });
            if (!static_types_success)
            {
                if (complete)
                {
                    complete(false);
                }
                return;
            }
        }

        GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
        jsb_check(lang);
        static constexpr char code[] = R"--((async function(output_path, callback, use_project_settings, skip_static_types) {
const mod = require("jsb.editor.codegen");
try {
    await (new mod.TSDCodeGen(output_path, use_project_settings)).emit(true);
    callback(true);
} catch (error) {
    console.error(error);
    callback(false);
}
    }))--";
        std::shared_ptr<jsb::Environment> environment = lang->get_environment();
        v8::Isolate* isolate = environment->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = environment->get_context();
        v8::Context::Scope context_scope(context);
        v8::MaybeLocal<v8::Value> func_maybe = jsb::impl::Helper::compile_function(
            context, code, ::std::size(code) - 1, "generate_types");

        if (func_maybe.IsEmpty())
        {
            if (complete)
            {
                complete(false);
            }
            return;
        }

        v8::Local<v8::Value> func = func_maybe.ToLocalChecked();

        auto heap_complete = new std::function<void(bool)>([complete, editor_plugin](bool static_success)
        {
            if (!static_success)
            {
                if (complete)
                {
                    complete(false);
                }
                return;
            }

            // In case the user does something strange with their get_autogen_path, don't delete their project.
            String autogen_url =  "res://" + jsb::internal::Settings::get_autogen_path();
            if (autogen_url.length() > 6 && FileAccess::exists(autogen_url.path_join(".gdignore")))
            {
                DirAccess::open(autogen_url)->erase_contents_recursive();
                GodotJSEditorPlugin::install_files(GodotJSEditorPlugin::filter_files(editor_plugin->install_files_, jsb::weaver::CH_GDIGNORE));
            }

            auto generate_resources = [complete](bool scene_success)
            {
                if (!scene_success)
                {
                    if (complete)
                    {
                        complete(false);
                    }
                    return;
                }

                Vector<String> resource_paths;
                GodotJSEditorPlugin::get_all_resources(EditorFileSystem::get_singleton()->get_filesystem(), resource_paths);
                GodotJSEditorPlugin::generate_resource_types(complete, resource_paths);
            };

            Vector<String> scene_paths;
            GodotJSEditorPlugin::get_all_scenes(EditorFileSystem::get_singleton()->get_filesystem(), scene_paths);
            GodotJSEditorPlugin::generate_scene_nodes_types(generate_resources, scene_paths);
        });
        v8::Local<v8::External> complete_callback = v8::External::New(isolate, heap_complete);

        v8::Local<v8::Value> argv[] = {
            jsb::impl::Helper::new_string(isolate, "./" JSB_TYPE_ROOT),
            JSB_NEW_FUNCTION(context, GodotJSEditorPlugin::_on_generate_completed, complete_callback),
            v8::Boolean::New(isolate, jsb::internal::Settings::get_codegen_use_project_settings()),
            v8::Boolean::New(isolate, skip_static_types),
        };

        const v8::MaybeLocal<v8::Value> result = func.As<v8::Function>()->Call(context, v8::Undefined(isolate), ::std::size(argv), argv);
        if (result.IsEmpty())
        {
            delete heap_complete;
            if (complete)
            {
                complete(false);
            }
            return;
        }
    }
}

void GodotJSEditorPlugin::install_static_types(std::function<void(bool)> complete)
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        const bool success = install_files(filter_files(editor_plugin->install_files_, jsb::weaver::CH_D_TS));
        if (complete)
        {
            complete(success);
        }
        return;
    }

    if (complete)
    {
        complete(false);
    }
}

void GodotJSEditorPlugin::try_install_project_files(std::function<void(bool)> complete, bool force)
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        editor_plugin->remove_obsolete_files();
        Vector<jsb::weaver::InstallFileInfo> modified;
        if (verify_files(editor_plugin->install_files_, true, &modified))
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

        if (force)
        {
            install_project_files(complete, modified);
        }
        else if (DisplayServer::get_singleton()->get_name() == "headless")
        {
            JSB_LOG(Log, "Skipped existing TypeScript project files: %s", modified_file_list);

            if (complete)
            {
                complete(true);
            }
        }
        else
        {
            editor_plugin->confirm_dialog_->pending_installs_ = modified;
            editor_plugin->confirm_dialog_->set_text(TTR("Found existing/missing files, re-installing presets will overwrite:") + modified_file_list);
            editor_plugin->confirm_dialog_->popup_centered();
        }
    }
}

void GodotJSEditorPlugin::cleanup_invalid_files(std::function<void(bool)> complete)
{
    int deleted_num = 0;
    Vector<String> invalid_files;
    collect_invalid_files(invalid_files);
    for (const String& invalid_file: invalid_files)
    {
        deleted_num += delete_file(invalid_file);
        deleted_num += delete_file(invalid_file + ".map");
    }
    JSB_LOG(Log, "%d files were deleted", deleted_num);

    if (complete)
    {
        complete(true);
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
        if (path.begins_with("res://install/") || path.begins_with("res://node_modules/"))
        {
            continue;
        }

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

void GodotJSEditorPlugin::generate_scene_nodes_types(std::function<void(bool)> complete, const Vector<String>& p_paths)
{
    if (!jsb::internal::Settings::get_gen_scene_dts()) return;

    if (p_paths.size() == 0)
    {
        JSB_LOG(Log, "generate_scene_nodes_dts: No scenes detected");
        if (complete)
        {
            complete(true);
        }
        return;
    }

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);

    static constexpr char code[] = R"--((async function(output_path, resource_paths, callback) {
const mod = require("jsb.editor.codegen");
try {
    await (new mod.SceneTSDCodeGen(output_path, resource_paths)).emit();
    callback(true);
} catch (error) {
    console.error(error);
    callback(false);
}
    }))--";

    std::shared_ptr<jsb::Environment> environment = lang->get_environment();
    v8::Isolate* isolate = environment->get_isolate();

    v8::HandleScope handle_scope(isolate);
    v8::Local<v8::Context> context = environment->get_context();

    v8::MaybeLocal<v8::Value> func_maybe = jsb::impl::Helper::compile_function(
        context, code, ::std::size(code) - 1, "generate_resource_type");

    if (func_maybe.IsEmpty())
    {
        JSB_LOG(Error, "Failed to request resource codegen for: ", String("\", \"").join(p_paths));

        if (complete)
        {
            complete(false);
        }

        return;
    }

    v8::Local<v8::Value> func = func_maybe.ToLocalChecked();
    auto heap_complete = new std::function(complete);
    v8::Local<v8::External> complete_callback = v8::External::New(isolate, heap_complete);

    v8::Local<v8::Value> argv[] = {
        jsb::impl::Helper::new_string(isolate, "./" + jsb::internal::Settings::get_autogen_path()),
        jsb::BridgeHelper::TVariantArray<String>::from_vector(isolate, context, Variant::Type::STRING, p_paths),
        JSB_NEW_FUNCTION(context, GodotJSEditorPlugin::_on_generate_completed, complete_callback)
    };

    const v8::MaybeLocal<v8::Value> result = func.As<v8::Function>()->Call(context, v8::Undefined(isolate), ::std::size(argv), argv);

    if (result.IsEmpty())
    {
        JSB_LOG(Error, "Failed to execute resource codegen for: ", String("\", \"").join(p_paths));
        delete heap_complete;

        if (complete)
        {
            complete(false);
        }
    }
}

void GodotJSEditorPlugin::generate_resource_types(std::function<void(bool)> complete, const Vector<String>& p_paths)
{
    if (!jsb::internal::Settings::get_gen_resource_dts()) return;

    if (p_paths.size() == 0)
    {
        JSB_LOG(Log, "generate_resource_dts: No resources detected");
        if (complete)
        {
            complete(true);
        }
        return;
    }

    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);


    static constexpr char code[] = R"--((async function(output_path, resource_paths, callback) {
const mod = require("jsb.editor.codegen");
try {
    await (new mod.ResourceTSDCodeGen(output_path, resource_paths)).emit();
    callback(true);
} catch (error) {
    console.error(error);
    callback(false);
}
    }))--";

    std::shared_ptr<jsb::Environment> environment = lang->get_environment();
    v8::Isolate* isolate = environment->get_isolate();

    v8::HandleScope handle_scope(isolate);
    v8::Local<v8::Context> context = environment->get_context();

    v8::MaybeLocal<v8::Value> func_maybe = jsb::impl::Helper::compile_function(
        context, code, ::std::size(code) - 1, "generate_resource_type");

    if (func_maybe.IsEmpty())
    {
        JSB_LOG(Error, "Failed to request resource codegen for: ", String("\", \"").join(p_paths));

        if (complete)
        {
            complete(false);
        }

        return;
    }

    v8::Local<v8::Value> func = func_maybe.ToLocalChecked();
    auto heap_complete = new std::function(complete);
    v8::Local<v8::External> complete_callback = v8::External::New(isolate, heap_complete);

    v8::Local<v8::Value> argv[] = {
        jsb::impl::Helper::new_string(isolate, "./" + jsb::internal::Settings::get_autogen_path()),
        jsb::BridgeHelper::TVariantArray<String>::from_vector(isolate, context, Variant::Type::STRING, p_paths),
        JSB_NEW_FUNCTION(context, GodotJSEditorPlugin::_on_generate_completed, complete_callback)
    };

    const v8::MaybeLocal<v8::Value> result = func.As<v8::Function>()->Call(context, v8::Undefined(isolate), ::std::size(argv), argv);

    if (result.IsEmpty())
    {
        JSB_LOG(Error, "Failed to execute resource codegen for: ", String("\", \"").join(p_paths));
        delete heap_complete;

        if (complete)
        {
            complete(false);
        }
    }
}

void GodotJSEditorPlugin::generate_all_scene_nodes_types()
{
    Vector<String> paths;
    get_all_scenes(EditorFileSystem::get_singleton()->get_filesystem(), paths);
    generate_scene_nodes_types({}, paths);
}

void GodotJSEditorPlugin::generate_all_resource_types()
{
    Vector<String> paths;
    get_all_resources(EditorFileSystem::get_singleton()->get_filesystem(), paths);
    generate_resource_types({}, paths);
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

    install_project_files([&](auto success) {
        if (confirm_dialog_->pending_installs_callback_)
        {
            confirm_dialog_->pending_installs_callback_(success);
            confirm_dialog_->pending_installs_callback_ = {};
        }
    }, confirm_dialog_->pending_installs_);
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
