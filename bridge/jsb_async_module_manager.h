#ifndef GODOTJS_ASYNC_MODULE_MANAGER_H
#define GODOTJS_ASYNC_MODULE_MANAGER_H
#include "jsb_bridge_pch.h"
#include "jsb_async_module_loader.h"

namespace jsb
{
    // TODO handle parent module id in AsyncModuleManager?

    /** a simple async module manager implementation */
    class AsyncModuleManager
    {
        struct ModuleInfo
        {
            StringName module_id;

#if JSB_SUPPORT_ASYNC_MODULE_LOADER
            /** a Promise created by `import`. */
            v8::Global<v8::Promise::Resolver> resolver;
#endif
        };

        Mutex modules_mutex_;

        /**
         * > THIS IS NOT IMPLEMENTED YET:
         * > ModuleCache need to complete an async op by module_id if it is synchronously loaded
         * > before IAsyncModuleLoader complete the loading.
         * > The AsyncModuleHandle becomes invalid in this situation.
         *
         * This map is only used to accelerate the lookup of the module id.
         */
        HashMap<StringName, AsyncModuleToken> tokens_;

        std::shared_ptr<IAsyncModuleLoader> loader_;

        internal::SArray<ModuleInfo, AsyncModuleToken> modules_;

    public:
        AsyncModuleManager() = default;
        ~AsyncModuleManager();

        /** [threaded] */
        bool is_valid(AsyncModuleToken p_token) const;

        /** call by IAsyncModuleLoader */
        void _mark_as_handled(const v8::Local<v8::Context>& p_context, AsyncModuleToken p_token, bool p_is_fulfill, const v8::Local<v8::Value>& p_value);

        /** exposed JS function */
        static void _set_async_module_loader(const v8::FunctionCallbackInfo<v8::Value>& info);

        /** exposed JS function */
        static void _import(const v8::FunctionCallbackInfo<v8::Value>& info);

        /** */
        void set_loader(const std::shared_ptr<IAsyncModuleLoader>& p_loader);
    };
} // namespace jsb
#endif
