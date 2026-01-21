#include "jsb_jsc_serializer.h"

#include "jsb_jsc_context.h"
#include "jsb_jsc_maybe.h"
#include "jsb_jsc_handle.h"
#include "jsb_jsc_isolate.h"

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
        // TODO serialize with JSON as a workaround?
        return Maybe<bool>();
    }

    std::pair<uint8_t*, size_t> ValueSerializer::Release()
    {
        std::pair<uint8_t*, size_t> rval = {buffer_, size_};
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
        // TODO deserialize with JSON as a workaround?
        return MaybeLocal<Value>();
    }

} // namespace v8
