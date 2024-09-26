#ifndef GODOTJS_WEB_STUB_TYPES_H
#define GODOTJS_WEB_STUB_TYPES_H

#include "../../jsb.gen.h"

#include <cstdint>
#include <memory>

#define V8_VERSION_STRING "jsapi-web"

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

    class HeapStatistics
    {
    public:
        HeapStatistics();
        size_t total_heap_size() { return total_heap_size_; }
        size_t total_heap_size_executable() { return total_heap_size_executable_; }
        size_t total_physical_size() { return total_physical_size_; }
        size_t total_available_size() { return total_available_size_; }
        size_t total_global_handles_size() { return total_global_handles_size_; }
        size_t used_global_handles_size() { return used_global_handles_size_; }
        size_t used_heap_size() { return used_heap_size_; }
        size_t heap_size_limit() { return heap_size_limit_; }
        size_t malloced_memory() { return malloced_memory_; }
        size_t external_memory() { return external_memory_; }
        size_t peak_malloced_memory() { return peak_malloced_memory_; }
        size_t number_of_native_contexts() { return number_of_native_contexts_; }
        size_t number_of_detached_contexts() { return number_of_detached_contexts_; }

        size_t does_zap_garbage() { return does_zap_garbage_; }

    private:
        size_t total_heap_size_;
        size_t total_heap_size_executable_;
        size_t total_physical_size_;
        size_t total_available_size_;
        size_t used_heap_size_;
        size_t heap_size_limit_;
        size_t malloced_memory_;
        size_t external_memory_;
        size_t peak_malloced_memory_;
        bool does_zap_garbage_;
        size_t number_of_native_contexts_;
        size_t number_of_detached_contexts_;
        size_t total_global_handles_size_;
        size_t used_global_handles_size_;

        friend class V8;
        friend class Isolate;
    };

}
#endif

