#ifndef GODOTJS_WEB_PRIMITIVE_H
#define GODOTJS_WEB_PRIMITIVE_H
#include <cstdint>

#include "jsb_web_primitive_data.h"
#include "jsb_web_context.h"
#include "jsb_web_value.h"
#include "jsb_web_local_handle.h"

namespace v8
{
    class Isolate;

    template<typename T>
    class MaybeLocal;

    class Primitive: public Value {};
    class Name : public Primitive {};

    class External : public Value
    {
    public:
        static Local<External> New(Isolate* isolate, void* data);
        void* Value() const;
    };

    class Function;
    class FunctionTemplate;

    class Symbol : public Name
    {
    public:
        static Local<Symbol> New(Isolate* isolate);
    };

    class String : public Name
    {
    public:
        class Utf8Value
        {
        public:
            Utf8Value(Isolate* isolate, Local<Value> obj);
            ~Utf8Value();

            char* operator*() { return str_; }
            const char* operator*() const { return str_; }
            int length() const { return length_; }

            // Disallow copying and assigning.
            Utf8Value(const Utf8Value&) = delete;
            void operator=(const Utf8Value&) = delete;

        private:
            char* str_;
            int length_;
        };

        class Value {
        public:
            Value(Isolate* isolate, Local<v8::Value> obj);
            ~Value();

            uint16_t* operator*() { return str_; }
            const uint16_t* operator*() const { return str_; }
            int length() const { return length_; }

            // Disallow copying and assigning.
            Value(const Value&) = delete;
            void operator=(const Value&) = delete;

        private:
            uint16_t* str_;
            int length_;
        };

        template<int N>
        static Local<String> NewFromUtf8Literal(Isolate* isolate, const char (&message)[N])
        {
            return NewFromUtf8(isolate, message, N - 1).ToLocalChecked();
        }

        static Local<String> Empty(Isolate* isolate);

        static MaybeLocal<String> NewFromOneByte(Isolate* isolate, const uint8_t* data, NewStringType type = NewStringType::kNormal, int length = -1);
        static MaybeLocal<String> NewFromUtf8(Isolate* isolate, const char* data, NewStringType type = NewStringType::kNormal, int length = -1);

        int Length() const;
    };

    typedef Symbol Private;

    class Number : public Primitive
    {
    public:
        static Local<Number> New(Isolate* isolate, double value);
    };

    class Integer : public Number
    {
    public:
        static Local<Integer> NewFromUnsigned(Isolate* isolate, uint32_t value);
    };

    class Int32 : public Integer
    {
    public:
        static Local<Int32> New(Isolate* isolate, int32_t value);
        static Local<Int32> New(Isolate* isolate, uint32_t value);
        int64_t Value() const;

    };

    class Uint32 : public Integer
    {
    public:
        uint32_t Value() const;
    };

    class Boolean : public Primitive
    {
    public:
        static Local<Boolean> New(Isolate* isolate, bool value);
    };

    Local<Primitive> Undefined(Isolate* isolate);
    Local<Primitive> Null(Isolate* isolate);
}
#endif
