#ifndef GODOTJS_JSC_HELPER_H
#define GODOTJS_JSC_HELPER_H
#include "jsb_jsc_catch.h"
#include "jsb_jsc_pch.h"
#include "jsb_jsc_isolate.h"
#include "jsb_jsc_context.h"
#include "jsb_jsc_primitive.h"
#include "jsb_jsc_function.h"

namespace jsb::impl
{
    class Helper
    {
    public:
        // deleter for valuetype optimization (no ObjectHandle needed)
        static void SetDeleter(Variant* p_pointer, const v8::Local<v8::Value> value, const v8::WeakCallbackInfo<void>::Callback callback, void *deleter_data)
        {
            JSObjectRef obj = JavaScriptCore::AsObject(value.data_.isolate_->ctx(), (JSValueRef) value);
            Broker::SetWeak(value.data_.isolate_, obj, deleter_data, (void*) callback);
        }

        static PackedByteArray to_packed_byte_array(v8::Isolate* isolate, const v8::Local<v8::ArrayBuffer>& array_buffer)
        {
            const size_t size = array_buffer->ByteLength();
            PackedByteArray packed;
            const Error err = packed.resize((int) size);
            jsb_unused(err);
            jsb_check(err == OK);
            const void* data = array_buffer->Data();
            memcpy(packed.ptrw(), data, size);
            return packed;
        }

        static v8::Local<v8::ArrayBuffer> to_array_buffer(v8::Isolate* isolate, const Vector<uint8_t>& packed)
        {
            const v8::Local<v8::ArrayBuffer> buffer = v8::ArrayBuffer::New(isolate, packed.size());
            void* data = buffer->Data();
            memcpy(data, packed.ptr(), packed.size());
            return buffer;
        }

        static v8::Local<v8::Function> NewFunction(v8::Local<v8::Context> context, const char* name, v8::FunctionCallback callback, v8::Local<v8::Value> data)
        {
            v8::Isolate* isolate = context->isolate_;
            const JSObjectRef func_obj = isolate->_NewFunction(v8::Function::_function_call, name, (void*) callback, (JSValueRef) data);
            static_assert(sizeof(callback) == sizeof(void*));
            const v8::Local<v8::Function> func = v8::Local<v8::Function>(v8::Data(isolate, isolate->push_copy(func_obj)));
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
            return NewFunction(isolate->GetCurrentContext(), str8.get_data(), callback, data).As<v8::Function>();
#else
            return NewFunction(isolate->GetCurrentContext(), "", callback, data).As<v8::Function>();
#endif
        }

        template<size_t N>
        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const char (&literal)[N])
        {
            const JSStringRef str_ref = JSStringCreateWithUTF8CString(literal);
            const JSValueRef val_ref = JSValueMakeString(isolate->ctx(), str_ref);
            JSStringRelease(str_ref);
            const uint16_t stack_pos = isolate->push_copy(val_ref);
            return v8::Local<v8::String>(v8::Data(isolate, stack_pos));
        }

        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 = p_str.utf8();
            const JSStringRef str_ref = JSStringCreateWithUTF8CString(str8.get_data());
            const JSValueRef val_ref = JSValueMakeString(isolate->ctx(), str_ref);
            JSStringRelease(str_ref);
            const uint16_t stack_pos = isolate->push_copy(val_ref);
            return v8::Local<v8::String>(v8::Data(isolate, stack_pos));
        }

        jsb_force_inline static v8::Local<v8::String> new_string_ascii(v8::Isolate* isolate, const String& p_str)
        {
            return new_string(isolate, p_str);
        }

        static v8::MaybeLocal<v8::Value> parse_json(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const uint8_t* p_ptr, size_t p_len)
        {
            jsb_check((size_t)(int) p_len == p_len);
            jsb_check(p_ptr[p_len] == '\0');
            const JSStringRef str_ref = JSStringCreateWithUTF8CString(p_ptr);
            const JSValueRef val_ref = JSValueMakeString(isolate->ctx(), str_ref);
            JSStringRelease(str_ref);
            const JSValueRef rval = JSValueMakeFromJSONString(isolate->ctx(), val_ref);
            if (rval == nullptr)
            {
                throw_error(isolate, "JSON parse error");
                return v8::MaybeLocal<v8::Value>();
            }
            const uint16_t stack_pos = isolate->push_copy(rval);
            return v8::Local<v8::String>(v8::Data(isolate, stack_pos));
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
            if (!p_val.IsEmpty() && !p_val->IsNullOrUndefined())
            {
                return JavaScriptCore::GetString(isolate->ctx(), (JSValueRef) p_val);
            }
            return String();
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

        jsb_force_inline static void get_statistics(v8::Isolate* isolate, Vector<CustomField>& p_fields)
        {
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
                JSB_JSC_LOG(VeryVerbose, "represented as bigint %d", p_val);
                return v8::BigInt::New(isolate, p_val);
            }
#endif
            return v8::Number::New(isolate, (double) p_val);
        }

        static v8::MaybeLocal<v8::Value> compile_function(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            jsb_checkf(p_source[p_source_len] == '\0', "JS_Eval needs a zero-terminated string as input to evaluate");
            v8::Isolate* isolate = context->GetIsolate();
            const JSContextRef ctx = isolate->ctx();
            const CharString filename_cs =  p_filename.utf8();
            const JSStringRef filename_ref = JSStringCreateWithUTF8CString(filename_cs.get_data());
            const JSStringRef code = JSStringCreateWithUTF8CString(p_source);

            JSValueRef error = nullptr;
            const JSValueRef rval = JSEvaluateScript(ctx, code, nullptr, filename_ref, 1, &error);
            JSStringRelease(filename_ref);
            JSStringRelease(code);
            if (error)
            {
                // intentionally keep the exception
                isolate->_ThrowError(error);
                return v8::MaybeLocal<v8::Value>();
            }
            jsb_check(rval);
            return v8::MaybeLocal<v8::Value>(v8::Data(isolate, isolate->push_copy(rval)));
        }

        static v8::MaybeLocal<v8::Value> eval(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            return compile_function(context, p_source, p_source_len, p_filename);
        }

        jsb_force_inline static void free(uint8_t* data)
        {
            //NOTE not a good practice, just for the simplicity of Buffer (to move/free by Buffer)
            memfree(data);
        }

        jsb_force_inline static void set_as_interruptible(v8::Isolate* isolate)
        {
            JSB_JSC_LOG(Error, "set_as_interruptible is not supported by JSC");
        }
    };
}

#endif


