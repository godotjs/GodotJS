#ifndef GODOTJS_QUICKJS_TYPEDEF_H
#define GODOTJS_QUICKJS_TYPEDEF_H

#include "jsb_quickjs_pch.h"
#define V8_VERSION_STRING "quickjs-" QUICKJS_CONFIG_VERSION

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
        __JS_ATOM_NULL = JS_ATOM_NULL,
#define DEF(name, str) JS_ATOM_ ## name,
#       include "../../quickjs/quickjs-atom.h"
#undef DEF
        JS_ATOM_END,
    };

    //TODO do not know whether it works properly or not
    enum
    {
        JS_TAG_EXTERNAL = JS_TAG_FLOAT64 + 1,
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

    class Platform
    {
    };

    namespace platform
    {
        inline std::unique_ptr<Platform> NewDefaultPlatform() { return std::make_unique<Platform>(); }
    }

    class V8
    {
    public:
        static void InitializePlatform(Platform* platform) {}
        static void Initialize() {}
        static void SetFlagsFromString(const char* str, size_t len) {}
    };

}

#endif

