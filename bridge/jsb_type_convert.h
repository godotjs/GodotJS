#ifndef GODOTJS_TYPE_CONVERT_H
#define GODOTJS_TYPE_CONVERT_H

#include "jsb_bridge_pch.h"
#include "jsb_object_handle.h"

namespace jsb
{
    struct TypeConvert
    {
        /**
         * Translate a Godot object into a javascript object. The type of `p_object_obj` will be automatically exposed to the context if not existed.
         * @param p_godot_obj non-null godot object pointer
         */
        static bool gd_obj_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, Object* p_godot_obj, v8::Local<v8::Object>& r_jval);
        static bool js_to_gd_obj(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Object*& r_godot_obj);

        jsb_force_inline static bool gd_var_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& p_cvar, v8::Local<v8::Value>& r_jval) { return gd_var_to_js(isolate, context, p_cvar, p_cvar.get_type(), r_jval); }
        static bool gd_var_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& p_cvar, Variant::Type p_type, v8::Local<v8::Value>& r_jval);
        static bool js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant::Type p_type, Variant& r_cvar);

        /**
         * Translate js val into gd variant without any type hint
         */
        static bool js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant& r_cvar);

        /**
         * Check if a javascript value `p_val` could be converted into the expected primitive type `p_type`
         */
        static bool can_convert_strict(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val, Variant::Type p_type);

        // variant fast check (without checking NativeClassInfo)
        jsb_force_inline static bool is_variant(const v8::Local<v8::Object>& p_obj)
        {
            return p_obj->InternalFieldCount() == IF_VariantFieldCount;
        }

        // object fast check (without checking NativeClassInfo)
        jsb_force_inline static bool is_object(const v8::Local<v8::Object>& p_obj)
        {
            return p_obj->InternalFieldCount() == IF_ObjectFieldCount;
        }
    };
}

#endif
