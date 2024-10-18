#ifndef GODOTJS_V8_GLOBAL_INIT_H
#define GODOTJS_V8_GLOBAL_INIT_H
#include "jsb_v8_pch.h"

namespace jsb::impl
{
    struct GlobalInitialize
    {
        std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();

        GlobalInitialize()
        {
#if JSB_EXPOSE_GC_FOR_TESTING
            constexpr char args[] = "--expose-gc";
            v8::V8::SetFlagsFromString(args, std::size(args) - 1);
#endif
            v8::V8::InitializePlatform(platform.get());
            v8::V8::Initialize();
        }

        static void init()
        {
            static GlobalInitialize global_initialize;
        }
    };

}
#endif
