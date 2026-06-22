#ifndef GODOTJS_NATIVE_ESM_RESOLVER_H
#define GODOTJS_NATIVE_ESM_RESOLVER_H

#include "jsb_bridge_pch.h"

#if JSB_NATIVE_ESM && JSB_WITH_V8

#include "jsb_module_resolver.h"

namespace jsb
{
    // Loads `.mjs` modules via `v8::ScriptCompiler::CompileModule` + `Module::InstantiateModule`.
    // Inherits search-path resolution from `DefaultModuleResolver` and post-filters to `.mjs` only,
    // so existing `.js` / `.cjs` modules keep their CJS load path untouched.
    class NativeESMModuleResolver : public DefaultModuleResolver
    {
    public:
        virtual ~NativeESMModuleResolver() override = default;

        virtual bool get_source_info(const String& p_module_id, ModuleSourceInfo& r_source_info) override;
        virtual bool load(Environment* p_env, const String& p_asset_path, JavaScriptModule& p_module) override;

    private:
        static v8::MaybeLocal<v8::Module> resolve_module_callback(
            v8::Local<v8::Context> p_context,
            v8::Local<v8::String> p_specifier,
            v8::Local<v8::FixedArray> p_import_attributes,
            v8::Local<v8::Module> p_referrer);
    };
}

#endif // JSB_NATIVE_ESM && JSB_WITH_V8

#endif
