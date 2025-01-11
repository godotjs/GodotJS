#include "register_types.h"

#include "weaver/jsb_script_language.h"
#include "weaver/jsb_script.h"
#include "weaver/jsb_resource_loader.h"
#include "weaver/jsb_resource_saver.h"

#ifdef TOOLS_ENABLED
#include "editor/editor_node.h"
#include "editor/export/editor_export.h"
#include "weaver-editor/jsb_editor_plugin.h"
#include "weaver-editor/jsb_export_plugin.h"
#endif

static GodotJSScriptLanguage* script_language_js;
static Ref<ResourceFormatLoaderGodotJSScript> resource_loader;
static Ref<ResourceFormatSaverGodotJSScript> resource_saver;

void jsb_initialize_module(ModuleInitializationLevel p_level)
{
    if (p_level == MODULE_INITIALIZATION_LEVEL_SERVERS)
    {
        GDREGISTER_CLASS(GodotJSScript);

        jsb::impl::GlobalInitialize::init();

        // register javascript language
        script_language_js = memnew(GodotJSScriptLanguage());
        ScriptServer::register_language(script_language_js);

        resource_loader.instantiate();
        resource_loader->register_resource_extension(JSB_TYPESCRIPT_EXT, script_language_js);
        resource_loader->register_resource_extension(JSB_JAVASCRIPT_EXT, script_language_js);
        ResourceLoader::add_resource_format_loader(resource_loader);

        resource_saver.instantiate();
        ResourceSaver::add_resource_format_saver(resource_saver);

#ifdef TOOLS_ENABLED
        EditorNode::add_init_callback([]
        {
            GodotJSEditorPlugin* plugin = memnew(GodotJSEditorPlugin);
            EditorNode::add_editor_plugin(plugin);

            Ref<GodotJSExportPlugin> exporter;
            exporter.instantiate(script_language_js->get_environment());
            EditorExport::get_singleton()->add_export_plugin(exporter);

            plugin->set_name(jsb_typename(GodotJSEditorPlugin));
        });
#endif
    }
}

void jsb_uninitialize_module(ModuleInitializationLevel p_level)
{
    if (p_level == MODULE_INITIALIZATION_LEVEL_CORE)
    {
        ResourceLoader::remove_resource_format_loader(resource_loader);
        resource_loader.unref();

        ResourceSaver::remove_resource_format_saver(resource_saver);
        resource_saver.unref();

        jsb_check(script_language_js);
        ScriptServer::unregister_language(script_language_js);
        memdelete(script_language_js);
    }
}
