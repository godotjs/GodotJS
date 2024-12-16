#include "jsb_web_function.h"

#include "jsb_web_context.h"

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

    JSValue Function::_function_call(JSContext* ctx, JSValue this_val, int argc, JSValue* argv, int magic, JSValue* func_data)
    {
        Isolate* isolate = (Isolate*) JS_GetContextOpaque(ctx);

        HandleScope func_scope(isolate);
        FunctionCallbackInfo<Value> info(isolate, argc, false);

        // init function stack base
        static_assert(jsb::impl::FunctionStackBase::ReturnValue == 0);
        const uint16_t stack_check_1 = isolate->push_copy(JS_UNDEFINED);

        static_assert(jsb::impl::FunctionStackBase::This == 1);
        isolate->push_copy(this_val);

        static_assert(jsb::impl::FunctionStackBase::Data == 2);
        isolate->push_copy(func_data[jsb::impl::FuncPayload::kData]);

        static_assert(jsb::impl::FunctionStackBase::NewTarget == 3);
        const uint16_t stack_check_2 = isolate->push_copy(JS_UNDEFINED);

        jsb_check(stack_check_2 - stack_check_1 == jsb::impl::FunctionStackBase::Num - 1);
        static_assert(jsb::impl::FunctionStackBase::Num == 4);

        // push arguments
        for (int i = 0; i < argc; ++i)
        {
            isolate->push_copy(argv[i]);
        }

        const FunctionCallback callback = (FunctionCallback) JS_VALUE_GET_PTR(func_data[jsb::impl::FuncPayload::kCallback]);

        callback(info);
        if (isolate->is_error_thrown())
        {
            return JS_EXCEPTION;
        }
        return JS_DupValue(isolate->ctx(), (JSValue) info.GetReturnValue());
    }

    MaybeLocal<Function> Function::New(Local<Context> context, FunctionCallback callback, Local<Value> data)
    {
        Isolate* isolate = context->isolate_;
        JSValue payload[] = {
            /* jsb::impl::FuncPayload::kCallback */ JS_MKPTR(jsb::impl::JS_TAG_EXTERNAL, (void*) callback),
            /* jsb::impl::FuncPayload::kData*/ isolate->stack_dup(data->stack_pos_),
        };

        static_assert(sizeof(callback) == sizeof(void*));
        static_assert(jsb::impl::FuncPayload::kNum == ::std::size(payload));
        return MaybeLocal<Function>(Data(isolate, isolate->push_steal(JS_NewCFunctionData(isolate->ctx(),
            _function_call,
            /* length */ 0,
            /* magic */ 0,
            ::std::size(payload), payload))));
    }

    Local<Context> Function::GetCreationContextChecked() const
    {
        return Local<Context>(Data(isolate_, 0));
    }
}
