#include "jsb_web_function.h"

namespace v8
{
    MaybeLocal<Value> Function::Call(Local<Context> context, Local<Value> recv, int argc, Local<Value> argv[])
    {
        //TODO
    }

    MaybeLocal<Function> Function::New(Local<Context> context, FunctionCallback callback, Local<Value> data, int length)
    {
        //TODO
    }

}
