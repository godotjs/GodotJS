#ifndef GODOTJS_OBJECT_BINDINGS_H
#define GODOTJS_OBJECT_BINDINGS_H
#include "jsb_bridge_pch.h"
#include "jsb_class_info.h"

namespace jsb
{
    class Environment;

    struct ObjectReflectBindingUtil
    {
        static NativeClassInfoPtr reflect_bind(Environment* p_env, const ClassDB::ClassInfo* p_class_info, NativeClassID* r_class_id);

        static void _godot_object_free(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_method(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_get2(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_set2(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_signal_get(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_object_cached_export_update(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _godot_utility_func(const v8::FunctionCallbackInfo<v8::Value>& info);
    };
} // namespace jsb
#endif
