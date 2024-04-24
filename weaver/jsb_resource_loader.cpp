#include "jsb_resource_loader.h"

#include "jsb_gdjs_lang.h"
#include "jsb_gdjs_script.h"
#include "jsb_weaver_consts.h"

Ref<Resource> ResourceFormatLoaderGodotJSScript::load(const String& p_path, const String& p_original_path, Error* r_error, bool p_use_sub_threads, float* r_progress, CacheMode p_cache_mode)
{
    //TODO use Realm to resolve?
    Error err;
    jsb_check(p_path.ends_with(JSB_RES_EXT));
    const String code = FileAccess::get_file_as_string(p_path, &err);
    if (err != OK)
    {
        if (r_error) *r_error = err;
        return {};
    }
    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    std::shared_ptr<jsb::Realm> realm = lang->get_context();
    err = realm->load(p_path);
    if (err != OK)
    {
        if (r_error) *r_error = err;
        return {};
    }
    const jsb::JavaScriptModuleCache& module_cache = realm->get_module_cache();
    if (jsb::JavaScriptModule* module = module_cache.find(p_path))
    {
        if (module->default_class_id)
        {
            Ref<GodotJSScript> spt;
            spt.instantiate();
            spt->attach_source(realm, p_path, code, module->default_class_id);
            return spt;
        }
        JSB_LOG(Error, "no godot js class defined as default exported in module '%s'", p_path);
    }

    if (r_error) *r_error = FAILED;
    return {};
}

void ResourceFormatLoaderGodotJSScript::get_recognized_extensions(List<String>* p_extensions) const
{
    p_extensions->push_back(JSB_RES_EXT);
}

bool ResourceFormatLoaderGodotJSScript::handles_type(const String& p_type) const
{
    return (p_type == "Script" || p_type == JSB_RES_TYPE);
}

String ResourceFormatLoaderGodotJSScript::get_resource_type(const String& p_path) const
{
    const String el = p_path.get_extension().to_lower();
    return el == JSB_RES_EXT ? JSB_RES_TYPE : "";
}

void ResourceFormatLoaderGodotJSScript::get_dependencies(const String& p_path, List<String>* p_dependencies, bool p_add_types)
{
    //TODO
}
