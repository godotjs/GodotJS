#ifndef GODOTJS_WEB_PRIMITIVE_H
#define GODOTJS_WEB_PRIMITIVE_H
#include <cstdint>

#include "jsb_web_local_handle.h"
#include "jsb_web_primitive_data.h"
#include "jsb_web_context.h"
#include "jsb_web_maybe.h"

namespace v8
{
    class Isolate;

    class Value : public Data
    {
    public:
        Maybe<int32_t> Int32Value(const Local<Context>& context) const;
        Maybe<double> NumberValue(const Local<Context>& context) const;
        bool BooleanValue(Isolate* isolate) const;
    };

    class External : public Value
    {
    public:
        static Local<External> New(Isolate* isolate, void* data);
    };

    class Template : public Data {};
    class FunctionTemplate : public Template
    {
    public:
        void SetClassName(Local<String> name) {}
    };

    class Primitive: public Value {};
    class Name : public Primitive {};

    class Symbol : public Name
    {
    public:
        static Local<Symbol> New(Isolate* isolate);
    };

    class String : public Name
    {
    public:
        template<int N>
        static Local<String> NewFromUtf8Literal(Isolate* isolate, const char (&message)[N])
        {
            return NewFromUtf8(isolate, message, N - 1).ToLocalChecked();
        }

        static MaybeLocal<String> NewFromUtf8(Isolate* isolate, const char* data, NewStringType type = NewStringType::kNormal, int length = -1);
    };

    typedef Symbol Private;

    class Number : public Primitive
    {
    public:
        static Local<Number> New(Isolate* isolate, double value);
    };

    class Integer : public Number {};

    class Int32 : public Integer
    {
    public:
        static Local<Int32> New(Isolate* isolate, int32_t value);
        static Local<Int32> New(Isolate* isolate, uint32_t value);
        int64_t Value() const;

    };

    class Boolean : public Primitive
    {
    public:
        static Local<Boolean> New(Isolate* isolate, bool value);
    };

    class Object : public Value
    {
    public:
        Isolate* GetIsolate() { return isolate_; }

        int InternalFieldCount() const;
        void SetAlignedPointerInInternalField(int slot, void* value);
        void* GetAlignedPointerFromInternalField(int slot);

        Maybe<bool> Set(const Local<Context>& context, Local<Value> key, Local<Value> value);
        MaybeLocal<Value> Get(const Local<Context>& context, Local<Value> key);

        static Local<Object> New(Isolate* isolate);
    };

    class Array : public Object
    {
    public:
        uint32_t Length() const;
        Maybe<bool> Set(const Local<Context>& context, uint32_t index, Local<Value> value);
    };

    class Promise : public Object
    {

    };

    class Function : public Value
    {
    public:
        MaybeLocal<Value> Call(Local<Context> context, Local<Value> recv, int argc, Local<Value> argv[]);
    };

    Local<Primitive> Undefined(Isolate* isolate);
    Local<Primitive> Null(Isolate* isolate);
}
#endif
