#ifndef GODOTJS_INLINE_ALLOCATOR_H
#define GODOTJS_INLINE_ALLOCATOR_H

#include "core/os/memory.h"
#include "jsb_macros.h"
#include "jsb_format.h"

namespace jsb::internal
{
    template <size_t ElementNum>
    struct InlineAllocator
    {
        enum { kInitialElementNum = ElementNum };

        template <size_t MemorySize>
        struct ByteCompat
        {
            uint8_t data[MemorySize];
        };

        template <typename TElementType>
        struct ForType
        {
            enum { kByteSize = ElementNum * sizeof(TElementType) };

            ForType() = default;
            ~ForType() = default;

            ForType(ForType&& other) noexcept
            {
                memcpy(compat.data, other.compat.data, kByteSize);
                num = other.num;
            }

            ForType& operator=(ForType&& other) noexcept
            {
                memcpy(compat.data, other.compat.data, kByteSize);
                num = other.num;
                return *this;
            }

            ForType(const ForType& other) = delete;
            ForType& operator=(const ForType& other) = delete;

            void resize(size_t p_last_num, size_t p_num)
            {
                jsb_checkf(p_num <= ElementNum, "can't allocate elements more than inline allocator allowed");
                if (p_num > p_last_num)
                {
                    const size_t added_count = p_num - p_last_num;
                    memset((void *)(get_data() + p_last_num), 0, added_count * sizeof(TElementType));
                    num = p_num;
                }
            }

            TElementType* get_data() const
            {
                return (TElementType*)(void*)compat.data;
            }

            constexpr size_t capacity() const { return num; }

            ByteCompat<kByteSize> compat;
            size_t num = 0;
        };
    };
}

#endif

