#include "jsb_export_plugin.h"
#include "../internal/jsb_internal_pch.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"

#define JSB_EXPORTER_LOG(Severity, Format, ...) JSB_LOG_IMPL(JSExporter, Severity, Format, ##__VA_ARGS__)

GodotJSExportPlugin::GodotJSExportPlugin() : super()
{
    // explicitly ignored files (not used by runtime)
    ignored_paths_.insert("res://tsconfig.json");
    ignored_paths_.insert("res://package.json");
    ignored_paths_.insert("res://package-lock.json");
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
}

void GodotJSExportPlugin::_export_file(const String& p_path, const String& p_type, const HashSet<String>& p_features)
{
    if (p_path.ends_with("." JSB_TYPESCRIPT_EXT))
    {
        const String compiled_script_path = jsb::internal::PathUtil::convert_typescript_path(p_path);
        Error err;
        const Vector<uint8_t> compiled_script_data = FileAccess::get_file_as_bytes(compiled_script_path, &err);
        if (err == OK)
        {
            add_file(compiled_script_path, compiled_script_data, false);
            if (jsb::internal::Settings::is_packaging_with_source_map())
            {
                const String source_map_path = compiled_script_path + ".map";
                const Vector<uint8_t> source_map_data = FileAccess::get_file_as_bytes(source_map_path, &err);
                if (err == OK)
                {
                    add_file(source_map_path, source_map_data, false);
                }
                else
                {
                    JSB_EXPORTER_LOG(Warning, "can't read the sourcemap file from %s, please ensure that 'tsc' has being executed properly.", source_map_path);
                }
            }
        }
        else
        {
            JSB_EXPORTER_LOG(Error, "can't read the javascript file from %s, please ensure that 'tsc' has being executed properly.", compiled_script_path);
        }
        skip();
        JSB_EXPORTER_LOG(Verbose, "export_file source: %s => %s", p_path, compiled_script_path);
    }
    else
    {
        if (ignored_paths_.has(p_path))
        {
            skip();
            JSB_EXPORTER_LOG(Verbose, "export_file ignored: %s", p_path);
        }
    }
}

String GodotJSExportPlugin::get_name() const
{
    return jsb_typename(GodotJSExportPlugin);
}
