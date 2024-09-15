#ifndef GODOTJS_V8_H
#define GODOTJS_V8_H

#include <v8.h>
#include <v8-persistent-handle.h>
#include <libplatform/libplatform.h>
#include <v8-inspector.h>
#include <v8-version-string.h>

namespace jsb::vm
{
    typedef v8::FunctionCallbackInfo<v8::Value> FunctionCallbackInfo;

    struct Runtime
    {
        v8::Isolate* isolate;
        v8::Global<v8::Context> context;
    };
}

#endif
