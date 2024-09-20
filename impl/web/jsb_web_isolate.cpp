#include "jsb_web_isolate.h"
#include "jsb_web_handle_scope.h"

namespace v8
{
    Isolate::Isolate()
    {
        top_ = nullptr;
        id_ = jsapi_create_engine(this);
        isolate_data_ = nullptr;
        context_data_ = nullptr;
    }

    Isolate::~Isolate()
    {
    }

    void Isolate::Dispose()
    {
        jsapi_drop_engine(id_);
    }

    void Isolate::SetData(uint32_t slot, void* data)
    {
        CRASH_COND_MSG(slot != 0, "not supported");
        isolate_data_ = data;
    }

    void* Isolate::GetData(uint32_t slot) const
    {
        CRASH_COND_MSG(slot != 0, "not supported");
        return isolate_data_;
    }

    Local<Context> Isolate::GetCurrentContext()
    {
        CRASH_COND(top_ == nullptr);
        return Local<Context>(this, top_->depth_, 0);
    }

    Local<Value> Isolate::ThrowError(Local<String> message)
    {
        //TODO
    }

    HandleScope::HandleScope(Isolate* isolate)
    {
        isolate_ = isolate;
        is_native_ = true;
        depth_ = ::jsapi_stack_enter(isolate_->id_);
        last_ = isolate->top_;
        isolate->top_ = this;
    }

    HandleScope::HandleScope(Isolate* isolate, int depth)
    {
        isolate_ = isolate;
        is_native_ = false;
        last_ = isolate->top_;
        isolate->top_ = this;
        depth_ = depth;
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
