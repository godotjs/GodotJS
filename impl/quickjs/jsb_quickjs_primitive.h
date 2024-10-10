#ifndef GODOTJS_QUICKJS_PRIMITIVE_H
#define GODOTJS_QUICKJS_PRIMITIVE_H
#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_data.h"
#include "jsb_quickjs_handle.h"

namespace v8
{
    class Isolate;
    class String;
    class Context;

    class Value : public Data
    {
    public:
        MaybeLocal<String> ToDetailString(Local<Context> context) const;
    };

    class Primitive: public Value {};
    class Name : public Primitive {};

    class String : public Name
    {
    public:

    };

    class Symbol : public Name
    {
    public:
    };

    class Boolean : public Primitive
    {
    public:
        static Local<Boolean> New(Isolate* isolate, bool value);
    };

    class Number : public Primitive
    {
    public:
        double Value() const;
    };

    class BigInt : public Primitive
    {
    public:
        int64_t Int64Value(bool* lossless = nullptr) const;
    };

    class Integer : public Number
    {
    public:
        int32_t Value() const;

        static Local<Integer> New(Isolate* isolate, int32_t value);
    };

    class Int32 : public Integer
    {
    };

    Local<Primitive> Undefined(Isolate* isolate);
    Local<Primitive> Null(Isolate* isolate);
}
#endif
