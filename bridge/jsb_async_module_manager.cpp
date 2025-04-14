#include "jsb_async_module_manager.h"
#include "jsb_environment.h"

namespace jsb
{
    bool AsyncModuleManager::is_valid(AsyncModuleToken p_token) const
    {
        MutexLock lock(modules_mutex_);
        return modules_.is_valid_index(p_token);
    }

    StringName AsyncModuleManager::get_module_id(AsyncModuleToken p_token) const
    {
        MutexLock lock(modules_mutex_);
        return modules_[p_token].module_id;
    }

    v8::MaybeLocal<v8::Promise> AsyncModuleManager::_import(Environment& p_env, const StringName& p_module_id)
    {
        MutexLock lock(modules_mutex_);
        jsb_check(!tokens_.getptr(p_module_id));
        if (!!loader_)
        {
            v8::Isolate* isolate = p_env.get_isolate();
            const v8::Local<v8::Context> context = p_env.get_context();
            const v8::Local<v8::Promise::Resolver> resolver = v8::Promise::Resolver::New(context).ToLocalChecked();
            const AsyncModuleToken token = modules_.add({ p_module_id, v8::Global<v8::Promise::Resolver>(isolate, resolver), false });
            const AsyncModuleHandle handle(p_env.id(), token);
            
            loader_->import(p_env, p_module_id, handle);
            return resolver->GetPromise();
        }
        return v8::Local<v8::Promise>();
    }

    void AsyncModuleManager::_mark_as_handled(const v8::Local<v8::Context>& p_context, AsyncModuleToken p_token, bool p_is_fulfill, const v8::Local<v8::Value>& p_value)
    {
        v8::Isolate* isolate = p_context->GetIsolate();
        auto pointer = modules_.get_value_scoped(p_token);
        const v8::Local<v8::Promise::Resolver> resolver = pointer->resolver.Get(isolate);
        pointer = nullptr;
        modules_.remove_at(p_token);

        if (p_is_fulfill)
        {
            //TODO check if the module is already in the cache
            //TODO compile the module from source (p_value) if not in the cache and write it to the cache
        
            resolver->Resolve(p_context, p_value).Check();
        }
        else
        {
            resolver->Reject(p_context, p_value).Check();
        }
    }

}
