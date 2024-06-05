#ifndef GODOTJS_BUILTINS_H
#define GODOTJS_BUILTINS_H
#include "jsb_pch.h"

namespace jsb
{
    class Builtins
    {
    public:
        static void register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self);

        static void _require(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _define(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _print(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _set_timer(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _clear_timer(const v8::FunctionCallbackInfo<v8::Value>& info);
    };
}
#endif
