#ifndef GODOTJS_ANSI_ALLOCATOR_H
#define GODOTJS_ANSI_ALLOCATOR_H

#include "../compat/jsb_compat.h"
#include "jsb_macros.h"

namespace jsb::internal
{
    struct AnsiAllocator
    {
        enum { kInitialElementNum = 8 };

        struct AnyType
        {
        };

        template<size_t kSizeOfElement>
        struct AnyTypeAllocator
        {
            AnyTypeAllocator() : data(nullptr), num(0)
            {
            }

            ~AnyTypeAllocator()
            {
                if (data)
                {
                    memfree(data);
                }
            }

            AnyTypeAllocator(AnyTypeAllocator&& other) noexcept
            {
                data = other.data;
                num = other.num;
                other.data = nullptr;
                other.num = 0;
            }

            AnyTypeAllocator& operator=(AnyTypeAllocator&& other) noexcept
            {
                data = other.data;
                num = other.num;
                other.data = nullptr;
                other.num = 0;
                return *this;
            }

            AnyTypeAllocator(const AnyTypeAllocator& other) = delete;
            AnyTypeAllocator& operator=(const AnyTypeAllocator& other) = delete;

            void resize(size_t p_last_num, size_t p_num)
            {
                data = (AnyType*)memrealloc(data, next_power_of_2((unsigned int) (p_num * kSizeOfElement)));
                jsb_check(data);
                const size_t added_count = p_num - p_last_num;
                memset((void *)((unsigned char*) data + p_last_num * kSizeOfElement), 0,
                            added_count * kSizeOfElement);
                num = p_num;
            }

            AnyType* get_data() const
            {
                return data;
            }

            size_t capacity() const { return num; }

            AnyType* data;
            size_t num;
        };

        template <typename T>
        struct ForType : AnyTypeAllocator<sizeof(T)>
        {
            T* get_data() const
            {
                return (T*) AnyTypeAllocator<sizeof(T)>::get_data();
            }
        };
    };
}
#endif
