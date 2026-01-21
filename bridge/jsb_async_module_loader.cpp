#include "jsb_async_module_loader.h"

#include "jsb_environment.h"

namespace jsb
{
    namespace
    {
        template <bool is_fulfilled>
        void js_on_finish(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            Environment* env = Environment::wrap(isolate);

            jsb_check(!info.Data().IsEmpty() && info.Data()->IsUint32());
            const AsyncModuleToken token(info.Data().As<v8::Uint32>()->Value());
            env->get_async_module_manager()._mark_as_handled(context, token, is_fulfilled, info[0]);
        }
    } // namespace

    bool AsyncModuleHandle::is_valid() const
    {
        if (env_ && !!token_)
        {
            if (const auto env = Environment::_access(env_))
            {
                return env->get_async_module_manager().is_valid(token_);
            }
        }
        return false;
    }

    bool AsyncModuleHandle::resolve(const String& p_source)
    {
        if (const auto env = Environment::_access(env_))
        {
            // TODO env -> enqueue async call
            jsb_not_implemented(true, "resolve from handle is not implemented yet");
        }
        return false;
    }

    bool AsyncModuleHandle::reject(const String& p_error)
    {
        if (const auto env = Environment::_access(env_))
        {
            // TODO env -> enqueue async call
            jsb_not_implemented(true, "reject from handle is not implemented yet");
        }
        return false;
    }


    void ScriptableAsyncModuleLoader::on_detached()
    {
        func_.Reset();
    }

    void ScriptableAsyncModuleLoader::import(Environment& p_env, const StringName& p_module_id, AsyncModuleHandle p_handle)
    {
        v8::Isolate* isolate = p_env.get_isolate();
        const v8::Local<v8::Function> func = func_.Get(isolate);
        const v8::Local<v8::Context> context = p_env.get_context();
        const v8::Local<v8::String> module_id = p_env.get_string_value(p_module_id);
        const v8::Local<v8::Value> data = v8::Uint32::NewFromUnsigned(isolate, *p_handle.token());
        v8::Local<v8::Value> args[] =
            {
                module_id,
                /* resolve */ v8::Function::New(context, js_on_finish<true>, data, 1).ToLocalChecked(),
                /* reject  */ v8::Function::New(context, js_on_finish<false>, data, 1).ToLocalChecked(),
            };
        // TODO JS try catch
        v8::MaybeLocal<v8::Value> ret = func->Call(context, v8::Undefined(isolate), std::size(args), args).ToLocalChecked();
        jsb_unused(ret);
        jsb_check(!ret.IsEmpty() && ret.ToLocalChecked()->IsUndefined());
    }

} // namespace jsb
