#ifndef GODOTJS_MODULE_LOADER_H
#define GODOTJS_MODULE_LOADER_H

#include "jsb_pch.h"
#include "jsb_module.h"

namespace jsb
{
    // resolve module with a name already known when registering to runtime
    class IModuleLoader
    {
    public:
        virtual ~IModuleLoader() = default;

        virtual bool load(class Environment* p_env, JavaScriptModule& p_module) = 0;
    };

}
#endif
