#ifndef GODOTJS_ENGINE_COMPAT_H
#define GODOTJS_ENGINE_COMPAT_H

#include "jsb_engine_version_comparison.h"
#include "../jsb.config.h"

#if defined(__GNUC__) || defined(__clang__)
    #define jsb_force_inline __attribute__((always_inline))
#elif defined(_MSC_VER)
    #define jsb_force_inline __forceinline
#else
    #define jsb_force_inline
#endif

#if JSB_GDEXTENSION
    #define jsb_ext_print_rich(Content) ::godot::UtilityFunctions::print_rich(jsb_format("\u001b[90m%s\u001b[39m\n", Content))
    #define jsb_ext_print_line(Content) ::godot::UtilityFunctions::print(Content)
    #define jsb_ext_print_error(Function, File, Line, Error, EditorNotify, IsWarning) ::godot::_err_print_error(Function, File, Line, Error, EditorNotify, IsWarning)
    #define jsb_ext_type_convert(Value, Type) ::godot::UtilityFunctions::type_convert(Value, Type)
    #define jsb_ext_error_string(Error) ::godot::UtilityFunctions::error_string(Error)
    #define jsb_ext_is_cmdline_tool() false
#else
    #define jsb_ext_print_rich(Content) ::OS::get_singleton()->print_rich("\u001b[90m%s\u001b[39m\n", Content)
    #define jsb_ext_print_line(Content) ::print_line(Content)
    #define jsb_ext_print_error(Function, File, Line, Error, EditorNotify, IsWarning) ::_err_print_error(Function, File, Line, Error, EditorNotify, IsWarning ? ERR_HANDLER_WARNING : ERR_HANDLER_ERROR)
    #define jsb_ext_type_convert(Value, Type) ::VariantUtilityFunctions::type_convert(Value, Type)
    #define jsb_ext_error_string(Error) ::VariantUtilityFunctions::error_string(Error)
    #define jsb_ext_is_cmdline_tool() ::Main::is_cmdline_tool()
#endif

#if GODOT_4_3_OR_NEWER
    #define ConstStringRefCompat const String&
    #define ConstStringNameRefCompat const StringName&
#else
    #define ConstStringRefCompat String
    #define ConstStringNameRefCompat StringName
#endif

#if JSB_GDEXTENSION

    #include <gdextension_interface.h>
    #include <godot_cpp/core/defs.hpp>

    #include <godot_cpp/variant/utility_functions.hpp>
    #include <godot_cpp/variant/variant.hpp>
    #include <godot_cpp/variant/string.hpp>
    #include <godot_cpp/templates/spin_lock.hpp>
    #include <godot_cpp/templates/vector.hpp>
    #include <godot_cpp/templates/hash_map.hpp>
    #include <godot_cpp/templates/rb_set.hpp>
    #include <godot_cpp/core/memory.hpp>
    #include <godot_cpp/core/object.hpp>

    #include <godot_cpp/classes/file_access.hpp>
    #include <godot_cpp/classes/dir_access.hpp>
    #include <godot_cpp/classes/thread.hpp>
    #include <godot_cpp/classes/engine.hpp>
    #include <godot_cpp/classes/os.hpp>
    #include <godot_cpp/classes/project_settings.hpp>
    #include <godot_cpp/classes/editor_settings.hpp>
    #include <godot_cpp/classes/editor_interface.hpp>
    #include <godot_cpp/classes/json.hpp>
    #include <godot_cpp/classes/button.hpp>
    #include <godot_cpp/classes/packed_scene.hpp>
    #include <godot_cpp/classes/performance.hpp>
    #include <godot_cpp/classes/reg_ex.hpp>

using namespace godot;

namespace jsb::compat
{
    typedef godot::ObjectDB ObjectDB;
    typedef godot::Performance Performance;
} // namespace jsb::compat

