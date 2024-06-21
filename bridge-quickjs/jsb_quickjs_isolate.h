#ifndef GODOTJS_QUICKJS_ISOLATE_H
#define GODOTJS_QUICKJS_ISOLATE_H

#include "jsb_quickjs_pch.h"

namespace v8
{
    class Isolate
    {
    private:
        JSRuntime* runtime_;
    };
}

#endif
