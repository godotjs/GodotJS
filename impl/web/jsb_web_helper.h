#ifndef GODOTJS_WEB_HELPER_H
#define GODOTJS_WEB_HELPER_H

#include "jsb_web_handle_scope.h"
#include "jsb_web_pch.h"

#include "jsb_web_interop.h"
#include "jsb_web_isolate.h"
#include "jsb_web_primitive.h"

#include "../../internal/jsb_macros.h"

#include "core/string/ustring.h"

namespace jsb::impl
{
    class Helper
    {
    public:
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
                return jsapi_sv_to_string(isolate->id_, p_val.data_.stack_, p_val.data_.index_);
            }
            return String();
        }

        static String to_string_without_side_effect(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
        {
            //TODO
            return to_string(isolate, p_val);
        }

        template<size_t N>
        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const char (&literal)[N])
        {
            return new_string(isolate, String(literal));
        }

        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 =  p_str.utf8();
            return v8::Local<v8::String>(isolate, isolate->GetCurrentStack(), jsapi_stack_push_string(isolate->id_, str8.get_data()));
        }

        jsb_force_inline static v8::Local<v8::String> new_string_ascii(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 = p_str.ascii();
            return v8::Local<v8::String>(isolate, isolate->GetCurrentStack(), jsapi_stack_push_string(isolate->id_, str8.get_data()));
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
            v8::Isolate* isolate = context->GetIsolate();
            const v8::Local<v8::String> source = v8::Local<v8::String>(isolate, isolate->GetCurrentStack(), jsapi_stack_push_string(isolate->id_, p_source));
            const int index = jsapi_sv_eval(isolate->id_, source.data_.stack_, source.data_.index_);
            if (index < 0) return {};
            return v8::MaybeLocal<v8::Value>(isolate, isolate->GetCurrentStack(), index);
        }
    };
}
#endif
