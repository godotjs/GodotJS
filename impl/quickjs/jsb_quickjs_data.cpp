#include "jsb_quickjs_data.h"

#include "jsb_quickjs_isolate.h"

namespace v8
{
    Data::operator JSValue() const
    {
        return isolate_->operator[](stack_pos_);
    }

    bool Data::IsNullOrUndefined() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsNull(val) || JS_IsUndefined(val);
    }

    bool Data::IsUndefined() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsUndefined(val);
    }

    bool Data::IsObject() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsObject(val);
    }

    bool Data::IsPromise() const
    {
        //TODO not supported
        return false;
    }

    bool Data::IsArray() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsArray(isolate_->ctx(), val);
    }

    bool Data::IsString() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsString(val);
    }

    bool Data::IsFunction() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsFunction(isolate_->ctx(), val);
    }

    bool Data::IsInt32() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);

        //TODO safe?
        return JS_VALUE_GET_TAG(val) == JS_TAG_INT;
    }

    bool Data::IsNumber() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsNumber(val);
    }

    bool Data::IsBigInt() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        return JS_IsBigInt(isolate_->ctx(), val);
    }

    bool Data::strict_eq(const Data& other) const
    {
        const JSValue val1 = isolate_->operator[](stack_pos_);
        const JSValue val2 = isolate_->operator[](other.stack_pos_);
        if (val1.tag != val2.tag) return false;

        //TODO unsafe eq check
        if (val1.u.ptr != val2.u.ptr) return false;
        return true;
    }

}
