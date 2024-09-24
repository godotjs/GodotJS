#include "jsb_godot_module_loader.h"
#include "jsb_environment.h"

namespace jsb
{
    bool GodotModuleLoader::load(Environment* p_env, JavaScriptModule& p_module)
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
        v8::Isolate* isolate = p_env->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Context::Scope context_scope(context);
        const v8::MaybeLocal<v8::Value> func_maybe_local = p_env->_compile_run(on_demand_loader_source, on_demand_loader_source.length(), "on_demand_loader_source");
        v8::Local<v8::Value> func_local;
        if (!func_maybe_local.ToLocal(&func_local))
        {
            // empty means error thrown in _compile_run()
            return false;
        }
        jsb_check(func_local->IsFunction());

        // load_type_impl: function(name)
        v8::Local<v8::Value> argv[] = { v8::Function::New(context, Environment::_load_godot_mod).ToLocalChecked() };
        const v8::Local<v8::Function> loader = func_local.As<v8::Function>();
        const v8::MaybeLocal<v8::Value> result = loader->Call(context, v8::Undefined(isolate), std::size(argv), argv);
        v8::Local<v8::Value> proxy;
        if (!result.ToLocal(&proxy))
        {
            // empty means error thrown in Call()
            return false;
        }
        jsb_check(proxy->IsProxy());

        // it's a proxy object which will load godot type on-demand until it's actually accessed in a script
        p_module.exports.Reset(isolate, proxy.As<v8::Object>());
        return true;
    }

}
