#include "jsb_resource_loader.h"

#include "jsb_gdjs_lang.h"
#include "jsb_gdjs_script.h"
#include "jsb_weaver_consts.h"

Ref<Resource> ResourceFormatLoaderGodotJSScript::load(const String& p_path, const String& p_original_path, Error* r_error, bool p_use_sub_threads, float* r_progress, CacheMode p_cache_mode)
{
    JSB_BENCHMARK_SCOPE(ResourceFormatLoaderGodotJSScript, load);

    //TODO use Realm to resolve?
    Error err;
    jsb_check(p_path.ends_with(JSB_RES_EXT));
    const String code = FileAccess::get_file_as_string(p_path, &err);
    if (err != OK)
    {
        if (r_error) *r_error = err;
        return {};
    }
    JSB_LOG(VeryVerbose, "loading script resource %s on thread %s", p_path, uitos(Thread::get_caller_id()));

    // return a skeleton script which only contains path and source code without actually loaded in `realm` since `load` may called from background threads
    Ref<GodotJSScript> spt;
    spt.instantiate();
    spt->attach_source(p_path, code);
    if (r_error) *r_error = OK;
    return spt;
}

void ResourceFormatLoaderGodotJSScript::get_recognized_extensions(List<String>* p_extensions) const
{
    p_extensions->push_back(JSB_RES_EXT);
}

bool ResourceFormatLoaderGodotJSScript::handles_type(const String& p_type) const
{
    return (p_type == "Script" || p_type == jsb_typename(GodotJSScript));
}

String ResourceFormatLoaderGodotJSScript::get_resource_type(const String& p_path) const
{
    const String el = p_path.get_extension().to_lower();
    return el == JSB_RES_EXT ? jsb_typename(GodotJSScript) : "";
}

void ResourceFormatLoaderGodotJSScript::get_dependencies(const String& p_path, List<String>* p_dependencies, bool p_add_types)
{
    //TODO
}
