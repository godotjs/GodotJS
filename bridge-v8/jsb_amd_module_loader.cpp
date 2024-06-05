#include "jsb_amd_module_loader.h"
#include "jsb_realm.h"
#include "jsb_builtins.h"

namespace jsb
{

    bool AMDModuleLoader::load(Realm* p_realm, JavaScriptModule& p_module)
    {
        typedef v8::Local<v8::Value> LocalValue;

        v8::Isolate* isolate = p_realm->get_isolate();
        const int len = deps_.size();
        bool succeeded = true;
        LocalValue* dep_vals = jsb_stackalloc(LocalValue, len);
        const String self_module_id = p_module.id;

        // setup self exports
        v8::Local<v8::Object> self_exports = v8::Object::New(isolate);
        p_module.exports.Reset(isolate, self_exports);

        // prepare all dependencies
        int index = 0;
        for (; index < len; ++index)
        {
            const String& dep_module_id = deps_[index];
            memnew_placement(&dep_vals[index], LocalValue);

            // special case: `require` & `exports`
            if (dep_module_id == "require")
            {
                dep_vals[index] = p_realm->_new_require_func(self_module_id.utf8());
                continue;
            }
            if (dep_module_id == "exports")
            {
                dep_vals[index] = self_exports;
                continue;
            }
            if (JavaScriptModule* module = p_realm->_load_module(self_module_id, dep_module_id))
            {
                JSB_LOG(Verbose, "load dep: %s", dep_module_id);
                dep_vals[index] = module->exports.Get(isolate);
                continue;
            }
            succeeded = false;
            break;
        }

        if (succeeded)
        {
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Function> evaluator = evaluator_.Get(isolate);
            if (evaluator->Call(context, v8::Undefined(isolate), len, dep_vals).IsEmpty())
            {
                JSB_LOG(Error, "failed to evaluate AMD module");
                succeeded = false;
            }
        }

        for (--index; index >= 0; --index)
        {
            dep_vals[index].~LocalValue();
        }
        return succeeded;
    }

}
