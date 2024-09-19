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

    class Value : public Data {};
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

        }
    };

    typedef Symbol Private;

    class Int32 : public Primitive
    {
    public:
        static Local<Int32> New(Isolate* isolate, int32_t value);
        static Local<Int32> New(Isolate* isolate, uint32_t value);
        int64_t Value() const;

    };

    class Boolean : public Primitive {};

    class Object : public Value
    {
    public:
        Isolate* GetIsolate() { return isolate_; }

        void SetAlignedPointerInInternalField(int index, void* value);

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
    };
}
#endif
