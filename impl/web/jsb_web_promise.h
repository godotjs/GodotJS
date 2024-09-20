#ifndef GODOTJS_WEB_PROMISE_H
#define GODOTJS_WEB_PROMISE_H
#include "jsb_web_local_handle.h"
#include "jsb_web_primitive.h"

namespace v8
{
    class PromiseRejectMessage
    {
    public:
        PromiseRejectMessage(Local<Promise> promise, PromiseRejectEvent event,
                             Local<Value> value)
            : promise_(promise), event_(event), value_(value) {}

        Local<Promise> GetPromise() const { return promise_; }
        PromiseRejectEvent GetEvent() const { return event_; }
        Local<Value> GetValue() const { return value_; }

    private:
        Local<Promise> promise_;
        PromiseRejectEvent event_;
        Local<Value> value_;
    };

    using PromiseRejectCallback = void (*)(PromiseRejectMessage message);

}
#endif

