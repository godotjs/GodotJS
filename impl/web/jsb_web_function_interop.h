#ifndef GODOTJS_WEB_FUNCTION_INTEROP_H
#define GODOTJS_WEB_FUNCTION_INTEROP_H
#include "jsb_web_object.h"
#include "jsb_web_isolate.h"
#include "jsb_web_typedef.h"

namespace v8
{
    template <typename T>
    class ReturnValue
    {
    public:
        ReturnValue(const Data& data)
            : data_(data) {}

        template <typename S>
        void Set(const Local<S>& value) const
        {
            jsbi_StackSet(data_.isolate_->rt(), data_.stack_pos_, (jsb::impl::StackPosition) value);
        }

        template <typename S>
        void Set(const Global<S>& value) const
        {
            if (value.IsEmpty())
            {
                jsbi_StackSet(data_.isolate_->rt(), data_.stack_pos_, jsb::impl::StackBase::Undefined);
                return;
            }
            Set(value.Get(data_.isolate_));
        }

        void Set(int32_t value) const
        {
            jsbi_StackSetInt32(data_.isolate_->rt(), data_.stack_pos_, value);
        }

    private:
        Data data_;
    };

    template <typename T>
    class FunctionCallbackInfo
    {
    public:
        FunctionCallbackInfo(Isolate* isolate, bool is_constructor, jsb::impl::StackPosition base_sp, int argc)
            : isolate_(isolate), is_constructor_(is_constructor), base_sp_(base_sp), argc_(argc)
        {
        }

        ReturnValue<T> GetReturnValue() const
        {
            return ReturnValue<T>(v8::Data(isolate_, base_sp_ + jsb::impl::FunctionStackBase::ReturnValue));
        }

        Local<Object> This() const
        {
            return Local<Object>(v8::Data(isolate_, base_sp_ + jsb::impl::FunctionStackBase::This));
        }

        Local<Value> Data() const
        {
            return Local<Object>(v8::Data(isolate_, base_sp_ + jsb::impl::FunctionStackBase::Data));
        }

        Local<Value> NewTarget() const
        {
            return Local<Object>(v8::Data(isolate_, base_sp_ + jsb::impl::FunctionStackBase::NewTarget));
        }

        Isolate* GetIsolate() const { return isolate_; }

        Local<Value> operator[](int index) const
        {
            jsb_check(index >= 0);
            if (index < argc_)
            {
                return Local<Value>(v8::Data(isolate_, base_sp_ + jsb::impl::FunctionStackBase::_Num + index));
            }
            return Local<Value>(v8::Data(isolate_, jsb::impl::StackBase::Undefined));
        }

        int Length() const { return argc_; }

        bool IsConstructCall() const { return is_constructor_; }

    private:
        Isolate* isolate_;
        bool is_constructor_;
        jsb::impl::StackPosition base_sp_;
        int argc_;
    };

    template <typename T>
    class PropertyCallbackInfo
    {
    public:
        PropertyCallbackInfo(Isolate* isolate, jsb::impl::StackPosition stack_pos)
            : isolate_(isolate), stack_pos_(stack_pos) {}
        Isolate* GetIsolate() const { return isolate_; }
        ReturnValue<T> GetReturnValue() const
        {
            return ReturnValue<T>(v8::Data(isolate_, stack_pos_));
        }

    private:
        Isolate* isolate_;
        jsb::impl::StackPosition stack_pos_;
    };
} // namespace v8
#endif
