#ifndef GODOTJS_WEB_CALLBACK_H
#define GODOTJS_WEB_CALLBACK_H
#include "jsb_web_interop.h"
#include "jsb_web_primitive.h"
#include "jsb_web_isolate.h"
#include "jsb_web_local_handle.h"

namespace v8
{
    class Isolate;

    namespace Indecies
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

        void Set(const Local<Value> value)
        {
            jsapi_sv_copy(isolate_->id_, value->stack_, value->index_, stack_, Indecies::kReturn);
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
            return Local<Value>(isolate_, stack_, index + Indecies::kArgs);
        }

        Local<Value> Data() const
        {
            return Local<Value>(isolate_, stack_, Indecies::kData);
        }

        Local<Object> This() const
        {
            return Local<Value>(isolate_, stack_, Indecies::kThis);
        }

        Local<Value> NewTarget() const
        {
            return Local<Value>(isolate_, stack_, Indecies::kNewTarget);
        }

        ReturnValue<T> GetReturnValue() const
        {
            return ReturnValue<T>(isolate_, stack_, Indecies::kReturn);
        }
    };
}

#endif
