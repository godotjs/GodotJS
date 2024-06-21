#ifndef GODOTJS_QUICKJS_PLATFORM_H
#define GODOTJS_QUICKJS_PLATFORM_H

#include "jsb_quickjs_pch.h"

namespace v8
{
    class Platform
    {

    };

    namespace platform
    {
        static std::unique_ptr<Platform> NewDefaultPlatform();
    }
}

#endif
