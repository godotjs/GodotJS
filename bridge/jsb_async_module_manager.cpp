#include "jsb_async_module_manager.h"
#include "jsb_environment.h"

namespace jsb
{
    AsyncModuleManager::~AsyncModuleManager()
    {
        if (!!loader_)
        {
            loader_->on_attached();
        }
    }
    
    bool AsyncModuleManager::is_valid(AsyncModuleToken p_token) const
    {
        MutexLock lock(modules_mutex_);
        return modules_.is_valid_index(p_token);
    }

    void AsyncModuleManager::set_loader(const std::shared_ptr<IAsyncModuleLoader>& p_loader)
    {
        if (!!loader_)
        {
            JSB_LOG(Info, "replacing async module loader %s with %s", (uintptr_t) loader_.get(), (uintptr_t) p_loader.get());
            loader_->on_detached();
        }
        loader_ = p_loader;
        if (!!loader_)
        {
            loader_->on_attached();
        }
    }

    void AsyncModuleManager::_set_async_module_loader(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (info.Length() != 1 || !info[0]->IsFunction())
        {
            jsb_throw(isolate, "a function is expected");
            return;
        }
        Environment* env = Environment::wrap(isolate);
        env->get_async_module_manager().set_loader(
            std::make_shared<ScriptableAsyncModuleLoader>(v8::Global<v8::Function>(isolate, info[0].As<v8::Function>())));
    }

    void AsyncModuleManager::_import(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (info.Length() != 1 || !info[0]->IsString())
        {
            jsb_throw(isolate, "a string is expected");
            return;
        }
        const v8::Local<v8::String> arg0 = info[0].As<v8::String>();
        if (arg0->Length() == 0)
        {
            jsb_throw(isolate, "module id can't be empty");
            return;
        }
        Environment* env = Environment::wrap(isolate);
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        AsyncModuleManager& manager = env->get_async_module_manager();
        const StringName module_id = env->get_string_name(arg0);
        
        MutexLock lock(manager.modules_mutex_);
        jsb_check(!manager.tokens_.getptr(module_id));
#if JSB_SUPPORT_ASYNC_MODULE_LOADER
        if (!!manager.loader_)
        {
            const v8::Local<v8::Promise::Resolver> resolver = v8::Promise::Resolver::New(context).ToLocalChecked();
            const AsyncModuleToken token = manager.modules_.add({ module_id, v8::Global<v8::Promise::Resolver>(isolate, resolver) });
            const AsyncModuleHandle handle(env->id(), token);
            
            manager.loader_->import(*env, module_id, handle);
            info.GetReturnValue().Set(resolver->GetPromise());
            return;
        }
        jsb_throw(isolate, "no async module loader");
#else
        jsb_throw(isolate, "not implemented yet");
#endif
    }

    void AsyncModuleManager::_mark_as_handled(const v8::Local<v8::Context>& p_context, AsyncModuleToken p_token, bool p_is_fulfill, const v8::Local<v8::Value>& p_value)
    {
#if JSB_SUPPORT_ASYNC_MODULE_LOADER
        v8::Isolate* isolate = p_context->GetIsolate();
        Environment* env = Environment::wrap(isolate);

        v8::Local<v8::Promise::Resolver> resolver;
        StringName module_id;
        {
            MutexLock lock(modules_mutex_);
            auto pointer = modules_.get_value_scoped(p_token);
            resolver = pointer->resolver.Get(isolate);
            module_id = pointer->module_id;
            pointer = nullptr;
            modules_.remove_at(p_token);
        }

        if (p_is_fulfill)
        {
            // check if the module is already in the cache
            JavaScriptModuleCache& module_cache = env->get_module_cache();
            JavaScriptModule* module = module_cache.find(module_id);
            v8::Local<v8::Object> module_obj;
            
            if (!module)
            {
                module = &module_cache.insert(isolate, p_context, module_id, false, false);
                module_obj = module->module.Get(isolate);
                const v8::Local<v8::Object> exports_obj = v8::Object::New(isolate);
                module_obj->Set(p_context, jsb_name(env, exports), exports_obj).Check();
                module->exports.Reset(isolate, exports_obj);
            }
            else
            {
                module_obj = module->module.Get(isolate);
            }
            module->mark_as_reloaded();

            // compile the module from source (p_value) if not in the cache and write it to the cache
            const String source = impl::Helper::to_string(isolate, p_value);
            const internal::StringSourceReader reader(module_id, module_id, source);

            const impl::TryCatch try_catch(isolate);
            if (!DefaultModuleResolver::load(env, reader, *module))
            {
                // error thrown in load()
                jsb_ensure(try_catch.has_caught());
                const String err = BridgeHelper::get_exception(try_catch);
                resolver->Reject(p_context, impl::Helper::new_string(isolate, err)).Check();
                return;
            }
            //TODO module tree needed?
            //TODO GodotJS script needed?
            jsb_nop();

            const v8::Local<v8::Value> updated_exports = module_obj->Get(p_context, jsb_name(env, exports)).ToLocalChecked();
            module->exports.Reset(isolate, updated_exports);
            
            module->on_load(isolate, p_context);
            resolver->Resolve(p_context, module->module.Get(isolate)).Check();
        }
        else
        {
            // p_value is the error message (string)
            resolver->Reject(p_context, p_value).Check();
        }
#else
        jsb_not_implemented(true, "not implemented yet");
#endif
    }

}
