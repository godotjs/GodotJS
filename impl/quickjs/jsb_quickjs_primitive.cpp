#include "jsb_quickjs_primitive.h"
#include "jsb_quickjs_maybe.h"
#include "jsb_quickjs_isolate.h"

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

    Maybe<int32_t> Value::Int32Value(Local<Context> context) const
    {
        const JSValue val = (JSValue) *this;
        if (JS_VALUE_GET_TAG(val) == JS_TAG_INT) return Maybe<int32_t>(JS_VALUE_GET_INT(val));
        return Maybe<int32_t>();
    }

    bool Value::BooleanValue(Isolate* isolate) const
    {
        const JSValue val = (JSValue) *this;
        const int res = JS_ToBool(isolate_->ctx(), val);
        jsb_ensure(res >= 0);
        return !!res;
    }

    Maybe<double> Value::NumberValue(Local<Context> context) const
    {
        const JSValue val = (JSValue) *this;
        if (JS_VALUE_GET_TAG(val) == JS_TAG_INT) return Maybe<double>(JS_VALUE_GET_INT(val));
        if (JS_VALUE_GET_TAG(val) == JS_TAG_FLOAT64) return Maybe<double>(JS_VALUE_GET_FLOAT64(val));
        return  Maybe<double>();
    }

    MaybeLocal<String> Value::ToString(Local<Context> context) const
    {
        return MaybeLocal<String>(Data(isolate_, isolate_->push_steal(JS_ToString(isolate_->ctx(), (JSValue) *this))));
    }

    void* External::Value() const
    {
        const JSValue val = (JSValue) *this;
        return JS_VALUE_GET_PTR(val);
    }

    Local<External> External::New(Isolate* isolate, void* value)
    {
        const uint16_t stack_pos = isolate->push_steal(JS_MKPTR(jsb::impl::JS_TAG_EXTERNAL, value));
        return Local<External>(Data(isolate, stack_pos));
    }

    Local<Symbol> Symbol::New(Isolate* isolate)
    {
        return Local<Symbol>(Data(isolate, isolate->push_symbol()));
    }

    int String::Length() const
    {
        const JSValue val = JS_GetProperty(isolate_->ctx(), (JSValue) *this, jsb::impl::JS_ATOM_length);
        jsb_check(JS_VALUE_GET_TAG(val) == JS_TAG_INT);
        return JS_VALUE_GET_INT(val);
    }

    Local<String> String::Empty(Isolate* isolate)
    {
        return Local<String>(Data(isolate, jsb::impl::StackPos::EmptyString));
    }

    Local<Integer> Integer::New(Isolate* isolate, int32_t value)
    {
        const uint16_t stack_pos = isolate->push_steal(JS_NewInt32(isolate->ctx(), value));
        return Local<String>(Data(isolate, stack_pos));
    }

    Local<Integer> Integer::NewFromUnsigned(Isolate* isolate, uint32_t value)
    {
        //TODO avoid using Uint32 because the underlying tag is INT or FLOAT64
        const uint16_t stack_pos = isolate->push_steal(JS_NewUint32(isolate->ctx(), value));
        return Local<String>(Data(isolate, stack_pos));
    }

    double Number::Value() const
    {
        const JSValue val = (JSValue) *this;
        double rval;
        if (JS_ToFloat64(isolate_->ctx(), &rval, val) == -1)
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(isolate_->ctx());
        }
        return rval;
    }

    Local<Number> Number::New(Isolate* isolate, double value)
    {
        const uint16_t stack_pos = isolate->push_steal(JS_NewFloat64(isolate->ctx(), value));
        return Local<String>(Data(isolate, stack_pos));
    }

    // int64_t Integer::Value() const
    // {
    //     const JSValue val = (JSValue) *this;
    //     int32_t rval;
    //     if (JS_ToInt32(isolate_->ctx(), &rval, val))
    //     {
    //         isolate_->remove_exception_anyway();
    //     }
    //     return rval;
    // }

    int32_t Int32::Value() const
    {
        const JSValue val = (JSValue) *this;
        int32_t rval;
        if (JS_ToInt32(isolate_->ctx(), &rval, val) == -1)
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(isolate_->ctx());
        }
        return rval;
    }

    uint32_t Uint32::Value() const
    {
        const JSValue val = (JSValue) *this;
        uint32_t rval;
        if (JS_ToUint32(isolate_->ctx(), &rval, val) == -1)
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(isolate_->ctx());
        }
        return rval;
    }

    bool Boolean::Value() const
    {
        const JSValue val = (JSValue) *this;
        return !!JS_VALUE_GET_BOOL(val);
    }

    Local<Boolean> Boolean::New(Isolate* isolate, bool value)
    {
        return Local<Boolean>(Data(isolate, value ? jsb::impl::StackPos::True : jsb::impl::StackPos::False));
    }

    int64_t BigInt::Int64Value(bool* lossless) const
    {
        const JSValue val = (JSValue) *this;
        int64_t rval;
        if (JS_ToBigInt64(isolate_->ctx(), &rval, val) == -1)
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(isolate_->ctx());
        }
        return rval;
    }

    Local<BigInt> BigInt::New(Isolate* isolate, int64_t value)
    {
        const JSValue val = JS_NewBigInt64(isolate->ctx(), value);
        jsb_check(!JS_IsException(val));
        const uint16_t stack_pos = isolate->push_steal(val);
        return Local<String>(Data(isolate, stack_pos));
    }

}
