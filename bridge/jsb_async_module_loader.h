#ifndef GODOTJS_ASYNC_MODULE_LOADER_H
#define GODOTJS_ASYNC_MODULE_LOADER_H
#include "jsb_bridge_pch.h"

namespace jsb
{
    class Environment;

    typedef internal::Index32 AsyncModuleToken;

    /** a handle for pending async module */
    struct AsyncModuleHandle
    {
    private:
        EnvironmentID env_ = nullptr;
        AsyncModuleToken token_;

    public:
        AsyncModuleHandle(EnvironmentID p_env, AsyncModuleToken p_token)
            : env_(p_env), token_(p_token)
        {
        }

        /** return false if env or token is invalid to call resolve/reject */
        bool is_valid() const;

        AsyncModuleToken token() const { return token_; }

        /**
         * the source will be compiled and loaded as a module
         *     (the actual loading is not happened here, it will send a load request to the main thread)
         * return false if the token is invalid
         * call it on a token which is already `Requested` will return false.
         * [threaded]
         */
        bool resolve(const String& p_source);

        /**
         * mark an async module as failed.
         * return false if the token is invalid.
         * call it on a token which is already `Requested` will return false.
         * [threaded]
         */
        bool reject(const String& p_error);
    };

    class IAsyncModuleLoader
    {
    public:
        virtual ~IAsyncModuleLoader() {}

        /** added to async module manager */
        virtual void on_attached() = 0;

        /** removed from async module manager */
        virtual void on_detached() = 0;

        /**
         * called by AsyncModuleManager if an async module is import().
         * return false if not handled by this loader.
         */
        virtual void import(Environment& p_env, const StringName& p_module_id, AsyncModuleHandle p_handle) = 0;
    };

    /**
     * A scriptable async module loader can be used as default async loader.
     */
    class ScriptableAsyncModuleLoader : public IAsyncModuleLoader
    {
        v8::Global<v8::Function> func_;

    public:
        ScriptableAsyncModuleLoader(v8::Global<v8::Function>&& p_func)
            : func_(std::move(p_func)) {}
        virtual ~ScriptableAsyncModuleLoader() override {}

        virtual void on_attached() override {}
        virtual void on_detached() override;

        virtual void import(Environment& p_env, const StringName& p_module_id, AsyncModuleHandle p_handle) override;
    };

    /**
     * Example of a custom async module loader in C++.
     * Need to build from source with scons parameter use_default_async_loader=no,
     * and set your custom loader as the async module loader in env.
     * ```
     * class CppAsyncModuleLoader : public IAsyncModuleLoader
     * {
     *     virtual void import(Environment& p_env, const StringName& p_module_id, AsyncModuleHandle p_handle) override
     *     {
     *          native_task_scheduler.load_file_async(p_module_id, [p_handle](bool succeeded, const String& data) {
     *              bool ret;
     *              if (succeeded) ret = p_handle.resolve(data); // module source
     *              else ret = p_handle.reject(data); // error message
     *              if (!ret) {
     *                  printf("async module handle is invalid\n");
     *                  return;
     *              }
     *          });
     *     }
     * };
     *
     * env->set_async_module_loader(std::make_shared<CppAsyncModuleLoader>());
     * ```
     */
} // namespace jsb
#endif
