#ifndef GODOTJS_RESOURCE_LOADER_H
#define GODOTJS_RESOURCE_LOADER_H

#include "core/io/resource_loader.h"

#include "jsb_script_language.h"

class ResourceFormatLoaderGodotJSScript : public ResourceFormatLoader
{

    ResourceFormatLoaderGodotJSScript(ResourceFormatLoaderGodotJSScript const &) = delete;
    ResourceFormatLoaderGodotJSScript & operator=(ResourceFormatLoaderGodotJSScript const &) = delete;

    HashMap<String, GodotJSScriptLanguage *> lang_map_;

public:
    ResourceFormatLoaderGodotJSScript() { }

    void register_resource_extension(String ext, GodotJSScriptLanguage * lang);

    virtual Ref<Resource> load(const String& p_path, const String& p_original_path = "", Error* r_error = nullptr, bool p_use_sub_threads = false, float* r_progress = nullptr, CacheMode p_cache_mode = CACHE_MODE_REUSE) override;
    virtual void get_recognized_extensions(List<String>* p_extensions) const override;
    virtual bool handles_type(const String& p_type) const override;
    virtual String get_resource_type(const String& p_path) const override;
    virtual void get_dependencies(const String& p_path, List<String>* p_dependencies, bool p_add_types = false) override;
};

#endif
