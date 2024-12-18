#ifndef GODOTJS_WEB_DATA_H
#define GODOTJS_WEB_DATA_H
#include "jsb_web_pch.h"
#include "jsb_web_typedef.h"

namespace v8
{
    class Isolate;

    class Data
    {
    public:
        Data() = default;
        Data(Isolate* isolate, jsb::impl::StackPosition stack_pos): isolate_(isolate), stack_pos_(stack_pos) {}

        Isolate* isolate_ = nullptr;
        jsb::impl::StackPosition stack_pos_ = 0;

        bool operator==(const Data& other) const
        {
            return isolate_ == other.isolate_ && (stack_pos_ == other.stack_pos_ || strict_eq(other));
        }

        // should only be called on Name & Object
        int GetIdentityHash() const;

        bool IsNullOrUndefined() const;
        bool IsUndefined() const;
        bool IsBoolean() const;
        bool IsObject() const;
        bool IsFunction() const;
        bool IsPromise() const;
        bool IsArray() const;
        bool IsMap() const;
        bool IsString() const;
        bool IsSymbol() const;
        bool IsInt32() const;
        bool IsUint32() const;
        bool IsNumber() const;
        bool IsBigInt() const;
        bool IsExternal() const;
        bool IsArrayBuffer() const;

    private:
        bool strict_eq(const Data& other) const;
    };
}
#endif
