#ifndef GODOTJS_INTERNAL_MODULE_LOADER_H
#define GODOTJS_INTERNAL_MODULE_LOADER_H

#include "jsb_module_loader.h"

namespace jsb
{
    // internal module
    class InternalModuleLoader : public IModuleLoader
    {
    public:
        InternalModuleLoader(const String& p_filename)
            : file_name_(p_filename) {}
        virtual ~InternalModuleLoader() override = default;

        virtual bool load(Environment* p_env, JavaScriptModule& p_module) override;

    private:
        String file_name_;
    };

} // namespace jsb

#endif
