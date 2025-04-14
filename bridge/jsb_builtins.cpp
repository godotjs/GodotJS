#include "jsb_builtins.h"

#include "jsb_environment.h"
#include "jsb_amd_module_loader.h"

namespace jsb
{
    void Builtins::_define(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (info.Length() != 3 || !info[0]->IsString() || !info[1]->IsArray() || !info[2]->IsFunction())
        {
            jsb_throw(isolate, "bad param");
            return;
        }
        Environment* env = Environment::wrap(context);
        const StringName module_id_str = env->get_string_name(info[0].As<v8::String>());
        if (!internal::VariantUtil::is_valid_name(module_id_str))
        {
            jsb_throw(isolate, "bad module_id");
            return;
        }
        if (env->module_cache_.find(module_id_str))
        {
            jsb_throw(isolate, "conflicted module_id");
            return;
        }
        const v8::Local<v8::Array> deps_val = info[1].As<v8::Array>();
        Vector<String> deps;
        for (uint32_t index = 0, len = deps_val->Length(); index < len; ++index)
        {
            v8::Local<v8::Value> item;
            if (!deps_val->Get(context, index).ToLocal(&item) || !item->IsString())
            {
                jsb_throw(isolate, "bad param");
                return;
            }

            const String item_str = impl::Helper::to_string(isolate, item);;
            if (item_str.is_empty())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            deps.push_back(item_str);
        }
        JSB_LOG(VeryVerbose, "new AMD module loader %s deps: %s", module_id_str, String(", ").join(deps));
        AMDModuleLoader& loader = env->add_module_loader<AMDModuleLoader>(module_id_str,
            deps, v8::Global<v8::Function>(isolate, info[2].As<v8::Function>()));

        if (info.Data()->IsBoolean())
        {
            loader.set_internal(info.Data()->BooleanValue(isolate));
        }
    }

    void Builtins::_require(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, _require);
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (info.Length() != 1)
        {
            jsb_throw(isolate, "bad argument");
            return;
        }

        const v8::Local<v8::Value> arg0 = info[0];
        if (!arg0->IsString())
        {
            jsb_throw(isolate, "bad argument");
            return;
        }

        // read parent module id from magic data
        const String parent_id = impl::Helper::to_string(isolate, info.Data());
        const String module_id = impl::Helper::to_string(isolate, arg0);
        Environment* env = Environment::wrap(context);

        // the impl should return an empty string for null or undefined value
        jsb_check(!info.Data()->IsNullOrUndefined() || parent_id.is_empty());
        jsb_check(!arg0->IsNullOrUndefined() || module_id.is_empty());

        if (const JavaScriptModule* module = env->_load_module(parent_id, module_id))
        {
            info.GetReturnValue().Set(module->exports);
            return;
        }
        JSB_LOG(Error, "can not load module '%s' (with parent '%s')", module_id, parent_id);
    }

}
