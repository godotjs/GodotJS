#ifndef GODOTJS_WEB_TEMPLATE_H
#define GODOTJS_WEB_TEMPLATE_H
#include "jsb_web_object.h"
#include "jsb_web_typedef.h"

namespace v8
{
    class Name;

    // identical to Function in web
    class FunctionTemplate : public Object
    {
    public:
        static Local<FunctionTemplate> New(Isolate* isolate, FunctionCallback callback = nullptr, Local<Value> data = Local<Value>());
    };

    // identical to Object in web
    class ObjectTemplate : public Object
    {
    public:
    };
} // namespace v8
#endif
