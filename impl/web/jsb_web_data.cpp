#include "jsb_web_data.h"
#include "jsb_web_isolate.h"
#include "jsb_web_ext.h"

namespace v8
{
    int Data::GetIdentityHash() const
    {
        return jsbi_hash(isolate_->rt(), stack_pos_);
    }

    bool Data::IsNullOrUndefined() const
    {
        return jsbi_IsNullOrUndefined(isolate_->rt(), stack_pos_);
    }

    bool Data::IsUndefined() const
    {
        return jsbi_IsUndefined(isolate_->rt(), stack_pos_);
    }

    bool Data::IsObject() const
    {
        return jsbi_IsObject(isolate_->rt(), stack_pos_);
    }

    bool Data::IsPromise() const
    {
        return jsbi_IsPromise(isolate_->rt(), stack_pos_);
    }

    bool Data::IsArray() const
    {
        return jsbi_IsArray(isolate_->rt(), stack_pos_);
    }

    bool Data::IsMap() const
    {
        return jsbi_IsMap(isolate_->rt(), stack_pos_);
    }

    bool Data::IsSymbol() const
    {
        return jsbi_IsSymbol(isolate_->rt(), stack_pos_);
    }

    bool Data::IsString() const
    {
        return jsbi_IsString(isolate_->rt(), stack_pos_);
    }

    bool Data::IsFunction() const
    {
        return jsbi_IsFunction(isolate_->rt(), stack_pos_);
    }

    bool Data::IsInt32() const
    {
        return jsbi_IsInt32(isolate_->rt(), stack_pos_);
    }

    bool Data::IsUint32() const
    {
        return jsbi_IsUint32(isolate_->rt(), stack_pos_);
    }

    bool Data::IsNumber() const
    {
        return jsbi_IsNumber(isolate_->rt(), stack_pos_);
    }

    bool Data::IsExternal() const
    {
        return jsbi_IsExternal(isolate_->rt(), stack_pos_);
    }

    bool Data::IsBoolean() const
    {
        return jsbi_IsBoolean(isolate_->rt(), stack_pos_);
    }

    bool Data::IsBigInt() const
    {
        return jsbi_IsBigInt(isolate_->rt(), stack_pos_);
    }

    bool Data::IsArrayBuffer() const
    {
        return jsbi_IsArrayBuffer(isolate_->rt(), stack_pos_);
    }

    bool Data::strict_eq(const Data& other) const
    {
        return jsbi_strict_eq(isolate_->rt(), stack_pos_, other.stack_pos_);
    }

}
