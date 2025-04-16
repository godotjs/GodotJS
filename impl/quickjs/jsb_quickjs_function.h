#ifndef GODOTJS_QUICKJS_FUNCTION_H
#define GODOTJS_QUICKJS_FUNCTION_H
#include "jsb_quickjs_object.h"
#include "jsb_quickjs_function_interop.h"

namespace jsb::impl
{
    namespace FuncPayload
    {
        enum { kCallback, kData, kNum, };
    }

    class Helper;
}

namespace v8
{
    class Function : public Object
    {
        friend class jsb::impl::Helper;
        friend class FunctionTemplate;

    public:
        MaybeLocal<Value> Call(
            Local<Context> context,
            Local<Value> recv, int argc,
            Local<Value> argv[]);

        static MaybeLocal<Function> New(
            Local<Context> context, FunctionCallback callback,
            Local<Value> data = Local<Value>(),
            int length = 0);

        Local<Context> GetCreationContextChecked() const;

    private:
        static JSValue _function_call(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv, int magic, JSValue *func_data);
    };

}
#endif
