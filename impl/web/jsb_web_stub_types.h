#ifndef GODOTJS_WEB_STUB_TYPES_H
#define GODOTJS_WEB_STUB_TYPES_H

#include "../../jsb.gen.h"

#include <cstdint>
#include <memory>

namespace v8
{
    enum GCType { kGCTypeAll = 0 };
    enum GCCallbackFlags {};
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

    typedef void (*GCCallback)(class Isolate* isolate, GCType type, GCCallbackFlags flags);

    class Isolate;

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