Variant EDITOR_GET(const String& p_setting)
{
    if (EditorInterface::get_singleton())
    {
        Ref settings = EditorInterface::get_singleton()->get_editor_settings();
        if (settings.is_valid() && settings->has_setting(p_setting))
        {
            return settings->get_setting(p_setting);
        }
    }
    return Variant();
}

    #ifndef GLOBAL_GET
        #define GLOBAL_GET(m_var) ProjectSettings::get_singleton()->get_setting_with_override(m_var)
    #endif

    #ifndef EDSCALE
        #define EDSCALE EditorInterface::get_singleton()->get_editor_scale()
    #endif

template <size_t N>
jsb_force_inline StringName _scs_create(const char (&literal)[N], bool p_static)
{
    return N > 0 && p_chr[0] ? StringName((const char*) p_chr, p_static) : StringName();
}

#else // MODULE

    #include "core/variant/variant.h"
    #include "core/variant/variant_utility.h"
    #include "core/os/spin_lock.h"
    #include "core/os/memory.h"
    #include "core/os/os.h"
    #include "core/os/thread.h"
    #include "core/io/json.h"
    #include "core/io/file_access.h"
    #include "core/io/dir_access.h"
    #include "core/io/resource_saver.h"
    #include "core/io/resource_loader.h"
    #include "core/config/engine.h"
    #include "core/config/project_settings.h"
    #include "core/object/object.h"
    #include "core/object/class_db.h"
    #include "core/object/script_language.h"
    #include "core/templates/vector.h"
    #include "core/templates/hash_map.h"
    #include "core/templates/rb_set.h"
    #include "core/string/ustring.h"
    #include "core/string/print_string.h"
    #include "core/core_constants.h"
    #include "core/version.h"
    #include "core/string/string_builder.h"
    #include "core/error/error_list.h"

    #include "main/main.h"
    #include "main/performance.h"

    #include "modules/regex/regex.h"

    #include "scene/main/node.h"
    #include "scene/resources/packed_scene.h"
    #include "scene/scene_string_names.h"
    #include "scene/gui/dialogs.h"
    #include "scene/gui/tree.h"
    #include "scene/gui/tab_container.h"
    #include "scene/gui/box_container.h"
    #include "scene/gui/button.h"
    #include "scene/gui/item_list.h"
    #include "scene/gui/line_edit.h"
    #include "scene/gui/rich_text_label.h"
    #include "scene/gui/popup_menu.h"

    #ifdef TOOLS_ENABLED
        #if GODOT_4_5_OR_NEWER
            #include "editor/file_system/editor_file_system.h"
            #include "editor/settings/project_settings_editor.h"
            #include "editor/settings/editor_settings.h"
            #include "editor/doc/editor_help.h"
        #else
            #include "editor/editor_file_system.h"
            #include "editor/project_settings_editor.h"
            #include "editor/editor_settings.h"
            #include "editor/editor_help.h"
        #endif
        #include "editor/editor_interface.h"
        #include "editor/editor_node.h"
        #include "editor/editor_string_names.h"
        #include "editor/export/editor_export.h"
        #include "editor/export/editor_export_plugin.h"
        #include "editor/gui/editor_toaster.h"
        #if GODOT_4_3_OR_NEWER
            #include "editor/plugins/editor_plugin.h"
            #include "editor/themes/editor_scale.h"
        #else
            #include "editor/editor_plugin.h"
            #include "editor/editor_scale.h"
        #endif
    #endif

namespace jsb::compat
{
    typedef ::ObjectDB ObjectDB;
    typedef ::Performance Performance;
} // namespace jsb::compat

#endif // JSB_GDEXTENSION

#include "jsb_engine_version_comparison.h"

namespace jsb
{
    struct ButtonCompat
    {
        static void set_icon(Button* self, const Ref<Texture2D>& p_icon)
        {
#if GODOT_4_4_OR_NEWER || (JSB_GDEXTENSION && GODOT_4_3_OR_NEWER)
            self->set_button_icon(p_icon);
#else
            self->set_icon(p_icon);
#endif
        }
    };
} // namespace jsb

#endif
