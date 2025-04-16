#ifndef GODOTJS_JSC_FUNCTION_H
#define GODOTJS_JSC_FUNCTION_H
#include "jsb_jsc_object.h"
#include "jsb_jsc_function_interop.h"

namespace jsb::impl
{
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
        static JSValueRef _function_call(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception);
    };

}
#endif
