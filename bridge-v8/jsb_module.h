#ifndef GODOTJS_MODULE_H
#define GODOTJS_MODULE_H

#include "jsb_pch.h"
#include "../internal/jsb_variant_util.h"

namespace jsb
{
    namespace EReloadResult
    {
        enum Type
        {
            NoSuchModule,
            NoChanges,
            Requested,
            Disabled,
        };
    }

    struct JavaScriptModule
    {
        StringName id;

        // asset path
        String path;

        //
        ScriptClassID default_class_id;

        v8::Global<v8::Object> module;
        v8::Global<v8::Value> exports;

#if JSB_SUPPORT_RELOAD
        bool reload_requested = false;
        uint64_t time_modified = 0;
        String hash;

        jsb_force_inline bool is_loaded() const { return !reload_requested; }
#else
        jsb_force_inline bool is_loaded() const { return true; }
#endif

        void on_load(v8::Isolate* isolate, const v8::Local<v8::Context>& context);
    };

    struct JavaScriptModuleCache
    {
    private:
        friend class Realm;

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

        jsb_force_inline v8::Local<v8::Object> unwrap(v8::Isolate* isolate) const
        {
            return cache_object_.Get(isolate);
        }

    };

}

#endif
