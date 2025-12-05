#include "jsb_timer_action.h"
#include "jsb_bridge_helper.h"
#include "jsb_environment.h"

namespace jsb
{
    void JavaScriptTimerAction::operator()(v8::Isolate* isolate)
    {
        if (!function_)
        {
            JSB_LOG(Warning, "Ignored attempt to execute a unassigned/moved/destroyed JavaScriptTimerAction");
            return;
        }

        const v8::Local<v8::Function> func = function_->Get(isolate);
        const v8::Local<v8::Context> context = func->GetCreationContextChecked();

        jsb_checkf(Environment::wrap(context), "timer triggered after Environment disposed");
        v8::Context::Scope context_scope(context);
        v8::MaybeLocal<v8::Value> result;
        const impl::TryCatch try_catch(isolate);

        if (argc_ > 0)
        {
            using LocalValue = v8::Local<v8::Value>;
            LocalValue* argv = jsb_stackalloc(LocalValue, argc_);
            for (int index = 0; index < argc_; ++index)
            {
                memnew_placement(&argv[index], LocalValue);
                argv[index] = argv_[index].Get(isolate);
            }
            result = func->Call(context, v8::Undefined(isolate), argc_, argv);
            for (int index = 0; index < argc_; ++index)
            {
                argv[index].~LocalValue();
            }

        }
        else
        {
            result = func->Call(context, v8::Undefined(isolate), 0, nullptr);
        }

#if JSB_DEBUG
        v8::Local<v8::Value> result_checked;
        if (result.ToLocal(&result_checked) && !result_checked->IsUndefined())
        {
            JSB_LOG(Verbose, "discarding the return value of TimerAction");
        }
#else
        jsb_unused(result);
#endif
        if (try_catch.has_caught())
        {
            JSB_LOG(Error, "timer error %s", BridgeHelper::get_exception(try_catch));
        }
    }
}
