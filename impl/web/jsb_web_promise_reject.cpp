#include "jsb_web_promise_reject.h"
#include "jsb_web_handle.h"

namespace v8
{
    Local<Promise> PromiseRejectMessage::GetPromise() const
    {
        return Local<Promise>(Data(isolate_, promise_sp_));
    }

    Local<Value> PromiseRejectMessage::GetValue() const
    {
        return Local<Value>(Data(isolate_, reason_sp_));
    }

}
