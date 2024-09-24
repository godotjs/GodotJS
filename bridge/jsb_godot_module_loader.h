#ifndef GODOTJS_GODOT_MODULE_LOADER_H
#define GODOTJS_GODOT_MODULE_LOADER_H

#include "jsb_module_loader.h"

namespace jsb
{
    // a lazy loader for Godot classes (and singletons/constants)
    class GodotModuleLoader : public IModuleLoader
    {
    public:
        virtual ~GodotModuleLoader() override = default;

        virtual bool load(Environment* p_env, JavaScriptModule& p_module) override;
    };

}

#endif
