#include "jsb_quickjs_primitive.h"

namespace v8
{
    Local<Primitive> Undefined(Isolate* isolate)
    {
        return Local<Primitive>(Data(isolate, jsb::impl::StackPos::Undefined));
    }

    Local<Primitive> Null(Isolate* isolate)
    {
        return Local<Primitive>(Data(isolate, jsb::impl::StackPos::Null));
    }

    MaybeLocal<String> Value::ToDetailString(Local<Context> context) const
    {
        const uint16_t stack_pos = isolate_->push_steal(JS_ToString(isolate_->ctx(), (JSValue) *this));
        return MaybeLocal<String>(Data(isolate_, stack_pos));
    }

    Local<Integer> Integer::New(Isolate* isolate, int32_t value)
    {
        const uint16_t stack_pos = isolate->push_steal(JS_NewInt32(isolate->ctx(), value));
        return Local<String>(Data(isolate, stack_pos));
    }

    double Number::Value() const
    {
        const JSValue val = (JSValue) *this;
        double rval;
        if (JS_ToFloat64(isolate_->ctx(), &rval, val))
        {
            isolate_->remove_exception_anyway();
        }
        return rval;
    }

    int32_t Integer::Value() const
    {
        const JSValue val = (JSValue) *this;
        int32_t rval;
        if (JS_ToInt32(isolate_->ctx(), &rval, val))
        {
            isolate_->remove_exception_anyway();
        }
        return rval;
    }

    int64_t BigInt::Int64Value(bool* lossless) const
    {
        const JSValue val = (JSValue) *this;
        int64_t rval;
        if (JS_ToBigInt64(isolate_->ctx(), &rval, val))
        {
            isolate_->remove_exception_anyway();
        }
        return rval;
    }

}
