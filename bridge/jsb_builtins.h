#ifndef GODOTJS_BUILTINS_H
#define GODOTJS_BUILTINS_H
#include "jsb_bridge_pch.h"

namespace jsb
{
    class Builtins
    {
    public:
        static void _require(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _define(const v8::FunctionCallbackInfo<v8::Value>& info);
    };
} // namespace jsb
#endif
