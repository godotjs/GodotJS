#ifndef GODOTJS_WEB_HANDLE_SCOPE_H
#define GODOTJS_WEB_HANDLE_SCOPE_H
#include "jsb_web_pch.h"

namespace v8
{
    class Isolate;

    class HandleScope
    {
    private:
        Isolate* isolate_;

    public:
        HandleScope(Isolate* isolate);
        ~HandleScope();

        HandleScope(HandleScope&& other) = delete;
        HandleScope& operator=(HandleScope&& other) = delete;
        HandleScope(const HandleScope&) = delete;
        HandleScope& operator=(const HandleScope&) = delete;
    };
}
#endif
