#ifndef GODOTJS_QUICKJS_FUNCTION_H
#define GODOTJS_QUICKJS_FUNCTION_H
#include "jsb_quickjs_object.h"
#include "jsb_quickjs_function_interop.h"

namespace v8
{
    class Function : public Object
    {
    public:
        MaybeLocal<Value> Call(
            Local<Context> context,
            Local<Value> recv, int argc,
            Local<Value> argv[]);

        static MaybeLocal<Function> New(
            Local<Context> context, FunctionCallback callback,
            Local<Value> data = Local<Value>());

    private:
        static JSValue _function_call(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv, int magic, JSValue *func_data);
    };

}
#endif
