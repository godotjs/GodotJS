#include "jsb_web_function.h"

#include "jsb_web_context.h"

namespace v8
{
    MaybeLocal<Value> Function::Call(Local<Context> context, Local<Value> recv, int argc, Local<Value> argv[])
    {
        jsb::impl::StackPosition* vargv = jsb_stackalloc(jsb::impl::StackPosition, argc);
        for (int i = 0; i < argc; i++)
        {
            vargv[i] = argv[i]->stack_pos_;
        }
        jsb::impl::StackPosition rval_sp = jsbi_Call(isolate_->rt(), recv->stack_pos_, stack_pos_, argc, vargv);
        return MaybeLocal<Value>(Data(isolate_, rval_sp));
    }

    MaybeLocal<Function> Function::New(Local<Context> context, FunctionCallback callback, Local<Value> data)
    {
        Isolate* isolate = context->isolate_;
        static_assert(sizeof(callback) == sizeof(void*));
        return MaybeLocal<Function>(Data(isolate, jsbi_NewCFunction(isolate->rt(), (jsb::impl::FunctionPointer) callback, data->stack_pos_)));
    }

    Local<Context> Function::GetCreationContextChecked() const
    {
        return Local<Context>(Data(isolate_, 0));
    }
}
