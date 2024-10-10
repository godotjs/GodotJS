#ifndef GODOTJS_QUICKJS_FUNCTION_H
#define GODOTJS_QUICKJS_FUNCTION_H
#include "jsb_quickjs_object.h"

namespace v8
{
    class Function : public Object
    {
    public:
        MaybeLocal<Value> Call(Local<Context> context,
                               Local<Value> recv, int argc,
                               Local<Value> argv[]);
    };

}
#endif
