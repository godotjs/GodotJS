#ifndef GODOTJS_WEB_FUNCTION_H
#define GODOTJS_WEB_FUNCTION_H

#include "jsb_web_primitive.h"
#include "jsb_web_object.h"

namespace v8
{
    class Function : public Object
    {
    public:
        MaybeLocal<Value> Call(Local<Context> context, Local<Value> recv, int argc, Local<Value> argv[]);
        static MaybeLocal<Function> New(Local<Context> context, FunctionCallback callback, Local<Value> data = Local<Value>(), int length = 0);
    };

}
#endif
