#include "jsb_export_plugin.h"
#include "../internal/jsb_macros.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"

namespace jsb
{
    struct CompiledScriptInfo
    {
        // file path
        //TODO res://.godot/javascripts/*.js ?
        String path;

        // content (utf8 encoded)
        Vector<uint8_t> data;
    };

    bool get_compiled_script_info(const String& p_path, CompiledScriptInfo& r_script_info)
    {
        //TODO
        return false;
    }
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

void GodotJSExportPlugin::_export_begin(const HashSet<String>& p_features, bool p_debug, const String& p_path, int p_flags)
{
    JSB_LOG(Verbose, "export_begin path:%s", p_path);
}

void GodotJSExportPlugin::_export_file(const String& p_path, const String& p_type, const HashSet<String>& p_features)
{
    JSB_LOG(Verbose, "export_file path:%s", p_path);
    if (p_path.ends_with("." JSB_TYPESCRIPT_EXT))
    {
        const String compiled_script_path = jsb::internal::PathUtil::convert_to_internal_path(p_path);
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
                    JSB_LOG(Warning, "can't read the sourcemap file from %s, please ensure that 'tsc' has being executed properly.", source_map_path);
                }
            }
        }
        else
        {
            JSB_LOG(Error, "can't read the javascript file from %s, please ensure that 'tsc' has being executed properly.", compiled_script_path);
        }
        skip();
    }
}
