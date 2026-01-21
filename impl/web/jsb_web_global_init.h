#ifndef GODOTJS_WEB_GLOBAL_INIT_H
#define GODOTJS_WEB_GLOBAL_INIT_H
#include "jsb_web_pch.h"

namespace jsb::impl
{
    struct GlobalInitialize
    {
        GlobalInitialize();

        static void init();
    };

} // namespace jsb::impl
#endif
