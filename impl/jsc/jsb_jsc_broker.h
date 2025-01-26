#ifndef GODOTJS_JSC_BROKER_H
#define GODOTJS_JSC_BROKER_H
#include "jsb_jsc_pch.h"

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
        static void SetWeak(v8::Isolate* isolate, JSObjectRef value, void* parameter, void* callback);

        static JSContextGroupRef rt(v8::Isolate* isolate);
        static JSContextRef ctx(v8::Isolate* isolate);

        // peek JSValue on stack (without duplicating)
        static JSValueRef stack_val(v8::Isolate* isolate, uint16_t index);

        // copy JSValue on stack (with duplicating)
        static JSValueRef stack_dup(v8::Isolate* isolate, uint16_t index);

        static uint16_t push_copy(v8::Isolate* isolate, JSValueRef value);

        static void _add_reference(v8::Isolate* isolate);
        static void _remove_reference(v8::Isolate* isolate);

        // strict eq check
        static bool IsStrictEqual(v8::Isolate* isolate, JSValueRef a, JSValueRef b);

    };
}
#endif
