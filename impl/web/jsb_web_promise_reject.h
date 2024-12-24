#ifndef GODOTJS_WEB_PROMISE_REJECT_H
#define GODOTJS_WEB_PROMISE_REJECT_H

#include "jsb_web_typedef.h"

namespace v8
{
    template<typename T>
    class Local;

    class Promise;
    class Value;

    class PromiseRejectMessage
    {
    public:
        PromiseRejectMessage(Isolate* isolate, PromiseRejectEvent event, jsb::impl::StackPosition promise_sp, jsb::impl::StackPosition reason_sp)
        : isolate_(isolate), event_(event), promise_sp_(promise_sp), reason_sp_(reason_sp)
        {}

        PromiseRejectEvent GetEvent() const { return event_; }

        Local<Promise> GetPromise() const;
        Local<Value> GetValue() const;

    private:
        Isolate* isolate_;
        PromiseRejectEvent event_;
        jsb::impl::StackPosition promise_sp_;
        jsb::impl::StackPosition reason_sp_;
    };

    using PromiseRejectCallback = void (*)(PromiseRejectMessage);
}

#endif
