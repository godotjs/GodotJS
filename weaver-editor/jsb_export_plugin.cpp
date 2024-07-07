#include "jsb_export_plugin.h"
#include "../internal/jsb_macros.h"

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
    if (dir_access->exists("res://typescripts"))
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

    //TODO skip the typescript source files, add compiled javascript files
    if (p_path.ends_with(".ts"))
    {
        jsb::CompiledScriptInfo compiled_script_info;
        jsb::get_compiled_script_info(p_path, compiled_script_info);
        add_file(compiled_script_info.path, compiled_script_info.data, false);
        skip();
    }
}
