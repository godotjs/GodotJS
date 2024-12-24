#ifndef GODOTJS_WEB_GLOBAL_INIT_H
#define GODOTJS_WEB_GLOBAL_INIT_H
#include "jsb_web_pch.h"

namespace jsb::impl
{
    struct GlobalInitialize
    {
        static void init()
        {
            jsbi_init();
        }
    };

}
#endif
