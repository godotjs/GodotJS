#include "jsb_resource_loader.h"

#include "jsb_script_language.h"
#include "jsb_script.h"


void ResourceFormatLoaderGodotJSScript::register_resource_extension(String ext, GodotJSScriptLanguage * lang)
{
    lang_map_.insert(ext, lang);
}

Ref<Resource> ResourceFormatLoaderGodotJSScript::load(const String& p_path, const String& p_original_path, Error* r_error, bool p_use_sub_threads, float* r_progress, CacheMode p_cache_mode)
{
    JSB_BENCHMARK_SCOPE(ResourceFormatLoaderGodotJSScript, load);

    GodotJSScriptLanguage * lang = nullptr;
    for (auto const & i: lang_map_) {
        if (p_path.ends_with(i.key)) {
            lang = i.value;
            break;
        }
    }

    if (!lang) {
        if (r_error) *r_error = ERR_FILE_UNRECOGNIZED;
        return {};
    }

    {
        //TODO a dirty but approaching solution for hot-reloading
        MutexLock lock(lang->mutex_);
        SelfList<GodotJSScript> *elem = lang->script_list_.first();
        while (elem)
        {
            if (elem->self()->get_path() == p_path)
            {
                if (p_cache_mode == CACHE_MODE_IGNORE)
                {
                    elem->self()->load_source_code_from_path();
                }
                return Ref(elem->self());
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

    // in case `node_modules` is not ignored (which is not expected though), we do not want any GodotJSScript to be generated from it.
    if (p_path.begins_with("res://node_modules"))
    {
        if (r_error) *r_error = ERR_CANT_RESOLVE;
        return {};
    }
    // exclude this extension
    if (p_path.ends_with("." JSB_DTS_EXT))
    {
        if (r_error) *r_error = ERR_FILE_UNRECOGNIZED;
        return {};
    }
    JSB_LOG(VeryVerbose, "loading script resource %s on thread %s", p_path, uitos(Thread::get_caller_id()));

    // return a skeleton script which only contains path and source code without actually loaded in `realm` since `load` may called from background threads
    Ref<GodotJSScript> spt = reinterpret_cast<GodotJSScript*>(lang->create_script());
    spt->attach_source(p_path);
    if (r_error) *r_error = OK;
    return spt;
}

void ResourceFormatLoaderGodotJSScript::get_recognized_extensions(List<String>* p_extensions) const
{
    for (auto const & i: lang_map_) {
        p_extensions->push_back(i.key);
    }
}

bool ResourceFormatLoaderGodotJSScript::handles_type(const String& p_type) const
{
    if (p_type == "Script")
        return true;
    for (auto const & i: lang_map_) {
        if (p_type == i.value->get_type())
            return true;
    }
    return false;
}

String ResourceFormatLoaderGodotJSScript::get_resource_type(const String& p_path) const
{
    const String el = p_path.get_extension().to_lower();
    for (auto const & i: lang_map_) {
        if (el == i.key)
            return i.value->get_type();
    }
    return "";
}

void ResourceFormatLoaderGodotJSScript::get_dependencies(const String& p_path, List<String>* p_dependencies, bool p_add_types)
{
    //TODO
}
