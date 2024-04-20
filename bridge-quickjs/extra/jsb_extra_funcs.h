#ifndef JSB_EXTRA_FUNCS_H
#define JSB_EXTRA_FUNCS_H
#include "../jsb_pch.h"

namespace jsb
{
    class ExtraFunctions
    {
    public:
#if JSB_EXTRA_CONSOLE_ENABLED
        // console.* = log, debug, warn, error, assert, trace,
        static JSValue print(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv, int magic);
#endif
    };
}
#endif
