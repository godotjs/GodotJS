#ifndef GODOTJS_MODULE_H
#define GODOTJS_MODULE_H

#include "jsb_pch.h"

namespace jsb
{
    struct JavaScriptModule
    {
        StringName id;

        // asset path
        String path;

        //
        GodotJSClassID default_class_id;

        v8::Global<v8::Object> module;
        v8::Global<v8::Value> exports;

        bool reload_requested = false;
    };

    struct JavaScriptModuleCache
    {
    private:
        StringName main_;
        HashMap<StringName, JavaScriptModule*> module_cache_;

    public:
        jsb_force_inline ~JavaScriptModuleCache()
        {
            for (KeyValue<StringName, JavaScriptModule*>& it : module_cache_)
            {
                memdelete(it.value);
            }
        }

        jsb_force_inline JavaScriptModule* find(const StringName& p_name) const
        {
            const HashMap<StringName, JavaScriptModule*>::ConstIterator it = module_cache_.find(p_name);
            return it != module_cache_.end() ? it->value : nullptr;
        }

        jsb_force_inline JavaScriptModule* get_main() const
        {
            return find(main_);
        }

        jsb_force_inline bool is_main(const StringName& p_name) const
        {
            return p_name == main_;
        }

        jsb_force_inline JavaScriptModule& insert(const String& p_name, bool p_main_candidate)
        {
            jsb_checkf(!p_name.is_empty(), "empty module name is not allowed");
            jsb_checkf(!find(p_name), "duplicated module name %s", p_name);
            if (p_main_candidate && !((const void*) main_))
            {
                main_ = p_name;
                JSB_LOG(Verbose, "load main module %s", p_name);
            }
            else
            {
                JSB_LOG(Verbose, "loading module %s", p_name);
            }
            JavaScriptModule* module = memnew(JavaScriptModule);
            module_cache_.insert(p_name, module);
            return *module;
        }

    };

}

#endif
