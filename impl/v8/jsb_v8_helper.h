#ifndef GODOTJS_V8_HELPER_H
#define GODOTJS_V8_HELPER_H

#include "jsb_v8_headers.h"

#include "../../internal/jsb_logger.h"
#include "../../internal/jsb_macros.h"

namespace jsb::impl
{
    class Helper
    {
    public:
        Helper() = delete;

        // with side effects (may trigger value evaluation).
        // any decoding error will be ignored.
        jsb_force_inline static String to_string_opt(v8::Isolate* isolate, const v8::MaybeLocal<v8::Value>& p_val)
        {
            v8::Local<v8::Value> local;
            return p_val.ToLocal(&local) ? to_string(isolate, local) : String();
        }

        static String to_string(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
        {
            if (!p_val.IsEmpty())
            {
#if JSB_UTF16_CONV_PREFERRED
                if (const v8::String::Value str16(isolate, p_val); str16.length())
                {
                    return String::utf16((const char16_t*) *str16, str16.length());
                }
#else
                if (const v8::String::Utf8Value str(isolate, p_val); str.length())
                {
                    return String::utf8(*str, str.length());
                }
#endif
            }
            return String();
        }

        static String to_string_without_side_effect(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
        {
            v8::Local<v8::Value> local;
            if (!p_val.IsEmpty() && p_val->ToDetailString(isolate->GetCurrentContext()).ToLocal(&local))
            {
                return to_string_opt(isolate, local);
            }
            return String();
        }

        template<size_t N>
        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const char (&literal)[N])
        {
            return v8::String::NewFromUtf8Literal(isolate, literal, v8::NewStringType::kNormal);
        }

        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const String& p_str)
        {
#if JSB_UTF16_CONV_PREFERRED
            const Char16String str16 = p_str.utf16();
            return v8::String::NewFromTwoByte(isolate, (const uint16_t*) str16.ptr(), v8::NewStringType::kNormal, str16.length()).ToLocalChecked();
#else
            const CharString str8 = p_str.utf8();
            return v8::String::NewFromUtf8(isolate, str8.ptr(), v8::NewStringType::kNormal, str8.length()).ToLocalChecked();
#endif
        }

        jsb_force_inline static v8::Local<v8::String> new_string_ascii(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 = p_str.ascii();
            return v8::String::NewFromOneByte(isolate, (const uint8_t*) str8.ptr(), v8::NewStringType::kNormal, str8.length()).ToLocalChecked();
        }

        static v8::MaybeLocal<v8::Value> compile_run(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            v8::Isolate* isolate = context->GetIsolate();
            v8::MaybeLocal<v8::Script> script;
            const v8::Local<v8::String> source = v8::String::NewFromUtf8(isolate, p_source, v8::NewStringType::kNormal, p_source_len).ToLocalChecked();

            if (p_filename.is_empty())
            {
                script = v8::Script::Compile(context, source);
            }
            else
            {
#if WINDOWS_ENABLED
                const CharString filename = p_filename.replace("/", "\\").utf8();
#else
                const CharString filename = p_filename.utf8();
#endif
                v8::ScriptOrigin origin(isolate, v8::String::NewFromUtf8(isolate, filename, v8::NewStringType::kNormal, filename.length()).ToLocalChecked());
                script = v8::Script::Compile(context, source, &origin);
            }

            if (script.IsEmpty())
            {
                return {};
            }

            const v8::MaybeLocal<v8::Value> maybe_value = script.ToLocalChecked()->Run(context);
            if (maybe_value.IsEmpty())
            {
                return {};
            }

            JSB_LOG(VeryVerbose, "script compiled %s", p_filename);
            return maybe_value;
        }
    };
}

#endif

