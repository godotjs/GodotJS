#ifndef GODOTJS_WEB_CONTAINER_H
#define GODOTJS_WEB_CONTAINER_H
#include "jsb_web_object.h"

namespace v8
{
    class Array : public Object
    {
    public:
        static Local<Array> New(Isolate* isolate, int length = 0);

        uint32_t Length() const;
        Maybe<bool> Set(const Local<Context>& context, uint32_t index, Local<Value> value);
    };

    class Map : public Object
    {
    public:
        MaybeLocal<Map> Set(Local<Context> context, Local<Value> key, Local<Value> value);
    };

}
#endif
