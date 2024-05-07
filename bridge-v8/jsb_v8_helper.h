#ifndef GODOTJS_V8_HELPER_H
#define GODOTJS_V8_HELPER_H
#include "jsb_pch.h"

namespace jsb
{
    struct V8Helper
    {
        template<typename T>
        jsb_force_inline static int32_t jsb_downscale(int64_t p_val, const T& p_msg)
        {
#if DEV_ENABLED
            if (p_val != (int64_t) (int32_t) p_val)
            {
                JSB_LOG(Warning, "inconsistent int64_t conversion: %s", p_msg);
            }
#endif
            return (int32_t) p_val;
        }

        jsb_force_inline static int32_t jsb_downscale(int64_t p_val)
        {
#if DEV_ENABLED
            if (p_val != (int64_t) (int32_t) p_val)
            {
                JSB_LOG(Warning, "inconsistent int64_t conversion");
            }
#endif
            return (int32_t) p_val;
        }

        jsb_force_inline static v8::Local<v8::Integer> to_int32(v8::Isolate* isolate, int64_t p_val)
        {
            return v8::Int32::New(isolate, jsb_downscale(p_val));
        }

        jsb_force_inline static v8::Local<v8::Boolean> to_boolean(v8::Isolate* isolate, bool p_val)
        {
            return v8::Boolean::New(isolate, p_val);
        }

        jsb_force_inline static v8::Local<v8::Number> to_number(v8::Isolate* isolate, double p_val)
        {
            return v8::Number::New(isolate, p_val);
        }

        static bool can_convert_strict(const v8::Local<v8::Value>& p_val, Variant::Type p_type)
        {
            //TODO guess and check
            return true;
        }

        /**
         * Convert a v8 utf-16 string to a godot String
         * @note crash if failed
        */
        jsb_force_inline static String to_string(const v8::String::Value& p_val)
        {
            String str_gd;
            const Error err = str_gd.parse_utf16((const char16_t*) *p_val, p_val.length());
            jsb_check(err == OK);
            return str_gd;
        }

        /**
         * Convert a javascript 'String/Symbol' value to a godot String
         */
        jsb_force_inline static String to_string(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
        {
            String str_gd;
            if (!p_val.IsEmpty() && (p_val->IsString() || p_val->IsSymbol()))
            {
                if (const v8::String::Utf8Value exchange(isolate, p_val); *exchange)
                {
                    const Error err = str_gd.parse_utf8(*exchange, exchange.length());
                    jsb_check(err == OK);
                }
            }
            return str_gd;
        }

        template<size_t N>
        jsb_force_inline static v8::Local<v8::String> to_string(v8::Isolate* isolate, const char (&literal)[N])
        {
            return v8::String::NewFromUtf8Literal(isolate, literal, v8::NewStringType::kNormal);
        }

        jsb_force_inline static v8::Local<v8::String> to_string(v8::Isolate* isolate, const String& p_str)
        {
            const CharString cstr = p_str.utf8();
            return v8::String::NewFromUtf8(isolate, cstr.ptr(), v8::NewStringType::kNormal, cstr.length()).ToLocalChecked();
        }

        jsb_force_inline static v8::MaybeLocal<v8::Script> compile(v8::Local<v8::Context> context, v8::Local<v8::String> source, const String& p_filename)
        {
            v8::Isolate* isolate = context->GetIsolate();
            if (p_filename.is_empty())
            {
                return v8::Script::Compile(context, source);
            }

#if WINDOWS_ENABLED
            const CharString filename = p_filename.replace("/", "\\").utf8();
#else
            const CharString filename = p_filename.utf8();
#endif
            v8::ScriptOrigin origin(isolate, v8::String::NewFromUtf8(isolate, filename, v8::NewStringType::kNormal, filename.length()).ToLocalChecked());
            return v8::Script::Compile(context, source, &origin);
        }
    };
}
#endif
