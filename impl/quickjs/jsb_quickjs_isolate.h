#ifndef GODOTJS_QUICKJS_ISOLATE_H
#define GODOTJS_QUICKJS_ISOLATE_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_array_buffer.h"

namespace v8
{
    class Isolate
    {
    public:
        struct CreateParams
        {
            ArrayBuffer::Allocator* array_buffer_allocator = nullptr;
        };

        Isolate* New(const CreateParams& params);

    private:
        Isolate();
        ~Isolate();

        JSRuntime* runtime_;
    };
}

#endif
