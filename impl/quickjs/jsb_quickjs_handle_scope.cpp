#include "jsb_quickjs_handle_scope.h"
#include "jsb_quickjs_isolate.h"
namespace v8
{
    HandleScope::HandleScope(Isolate* isolate)
    {
        isolate_ = isolate;

        last_ = isolate_->handle_scope_;
        stack_ = isolate_->stack_pos_;
        isolate_->handle_scope_ = this;
        JSB_QUICKJS_LOG(VeryVerbose, "enter stack frame %d", stack_);
    }

    HandleScope::~HandleScope()
    {
        jsb_check(isolate_->handle_scope_ == this);
        for (uint16_t i = stack_; i < isolate_->stack_pos_; i++)
        {
            JS_FreeValueRT(isolate_->rt(), isolate_->stack_[i]);
        }
        isolate_->handle_scope_ = last_;
        isolate_->stack_pos_ = stack_;
        JSB_QUICKJS_LOG(VeryVerbose, "leave stack frame %d", stack_);
    }

}
