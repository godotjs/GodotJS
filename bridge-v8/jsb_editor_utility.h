#ifndef JAVASCRIPT_EDITOR_UTILITY_H
#define JAVASCRIPT_EDITOR_UTILITY_H

#if TOOLS_ENABLED
#include "jsb_pch.h"
namespace jsb
{
    struct JavaScriptEditorUtility
    {
        static void _get_classes(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _get_global_constants(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _get_utility_functions(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _get_primitive_types(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _get_singletons(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _delete_file(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _benchmark_dump(const v8::FunctionCallbackInfo<v8::Value>& info);
    };
}
#endif

#endif
