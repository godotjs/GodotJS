#ifndef GODOTJS_QUICKJS_HELPER_H
#define GODOTJS_QUICKJS_HELPER_H
#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_isolate.h"
#include "jsb_quickjs_primitive.h"
#include "jsb_quickjs_function.h"

namespace jsb::impl
{
    class Helper
    {
    public:
        static v8::Local<v8::Function> NewFunction(v8::Local<v8::Context> context, const char* name, v8::FunctionCallback callback, v8::Local<v8::Value> data)
        {
            // const v8::Local<v8::Function> func = v8::Function::New(context, callback, data).ToLocalChecked();
            v8::Isolate* isolate = context->isolate_;
            JSValue payload[] = {
                /* kFuncPayloadCallback */ JS_MKPTR(jsb::impl::JS_TAG_EXTERNAL, (void*) callback),
                /* kFuncPayloadData*/ isolate->stack_dup(data->stack_pos_),
            };

            static_assert(sizeof(callback) == sizeof(void*));
            static_assert(jsb::impl::FuncPayload::kNum == ::std::size(payload));
            const JSValue func_obj = JS_NewCFunctionData(isolate->ctx(),
                v8::Function::_function_call,
                /* length */ 0,
                /* magic */ 0,
                ::std::size(payload), payload);
#if JSB_DEBUG
            JSContext* ctx = context->GetIsolate()->ctx();
            jsb_check(JS_IsFunction(ctx, func_obj));
            jsb_ensure(JS_DefinePropertyValue(ctx, func_obj, JS_ATOM_name, JS_NewString(ctx, name), JS_PROP_CONFIGURABLE) == 1);
#endif
            const v8::Local<v8::Function> func = v8::Local<v8::Function>(v8::Data(isolate, isolate->push_steal(func_obj)));
            return func;
        }

        static v8::Local<v8::FunctionTemplate> NewFunctionTemplate(v8::Isolate* isolate, const char* name, v8::FunctionCallback callback, v8::Local<v8::Value> data)
        {
            return NewFunction(isolate->GetCurrentContext(), name, callback, data).As<v8::Function>();
        }

        static v8::Local<v8::FunctionTemplate> NewFunctionTemplate(v8::Isolate* isolate, const ::String& name, v8::FunctionCallback callback, v8::Local<v8::Value> data)
        {
#if JSB_DEBUG
            const CharString str8 = name.utf8();
            return NewFunction(isolate->GetCurrentContext(), str8.ptr(), callback, data).As<v8::Function>();
#else
            return NewFunction(isolate->GetCurrentContext(), "", callback, data).As<v8::Function>();
#endif
        }

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
                JSB_QUICKJS_LOG(VeryVerbose, "represented as bigint %d", p_val);
                return v8::BigInt::New(isolate, p_val);
            }
#endif
            return v8::Number::New(isolate, (double) p_val);
        }

        static v8::MaybeLocal<v8::Value> compile_run(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            v8::Isolate* isolate = context->GetIsolate();
            JSContext* ctx = isolate->ctx();
            const CharString filename = p_filename.utf8();
            constexpr int flags = JS_EVAL_TYPE_GLOBAL | JS_EVAL_FLAG_STRICT;
            const JSValue rval = JS_Eval(ctx, p_source, p_source_len, filename.ptr(), flags);
            if (JS_IsException(rval))
            {
                return v8::MaybeLocal<v8::Value>();
            }
            return v8::MaybeLocal<v8::Value>(v8::Data(isolate, isolate->push_steal(rval)));
        }
    };
}

#endif


