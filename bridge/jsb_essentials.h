#ifndef GODOTJS_ESSENTIALS_H
#define GODOTJS_ESSENTIALS_H
#include "jsb_bridge_pch.h"

namespace jsb
{
    class Essentials
    {
    public:
        static void register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self);
    };
}

#endif
