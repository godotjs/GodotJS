#ifndef GODOTJS_V8_GLOBAL_INIT_H
#define GODOTJS_V8_GLOBAL_INIT_H
#include "jsb_v8_pch.h"

namespace jsb::impl
{
    struct GlobalInitialize
    {
#if JSB_V8_CPPGC
        std::unique_ptr<cppgc::DefaultPlatform> platform = std::make_unique<cppgc::DefaultPlatform>();
#else
        std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();
#endif

        GlobalInitialize()
        {
#if JSB_EXPOSE_GC_FOR_TESTING
            constexpr char args[] = "--expose-gc";
            v8::V8::SetFlagsFromString(args, std::size(args) - 1);
#endif

#if JSB_V8_CPPGC
            v8::V8::InitializePlatform(platform->GetV8Platform());
            cppgc::InitializeProcess(platform->GetPageAllocator());
#else
            v8::V8::InitializePlatform(platform.get());
#endif

            v8::V8::Initialize();
        }

        // NOTE never called in the current implementation
        ~GlobalInitialize()
        {
#if JSB_V8_CPPGC
            cppgc::ShutdownProcess();
#endif
        }

        static v8::Platform* get_platform()
        {
            static GlobalInitialize global_initialize;
#if JSB_V8_CPPGC
            return global_initialize.platform->GetV8Platform();
#else
            return global_initialize.platform.get();
#endif
        }

        static void init()
        {
            jsb_ensure(get_platform());
        }
    };

} // namespace jsb::impl
#endif
