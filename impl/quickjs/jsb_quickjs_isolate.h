#ifndef GODOTJS_QUICKJS_ISOLATE_H
#define GODOTJS_QUICKJS_ISOLATE_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_typedef.h"
#include "jsb_quickjs_handle_scope.h"
#include "jsb_quickjs_array_buffer.h"

namespace v8
{
    template<typename T>
    class WeakCallbackInfo
    {

    };

    typedef void (*GCCallback)(WeakCallbackInfo<void> info);

    class Isolate
    {
    public:
        struct InternalData
        {
            uint8_t internal_field_count = 0;
            void* internal_fields[2];
            Vector<GCCallback> callbacks;
        };

        struct ReferenceData
        {
            jsb::internal::SArray<GCCallback, jsb::internal::Index32> callbacks;
        };

        struct CreateParams
        {
            ArrayBuffer::Allocator* array_buffer_allocator = nullptr;
        };

        Isolate* New(const CreateParams& params);

    private:
        Isolate();
        ~Isolate();

        JSRuntime* runtime_;
        HandleScope* handle_scope_;

        jsb::internal::SArray<InternalData> internal_data_;
        HashMap<jsb::internal::Index64, ReferenceData> ref_data_;

        JSValue stack_[jsb::impl::kStackSize];
    };
}

#endif
