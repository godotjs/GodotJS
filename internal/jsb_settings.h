#ifndef GODOTJS_SETTINGS_H
#define GODOTJS_SETTINGS_H
#include "core/config/engine.h"
#include "core/config/project_settings.h"
#include "core/variant/variant.h"
#include "editor/editor_settings.h"

namespace jsb::internal
{
    class Settings
    {
    public:
        static uint16_t get_debugger_port();
        static bool get_sourcemap_enabled();

        static bool is_packaging_with_source_map();

        // get the project relative path for `outDir` (it's `.godot/jsb` for now)
        static String get_jsb_out_dir_name();

        // get path for .tsbuildinfo (.godot/.tsbuildinfo)
        static String get_tsbuildinfo_path();

        // get the res path for `outDir`, it's equivalent to `res://` + get_jsb_out_dir_name()
        static String get_jsb_out_res_path();

        static String get_indentation();
    };
}

#endif
