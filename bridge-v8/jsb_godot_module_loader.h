#ifndef GODOTJS_GODOT_MODULE_LOADER_H
#define GODOTJS_GODOT_MODULE_LOADER_H

#include "jsb_pch.h"
#include "jsb_module.h"
#include "jsb_module_loader.h"

namespace jsb
{
    // a lazy loader for Godot classes (and singletons/constants)
    class GodotModuleLoader : public IModuleLoader
    {
    public:
        virtual ~GodotModuleLoader() override = default;

        virtual bool load(class Realm* p_realm, JavaScriptModule& p_module) override;
    };

}

#endif
