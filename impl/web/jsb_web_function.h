#ifndef GODOTJS_WEB_FUNCTION_H
#define GODOTJS_WEB_FUNCTION_H
#include "jsb_web_object.h"
#include "jsb_web_function_interop.h"

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
            Local<Value> data = Local<Value>());

        Local<Context> GetCreationContextChecked() const;
    };

}
#endif
