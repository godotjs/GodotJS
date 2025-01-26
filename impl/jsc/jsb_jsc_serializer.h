#ifndef GODOTJS_JSC_SERIALIZER_H
#define GODOTJS_JSC_SERIALIZER_H
#include "jsb_jsc_pch.h"

namespace v8
{
    class Isolate;

    template<typename T>
    class Local;

    template<typename T>
    class Maybe;

    template<typename T>
    class MaybeLocal;

    class Context;
    class Value;

    class ValueSerializer
    {
        uint8_t* buffer_ = nullptr;
        size_t size_ = 0;

    public:
        explicit ValueSerializer(Isolate* isolate);

        void WriteHeader();
        Maybe<bool> WriteValue(Local<Context> context, Local<Value> value);
        std::pair<uint8_t*, size_t> Release();
    };

    class ValueDeserializer
    {
        uint8_t* buffer_ = nullptr;
        size_t size_ = 0;

    public:
        ValueDeserializer(Isolate* isolate, const uint8_t* data, size_t size);
        Maybe<bool> ReadHeader(Local<Context> context);
        MaybeLocal<Value> ReadValue(Local<Context> context);
    };
}
#endif
