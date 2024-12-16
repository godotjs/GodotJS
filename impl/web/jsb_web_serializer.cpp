#include "jsb_web_serializer.h"

#include "jsb_web_context.h"
#include "jsb_web_maybe.h"
#include "jsb_web_handle.h"
#include "jsb_web_isolate.h"

namespace v8
{
    ValueSerializer::ValueSerializer(Isolate* isolate)
    {

    }

    void ValueSerializer::WriteHeader()
    {
    }

    Maybe<bool> ValueSerializer::WriteValue(Local<Context> context, Local<Value> value)
    {
        JSContext* ctx = context->GetIsolate()->ctx();
        buffer_ = JS_WriteObject(ctx, &size_, (JSValue) value, JS_WRITE_OBJ_REFERENCE);
        return Maybe(!!buffer_);
    }

    std::pair<uint8_t*, size_t> ValueSerializer::Release()
    {
        std::pair<uint8_t*, size_t> rval = { buffer_, size_ };
        buffer_ = nullptr;
        size_ = 0;
        return rval;
    }

    ValueDeserializer::ValueDeserializer(Isolate* isolate, const uint8_t* data, size_t size)
        : buffer_(const_cast<uint8_t*>(data)), size_(size)
    {
    }

    Maybe<bool> ValueDeserializer::ReadHeader(Local<Context> context)
    {
        return Maybe(true);
    }

    MaybeLocal<Value> ValueDeserializer::ReadValue(Local<Context> context)
    {
        v8::Isolate* isolate = context->GetIsolate();
        JSContext* ctx = isolate->ctx();
        const JSValue rval = JS_ReadObject(ctx, buffer_, size_, JS_READ_OBJ_REFERENCE);
        if (JS_IsException(rval))
        {
            isolate->remove_exception_anyway();
            return MaybeLocal<Value>();
        }

        return MaybeLocal<Value>(Data(isolate, isolate->push_steal(rval)));
    }

}
