#ifndef GODOTJS_QUICKJS_PROMISE_REJECT_H
#define GODOTJS_QUICKJS_PROMISE_REJECT_H

#include "jsb_quickjs_typedef.h"

namespace v8
{
    template<typename T>
    class Local;

    class Promise;
    class Value;

    class PromiseRejectMessage
    {
    public:
        PromiseRejectMessage(PromiseRejectEvent event, uint16_t promise_pos, uint16_t reason_pos)
        : event_(event), promise_pos_(promise_pos), reason_pos_(reason_pos)
        {}

        PromiseRejectEvent GetEvent() const { return event_; }

        Local<Promise> GetPromise() const;
        Local<Value> GetValue() const;

    private:
        PromiseRejectEvent event_;
        Isolate* isolate_;
        uint16_t promise_pos_;
        uint16_t reason_pos_;
    };

    using PromiseRejectCallback = void (*)(PromiseRejectMessage);
}

#endif
