#ifndef GODOTJS_AMD_MODULE_LOADER_H
#define GODOTJS_AMD_MODULE_LOADER_H
#include "jsb_pch.h"
#include "jsb_module.h"
#include "jsb_module_loader.h"

namespace jsb
{
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

        virtual bool load(class Environment* p_env, JavaScriptModule& p_module) override;
    };

}
#endif
