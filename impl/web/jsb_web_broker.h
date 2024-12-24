#ifndef GODOTJS_WEB_BROKER_H
#define GODOTJS_WEB_BROKER_H
#include "jsb_web_pch.h"

namespace v8
{
    class Isolate;
}

namespace jsb::impl
{
    // a helper class to break header cyclic dependencies
    class Broker
    {
    public:
        static void SetWeakCallback(v8::Isolate* isolate, HandleID value, void* parameter, void* callback);

        static JSRuntime get_engine(v8::Isolate* isolate);
    };
}
#endif
