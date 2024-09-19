#ifndef GODOTJS_WEB_PRIMITIVE_DATA_H
#define GODOTJS_WEB_PRIMITIVE_DATA_H

#include <climits>
#include <cstdint>

namespace v8
{
    class Isolate;

    struct Data
    {
        Isolate* isolate_ = nullptr;
        uint32_t address_ = UINT_MAX;

        bool is_valid() const { return isolate_ != nullptr && address_ != UINT_MAX; }
        bool operator==(const Data& other) const { return isolate_ == other.isolate_ && address_ == other.address_; }

        bool IsArray() const;
        bool IsUndefined() const;
        bool IsNull() const;
        bool IsObject() const;
    };
}

#endif
