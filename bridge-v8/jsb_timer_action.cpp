#include "jsb_timer_action.h"
#include "jsb_exception_info.h"
#include "jsb_realm.h"

namespace jsb
{
    void JavaScriptTimerAction::operator()(v8::Isolate* isolate)
    {
        v8::Local<v8::Function> func = function_.Get(isolate);
        v8::Local<v8::Context> context = func->GetCreationContextChecked();
        Realm* realm = Realm::wrap(context);

        jsb_checkf(realm, "timer triggered after Realm diposed");
        v8::Context::Scope context_scope(context);
        v8::Local<v8::Value> result;
        v8::TryCatch try_catch(isolate);

        if (argc_ > 0)
        {
            using LocalValue = v8::Local<v8::Value>;
            LocalValue* argv = jsb_stackalloc(LocalValue, argc_);
            for (int index = 0; index < argc_; ++index)
            {
                memnew_placement(&argv[index], LocalValue);
                argv[index] = argv_[index].Get(isolate);
            }
            func->Call(context, v8::Undefined(isolate), argc_, argv).ToLocal(&result);
            for (int index = 0; index < argc_; ++index)
            {
                argv[index].~LocalValue();
            }

        }
        else
        {
            func->Call(context, v8::Undefined(isolate), 0, nullptr).ToLocal(&result);
        }

        if (!result.IsEmpty() && !result->IsUndefined())
        {
            JSB_LOG(Verbose, "discarding the return value of TimerAction");
        }
        if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch))
        {
            JSB_LOG(Error, "timer error %s", (String) exception_info);
        }
    }
}
