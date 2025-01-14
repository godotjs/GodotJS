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

static Ref<ResourceFormatLoaderGodotJSScript> resource_loader;
static Ref<ResourceFormatSaverGodotJSScript> resource_saver;

void jsb_initialize_module(ModuleInitializationLevel p_level)
{
    if (p_level == MODULE_INITIALIZATION_LEVEL_SERVERS)
    {
        GDREGISTER_CLASS(GodotJSScript);
        GDREGISTER_CLASS(GodotJavaScript);

        jsb::impl::GlobalInitialize::init();

        // register javascript language
        ScriptServer::register_language(GodotJSScriptLanguage::create_singleton());
        ScriptServer::register_language(GodotJavascriptLanguage::create_singleton());

        resource_loader.instantiate();
        resource_loader->register_resource_extension(JSB_TYPESCRIPT_EXT, GodotJSScriptLanguage::get_singleton());
        resource_loader->register_resource_extension(JSB_JAVASCRIPT_EXT, GodotJavascriptLanguage::get_singleton());
        ResourceLoader::add_resource_format_loader(resource_loader);

        resource_saver.instantiate();
        ResourceSaver::add_resource_format_saver(resource_saver);


#ifdef TOOLS_ENABLED
        EditorNode::add_init_callback([]
        {
            GodotJSEditorPlugin* plugin = memnew(GodotJSEditorPlugin(GodotJSScriptLanguage::get_singleton()));
            EditorNode::add_editor_plugin(plugin);

            Ref<GodotJSExportPlugin> exporter;
            exporter.instantiate(GodotJSScriptLanguage::get_singleton()->get_environment());
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

        ScriptServer::unregister_language(GodotJSScriptLanguage::get_singleton());
        GodotJSScriptLanguage::destroy_singleton();

        ScriptServer::unregister_language(GodotJavascriptLanguage::get_singleton());
        GodotJavascriptLanguage::destroy_singleton();
    }
}
