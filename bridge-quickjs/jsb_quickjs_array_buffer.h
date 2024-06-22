#ifndef GODOTJS_QUICKJS_ARRAY_BUFFER_H
#define GODOTJS_QUICKJS_ARRAY_BUFFER_H

namespace v8
{
    class ArrayBuffer
    {
    public:
        class Allocator
        {
        public:
            virtual ~Allocator() = default;

            virtual void* Allocate(size_t length) = 0;
            virtual void* AllocateUninitialized(size_t length) = 0;
            virtual void Free(void* data, size_t length) = 0;
        };
    };
}
#endif
