#include "register_types.h"

#include "weaver/jsb_gdjs_lang.h"
#include "weaver/jsb_resource_loader.h"
#include "weaver/jsb_resource_saver.h"

#if TOOLS_ENABLED
#include "editor/editor_node.h"
#include "weaver-editor/jsb_editor_plugin.h"
#endif

Ref<ResourceFormatLoaderGodotJSScript> resource_loader_js;
Ref<ResourceFormatSaverGodotJSScript> resource_saver_js;

void jsb_initialize_module(ModuleInitializationLevel p_level)
{
    if (p_level == MODULE_INITIALIZATION_LEVEL_SCENE)
    {
    }

    if (p_level == MODULE_INITIALIZATION_LEVEL_CORE)
    {
        // register javascript language
        GodotJSScriptLanguage* script_language_js = memnew(GodotJSScriptLanguage());
	    ScriptServer::register_language(script_language_js);

		resource_loader_js.instantiate();
		ResourceLoader::add_resource_format_loader(resource_loader_js);

		resource_saver_js.instantiate();
		ResourceSaver::add_resource_format_saver(resource_saver_js);

#if TOOLS_ENABLED
        EditorNode::add_init_callback([]
        {
            GodotJSEditorPlugin* plugin = memnew(GodotJSEditorPlugin);
            EditorNode::add_editor_plugin(plugin);
        });
#endif
    }
}

void jsb_uninitialize_module(ModuleInitializationLevel p_level)
{
    if (p_level == MODULE_INITIALIZATION_LEVEL_CORE)
    {
		ResourceLoader::remove_resource_format_loader(resource_loader_js);
		resource_loader_js.unref();

		ResourceSaver::remove_resource_format_saver(resource_saver_js);
		resource_saver_js.unref();

        GodotJSScriptLanguage *script_language_js = GodotJSScriptLanguage::get_singleton();
        jsb_check(script_language_js);
        ScriptServer::unregister_language(script_language_js);
        memdelete(script_language_js);
    }
}
