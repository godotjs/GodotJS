#ifndef GODOTJS_JSC_ARRAY_H
#define GODOTJS_JSC_ARRAY_H
#include "jsb_jsc_object.h"

namespace v8
{
    class Array : public Object
    {
    public:
        uint32_t Length() const;

        static Local<Array> New(Isolate* isolate, int length = 0);
    };

    class Map : public Object
    {
    public:
        size_t Size() const;
        Local<Array> AsArray() const;

        MaybeLocal<Value> Get(Local<Context> context, Local<Value> key);

        MaybeLocal<Map> Set(Local<Context> context,
                            Local<Value> key,
                            Local<Value> value);

        static Local<Map> New(Isolate* isolate);
    };

    class Set : public Object
    {
    public:
        size_t Size() const;
        Local<Array> AsArray() const;

        MaybeLocal<Set> Add(Local<Context> context, Local<Value> key);

        static Local<Set> New(Isolate* isolate);
    };
}
#endif
