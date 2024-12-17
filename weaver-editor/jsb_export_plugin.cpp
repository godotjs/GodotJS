#include "jsb_export_plugin.h"

#define JSB_EXPORTER_LOG(Severity, Format, ...) JSB_LOG_IMPL(JSExporter, Severity, Format, ##__VA_ARGS__)

GodotJSExportPlugin::GodotJSExportPlugin() : super()
{
    // explicitly ignored files (not used by runtime)
    ignored_paths_.insert("res://tsconfig.json");
    ignored_paths_.insert("res://package.json");
    ignored_paths_.insert("res://package-lock.json");
    env_ = GodotJSScriptLanguage::get_singleton()->get_environment();
    jsb_check(env_);
}

PackedStringArray GodotJSExportPlugin::_get_export_features(const Ref<EditorExportPlatform>& p_export_platform, bool p_debug) const
{
    //TODO features (typescript, javascript?)
    const Ref<DirAccess> dir_access = DirAccess::create(DirAccess::ACCESS_RESOURCES);
    if (dir_access->exists("res://tsconfig.json"))
    {
        return { "typescript" };
    }
    return {};
}

// p_path is the exported package full path (like X:/Folder1/Folder2/test.zip)
void GodotJSExportPlugin::_export_begin(const HashSet<String>& p_features, bool p_debug, const String& p_path, int p_flags)
{
    JSB_EXPORTER_LOG(Verbose, "export_begin path: %s", p_path);
    exported_paths_.clear();
}

bool GodotJSExportPlugin::export_raw_file(const String& p_path)
{
    if (exported_paths_.has(p_path))
    {
        return true;
    }
    Error err;
    const Vector<uint8_t> content = FileAccess::get_file_as_bytes(p_path, &err);
    if (err != OK)
    {
        return false;
    }
    exported_paths_.insert(p_path);
    add_file(p_path, content, false);
    JSB_EXPORTER_LOG(Verbose, "include raw: %s", p_path);
    return true;
}

bool GodotJSExportPlugin::export_module_files(const jsb::JavaScriptModule& p_module)
{
    if (!export_raw_file(p_module.source_info.source_filepath))
    {
        JSB_EXPORTER_LOG(Error, "can't read JS source from %s, please ensure that 'tsc' has being executed properly.", p_module.source_info.source_filepath);
        return false;
    }

    if (jsb::internal::Settings::is_packaging_with_source_map())
    {
        const String source_map_path = p_module.source_info.source_filepath + ".map";
        if (!export_raw_file(source_map_path))
        {
            JSB_EXPORTER_LOG(Verbose, "can't read the sourcemap from %s, please ensure that 'tsc' has being executed properly.", source_map_path);
        }
    }

    if (!p_module.source_info.package_filepath.is_empty() && !export_raw_file(p_module.source_info.package_filepath))
    {
        JSB_EXPORTER_LOG(Error, "can't read the package.json from %s", p_module.source_info.package_filepath);
        return false;
    }
    return true;
}

bool GodotJSExportPlugin::export_compiled_script(const String& p_path)
{
    if (p_path.is_empty() || exported_paths_.has(p_path))
    {
        return false;
    }
    if (!p_path.begins_with("res://"))
    {
        JSB_EXPORTER_LOG(Warning, "can not export external source: %s", p_path);
        return false;
    }

    // export dependent files.
    // force module loading. ensure the module hierarchy available.
    if (jsb::JavaScriptModule* module; env_->load(p_path, &module) == OK)
    {
        v8::Isolate* isolate = env_->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = env_->get_context();
        v8::Context::Scope context_scope(context);

        export_module_files(*module);
        jsb::Environment* environment = jsb::Environment::wrap(isolate);
        const v8::Local<v8::Object> module_obj = module->module.Get(isolate);
        if (v8::Local<v8::Value> temp; module_obj->Get(context, jsb_name(environment, children)).ToLocal(&temp) && temp->IsArray())
        {
            const v8::Local<v8::Array> children = temp.As<v8::Array>();
            const int32_t len = (int32_t) children->Length();
            for (int i = 0; i < len; i++)
            {
                if (children->Get(context, i).ToLocal(&temp) && temp->IsObject())
                {
                    const v8::Local<v8::Object> child = temp.As<v8::Object>();
                    if (child->Get(context, jsb_name(environment, filename)).ToLocal(&temp))
                    {
                        const String filename = jsb::impl::Helper::to_string(isolate, temp);
                        if (export_compiled_script(filename))
                        {
                            JSB_EXPORTER_LOG(Verbose, "export dependent source: %s", filename);
                        }
                    }
                }
            }
        }
    }
    else
    {
        JSB_EXPORTER_LOG(Warning, "failed to include module: %s", p_path);
    }
    return true;
}

void GodotJSExportPlugin::_export_file(const String& p_path, const String& p_type, const HashSet<String>& p_features)
{
    //TODO when exporting for web.impl, need to reorganize all scripts into a monolithic script (like webpack)? and preload it before everything get run.

    if (p_path.ends_with("." JSB_TYPESCRIPT_EXT))
    {
        const String compiled_script_path = jsb::internal::PathUtil::convert_typescript_path(p_path);
        export_compiled_script(compiled_script_path);

        // always skip the typescript source from packing
        skip();
        JSB_EXPORTER_LOG(Verbose, "export source: %s => %s", p_path, compiled_script_path);
    }
    else
    {
        if (ignored_paths_.has(p_path))
        {
            skip();
            JSB_EXPORTER_LOG(Verbose, "ignored: %s", p_path);
        }
    }
}

String GodotJSExportPlugin::get_name() const
{
    return jsb_typename(GodotJSExportPlugin);
}

bool GodotJSExportPlugin::supports_platform(const Ref<EditorExportPlatform>& p_export_platform) const
{
    //TODO
    JSB_EXPORTER_LOG(Verbose, "GodotJSExportPlugin::supports_platform( %s )", p_export_platform.is_valid() ? p_export_platform->get_name() : String("null"));
    return true;
}
