#include "jsb_jsc_data.h"
#include "jsb_jsc_isolate.h"
#include "jsb_jsc_ext.h"
#include <cmath>
#include <limits>

namespace v8
{
    static bool is_strict_integer_in_range(const JSContextRef ctx, const JSValueRef value, const double min, const double max)
    {
        JSValueRef error = nullptr;
        const double number = JSValueToNumber(ctx, value, &error);
        if (error != nullptr)
        {
            return false;
        }
        if (!std::isfinite(number) || std::trunc(number) != number)
        {
            return false;
        }
        return number >= min && number <= max;
    }

    int Data::GetIdentityHash() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        //TODO improve jsc value hash

        if (!JSValueIsObject(isolate_->ctx(), val))
        {
            return 0;
        }

        const uintptr_t ptr = (uintptr_t) val;
#if INTPTR_MAX >= INT64_MAX
        return (int) ((ptr >> 32) ^ (ptr & 0xffffffff));
#elif INTPTR_MAX >= INT32_MAX
        return (int) ptr;
#else
        #error "jsc.impl does not support on the current arch"
#endif
    }

    Data::operator JSValueRef() const
    {
        return isolate_->stack_val(stack_pos_);
    }

    bool Data::IsNullOrUndefined() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsNull(isolate_->ctx(), val) || JSValueIsUndefined(isolate_->ctx(), val);
    }

    bool Data::IsNull() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsNull(isolate_->ctx(), val);
    }

    bool Data::IsUndefined() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsUndefined(isolate_->ctx(), val);
    }

    bool Data::IsObject() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsObject(isolate_->ctx(), val);
    }

    bool Data::IsPromise() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return isolate_->_IsPromise(val);
    }

    bool Data::IsArray() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsArray(isolate_->ctx(), val);
    }

    bool Data::IsMap() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return isolate_->_IsMap(val);
    }

    bool Data::IsSet() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return isolate_->_IsSet(val);
    }

    bool Data::IsSymbol() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsSymbol(isolate_->ctx(), val);
    }

    bool Data::IsString() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsString(isolate_->ctx(), val);
    }

    bool Data::IsFunction() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        const JSObjectRef obj = JSValueToObject(isolate_->ctx(), val, nullptr);
        return obj && JSObjectIsFunction(isolate_->ctx(), obj);
    }

    bool Data::IsInt32() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        if (!JSValueIsNumber(isolate_->ctx(), val))
        {
            return false;
        }
        return is_strict_integer_in_range(
            isolate_->ctx(),
            val,
            (double) std::numeric_limits<int32_t>::min(),
            (double) std::numeric_limits<int32_t>::max());
    }

    bool Data::IsUint32() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        if (!JSValueIsNumber(isolate_->ctx(), val))
        {
            return false;
        }
        return is_strict_integer_in_range(
            isolate_->ctx(),
            val,
            0.0,
            (double) std::numeric_limits<uint32_t>::max());
    }

    bool Data::IsNumber() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsNumber(isolate_->ctx(), val);
    }

    bool Data::IsExternal() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return isolate_->_IsExternal(val);
    }

    bool Data::IsBoolean() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsBoolean(isolate_->ctx(), val);
    }

    bool Data::IsBigInt() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return JSValueIsBigInt(isolate_->ctx(), val);
    }

    bool Data::IsArrayBuffer() const
    {
        const JSValueRef val = isolate_->stack_val(stack_pos_);
        return isolate_->_IsArrayBuffer(val);
    }

    bool Data::strict_eq(const Data& other) const
    {
        const JSValueRef val1 = isolate_->stack_val(stack_pos_);
        const JSValueRef val2 = isolate_->stack_val(other.stack_pos_);
        return JSValueIsStrictEqual(isolate_->ctx(), val1, val2);
    }

}
