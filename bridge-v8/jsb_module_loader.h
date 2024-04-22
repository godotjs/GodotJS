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

        virtual bool load(class Realm* p_realm, JavaScriptModule& p_module) = 0;
    };

    // a lazy loader for Godot classes (and singletons/constants)
    class GodotModuleLoader : public IModuleLoader
    {
    public:
        virtual ~GodotModuleLoader() override = default;

        virtual bool load(class Realm* p_realm, JavaScriptModule& p_module) override;
    };

    // `AMDModuleLoader` follows the fundamental guidelines of the `AsynchronousModuleDefinition`, but not really async.
    // it's currently only used to load the `compiled` editor script bundle.
    class AMDModuleLoader : public IModuleLoader
    {
    private:
        Vector<String> deps_;
        v8::Global<v8::Function> evaluator_;

    public:
        AMDModuleLoader(const Vector<String>& p_deps, v8::Global<v8::Function>&& p_evaluator)
        : deps_(p_deps), evaluator_(std::move(p_evaluator))
        {}

        virtual ~AMDModuleLoader() override { evaluator_.Reset(); }

        virtual bool load(class Realm* p_realm, JavaScriptModule& p_module) override;
    };
}
#endif
