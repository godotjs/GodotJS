#ifndef GODOTJS_JSC_TYPEDEF_H
#define GODOTJS_JSC_TYPEDEF_H

#include "jsb_jsc_pch.h"
#define JSB_IMPL_VERSION_STRING "JavaScriptCore"

typedef uint32_t JSAtom;

namespace jsb::impl
{
    // Offset positions based on the current scope
    namespace FunctionStackBase
    {
        enum
        {
            ReturnValue,
            This,
            Data,
            NewTarget,

            Num,
        };
    }

    enum
    {
        JS_ATOM_prototype,
        JS_ATOM_constructor,
        JS_ATOM_message,
        JS_ATOM_stack,
        JS_ATOM_name,
        JS_ATOM_configurable,
        JS_ATOM_writable,
        JS_ATOM_enumerable,

        // for quick access
        JS_ATOM_Map,
        JS_ATOM_Promise,
        JS_ATOM_ArrayBuffer,

        // the following ATOMs may be unnecessary
        JS_ATOM_get,
        JS_ATOM_set,
        JS_ATOM_value,
        JS_ATOM_length,

        JS_ATOM_END,
    };
} // namespace jsb::impl

namespace v8
{
    enum GCType
    {
        kGCTypeAll = 0
    };
    enum GCCallbackFlags
    {
    };
    enum GarbageCollectionType
    {
        kFullGarbageCollection,
        kMinorGarbageCollection
    };
    enum class NewStringType
    {
        kNormal,
        kInternalized
    };
    enum class KeyCollectionMode
    {
        kOwnOnly,
        kIncludePrototypes
    };
    enum PropertyFilter
    {
        ALL_PROPERTIES = 0,
        ONLY_WRITABLE = 1,
        ONLY_ENUMERABLE = 2,
        ONLY_CONFIGURABLE = 4,
        SKIP_STRINGS = 8,
        SKIP_SYMBOLS = 16
    };
    enum class IndexFilter
    {
        kIncludeIndices,
        kSkipIndices
    };
    enum class KeyConversionMode
    {
        kConvertToString,
        kKeepNumbers,
        kNoNumbers
    };
    enum PromiseRejectEvent
    {
        kPromiseRejectWithNoHandler = 0,
        kPromiseHandlerAddedAfterReject = 1,
        kPromiseRejectAfterResolved = 2,
        kPromiseResolveAfterResolved = 3,
    };

    /**
     * PropertyAttribute.
     */
    enum PropertyAttribute
    {
        /** None. **/
        None = 0,
        /** ReadOnly, i.e., not writable. **/
        ReadOnly = 1 << 0,
        /** DontEnum, i.e., not enumerable. **/
        DontEnum = 1 << 1,
        /** DontDelete, i.e., not configurable. **/
        DontDelete = 1 << 2
    };

    class Isolate;

    template <typename T>
    class FunctionCallbackInfo;

    template <typename T>
    class PropertyCallbackInfo;

    template <typename T>
    class Local;

    class Value;
    class Name;

    using FunctionCallback = void (*)(const FunctionCallbackInfo<Value>& info);
    using GCCallback = void (*)(Isolate* isolate, GCType type, GCCallbackFlags flags);
    using AccessorNameGetterCallback = void (*)(Local<Name> property, const PropertyCallbackInfo<Value>& info);

} // namespace v8

#endif
