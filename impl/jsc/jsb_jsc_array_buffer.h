#ifndef GODOTJS_QUICKJS_ARRAY_BUFFER_H
#define GODOTJS_QUICKJS_ARRAY_BUFFER_H
#include "jsb_jsc_object.h"

namespace v8
{
    //NOTE Avoid using ArrayBuffer in 'bridge' layer.
    //     It has no direct alternative implementation in web.impl (for simplicity).
    class ArrayBuffer : public Object
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

        void* Data() const;
        size_t ByteLength() const;

        static Local<ArrayBuffer> New(Isolate* isolate, size_t length);

    private:
        static void _free(JSRuntime *rt, void *opaque, void *ptr);
    };
}
#endif
