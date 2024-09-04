#include "jsb_settings.h"

#include "core/config/engine.h"
#include "core/config/project_settings.h"
#include "core/variant/variant.h"
#include "editor/editor_settings.h"

#include "jsb_internal_pch.h"

#define JSB_SET_RESTART(val) (val)
#define JSB_SET_IGNORE_DOCS(val) (val)
#define JSB_SET_BASIC(val) (val)
#define JSB_SET_INTERNAL(val) (val)

namespace jsb::internal
{
    static constexpr char kEdDebuggerPort[] =     JSB_MODULE_NAME_STRING "/debugger/editor_port";
    static constexpr char kRtDebuggerPort[] =     JSB_MODULE_NAME_STRING "/debugger/runtime_port";
    static constexpr char kRtSourceMapEnabled[] = JSB_MODULE_NAME_STRING "/logger/source_map_enabled";
    static constexpr char kRtPackagingWithSourceMap[] = JSB_MODULE_NAME_STRING "/packaging/source_map_included";

    void init_settings()
    {
        static bool inited = false;
        if (!inited)
        {
            inited = true;
            // EDITOR_DEF(kEdDebuggerPort, 9230);
            _GLOBAL_DEF(kEdDebuggerPort, 9230, JSB_SET_RESTART(true), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(false), JSB_SET_INTERNAL(false));
            _GLOBAL_DEF(kRtDebuggerPort, 9229, JSB_SET_RESTART(true), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(false), JSB_SET_INTERNAL(false));
            _GLOBAL_DEF(kRtSourceMapEnabled, true, JSB_SET_RESTART(false), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));
            _GLOBAL_DEF(kRtPackagingWithSourceMap, true, JSB_SET_RESTART(false), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));
        }
    }

    uint16_t Settings::get_debugger_port()
    {
        //TODO temporarily use project settings for debugger port in editor mode due to unexpected EditorSettings singleton initialization flow
        init_settings();
        return Engine::get_singleton()->is_editor_hint()
            // ? EDITOR_GET(kEdDebuggerPort)
            ? GLOBAL_GET(kEdDebuggerPort)
            : GLOBAL_GET(kRtDebuggerPort);
    }

    bool Settings::get_sourcemap_enabled()
    {
        return GLOBAL_GET(kRtSourceMapEnabled);
    }

    bool Settings::is_packaging_with_source_map()
    {
        return GLOBAL_GET(kRtPackagingWithSourceMap);
    }

    String Settings::get_jsb_out_dir_name()
    {
        return ProjectSettings::get_singleton()->get_project_data_dir_name().path_join(JSB_MODULE_NAME_STRING);
    }

    String Settings::get_tsbuildinfo_path()
    {
        return ProjectSettings::get_singleton()->get_project_data_dir_name().path_join(".tsbuildinfo");
    }

    String Settings::get_jsb_out_res_path()
    {
        return "res://" + get_jsb_out_dir_name();
    }

    String Settings::get_indentation()
    {
#ifdef TOOLS_ENABLED
        if (Engine::get_singleton()->is_editor_hint())
        {
            // use_space_indentation
            if (!!EDITOR_GET("text_editor/behavior/indent/type"))
            {
                const int indent_size = EDITOR_GET("text_editor/behavior/indent/size");
                return String(" ").repeat(indent_size);
            }
        }
#endif
        return "\t";
    }

}
