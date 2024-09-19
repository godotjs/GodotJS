#ifndef GODOTJS_WEB_STUB_TYPES_H
#define GODOTJS_WEB_STUB_TYPES_H

#include <memory>

namespace v8
{
    enum GCType { kGCTypeAll = 0 };
    enum GCCallbackFlags {};

    typedef void (*GCCallback)(class Isolate* isolate, GCType type, GCCallbackFlags flags);

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

