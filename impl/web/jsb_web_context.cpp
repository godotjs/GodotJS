#include "jsb_web_context.h"

#include "jsb_web_isolate.h"

namespace v8
{
    void* Context::GetAlignedPointerFromEmbedderData(int index) const
    {
        jsb_check(index == 0);
        return isolate_->context_embedder_data_;
    }

    void Context::SetAlignedPointerInEmbedderData(int index, void* data)
    {
        jsb_check(index == 0);
        isolate_->context_embedder_data_ = data;
    }

    Local<Context> Context::New(Isolate* isolate)
    {
        return Local<Context>(Data(isolate, 0));
    }

    Local<Object> Context::Global() const
    {
        return Local<Object>(Data(isolate_, jsbi_GetGlobalObject(isolate_->rt())));
    }

}
