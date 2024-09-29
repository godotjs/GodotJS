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

    void Isolate::SetPromiseRejectCallback(PromiseRejectCallback callback)
    {
        //TODO
    }

    void Isolate::GetHeapStatistics(HeapStatistics* heap_statistics)
    {
        //TODO
    }

    int Isolate::GetCurrentStack() const
    {
        return top_->stack_;
    }


    Local<Context> Isolate::GetCurrentContext()
    {
        CRASH_COND(top_ == nullptr);
        return Local<Context>(this, top_->stack_, 0);
    }

    Local<Value> Isolate::ThrowError(Local<String> message)
    {
        //TODO
    }

}
