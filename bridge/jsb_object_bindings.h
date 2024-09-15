#ifndef GODOTJS_OBJECT_BINDINGS_H
#define GODOTJS_OBJECT_BINDINGS_H
#include "jsb_pch.h"
namespace jsb
{
    struct ObjectReflectBindingUtil
    {
        static NativeClassID reflect_bind(Realm* p_realm, const ClassDB::ClassInfo* p_class_info);

        static void _godot_object_free(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_method(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_get2(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_set2(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_signal(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_utility_func(const v8::FunctionCallbackInfo<v8::Value>& info);

    };
}
#endif
