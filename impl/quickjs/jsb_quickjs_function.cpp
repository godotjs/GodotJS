#include "jsb_quickjs_function.h"

#include "jsb_quickjs_context.h"

namespace v8
{
    namespace
    {
        enum { kFuncPayloadCallback, kFuncPayloadData, kFuncPayloadNum, };
    }

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

    JSValue Function::_function_call(JSContext* ctx, JSValue this_val, int argc, JSValue* argv, int magic, JSValue* func_data)
    {
        Isolate* isolate = (Isolate*) JS_GetContextOpaque(ctx);

        HandleScope func_scope(isolate);
        FunctionCallbackInfo<Value> info(isolate, argc, false);

        // init function stack base
        static_assert(jsb::impl::FunctionStackBase::ReturnValue == 0);
        isolate->push_copy(JS_UNDEFINED);

        static_assert(jsb::impl::FunctionStackBase::This == 1);
        isolate->push_copy(this_val);

        static_assert(jsb::impl::FunctionStackBase::Data == 2);
        isolate->push_copy(func_data[kFuncPayloadData]);

        static_assert(jsb::impl::FunctionStackBase::NewTarget == 3);
        isolate->push_copy(JS_UNDEFINED);

        static_assert(jsb::impl::FunctionStackBase::Num == 4);

        // push arguments
        for (int i = 0; i < argc; ++i)
        {
            isolate->push_copy(argv[i]);
        }

        const FunctionCallback callback = (FunctionCallback) JS_VALUE_GET_PTR(func_data[kFuncPayloadCallback]);

        callback(info);
        return JS_DupValueRT(isolate->rt(), (JSValue) info.GetReturnValue());
    }

    MaybeLocal<Function> Function::New(Local<Context> context, FunctionCallback callback, Local<Value> data)
    {
        Isolate* isolate = context->isolate_;

        JSValue payload[kFuncPayloadNum];
        payload[kFuncPayloadCallback] = JS_MKPTR(jsb::impl::JS_TAG_EXTERNAL, (void*) callback);
        payload[kFuncPayloadData] = isolate->stack_dup(data->stack_pos_);

        const JSValue val = JS_NewCFunctionData(isolate->ctx(), _function_call, 0, 0, kFuncPayloadNum, payload);
        const uint16_t stack_pos = isolate->push_steal(val);
        return MaybeLocal<Function>(Data(isolate, stack_pos));
    }

    Local<Context> Function::GetCreationContextChecked() const
    {
        return Local<Context>(Data(isolate_, 0));
    }
}
