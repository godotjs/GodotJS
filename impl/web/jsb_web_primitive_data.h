#ifndef GODOTJS_WEB_PRIMITIVE_DATA_H
#define GODOTJS_WEB_PRIMITIVE_DATA_H

#include "jsb_web_interop.h"

namespace v8
{
    class Isolate;

    struct Data
    {
        Isolate* isolate_ = nullptr;
        int stack_ = 0;
        int index_ = 0;

        Data() {}
        Data(Isolate* isolate, int stack, int index) : isolate_(isolate), stack_(stack), index_(index) {}

        bool is_valid() const { return isolate_ != nullptr && stack_ != 0; }
        bool equals_to(const Data& other) const;

        bool operator==(const Data& other) const
        {
            if (isolate_ != other.isolate_) return false;
            if (stack_ == other.stack_ && index_ == other.index_) return true;
            return equals_to(other);
        }

        bool IsMap() const;
        bool IsInt32() const;
        bool IsUint32() const;
        bool IsNumber() const;
        bool IsBoolean() const;
        bool IsString() const;
        bool IsArray() const;
        bool IsUndefined() const;
        bool IsNull() const;
        bool IsObject() const;
        bool IsFunction() const;
        bool IsPromise() const;
    };
}

#endif
