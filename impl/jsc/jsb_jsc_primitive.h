#ifndef GODOTJS_QUICKJS_PRIMITIVE_H
#define GODOTJS_QUICKJS_PRIMITIVE_H
#include "jsb_jsc_pch.h"
#include "jsb_jsc_data.h"
#include "jsb_jsc_handle.h"

namespace v8
{
    class Isolate;
    class String;
    class Context;

    template<typename T>
    class Maybe;

    class Value : public Data
    {
    public:
        MaybeLocal<String> ToDetailString(Local<Context> context) const;
        Maybe<double> NumberValue(Local<Context> context) const;
        Maybe<int32_t> Int32Value(Local<Context> context) const;
        bool BooleanValue(Isolate* isolate) const;

        MaybeLocal<String> ToString(Local<Context> context) const;
    };

    class External : public Value
    {
    public:
        void* Value() const;

        static Local<External> New(Isolate* isolate, void* value);
    };

    class Primitive: public Value {};
    class Name : public Primitive {};

    class String : public Name
    {
    public:
        int Length() const;

        static Local<String> Empty(Isolate* isolate);
    };

    class Symbol : public Name
    {
    public:
        static Local<Symbol> New(Isolate* isolate);
    };

    class Boolean : public Primitive
    {
    public:
        bool Value() const;
        
        static Local<Boolean> New(Isolate* isolate, bool value);
    };

    class Number : public Primitive
    {
    public:
        double Value() const;

        static Local<Number> New(Isolate* isolate, double value);
    };

    class BigInt : public Primitive
    {
    public:
        int64_t Int64Value(bool* lossless = nullptr) const;

        static Local<BigInt> New(Isolate* isolate, int64_t value);
    };

    class Integer : public Number
    {
    public:
        // int64_t Value() const;

        static Local<Integer> New(Isolate* isolate, int32_t value);
        static Local<Integer> NewFromUnsigned(Isolate* isolate, uint32_t value);
    };

    class Uint32 : public Integer
    {
    public:
        uint32_t Value() const;
    };

    class Int32 : public Integer
    {
    public:
        int32_t Value() const;
    };

    Local<Primitive> Undefined(Isolate* isolate);
    Local<Primitive> Null(Isolate* isolate);
}
#endif
