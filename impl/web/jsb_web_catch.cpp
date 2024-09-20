#include "jsb_web_catch.h"
#include "jsb_web_isolate.h"
#include "jsb_web_interop.h"

namespace v8
{
    bool TryCatch::HasCaught() const
    {
        return jsapi_exception_check(isolate_->id_);
    }

    TryCatch::~TryCatch()
    {
        jsapi_exception_clear(isolate_->id_);
    }

    Local<Message> TryCatch::Message() const
    {
        //TODO
    }

    MaybeLocal<Value> TryCatch::StackTrace(Local<Context> context) const
    {
        //TODO
    }

}
