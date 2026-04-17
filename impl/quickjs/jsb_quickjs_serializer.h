#ifndef GODOTJS_QUICKJS_SERIALIZER_H
#define GODOTJS_QUICKJS_SERIALIZER_H
#include "jsb_quickjs_pch.h"
#include <vector>

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
    class String;
    class Object;
    class SharedArrayBuffer;
    class WasmModuleObject;
    class Value;

    class ValueSerializer
    {
    public:
        class Delegate
        {
        public:
            virtual ~Delegate() = default;
            virtual void ThrowDataCloneError(Local<String> message);
            virtual Maybe<bool> WriteHostObject(Isolate* isolate, Local<Object> object);
            virtual Maybe<uint32_t> GetSharedArrayBufferId(Isolate* isolate, Local<SharedArrayBuffer> shared_array_buffer);
            virtual Maybe<uint32_t> GetWasmModuleTransferId(Isolate* isolate, Local<WasmModuleObject> module);
        };

    private:
        uint8_t* buffer_ = nullptr;
        size_t size_ = 0;
        Delegate* delegate_ = nullptr;
        std::vector<uint8_t> stream_buffer_;

    public:
        explicit ValueSerializer(Isolate* isolate, Delegate* delegate = nullptr);

        void WriteHeader();
        Maybe<bool> WriteValue(Local<Context> context, Local<Value> value);
        void WriteUint32(uint32_t value);
        void WriteRawBytes(const void* source, size_t length);
        std::pair<uint8_t*, size_t> Release();
    };

    class ValueDeserializer
    {
    public:
        class Delegate
        {
        public:
            virtual ~Delegate() = default;
            virtual MaybeLocal<Object> ReadHostObject(Isolate* isolate);
        };

    private:
        uint8_t* buffer_ = nullptr;
        size_t size_ = 0;
        Delegate* delegate_ = nullptr;
        size_t read_offset_ = 0;

    public:
        ValueDeserializer(Isolate* isolate, const uint8_t* data, size_t size, Delegate* delegate = nullptr);
        Maybe<bool> ReadHeader(Local<Context> context);
        bool ReadUint32(uint32_t* value);
        bool ReadRawBytes(size_t length, const void** data);
        size_t GetReadOffset() const;
        bool SetReadOffset(size_t offset);
        MaybeLocal<Value> ReadValue(Local<Context> context);
    };
}
#endif
