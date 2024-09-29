#include "jsb_web_handle_scope.h"
#include "jsb_web_interop.h"
#include "jsb_web_isolate.h"

namespace v8
{
    HandleScope::HandleScope(Isolate* isolate)
    {
        isolate_ = isolate;
        is_native_ = true;
        stack_ = ::jsapi_stack_enter(isolate_->id_);
        last_ = isolate->top_;
        isolate->top_ = this;
    }

    HandleScope::HandleScope(Isolate* isolate, int stack)
    {
        isolate_ = isolate;
        is_native_ = false;
        last_ = isolate->top_;
        isolate->top_ = this;
        stack_ = stack;
    }

    HandleScope::~HandleScope()
    {
        CRASH_COND_MSG(isolate_->top_ != this, "invalid op");
        isolate_->top_ = last_;
        if (is_native_)
        {
            ::jsapi_stack_exit(isolate_->id_);
        }
    }
}
