#ifndef GODOTJS_QUICKJS_INITIALIZATION_H
#define GODOTJS_QUICKJS_INITIALIZATION_H

#include "jsb_quickjs_platform.h"

namespace v8
{
    class V8
    {
    public:
        static void SetFlagsFromString(const char* str, size_t length);

        static void InitializePlatform(Platform* platform);

        static bool Initialize();
    };
}
#endif
