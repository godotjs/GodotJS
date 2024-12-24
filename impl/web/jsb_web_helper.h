#ifndef GODOTJS_WEB_HELPER_H
#define GODOTJS_WEB_HELPER_H
#include "jsb_web_catch.h"
#include "jsb_web_pch.h"
#include "jsb_web_isolate.h"
#include "jsb_web_context.h"
#include "jsb_web_primitive.h"
#include "jsb_web_function.h"

namespace jsb::impl
{
    class Helper
    {
    public:
        // deleter for valuetype optimization (no ObjectHandle needed)
        static void SetDeleter(Variant* p_pointer, const v8::Local<v8::Value> value, const v8::WeakCallbackInfo<void>::Callback callback, void *deleter_data)
        {
            //TODO needed?
        }

        static PackedByteArray to_packed_byte_array(v8::Isolate* isolate, const v8::Local<v8::ArrayBuffer>& array_buffer)
        {
            const int size = jsbi_GetByteLength(isolate->rt(), array_buffer->stack_pos_);
            jsb_check(size >= 0);
            if (size == 0) return {};

            PackedByteArray packed;
            const Error err = packed.resize(size);
            jsb_unused(err);
            jsb_check(err == OK);
            jsbi_ReadArrayBufferData(isolate->rt(), array_buffer->stack_pos_, size, packed.ptrw());
            return packed;
        }

        //TODO copy from HEAP?
        static v8::Local<v8::ArrayBuffer> to_array_buffer(v8::Isolate* isolate, const Vector<uint8_t>& packed)
        {
            return v8::Local<v8::ArrayBuffer>(v8::Data(isolate, jsbi_NewArrayBuffer(isolate->rt(), packed.ptr(), packed.size())));
        }

        static v8::Local<v8::Function> NewFunction(v8::Local<v8::Context> context, const char* name, v8::FunctionCallback callback, v8::Local<v8::Value> data)
        {
            const jsb::impl::StackPosition rval = jsbi_NewCFunction(context->isolate_->rt(), (jsb::impl::FunctionPointer) callback, data->stack_pos_);
            if (rval == jsb::impl::StackBase::Error)
            {
                return v8::Local<v8::Function>();
            }
            return v8::Local<v8::Function>(v8::Data(context->isolate_, rval));
        }

        static v8::Local<v8::FunctionTemplate> NewFunctionTemplate(v8::Isolate* isolate, const char* name, v8::FunctionCallback callback, v8::Local<v8::Value> data)
        {
            return NewFunction(isolate->GetCurrentContext(), name, callback, data).As<v8::Function>();
        }

        static v8::Local<v8::FunctionTemplate> NewFunctionTemplate(v8::Isolate* isolate, const ::String& name, v8::FunctionCallback callback, v8::Local<v8::Value> data)
        {
#if JSB_DEBUG
            const CharString str8 = name.utf8();
            return NewFunction(isolate->GetCurrentContext(), str8.get_data(), callback, data).As<v8::Function>();
#else
            return NewFunction(isolate->GetCurrentContext(), "", callback, data).As<v8::Function>();
#endif
        }

        template<size_t N>
        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const char (&literal)[N])
        {
            return v8::Local<v8::String>(v8::Data(isolate, jsbi_NewString(isolate->rt(), literal, N - 1)));
        }

        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 = p_str.utf8();
            return v8::Local<v8::String>(v8::Data(isolate, jsbi_NewString(isolate->rt(), str8.get_data(), str8.length())));
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

        // should return an empty string if `p_val` is null or undefined.
        static String to_string(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
        {
            String ret;
            if (!p_val.IsEmpty() && !p_val->IsNullOrUndefined())
            {
                int32_t len;
                if (char* str = jsbi_ToCStringLen(isolate->rt(), &len, p_val->stack_pos_))
                {
                    ret = String::utf8(str, (int) len);
                    memfree(str);
                }
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
            isolate->throw_error(message);
        }

        jsb_force_inline static void throw_error(v8::Isolate* isolate, const String& message)
        {
            isolate->throw_error(message);
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
                JSB_WEB_LOG(VeryVerbose, "represented as bigint %d", p_val);
                return v8::BigInt::New(isolate, p_val);
            }
#endif
            return v8::Number::New(isolate, (double) p_val);
        }

        static v8::MaybeLocal<v8::Value> compile_function(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            jsb_checkf(p_source[p_source_len] == '\0', "needs a zero-terminated string as input to evaluate");
            v8::Isolate* isolate = context->GetIsolate();
            const CharString filename = p_filename.utf8();

            const jsb::impl::StackPosition rval_sp = jsbi_CompileFunctionSource(isolate->rt(), filename.get_data(), p_source);
            if (rval_sp == jsb::impl::StackBase::Error)
            {
                return v8::MaybeLocal<v8::Value>();
            }
            return v8::MaybeLocal<v8::Value>(v8::Data(isolate, rval_sp));
        }

        static v8::MaybeLocal<v8::Value> eval(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            jsb_checkf(p_source[p_source_len] == '\0', "needs a zero-terminated string as input to evaluate");
            v8::Isolate* isolate = context->GetIsolate();
            const CharString filename = p_filename.utf8();

            const jsb::impl::StackPosition rval_sp = jsbi_Eval(isolate->rt(), filename.get_data(), p_source);
            if (rval_sp == jsb::impl::StackBase::Error)
            {
                return v8::MaybeLocal<v8::Value>();
            }
            return v8::MaybeLocal<v8::Value>(v8::Data(isolate, rval_sp));
        }

        jsb_force_inline static void free(uint8_t* data)
        {
            // js_free(context->GetIsolate()->ctx(), data);

            //NOTE not a good practice, just for the simplicity of Buffer (to move/free by Buffer)
            memfree(data);
        }

        jsb_force_inline static void set_as_interruptible(v8::Isolate* isolate)
        {
            isolate->set_as_interruptible();
        }
    };
}

#endif


