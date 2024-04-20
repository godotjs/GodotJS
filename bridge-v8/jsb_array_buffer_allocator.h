#ifndef JAVASCRIPT_ARRAY_BUFFER_ALLOCATOR_H
#define JAVASCRIPT_ARRAY_BUFFER_ALLOCATOR_H

#include "jsb_pch.h"

namespace jsb
{
    class ArrayBufferAllocator : public v8::ArrayBuffer::Allocator
    {
    public:
        virtual void* Allocate(size_t length) override
        {
            return memalloc(length);
        }

        virtual void* AllocateUninitialized(size_t length) override
        {
            void* p = memalloc(length);
            memset(p, 0, length);
            return p;
        }

        virtual void Free(void* data, size_t length) override
        {
            memfree(data);
        }
    };
}

#endif
