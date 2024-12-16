#ifndef GODOTJS_WEB_ARRAY_BUFFER_H
#define GODOTJS_WEB_ARRAY_BUFFER_H
#include "jsb_web_object.h"

namespace v8
{
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
