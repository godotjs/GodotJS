#ifndef GODOTJS_ASYNC_MODULE_MANAGER_H
#define GODOTJS_ASYNC_MODULE_MANAGER_H
#include "jsb_bridge_pch.h"
#include "jsb_async_module_loader.h"

namespace jsb
{
    /** a simple async module manager implementation */
    class AsyncModuleManager
    {
        struct ModuleInfo
        {
            StringName module_id;

            /** a Promise created by `import`. */
            v8::Global<v8::Promise::Resolver> resolver;
            
            /** a request has already been sent to the env to complete the async op. */
            bool requested = false;
        };

        Mutex modules_mutex_;

        /**
         * ModuleCache need to complete an async op by module_id if it is synchronously loaded
         * before IAsyncModuleLoader complete the loading.
         * The AsyncModuleHandle becomes invalid in this situation.
         *
         * This map is only used to accelerate the lookup of the module id.
         */
        HashMap<StringName, AsyncModuleToken> tokens_;
        
        std::shared_ptr<IAsyncModuleLoader> loader_;
        
        internal::SArray<ModuleInfo, AsyncModuleToken> modules_;

    public:
        void set_loader(const std::shared_ptr<IAsyncModuleLoader>& p_loader)
        {
            loader_ = p_loader;
        }
        
        //TODO direct use p_module_id => v8::String ?
        /**
         * call it only if the module does not exist in module cache
         * [environment thread only]
         */
        v8::MaybeLocal<v8::Promise> _import(Environment& p_env, const StringName& p_module_id);

        /** [threaded] */
        bool is_valid(AsyncModuleToken p_token) const;

        StringName get_module_id(AsyncModuleToken p_token) const;

        /** call by IAsyncModuleLoader */
        void _mark_as_handled(const v8::Local<v8::Context>& p_context, AsyncModuleToken p_token, bool p_is_fulfill, const v8::Local<v8::Value>& p_value);

    private:
        /**
         * call by module cache?
         * [environment thread only]
        */
        void remove(AsyncModuleToken p_token);
    };
}
#endif
