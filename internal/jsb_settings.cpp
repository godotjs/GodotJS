#include "jsb_settings.h"

#include "jsb_internal_pch.h"
#include "jsb_macros.h"
#include "jsb_logger.h"

#define JSB_SET_RESTART(val) (val)
#define JSB_SET_IGNORE_DOCS(val) (val)
#define JSB_SET_BASIC(val) (val)
#define JSB_SET_INTERNAL(val) (val)

namespace jsb::internal
{
#ifdef TOOLS_ENABLED
    static constexpr char kEdDebuggerPort[] =     JSB_MODULE_NAME_STRING "/debugger/editor_port";
    static constexpr char kEdIgnoredClasses[] =     JSB_MODULE_NAME_STRING "/codegen/ignored_classes";
    static constexpr char kEdAutogenPath[] =     JSB_MODULE_NAME_STRING "/codegen/autogen_path";
    static constexpr char kEdAutogenSceneDTSOnSave[] =     JSB_MODULE_NAME_STRING "/codegen/autogen_scene_dts_on_save";
    static constexpr char kEdGenSceneDTS[] =     JSB_MODULE_NAME_STRING "/codegen/generate_scene_dts";
    static constexpr char kEdAutogenResourceDTSOnSave[] =     JSB_MODULE_NAME_STRING "/codegen/autogen_resource_dts_on_save";
    static constexpr char kEdGenResourceDTS[] =     JSB_MODULE_NAME_STRING "/codegen/generate_resource_dts";
    static constexpr char kEdCodegenUseProjectSettings[] =     JSB_MODULE_NAME_STRING "/codegen/use_project_settings";
#endif

    // use unnecessary first category layer (runtime and editor) to make the second layer shown as sections in project settings

    static constexpr char kRtDebuggerPort[] =     JSB_MODULE_NAME_STRING "/runtime/debugger/debugger_port";
    static constexpr char kRtSourceMapEnabled[] = JSB_MODULE_NAME_STRING "/runtime/logger/source_map_enabled";
    static constexpr char kRtAdditionalSearchPaths[] = JSB_MODULE_NAME_STRING "/runtime/core/additional_search_paths";
    static constexpr char kRtEntryScriptPath[] = JSB_MODULE_NAME_STRING "/runtime/core/entry_script_path";
    static constexpr char kRtCamelCaseBindingsEnabled[] = JSB_MODULE_NAME_STRING "/runtime/core/camel_case_bindings_enabled";

    // editor specific settings, but we need it configured as project-wise instead of global-wise
    static constexpr char kRtPackagingWithSourceMap[] = JSB_MODULE_NAME_STRING "/editor/packaging/source_map_included";
    static constexpr char kRtPackagingIncludeFiles[] = JSB_MODULE_NAME_STRING "/editor/packaging/include_files";
    static constexpr char kRtPackagingIncludeDirectories[] = JSB_MODULE_NAME_STRING "/editor/packaging/include_directories";
    static constexpr char kRtPackagingReferencedNodeModules[] = JSB_MODULE_NAME_STRING "/editor/packaging/referenced_node_modules";

#ifdef TOOLS_ENABLED
    bool init_editor_settings()
    {
        static bool inited = false;
        if (!inited)
        {
            if (!EditorSettings::get_singleton())
            {
                if (Engine::get_singleton()->is_editor_hint() || Engine::get_singleton()->is_project_manager_hint() || jsb_ext_is_cmdline_tool())
                {
                    EditorSettings::create();
                    jsb_check(EditorSettings::get_singleton());
                }
                else
                {
                    JSB_LOG(Verbose, "EditorSettings is not available when initialising %s", jsb_typename(jsb::internal::Settings));
                }
            }

            // check before read to avoid redundant warnings
            if (EditorSettings::get_singleton())
            {
                inited = true;
                _EDITOR_DEF(kEdDebuggerPort, 9230, true);
                _EDITOR_DEF(kEdIgnoredClasses, PackedStringArray(), false);
                _EDITOR_DEF(kEdAutogenPath, "gen/godot", false);
                _EDITOR_DEF(kEdGenSceneDTS, true, false);
                _EDITOR_DEF(kEdAutogenSceneDTSOnSave, true, false);
                _EDITOR_DEF(kEdGenResourceDTS, true, false);
                _EDITOR_DEF(kEdAutogenResourceDTSOnSave, true, false);
                _EDITOR_DEF(kEdCodegenUseProjectSettings, true, false);
            }
        }
        return inited;
    }
#endif

