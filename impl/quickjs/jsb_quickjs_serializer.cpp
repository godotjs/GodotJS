#include "jsb_quickjs_serializer.h"

#include "jsb_quickjs_context.h"
#include "jsb_quickjs_maybe.h"
#include "jsb_quickjs_handle.h"
#include "jsb_quickjs_isolate.h"

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
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Value>();
        }

        return MaybeLocal<Value>(Data(isolate, isolate->push_steal(rval)));
    }

}
