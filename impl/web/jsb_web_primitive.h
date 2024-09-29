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
        static Local<String> Empty(Isolate* isolate);

        int Length() const;
    };

    typedef Symbol Private;

    class Number : public Primitive
    {
    public:
        static Local<Number> New(Isolate* isolate, double value);

        double Value() const;
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

    class BigInt : public Data
    {
    public:
        static Local<BigInt> New(Isolate* isolate, int64_t value);

        int64_t Int64Value() const;
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