    void init_settings()
    {
        static bool inited = false;
        if (!inited)
        {
            inited = true;
            static constexpr char filter[] = "*." JSB_JAVASCRIPT_EXT
#if JSB_USE_TYPESCRIPT
                                            ",*." JSB_TYPESCRIPT_EXT
#endif
            ;

            _GLOBAL_DEF(kRtDebuggerPort, 9229, JSB_SET_RESTART(true), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(false), JSB_SET_INTERNAL(false));
            _GLOBAL_DEF(kRtSourceMapEnabled, true, JSB_SET_RESTART(false), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));
            _GLOBAL_DEF(kRtAdditionalSearchPaths, PackedStringArray(), JSB_SET_RESTART(false),  JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));
            _GLOBAL_DEF(kRtCamelCaseBindingsEnabled, false, JSB_SET_RESTART(true), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));

            {
                PropertyInfo EntryScriptPath;
                EntryScriptPath.type = Variant::STRING;
                EntryScriptPath.name = kRtEntryScriptPath;
                EntryScriptPath.hint = PROPERTY_HINT_FILE;
                EntryScriptPath.hint_string = filter;
                _GLOBAL_DEF(EntryScriptPath, String(), JSB_SET_RESTART(false), JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));
            }

            _GLOBAL_DEF(kRtPackagingWithSourceMap, true, false);

            {
                PropertyInfo PackagingIncludeFiles;
                PackagingIncludeFiles.type = Variant::ARRAY;
                PackagingIncludeFiles.name = kRtPackagingIncludeFiles;
                PackagingIncludeFiles.hint = PROPERTY_HINT_ARRAY_TYPE;
                PackagingIncludeFiles.hint_string = vformat("%s/%s:%s", Variant::STRING, PROPERTY_HINT_FILE, filter);
                _GLOBAL_DEF(PackagingIncludeFiles, Array(), false, JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));
            }

            {
                PropertyInfo PackagingIncludeDirectories;
                PackagingIncludeDirectories.type = Variant::ARRAY;
                PackagingIncludeDirectories.name = kRtPackagingIncludeDirectories;
                PackagingIncludeDirectories.hint = PROPERTY_HINT_ARRAY_TYPE;
                PackagingIncludeDirectories.hint_string = vformat("%s/%s:%s", Variant::STRING, PROPERTY_HINT_DIR, filter);
                _GLOBAL_DEF(PackagingIncludeDirectories, Array(), false, JSB_SET_IGNORE_DOCS(false), JSB_SET_BASIC(true),  JSB_SET_INTERNAL(false));
            }

            _GLOBAL_DEF(kRtPackagingReferencedNodeModules, true, false);
        }
    }

#ifdef TOOLS_ENABLED
    bool Settings::editor_settings_available()
    {
        return EditorSettings::get_singleton() != nullptr || Engine::get_singleton()->is_editor_hint() || Engine::get_singleton()->is_project_manager_hint() || jsb_ext_is_cmdline_tool();
    }

    PackedStringArray Settings::get_ignored_classes()
    {
        init_editor_settings();
        return EDITOR_GET(kEdIgnoredClasses);
    }

    String Settings::get_autogen_path()
    {
        init_editor_settings();
        return EDITOR_GET(kEdAutogenPath);
    }

    bool Settings::get_autogen_scene_dts_on_save()
    {
        init_editor_settings();
        return EDITOR_GET(kEdAutogenSceneDTSOnSave);
    }

    bool Settings::get_gen_scene_dts()
    {
        init_editor_settings();
        return EDITOR_GET(kEdGenSceneDTS);
    }

    bool Settings::get_autogen_resource_dts_on_save()
    {
        init_editor_settings();
        return EDITOR_GET(kEdAutogenResourceDTSOnSave);
    }

    bool Settings::get_gen_resource_dts()
    {
        init_editor_settings();
        return EDITOR_GET(kEdGenResourceDTS);
    }

    bool Settings::get_codegen_use_project_settings()
    {
        init_editor_settings();
        return EDITOR_GET(kEdCodegenUseProjectSettings);
    }
#endif

    bool Settings::is_packaging_with_source_map()
    {
        init_settings();
        return GLOBAL_GET(kRtPackagingWithSourceMap);
    }

    PackedStringArray Settings::get_packaging_include_files()
    {
        init_settings();
        // rely on auto variant convert from Array
        return (PackedStringArray) GLOBAL_GET(kRtPackagingIncludeFiles);
    }

    PackedStringArray Settings::get_packaging_include_directories()
    {
        init_settings();
        // rely on auto variant convert from Array
        return (PackedStringArray) GLOBAL_GET(kRtPackagingIncludeDirectories);
    }

    bool Settings::is_packaging_referenced_node_modules()
    {
        init_settings();
        return GLOBAL_GET(kRtPackagingReferencedNodeModules);
    }

    uint16_t Settings::get_debugger_port()
    {
#ifdef TOOLS_ENABLED
        if (Engine::get_singleton()->is_editor_hint())
        {
            init_editor_settings();
            return EDITOR_GET(kEdDebuggerPort);
        }
#endif
        init_settings();
        return GLOBAL_GET(kRtDebuggerPort);
    }

    bool Settings::get_sourcemap_enabled()
    {
        init_settings();
        return GLOBAL_GET(kRtSourceMapEnabled);
    }

    String Settings::get_project_data_dir_name()
    {
        const String project_data_dir = ProjectSettings::get_singleton()->get_project_data_dir_name();
        jsb_check(!project_data_dir.is_empty());
        return project_data_dir;
    }

    String Settings::get_jsb_out_dir_name()
    {
        return get_project_data_dir_name().path_join(JSB_MODULE_NAME_STRING);
    }

    String Settings::get_tsbuildinfo_path()
    {
        return get_project_data_dir_name().path_join(".tsbuildinfo");
    }

    String Settings::get_jsb_out_res_path()
    {
        return "res://" + get_jsb_out_dir_name();
    }

    PackedStringArray Settings::get_additional_search_paths()
    {
        init_settings();
        return GLOBAL_GET(kRtAdditionalSearchPaths);
    }

    String Settings::get_entry_script_path()
    {
        init_settings();
        return GLOBAL_GET(kRtEntryScriptPath);
    }

    bool Settings::get_camel_case_bindings_enabled()
    {
        init_settings();
        return GLOBAL_GET(kRtCamelCaseBindingsEnabled);
    }

    String Settings::get_indentation()
    {
#ifdef TOOLS_ENABLED
        if (Engine::get_singleton()->is_editor_hint())
        {
            init_settings();
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
