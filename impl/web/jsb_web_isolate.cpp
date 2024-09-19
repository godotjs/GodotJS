#include "jsb_web_isolate.h"
// #include ""
namespace v8
{
    uint32_t Isolate::alloc_value(const jsb::vm::JSValue& value)
    {
        CRASH_COND(handle_scope_ == nullptr);
        const uint32_t index = handle_scope_->size_++;
        jsb::vm::JSValue& jv = _at(index);
        jv = value;
        if (jv.type < 0)
        {
            ::jsb_web_value_add_ref(id_, jv.u.ptr);
        }
        return index;
    }

    const jsb::vm::JSValue& Isolate::get_value(uint32_t index)
    {
        CRASH_COND(handle_scope_ == nullptr);
        CRASH_COND(handle_scope_->base_ + handle_scope_->size_ <= index);
        return stack_[index];
    }

    Isolate::Isolate()
    {
        handle_scope_ = nullptr;
        id_ = jsb_web_create_engine();
        data_ = nullptr;
        context_data_ = nullptr;
        stack_.resize(64);
    }

    Isolate::~Isolate()
    {
    }

    void Isolate::Dispose()
    {
        jsb_web_drop_engine(id_);
    }

    void Isolate::SetData(uint32_t slot, void* data)
    {
        CRASH_COND_MSG(slot != 0, "not supported");
        data_ = data;
    }

    void* Isolate::GetData(uint32_t slot) const
    {
        CRASH_COND_MSG(slot != 0, "not supported");
        return data_;
    }

    Local<Context> Isolate::GetCurrentContext()
    {
        return Local<Context>(this, 0);
    }

    HandleScope::HandleScope(Isolate* isolate)
    {
        size_ = 0;
        isolate_ = isolate;
        last_ = isolate->handle_scope_;
        base_ = last_ ? last_->base_ + last_->size_ : 0;
        isolate->handle_scope_ = this;
    }

    HandleScope::~HandleScope()
    {
        CRASH_COND_MSG(isolate_->handle_scope_ != this, "invalid op");
        isolate_->handle_scope_ = last_;
        for (uint32_t i = base_; i < size_; ++i)
        {
            jsb::vm::JSValue& val = isolate_->stack_[i];
            if (val.type < 0)
            {
                ::jsb_web_value_remove_ref(isolate_->id_, val.u.ptr);
                val.type = jsb::vm::JSValue::Uninitialized;
            }
        }
    }

}
