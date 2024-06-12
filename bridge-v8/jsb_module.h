#ifndef GODOTJS_MODULE_H
#define GODOTJS_MODULE_H

#include "jsb_pch.h"
#include "../internal/jsb_variant_util.h"

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

        void on_load(v8::Isolate* isolate, const v8::Local<v8::Context>& context);
    };

    struct JavaScriptModuleCache
    {
    private:
        StringName main_;
        HashMap<StringName, JavaScriptModule*> modules_;
        v8::Global<v8::Object> cache_object_;

    public:
        void init(v8::Isolate* isolate)
        {
            cache_object_.Reset(isolate, v8::Object::New(isolate));
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
            const HashMap<StringName, JavaScriptModule*>::ConstIterator it = modules_.find(p_name);
            return it != modules_.end() ? it->value : nullptr;
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

        jsb_force_inline v8::Local<v8::Object> unwrap(v8::Isolate* isolate) const
        {
            return cache_object_.Get(isolate);
        }

    };

}

#endif
