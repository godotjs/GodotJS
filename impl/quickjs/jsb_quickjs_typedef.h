#ifndef GODOTJS_QUICKJS_TYPEDEF_H
#define GODOTJS_QUICKJS_TYPEDEF_H
#include <cstdint>

#define V8_VERSION_STRING "quickjs"

namespace jsb::impl
{
    enum
    {
        __JS_ATOM_NULL = JS_ATOM_NULL,
#define DEF(name, str) JS_ATOM_ ## name,
#       include "../../quickjs/quickjs-atom.h"
#undef DEF
        JS_ATOM_END,
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

    class Isolate;

    typedef void (*GCCallback)(Isolate* isolate, GCType type, GCCallbackFlags flags);
    typedef void(*JSAPI_GC_CALLBACK)(void*);
    typedef void(*JSAPI_FUNC_CALLBACK)(Isolate* isolate, void* func, int stack);

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

