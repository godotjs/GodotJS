#include "jsb_quickjs_function.h"
namespace v8
{
    MaybeLocal<Value> Function::Call(Local<Context> context, Local<Value> recv, int argc, Local<Value> argv[])
    {
        const JSValue func = (JSValue) *this;
        const JSValue self = (JSValue) recv;
        JSValue* vargv = jsb_stackalloc(JSValue, argc);
        for (int i = 0; i < argc; i++)
        {
            vargv[i] = (JSValue) argv[i];
        }
        const JSValue rval = JS_Call(isolate_->ctx(), func, self, argc, vargv);
        if (JS_IsException(rval))
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, isolate_->push_steal(rval)));
    }

}
