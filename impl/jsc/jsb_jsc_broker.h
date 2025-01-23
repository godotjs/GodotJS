#ifndef GODOTJS_QUICKJS_BROKER_H
#define GODOTJS_QUICKJS_BROKER_H
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
        static void SetWeak(v8::Isolate* isolate, JSValue value, void* parameter, void* callback);

        static JSValue _dup(v8::Isolate* isolate, JSValueConst value);
        static void _free(v8::Isolate* isolate, JSValueConst value);
        static void _free_delayed(v8::Isolate* isolate, JSValueConst value);

        static void add_phantom(v8::Isolate* isolate, void* token);
        static void remove_phantom(v8::Isolate* isolate, void* token);
        static bool is_phantom_alive(v8::Isolate* isolate, void* token);

        // peek JSValue on stack (without duplicating)
        static JSValue stack_val(v8::Isolate* isolate, uint16_t index);

        // copy JSValue on stack (with duplicating)
        static JSValue stack_dup(v8::Isolate* isolate, uint16_t index);

        static uint16_t push_copy(v8::Isolate* isolate, JSValueConst value);

        static void _add_reference(v8::Isolate* isolate);
        static void _remove_reference(v8::Isolate* isolate);
    };
}
#endif
