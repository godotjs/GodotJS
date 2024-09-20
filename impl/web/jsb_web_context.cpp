#include "jsb_web_context.h"
#include "jsb_web_isolate.h"
#include "jsb_web_handle_scope.h"
#include "core/error/error_macros.h"

namespace v8
{
    void Context::SetAlignedPointerInEmbedderData(int index, void* ptr)
    {
        CRASH_COND_MSG(index != 0, "not supported");
        isolate_->context_data_ = ptr;
    }

    void* Context::GetAlignedPointerFromEmbedderData(int index) const
    {
        CRASH_COND_MSG(index != 0, "not supported");
        return isolate_->context_data_;
    }

    Local<Context> Context::New(Isolate* isolate)
    {
        return Local<Context>(isolate, isolate->top_->depth_, 0);
    }

    Local<Object> Context::Global()
    {
        return Local<Object>(
            isolate_,
            isolate_->top_->depth_,
            ::jsapi_stack_push_global(isolate_->id_));
    }

}
