#ifndef GODOTJS_ASYNC_MODULE_MANAGER_H
#define GODOTJS_ASYNC_MODULE_MANAGER_H
#include "jsb_bridge_pch.h"

namespace jsb::draft
{
    typedef internal::Index32 AsyncModuleToken;

    struct AsyncModuleHandle
    {
        friend class AsyncModuleManager;
        
    private:
        EnvironmentID env_;
        AsyncModuleToken token_;

    public:
        StringName get_module_id() const;

        /** return false if env or token is invalid to call resolve/reject */
        bool is_valid() const;

        bool resolve(const String& p_source);
        bool reject(const String& p_error);
    };

    class IAsyncModuleLoader
    {
    public:
        virtual ~IAsyncModuleLoader() {}

        /** called by AsyncModuleManager if an async module is imported */
        virtual void load(AsyncModuleHandle p_handle) = 0;
    };
    
    /** a simple async module manager implementation */
    class AsyncModuleManager
    {
        friend struct JavaScriptModuleCache;
        
        struct ModuleInfo
        {
            /** a request has already been sent to the env to complete the async op. */
            bool requested;

            /** a Promise created by `import`. */
            v8::Global<v8::Promise::Resolver> resolver;
        };

        Mutex mutex_;

        /**
         * ModuleCache need to complete an async op by module_id if it is synchronously loaded
         * before IAsyncModuleLoader complete the loading.
         * The AsyncModuleHandle becomes invalid in this situation.
         */
        HashMap<StringName, AsyncModuleToken> tokens_;
        internal::SArray<ModuleInfo, AsyncModuleToken> modules_;
        
    public:
        /**
         * call it only if the module does not exist in module cache
         * [environment thread only]
         */
        void import(const StringName& p_module_id);

        /**
         * the source will be compiled and loaded as a module
         *     (the actual loading is not happened here, it will send a load request to the main thread)
         * return false if the token is invalid
         * call it on a token which is already `Requested` will return false.
         * [threaded]
        */
        bool resolve(AsyncModuleToken p_token, const String& p_source);

        /**
         * mark an async module loading as failed.
         * return false if the token is invalid.
         * call it on a token which is already `Requested` will return false.
         * [threaded]
        */
        bool reject(AsyncModuleToken p_token, const String& p_error);

    private:
        /**
         * call by module cache?
         * [environment thread only]
        */
        void remove(AsyncModuleToken p_token);
    };
}
#endif
