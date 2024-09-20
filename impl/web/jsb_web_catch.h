#ifndef GODOTJS_WEB_CATCH_H
#define GODOTJS_WEB_CATCH_H
#include "jsb_web_local_handle.h"
#include "jsb_web_primitive.h"
#include "jsb_web_message.h"

namespace v8
{
    class Isolate;

    class TryCatch
    {
    public:
        Isolate* isolate_;

        TryCatch(Isolate* isolate) : isolate_(isolate) {}
        ~TryCatch();

        bool HasCaught() const;
        Local<Message> Message() const;
        MaybeLocal<Value> StackTrace(Local<Context> context) const;
    };
}
#endif
