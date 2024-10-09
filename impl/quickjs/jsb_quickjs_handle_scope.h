#ifndef GODOTJS_QUICKJS_HANDLE_SCOPE_H
#define GODOTJS_QUICKJS_HANDLE_SCOPE_H
#include "jsb_quickjs_pch.h"

namespace v8
{
    class Isolate;

    class HandleScope
    {
    public:
        Isolate* isolate_;
        HandleScope* last_;
        uint16_t stack_;

        HandleScope(Isolate* isolate);
        HandleScope(Isolate* isolate, uint16_t stack);
        ~HandleScope();
    };
}
#endif
