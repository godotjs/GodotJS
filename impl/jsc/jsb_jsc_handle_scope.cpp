#include "jsb_jsc_handle_scope.h"
#include "jsb_jsc_isolate.h"
namespace v8
{
    HandleScope::HandleScope(Isolate* isolate)
    {
        isolate_ = isolate;

        last_ = isolate_->handle_scope_;
        stack_ = isolate_->stack_pos_;
        isolate_->handle_scope_ = this;
        JSB_JSC_LOG(VeryVerbose, "enter stack frame %d", stack_);
    }

    HandleScope::~HandleScope()
    {
        jsb_check(isolate_->handle_scope_ == this);
        for (uint16_t i = stack_; i < isolate_->stack_pos_; i++)
        {
            JSValueUnprotect(isolate_->ctx_, isolate_->stack_[i]);
        }
        isolate_->handle_scope_ = last_;
        isolate_->stack_pos_ = stack_;
        JSB_JSC_LOG(VeryVerbose, "leave stack frame %d", stack_);
    }

} // namespace v8
