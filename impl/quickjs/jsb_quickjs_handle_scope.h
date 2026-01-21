#ifndef GODOTJS_QUICKJS_HANDLE_SCOPE_H
#define GODOTJS_QUICKJS_HANDLE_SCOPE_H
#include "jsb_quickjs_pch.h"

namespace v8
{
    class Isolate;

    class HandleScope
    {
    private:
        Isolate* isolate_;
        HandleScope* last_;
        uint16_t stack_;

    public:
        HandleScope(Isolate* isolate);
        ~HandleScope();

        HandleScope(HandleScope&& other) = delete;
        HandleScope& operator=(HandleScope&& other) = delete;
        HandleScope(const HandleScope&) = delete;
        HandleScope& operator=(const HandleScope&) = delete;
    };
} // namespace v8
#endif
