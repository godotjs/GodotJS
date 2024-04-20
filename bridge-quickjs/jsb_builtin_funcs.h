#ifndef JAVASCRIPT_BUILTIN_FUNCS_H
#define JAVASCRIPT_BUILTIN_FUNCS_H
#include "jsb_pch.h"

namespace jsb
{
    class BuiltinFunctions
    {
    public:
        // commonjs-style module require
        // magic is the index of parent module in the managed module list in Environment
        static JSValue require(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv, int magic);
    };
}
#endif
