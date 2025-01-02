#ifndef GODOTJS_WEB_TYPEDEF_H
#define GODOTJS_WEB_TYPEDEF_H

#include "jsb_web_pch.h"
#define JSB_IMPL_VERSION_STRING "jsbi-experimental"

namespace jsb::impl
{
    // Offset positions based on the current scope
    //NOTE be cautious to always keep sync with NewCFunction in monolith.ts `NativeAPI.ccall(self._opaque, cb, rval_pos, argc);`
    namespace FunctionStackBase
    {
        enum
        {
            ReturnValue = 0,
            This = 1,
            Data = 2,
            NewTarget = 3,

            _Num,
        };
    }

    // absolute stack position for common values
    //NOTE be cautious to always keep sync with jsbb_StackPos in monolith.ts
    namespace StackBase
    {
        enum
        {
            Undefined = 0,
            Null = 1,
            True = 2,
            False = 3,
            EmptyString = 4,
            SymbolClass = 5,
            MapClass = 6,
            Error = 7,

            _Num = 8,
        };
    }

    enum JSAtomIndex
    {
        JS_ATOM_message = 0,
        JS_ATOM_stack = 1,
    };
}

namespace v8
{
    enum GCType { kGCTypeAll = 0 };
    enum GCCallbackFlags {};
    enum GarbageCollectionType
    {
        kFullGarbageCollection,
        kMinorGarbageCollection
    };
    enum class NewStringType { kNormal, kInternalized };
    enum class KeyCollectionMode { kOwnOnly, kIncludePrototypes };
    enum PropertyFilter
    {
        ALL_PROPERTIES = 0,
        ONLY_WRITABLE = 1,
        ONLY_ENUMERABLE = 2,
        ONLY_CONFIGURABLE = 4,
        SKIP_STRINGS = 8,
        SKIP_SYMBOLS = 16
    };
    enum class IndexFilter { kIncludeIndices, kSkipIndices };
    enum class KeyConversionMode { kConvertToString, kKeepNumbers, kNoNumbers };
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

    template<typename T>
    class FunctionCallbackInfo;

    template<typename T>
    class PropertyCallbackInfo;

    template<typename T>
    class Local;

    class Value;
    class Name;

    using FunctionCallback = void (*)(const FunctionCallbackInfo<Value>& info);
    using GCCallback = void (*)(Isolate* isolate, GCType type, GCCallbackFlags flags);
    using AccessorNameGetterCallback = void (*)(Local<Name> property, const PropertyCallbackInfo<Value>& info);

}

#endif

