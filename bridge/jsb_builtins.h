#ifndef GODOTJS_BUILTINS_H
#define GODOTJS_BUILTINS_H
#include "jsb_pch.h"

namespace jsb
{
    class Builtins
    {
    public:
        static void register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self);

        static void _require(const vm::FunctionCallbackInfo& info);
        static void _define(const vm::FunctionCallbackInfo& info);
        static void _set_timer(const vm::FunctionCallbackInfo& info);
        static void _clear_timer(const vm::FunctionCallbackInfo& info);
    };
}
#endif
