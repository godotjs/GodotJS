#ifndef GODOTJS_OBJECT_HANDLE_H
#define GODOTJS_OBJECT_HANDLE_H

#include "jsb_bridge_pch.h"

namespace jsb
{
    enum EInternalFields
    {
        IF_Pointer = 0, // pointer to object (used by object/variant both)
        IF_ObjectT = 1, // placeholder for non-valuetype objects

        IF_VariantFieldCount = 1,
        IF_ObjectFieldCount = 2,
    };

    namespace EBindingPolicy
    {
        enum Type : uint8_t
        {
            External, // managed by c++ (the javascript counterpart will be strong-referenced)
            Managed,  // managed by javascript gc (c++ waits gc to finalize the native object)
        };
    }

    // godot Object classes or c++ native wrapped classes are registered in an object registry in Environment.
    // godot Variant (valuetype) DO NOT have it's ObjectHandle.
    struct ObjectHandle
    {
        NativeClassID class_id;

        uint32_t ref_count_;

#if JSB_DEBUG
        // The raw pointer to the native object.
        // It must be a unique pointer which implies that different objects have different addresses.
        //NOTE it's useless at runtime now. we hold it here to validate the object binding for debugging only.
        void* pointer;
#endif

        // this reference is initially weak and hooked on v8 gc callback.
        // it becomes a strong reference after the `ref_count_` explicitly increased.
        v8::Global<v8::Object> ref_;
    };

    typedef internal::SArray<ObjectHandle, NativeObjectID>::Pointer ObjectHandlePtr;
    typedef internal::SArray<ObjectHandle, NativeObjectID>::ConstPointer ObjectHandleConstPtr;
}

#endif
