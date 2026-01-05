#ifndef GODOTJS_JSC_TEMPLATE_H
#define GODOTJS_JSC_TEMPLATE_H
#include "jsb_jsc_object.h"
#include "jsb_jsc_typedef.h"

namespace v8
{
    class Name;

    // identical to Function in quickjs
    class FunctionTemplate : public Object
    {
    public:
        static Local<FunctionTemplate> New(Isolate* isolate, FunctionCallback callback = nullptr, Local<Value> data = Local<Value>());
    };

    // identical to Object in quickjs
    class ObjectTemplate : public Object
    {
    public:
    };
} // namespace v8
#endif
