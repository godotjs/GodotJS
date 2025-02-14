#include "jsb_resource_loader.h"

#include "jsb_script_language.h"
#include "jsb_script.h"

Ref<Resource> ResourceFormatLoaderGodotJSScript::load(const String& p_path, const String& p_original_path, Error* r_error, bool p_use_sub_threads, float* r_progress, CacheMode p_cache_mode)
{
    JSB_BENCHMARK_SCOPE(ResourceFormatLoaderGodotJSScript, load);

    //TODO handle script cache issues (used by Worker)

    {
        //TODO a dirty but approaching solution for hot-reloading
        MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
        SelfList<GodotJSScript> *elem = GodotJSScriptLanguage::singleton_->script_list_.first();
        while (elem)
        {
            //TODO need to handle duplicate scripts if GodotJSScript is implemented as thread-wide (not implemented yet)
            if (elem->self()->get_path() == p_path)
            {
                if (p_cache_mode != CACHE_MODE_REUSE)
                {
                    elem->self()->load_source_code_from_path();
                }

                //TODO temporarily ignore it, we are trying to implement scripts in worker threads which may be better not to reuse an existing script reference
                if (p_cache_mode == CACHE_MODE_REUSE)
                {
                    return Ref(elem->self());
                }
            }
            elem = elem->next();
        }
    }

#ifdef TOOLS_ENABLED
    // only check the source file in editor mode since .ts source code is not required in runtime mode
    if (Engine::get_singleton()->is_editor_hint() && !FileAccess::exists(p_path))
    {
        if (r_error) *r_error = ERR_FILE_NOT_FOUND;
        return {};
    }
#endif
    jsb_check(p_path.ends_with(JSB_TYPESCRIPT_EXT) || p_path.ends_with(JSB_JAVASCRIPT_EXT));

    // in case `node_modules` is not ignored (which is not expected though), we do not want any GodotJSScript to be generated from it.
    if (p_path.begins_with("res://node_modules"))
    {
        if (r_error) *r_error = ERR_CANT_RESOLVE;
        return {};
    }
    if (p_path.ends_with("." JSB_DTS_EXT))
    {
        if (r_error) *r_error = ERR_FILE_UNRECOGNIZED;
        return {};
    }
    JSB_LOG(VeryVerbose, "loading script resource %s on thread %s", p_path, uitos(Thread::get_caller_id()));

    // return a skeleton script which only contains path and source code without actually loaded in `realm` since `load` may called from background threads
    Ref<GodotJSScript> spt;
    spt.instantiate();
    spt->attach_source(p_path);
    if (r_error) *r_error = OK;
    return spt;
}

void ResourceFormatLoaderGodotJSScript::get_recognized_extensions(List<String>* p_extensions) const
{
    p_extensions->push_back(JSB_TYPESCRIPT_EXT);
    p_extensions->push_back(JSB_JAVASCRIPT_EXT);
}

bool ResourceFormatLoaderGodotJSScript::handles_type(const String& p_type) const
{
    return (p_type == "Script" || p_type == jsb_typename(GodotJSScript));
}

String ResourceFormatLoaderGodotJSScript::get_resource_type(const String& p_path) const
{
    const String el = p_path.get_extension().to_lower();
    return (el == JSB_TYPESCRIPT_EXT || el == JSB_JAVASCRIPT_EXT) ? jsb_typename(GodotJSScript) : "";
}

void ResourceFormatLoaderGodotJSScript::get_dependencies(const String& p_path, List<String>* p_dependencies, bool p_add_types)
{
    //TODO
}
