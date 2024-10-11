#ifndef GODOTJS_QUICKJS_TEMPLATE_H
#define GODOTJS_QUICKJS_TEMPLATE_H
#include "jsb_quickjs_object.h"

namespace v8
{
    class Name;
    class FunctionTemplate;

    class FunctionTemplate : public Object
    {
    public:
        static Local<FunctionTemplate> New(Isolate* isolate, FunctionCallback callback = nullptr, Local<Value> data = Local<Value>());
    };

}
#endif
