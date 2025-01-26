#include "jsb_jsc_primitive.h"
#include "jsb_jsc_maybe.h"
#include "jsb_jsc_isolate.h"

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
        //TODO no equivalent implementation
        return ToString(context);
    }

    Maybe<int32_t> Value::Int32Value(Local<Context> context) const
    {
        JSValueRef error = nullptr;
        const int32_t rval = JSValueToInt32(isolate_->ctx(), (JSValueRef) *this, &error);
        if (jsb_unlikely(error)) return Maybe<int32_t>();
        return Maybe<int32_t>(rval);
    }

    bool Value::BooleanValue(Isolate* isolate) const
    {
        return JSValueToBoolean(isolate_->ctx(), (JSValueRef) *this);
    }

    Maybe<double> Value::NumberValue(Local<Context> context) const
    {
        JSValueRef error = nullptr;
        const double rval = JSValueToNumber(isolate_->ctx(), (JSValueRef) *this, &error);
        if (jsb_unlikely(error)) return Maybe<double>();
        return Maybe<double>(rval);
    }

    MaybeLocal<String> Value::ToString(Local<Context> context) const
    {
        if (const JSStringRef str = JSValueToStringCopy(isolate_->ctx(), (JSValueRef) *this, nullptr))
        {
            const JSValueRef val = JSValueMakeString(isolate_->ctx(), str);
            return MaybeLocal<String>(Data(isolate_, isolate_->push_copy(val)));
        }
        return MaybeLocal<String>();
    }

    void* External::Value() const
    {
        const JSValueRef val = (JSValueRef) *this;
        jsb_check(isolate_->_IsExternal(val));
        //TODO we know val must be an instance of External. uncertain whether it's reasonable not using `JSValueToObject` here?
        return JSObjectGetPrivate((JSObjectRef) val);
    }

    Local<External> External::New(Isolate* isolate, void* value)
    {
        const JSObjectRef obj = isolate->_NewExternal(value);
        const uint16_t stack_pos = isolate->push_copy(obj);
        return Local<External>(Data(isolate, stack_pos));
    }

    Local<Symbol> Symbol::New(Isolate* isolate)
    {
        const JSValueRef val = JSValueMakeSymbol(isolate->ctx(), nullptr);
        jsb_check(val);
        return Local<Symbol>(Data(isolate, isolate->push_copy(val)));
    }

    int String::Length() const
    {
        jsb_check(JSValueIsString(isolate_->ctx(), (JSValueRef) *this));
        if (const JSStringRef str = JSValueToStringCopy(isolate_->ctx(), (JSValueRef) *this, nullptr))
        {
            const size_t len = JSStringGetLength(str);
            jsb_check((size_t)(int) len == len);
            return (int) len;
        }
        return 0;
    }

    Local<String> String::Empty(Isolate* isolate)
    {
        return Local<String>(Data(isolate, jsb::impl::StackPos::EmptyString));
    }

    Local<Integer> Integer::New(Isolate* isolate, int32_t value)
    {
        const JSValueRef val = JSValueMakeNumber(isolate->ctx(), (int32_t) value);
        const uint16_t stack_pos = isolate->push_copy(val);
        return Local<String>(Data(isolate, stack_pos));
    }

    Local<Integer> Integer::NewFromUnsigned(Isolate* isolate, uint32_t value)
    {
        const JSValueRef val = JSValueMakeNumber(isolate->ctx(), (uint32_t) value);
        const uint16_t stack_pos = isolate->push_copy(val);
        return Local<String>(Data(isolate, stack_pos));
    }

    double Number::Value() const
    {
        return JSValueToNumber(isolate_->ctx(), (JSValueRef) *this, nullptr);
    }

    Local<Number> Number::New(Isolate* isolate, double value)
    {
        const JSValueRef val = JSValueMakeNumber(isolate->ctx(), value);
        const uint16_t stack_pos = isolate->push_copy(val);
        return Local<String>(Data(isolate, stack_pos));
    }

    int32_t Int32::Value() const
    {
        return JSValueToInt32(isolate_->ctx(), (JSValueRef) *this, nullptr);
    }

    uint32_t Uint32::Value() const
    {
        return JSValueToUInt32(isolate_->ctx(), (JSValueRef) *this, nullptr);
    }

    bool Boolean::Value() const
    {
        return JSValueToBoolean(isolate_->ctx(), (JSValueRef) *this);
    }

    Local<Boolean> Boolean::New(Isolate* isolate, bool value)
    {
        return Local<Boolean>(Data(isolate, value ? jsb::impl::StackPos::True : jsb::impl::StackPos::False));
    }

    int64_t BigInt::Int64Value(bool* lossless) const
    {
        return JSValueToInt64(isolate_->ctx(), (JSValueRef) *this, nullptr);
    }

    Local<BigInt> BigInt::New(Isolate* isolate, int64_t value)
    {
        const JSValueRef val = JSBigIntCreateWithInt64(isolate->ctx(), value, nullptr);
        jsb_check(val);
        const uint16_t stack_pos = isolate->push_copy(val);
        return Local<String>(Data(isolate, stack_pos));
    }

}
