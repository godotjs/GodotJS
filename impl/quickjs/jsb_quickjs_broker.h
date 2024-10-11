#ifndef GODOTJS_QUICKJS_BROKER_H
#define GODOTJS_QUICKJS_BROKER_H
#include "jsb_quickjs_pch.h"

namespace v8
{
    class Isolate;
}

namespace jsb::impl
{
    class Broker
    {
    public:
        static void SetWeak(v8::Isolate* isolate, JSValue value, void* parameter, void* callback);

        static JSRuntime* GetRuntime(v8::Isolate* isolate);
        static JSContext* GetContext(v8::Isolate* isolate);

        static uint16_t push_copy(v8::Isolate* isolate, JSValueConst value);
        static bool is_valid_internal_data(v8::Isolate* isolate, jsb::internal::Index64 value);
    };
}
#endif
