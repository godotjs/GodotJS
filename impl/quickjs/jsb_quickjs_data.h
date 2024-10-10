#ifndef GODOTJS_QUICKJS_DATA_H
#define GODOTJS_QUICKJS_DATA_H
#include "jsb_quickjs_pch.h"

namespace v8
{
    class Isolate;

    class Data
    {
    public:
        Data() = default;
        Data(Isolate* isolate, uint16_t stack_pos): isolate_(isolate), stack_pos_(stack_pos) {}

        Isolate* isolate_ = nullptr;
        uint16_t stack_pos_ = 0;

        explicit operator JSValue() const;

        bool operator==(const Data& other) const
        {
            return isolate_ == other.isolate_ && (stack_pos_ == other.stack_pos_ || strict_eq(other));
        }

        bool IsNullOrUndefined() const;
        bool IsUndefined() const;
        bool IsObject() const;
        bool IsFunction() const;
        bool IsPromise() const;
        bool IsArray() const;
        bool IsString() const;
        bool IsInt32() const;
        bool IsNumber() const;
        bool IsBigInt() const;

    private:
        bool strict_eq(const Data& other) const;
    };
}
#endif
