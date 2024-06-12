#include "jsb_module.h"
#include "jsb_v8_helper.h"
#include "jsb_environment.h"

namespace jsb
{
    void JavaScriptModule::on_load(v8::Isolate* isolate, const v8::Local<v8::Context>& context)
    {
        Environment* environment = Environment::wrap(isolate);
        module.Get(isolate)->Set(context, environment->GetStringValue(loaded), v8::Boolean::New(isolate, true)).Check();
    }

    JavaScriptModule& JavaScriptModuleCache::insert(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& p_name, bool p_main_candidate, bool p_init_loaded)
    {
        jsb_checkf(!((String) p_name).is_empty(), "empty module name is not allowed");
        jsb_checkf(!find(p_name), "duplicated module name %s", p_name);
        if (p_main_candidate && !internal::VariantUtil::is_valid(main_))
        {
            main_ = p_name;
            JSB_LOG(Verbose, "load main module %s", p_name);
        }
        else
        {
            JSB_LOG(VeryVerbose, "loading module %s", p_name);
        }

        Environment* environment = Environment::wrap(isolate);
        JavaScriptModule* module = memnew(JavaScriptModule);
        v8::Local<v8::Object> module_obj = v8::Object::New(isolate);
        v8::Local<v8::String> module_id = V8Helper::to_string(isolate, p_name);
        modules_.insert(p_name, module);

        // register the new module obj into module_cache obj
        cache_object_.Get(isolate)->Set(context, module_id, module_obj).Check();

        // init the new module obj
        module_obj->Set(context, environment->GetStringValue(id), module_id).Check();
        module_obj->Set(context, environment->GetStringValue(loaded), v8::Boolean::New(isolate, p_init_loaded)).Check();

        module->id = p_name;
        module->module.Reset(isolate, module_obj);
        return *module;
    }

}
