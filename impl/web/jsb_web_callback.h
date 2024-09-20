#ifndef GODOTJS_WEB_CALLBACK_H
#define GODOTJS_WEB_CALLBACK_H

#include "jsb_web_local_handle.h"
#include "jsb_web_global_handle.h"
#include "jsb_web_primitive.h"
#include "jsb_web_isolate.h"

namespace v8
{
    class Isolate;

    namespace internal
    {
        enum { kReturn, kThis, kNewTarget, kData, kArgs };
    }

    template<typename T>
    struct ReturnValue
    {
        Isolate* isolate_;
        int stack_;

        ReturnValue(Isolate* isolate, int stack)
            : isolate_(isolate), stack_(stack)
        {}

        template<typename S>
        void Set(const Local<S>& value)
        {
            jsapi_sv_copy(isolate_->id_, value->stack_, value->index_, stack_, internal::kReturn);
        }

        template<typename S>
        void Set(const Global<S>& value)
        {
            const Local<Value> lv = value.Get(isolate_);
            jsapi_sv_copy(isolate_->id_, lv->stack_, lv->index_, stack_, internal::kReturn);
        }

        void Set(uint32_t value)
        {
            const Local<Value> lv = Uint32::NewFromUnsigned(isolate_, value);
            jsapi_sv_copy(isolate_->id_, lv->stack_, lv->index_, stack_, internal::kReturn);
        }
    };

    template<typename T>
    struct FunctionCallbackInfo
    {
        Isolate* isolate_;
        bool is_construct_;
        int stack_;
        int argc_;

        FunctionCallbackInfo(Isolate* isolate, bool is_construct, int stack, int argc)
        : isolate_(isolate), is_construct_(is_construct), stack_(stack), argc_(argc)
        {}

        Isolate* GetIsolate() const { return isolate_; }

        bool IsConstructCall() const { return is_construct_; }

        int Length() const { return argc_; }

        Local<Value> operator[](int index) const
        {
            if (index < 0 || index >= Length()) return Undefined(isolate_);
            return Local<Value>(isolate_, stack_, index + internal::kArgs);
        }

        Local<Value> Data() const
        {
            return Local<Value>(isolate_, stack_, internal::kData);
        }

        Local<Object> This() const
        {
            return Local<Value>(isolate_, stack_, internal::kThis);
        }

        Local<Value> NewTarget() const
        {
            return Local<Value>(isolate_, stack_, internal::kNewTarget);
        }

        ReturnValue<T> GetReturnValue() const
        {
            return ReturnValue<T>(isolate_, stack_, internal::kReturn);
        }
    };

    using FunctionCallback = void (*)(const FunctionCallbackInfo<Value>& info);
}

#endif
