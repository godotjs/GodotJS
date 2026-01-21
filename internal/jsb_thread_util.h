#ifndef GODOTJS_THREAD_UTIL_H
#define GODOTJS_THREAD_UTIL_H

#include "jsb_internal_pch.h"

namespace jsb::internal
{
    struct ThreadUtil
    {
        static void set_name(const String& p_name);
    };
} // namespace jsb::internal
#endif
