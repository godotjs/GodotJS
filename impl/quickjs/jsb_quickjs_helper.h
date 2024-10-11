#ifndef GODOTJS_QUICKJS_HELPER_H
#define GODOTJS_QUICKJS_HELPER_H
#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_isolate.h"
#include "jsb_quickjs_primitive.h"

namespace jsb::impl
{
    class Helper
    {
    public:

        template<size_t N>
        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const char (&literal)[N])
        {
            const uint16_t stack_pos = isolate->push_steal(JS_NewStringLen(isolate->ctx(), literal, N - 1));
            return v8::Local<v8::String>(v8::Data(isolate, stack_pos));
        }

        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 = p_str.utf8();
            const uint16_t stack_pos = isolate->push_steal(JS_NewStringLen(isolate->ctx(), str8.ptr(), str8.length()));
            return v8::Local<v8::String>(v8::Data(isolate, stack_pos));
        }

        jsb_force_inline static v8::Local<v8::String> new_string_ascii(v8::Isolate* isolate, const String& p_str)
        {
            return new_string(isolate, p_str);
        }

        // with side effects (may trigger value evaluation).
        // any decoding error will be ignored.
        jsb_force_inline static String to_string_opt(v8::Isolate* isolate, const v8::MaybeLocal<v8::Value>& p_val)
        {
            v8::Local<v8::Value> local;
            return p_val.ToLocal(&local) ? to_string(isolate, local) : String();
        }

        static String to_string(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
        {
            String ret;
            if (!p_val.IsEmpty())
            {
                size_t len;
                const char* str = JS_ToCStringLen(isolate->ctx(), &len, (JSValue) p_val);
                ret = String::utf8(str, (int) len);
                JS_FreeCString(isolate->ctx(), str);
            }
            return ret;
        }

        static String to_string_without_side_effect(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
        {
            if (!p_val.IsEmpty())
            {
                const v8::MaybeLocal<v8::Value> local = p_val->ToDetailString(isolate->GetCurrentContext());
                return to_string_opt(isolate, local);
            }
            return String();
        }

        template<int N>
        jsb_force_inline static void throw_error(v8::Isolate* isolate, const char (&message)[N])
        {
            JS_ThrowInternalError(isolate->ctx(), "%s", message);
        }

        jsb_force_inline static void throw_error(v8::Isolate* isolate, const String& message)
        {
            const CharString str8 = message.utf8();
            JS_ThrowInternalError(isolate->ctx(), "%s", str8.ptr());
        }

        jsb_force_inline static bool to_int64(const v8::Local<v8::Value> p_val, int64_t& r_val)
        {
            if (p_val->IsInt32()) { r_val = p_val.As<v8::Int32>()->Value(); return true; }
            if (p_val->IsNumber()) { r_val = (int64_t) p_val.As<v8::Number>()->Value(); return true; }
#if JSB_WITH_BIGINT
            if (p_val->IsBigInt()) { r_val = p_val.As<v8::BigInt>()->Int64Value(); return true; }
#endif
            return false;
        }

        jsb_force_inline static v8::Local<v8::Value> new_integer(v8::Isolate* isolate, const int64_t p_val)
        {
            if (const int32_t downscale = (int32_t) p_val;
                (int64_t) downscale == p_val)
            {
                return v8::Int32::New(isolate, downscale);
            }
#if JSB_WITH_BIGINT
            if (p_val > JSB_MAX_SAFE_INTEGER)
            {
                JSB_LOG(VeryVerbose, "represented as bigint %d", p_val);
                return v8::BigInt::New(isolate, p_val);
            }
#endif
            return v8::Number::New(isolate, (double) p_val);
        }

        static v8::MaybeLocal<v8::Value> compile_run(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            //TODO
        }
    };
}

#endif


