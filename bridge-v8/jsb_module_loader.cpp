#include "jsb_module_loader.h"
#include "jsb_realm.h"

namespace jsb
{
    bool GodotModuleLoader::load(class Realm* p_realm, JavaScriptModule& p_module)
    {
        static const CharString on_demand_loader_source = ""
            "(function (type_loader_func) {"
            "    return new Proxy({}, {"
            "        set: function (target, prop_name, value) {"
            "            if (typeof prop_name !== 'string') {"
            "                throw new Error(`only string key is allowed`);"
            "            }"
            "            if (typeof target[prop_name] !== 'undefined') {"
            "                target[prop_name] = value;"
            "                return;"
            "            }"
            "            throw new Error(prop_name + ' is inaccessible');"
            "        },"
            "        get: function (target, prop_name) {"
            "            let o = target[prop_name];"
            "            if (typeof o === 'undefined' && typeof prop_name === 'string') {"
            "                o = target[prop_name] = type_loader_func(prop_name);"
            "            }"
            "            return o;"
            "        }"
            "    });"
            "})"
            "";
        v8::Isolate* isolate = p_realm->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Context::Scope context_scope(context);

        jsb_check(p_realm->check(context));
        v8::MaybeLocal<v8::Value> func_maybe_local = p_realm->_compile_run(on_demand_loader_source, on_demand_loader_source.length(), "on_demand_loader_source");
        if (func_maybe_local.IsEmpty())
        {
            return false;
        }

        v8::Local<v8::Value> func_local;
        if (!func_maybe_local.ToLocal(&func_local) || !func_local->IsFunction())
        {
            isolate->ThrowError("not a function");
            return false;
        }

        // load_type_impl: function(name)
        v8::Local<v8::Value> argv[] = { v8::Function::New(context, Realm::_load_godot_mod).ToLocalChecked() };
        v8::Local<v8::Function> loader = func_local.As<v8::Function>();
        v8::MaybeLocal<v8::Value> type_maybe_local = loader->Call(context, v8::Undefined(isolate), std::size(argv), argv);
        if (type_maybe_local.IsEmpty())
        {
            return false;
        }

        // it's a proxy object which will load godot type on-demand until it's actually accessed in a script
        v8::Local<v8::Value> type_local;
        if (!type_maybe_local.ToLocal(&type_local) || !type_local->IsObject())
        {
            isolate->ThrowError("bad call");
            return false;
        }

        p_module.exports.Reset(isolate, type_local.As<v8::Object>());
        return true;
    }

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
