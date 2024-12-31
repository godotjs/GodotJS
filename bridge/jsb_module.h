#ifndef GODOTJS_MODULE_H
#define GODOTJS_MODULE_H

#include "jsb_bridge_pch.h"

namespace jsb
{
    class Environment;

    namespace EReloadResult
    {
        enum Type : uint8_t
        {
            NoSuchModule,
            NoChanges,
            Requested,
            Disabled,
        };
    }

    struct ModuleSourceInfo
    {
        // source file path (also used as the moduleid in module_cache)
        String source_filepath;

        // [optional] filepath of package.json which the source file is indirectly resolved from
        String package_filepath;
    };

    struct JavaScriptModule
    {
        StringName id;

        // asset path
        ModuleSourceInfo source_info;

        v8::Global<v8::Object> module;
        v8::Global<v8::Value> exports;

        // the default class exported in this JS module
        ScriptClassID script_class_id;

#if JSB_SUPPORT_RELOAD && defined(TOOLS_ENABLED)
        bool reload_requested = false;
        uint64_t time_modified = 0;
        String hash;

        jsb_force_inline bool is_loaded() const { return !reload_requested; }

        // can't reload modules if it's time_modified is unknown or non-file modules
        bool is_reloadable() const { return time_modified != 0 && !source_info.source_filepath.is_empty(); }
#else
        jsb_force_inline constexpr bool is_loaded() const { return true; }
        jsb_force_inline constexpr bool is_reloadable() const { return false; }
#endif

        void on_load(v8::Isolate* isolate, const v8::Local<v8::Context>& context);
        bool mark_as_reloading();

    };

    struct JavaScriptModuleCache
    {
    private:
        friend class Environment;

        StringName main_;
        HashMap<StringName, JavaScriptModule*> modules_;
        v8::Global<v8::Object> cache_object_;

    public:
        void init(v8::Isolate* isolate, const v8::Local<v8::Object>& cache_obj)
        {
            cache_object_.Reset(isolate, cache_obj);
        }

        void deinit()
        {
            cache_object_.Reset();
            for (const KeyValue<StringName, JavaScriptModule*>& it : modules_)
            {
                memdelete(it.value);
            }
            modules_.clear();
        }

        jsb_force_inline ~JavaScriptModuleCache()
        {
            jsb_check(cache_object_.IsEmpty());
            jsb_check(modules_.is_empty());
        }

        jsb_force_inline JavaScriptModule* find(const StringName& p_name) const
        {
            JavaScriptModule* const * it = modules_.getptr(p_name);
            return it ? *it : nullptr;
        }

        jsb_force_inline JavaScriptModule* get_main() const
        {
            return find(main_);
        }

        jsb_force_inline bool is_main(const StringName& p_name) const
        {
            return p_name == main_;
        }

        JavaScriptModule& insert(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& p_name, bool p_main_candidate, bool p_init_loaded);
    };

}

#endif
