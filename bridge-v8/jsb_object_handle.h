#ifndef JAVASCRIPT_PRIVATE_DATA_TYPE_H
#define JAVASCRIPT_PRIVATE_DATA_TYPE_H

#include "jsb_class_info.h"
#include "jsb_pch.h"

namespace jsb
{
    enum : uint32_t
    {
        kObjectFieldPointer,
        kObjectFieldCount
    };

    struct ObjectHandle
    {
        NativeClassID class_id;

        // primitive pointer to the native object.
        // must be a real pointer which implies that different objects have different addresses.
        void* pointer;

        // this reference is initially weak and hooked on v8 gc callback.
        // it becomes a strong reference after the `ref_count_` explicitly increased.
        v8::Global<v8::Object> ref_;

        uint32_t ref_count_;
    };
}

#endif
