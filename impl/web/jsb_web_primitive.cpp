#include "jsb_web_primitive.h"
#include "jsb_web_maybe.h"
#include "jsb_web_isolate.h"

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
        return MaybeLocal<String>(Data(isolate_, jsbi_ToString(isolate_->rt(), stack_pos_)));
    }

    Maybe<int32_t> Value::Int32Value(Local<Context> context) const
    {
        return Maybe<int32_t>(jsbi_Int32Value(isolate_->rt(), stack_pos_));
    }

    bool Value::BooleanValue(Isolate* isolate) const
    {
        return jsbi_BooleanValue(isolate_->rt(), stack_pos_);
    }

    Maybe<double> Value::NumberValue(Local<Context> context) const
    {
        return Maybe<double>(jsbi_NumberValue(isolate_->rt(), stack_pos_));
    }

    MaybeLocal<String> Value::ToString(Local<Context> context) const
    {
        return MaybeLocal<String>(Data(isolate_, jsbi_ToString(isolate_->rt(), stack_pos_)));
    }

    void* External::Value() const
    {
        return jsbi_GetExternal(isolate_->rt(), stack_pos_);
    }

    Local<External> External::New(Isolate* isolate, void* value)
    {
        return Local<External>(Data(isolate, jsbi_NewExternal(isolate->rt(), value)));
    }

    Local<Symbol> Symbol::New(Isolate* isolate)
    {
        return Local<Symbol>(Data(isolate, jsbi_NewSymbol(isolate->rt())));
    }

    int String::Length() const
    {
        return jsbi_GetLength(isolate_->rt(), stack_pos_);
    }

    Local<String> String::Empty(Isolate* isolate)
    {
        return Local<String>(Data(isolate, jsb::impl::StackPos::EmptyString));
    }

    Local<Integer> Integer::New(Isolate* isolate, int32_t value)
    {
        return Local<String>(Data(isolate, jsbi_NewInt32(isolate->rt(), value)));
    }

    Local<Integer> Integer::NewFromUnsigned(Isolate* isolate, uint32_t value)
    {
        return Local<String>(Data(isolate, jsbi_NewUint32(isolate->rt(), value)));
    }

    double Number::Value() const
    {
        return jsbi_NumberValue(isolate_->rt(), stack_pos_);
    }

    Local<Number> Number::New(Isolate* isolate, double value)
    {
        return Local<String>(Data(isolate, jsbi_NewNumber(isolate->rt(), value)));
    }

    int32_t Int32::Value() const
    {
        return jsbi_Int32Value(isolate_->rt(), stack_pos_);
    }

    uint32_t Uint32::Value() const
    {
        return jsbi_Uint32Value(isolate_->rt(), stack_pos_);
    }

    bool Boolean::Value() const
    {
        return jsbi_BooleanValue(isolate_->rt(), stack_pos_);
    }

    Local<Boolean> Boolean::New(Isolate* isolate, bool value)
    {
        return Local<Boolean>(Data(isolate, value ? jsb::impl::StackPos::True : jsb::impl::StackPos::False));
    }

    int64_t BigInt::Int64Value(bool* lossless) const
    {
        int64_t rval;
        const bool res = jsbi_Int64Value(isolate_->rt(), stack_pos_, &rval);
        jsb_unused(res);
        jsb_check(res);
        return rval;
    }

    Local<BigInt> BigInt::New(Isolate* isolate, int64_t value)
    {
        return Local<String>(Data(isolate, jsbi_NewBigInt64(isolate->rt(), &value)));
    }

}
