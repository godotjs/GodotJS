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
    };

}

#endif
