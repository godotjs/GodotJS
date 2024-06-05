#ifndef GODOTJS_BRIDGE_MODULE_LOADER_H
#define GODOTJS_BRIDGE_MODULE_LOADER_H

#include "jsb_pch.h"
#include "jsb_module.h"
#include "jsb_module_loader.h"

namespace jsb
{
    class BridgeModuleLoader : public IModuleLoader
    {
    public:
        virtual ~BridgeModuleLoader() override = default;

        virtual bool load(class Realm* p_realm, JavaScriptModule& p_module) override;

    private:
        static void _to_array_buffer(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _is_instance_valid(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _new_callable(const v8::FunctionCallbackInfo<v8::Value>& info);

        static void _add_script_signal(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _add_script_property(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _add_script_ready(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _add_script_tool(const v8::FunctionCallbackInfo<v8::Value>& info);
    };

}

#endif
