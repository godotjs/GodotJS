#ifndef GODOTJS_AMD_MODULE_LOADER_H
#define GODOTJS_AMD_MODULE_LOADER_H
#include "jsb_bridge_pch.h"
#include "jsb_module_loader.h"
#include "../internal/jsb_preset_source.h"

namespace jsb
{
    // `AMDModuleLoader` follows the fundamental guidelines of the `AsynchronousModuleDefinition`, but not really async.
    // it's currently only used to load the `compiled` editor script bundle.
    class AMDModuleLoader : public IModuleLoader
    {
    private:
        Vector<String> deps_;
        v8::Global<v8::Function> evaluator_;
        bool internal_;

    public:
        AMDModuleLoader(const Vector<String>& p_deps, v8::Global<v8::Function>&& p_evaluator)
        : deps_(p_deps), evaluator_(std::move(p_evaluator))
        {}

        virtual ~AMDModuleLoader() override { evaluator_.Reset(); }

        virtual bool load(Environment* p_env, JavaScriptModule& p_module) override;

        void set_internal(bool internal)
        {
            internal_ = internal;
        }

        static Error load_source(Environment* p_env, const internal::PresetSource& p_source);
        static void load_source(Environment* p_env, const char* p_source, int p_len, const String& p_name, bool p_internal = false);
    };

}
#endif
