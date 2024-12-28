#ifndef GODOTJS_ESSENTIALS_H
#define GODOTJS_ESSENTIALS_H
#include "jsb_bridge_pch.h"

namespace jsb
{
    // custom implementation of common functions in JS (`console.*` and timer functions)
    //NOTE the original functions are used in WebBuild (if using web.impl),
    //     be cautious the behaviour differences between the custom implementation here and the standard version (in the host browser).
    class Essentials
    {
    public:
        static void register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self);
    };
}

#endif
