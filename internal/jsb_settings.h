#ifndef GODOTJS_SETTINGS_H
#define GODOTJS_SETTINGS_H

#include <cstdint>
#include "core/string/ustring.h"
#include "core/variant/variant.h"

namespace jsb::internal
{
    class Settings
    {
    public:
        static uint16_t get_debugger_port();
        static bool get_sourcemap_enabled();

        /**
         * get the project relative path for `outDir` (it refers to `.godot/GodotJS` by default)
         */
        static String get_jsb_out_dir_name();

        /**
         * get path for .tsbuildinfo (.godot/.tsbuildinfo)
         */
        static String get_tsbuildinfo_path();

        /**
         * get the res path for `outDir`, it's equivalent to `res://` + get_jsb_out_dir_name()
         */
        static String get_jsb_out_res_path();

        static String get_indentation();

        static String get_project_data_dir_name();

        static PackedStringArray get_additional_search_paths();

        static String get_entry_script_path();

        static bool is_packaging_with_source_map();

        static PackedStringArray get_packaging_include_files();

#ifdef TOOLS_ENABLED
        // [EDITOR ONLY]
        static PackedStringArray get_ignored_classes();
#endif
    };
}

#endif
