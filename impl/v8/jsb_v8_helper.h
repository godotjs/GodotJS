#ifndef GODOTJS_V8_HELPER_H
#define GODOTJS_V8_HELPER_H

#include "jsb_v8_pch.h"

namespace jsb::impl
{
    class Helper
    {
    public:
        Helper() = delete;

        // deleter for valuetype optimization (no ObjectHandle needed)
        static void SetDeleter(Variant* p_pointer, const v8::Local<v8::Object> p_object, v8::BackingStore::DeleterCallback callback, void *deleter_data)
        {
            v8::Isolate* isolate = p_object->GetIsolate();
            p_object->Set(isolate->GetCurrentContext(), 0,
                // in this way, the scavenger could gc it efficiently
                v8::ArrayBuffer::New(isolate, v8::ArrayBuffer::NewBackingStore(p_pointer, sizeof(Variant), callback, deleter_data))
            ).Check();
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
            return v8::Function::New(context, callback, data).ToLocalChecked();
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
            if (!p_val.IsEmpty() && !p_val->IsNullOrUndefined() && p_val->ToDetailString(isolate->GetCurrentContext()).ToLocal(&local))
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
            return v8::String::NewFromTwoByte(isolate, (const uint16_t*) str16.get_data(), v8::NewStringType::kNormal, str16.length()).ToLocalChecked();
#else
            const CharString str8 = p_str.utf8();
            return v8::String::NewFromUtf8(isolate, str8.get_data(), v8::NewStringType::kNormal, str8.length()).ToLocalChecked();
#endif
        }

        jsb_force_inline static v8::Local<v8::String> new_string_ascii(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 = p_str.ascii();
            return v8::String::NewFromOneByte(isolate, (const uint8_t*) str8.get_data(), v8::NewStringType::kNormal, str8.length()).ToLocalChecked();
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

        /**
         * \brief run  and return a value from source
         * \param p_source source bytes (utf-8 encoded)
         * \param p_source_len length of source
         * \param p_filename SourceOrigin (compile the code snippet without ScriptOrigin if `p_filename` is empty)
         * \return js rval
         */
        static v8::MaybeLocal<v8::Value> compile_function(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
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
#ifdef WINDOWS_ENABLED
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

            // JSB_LOG(VeryVerbose, "script compiled %s", p_filename);
            return maybe_value;
        }

        static v8::MaybeLocal<v8::Value> eval(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            return compile_function(context, p_source, p_source_len, p_filename);
        }

        template<int N>
        jsb_force_inline static void throw_error(v8::Isolate* isolate, const char (&message)[N])
        {
            isolate->ThrowError(message);
        }

        jsb_force_inline static void throw_error(v8::Isolate* isolate, const String& message)
        {
            isolate->ThrowError(new_string(isolate, message));
        }

        jsb_force_inline static void free(uint8_t* data)
        {
            ::free(data);
        }

        jsb_force_inline static void get_statistics(v8::Isolate* isolate, Vector<CustomField>& p_fields)
        {
            v8::HeapStatistics v8_statistics;
            isolate->GetHeapStatistics(&v8_statistics);

            p_fields.append(CustomField::cap("global_handles_size", v8_statistics.used_global_handles_size(), v8_statistics.total_global_handles_size()));
            p_fields.append(CustomField::cap("heap_size", v8_statistics.used_heap_size(), v8_statistics.total_heap_size(), CustomField::HINT_SIZE));
            p_fields.append(CustomField::value("peak_malloced_memory", v8_statistics.peak_malloced_memory()));
            p_fields.append(CustomField::value("malloced_memory", v8_statistics.malloced_memory()));
            p_fields.append(CustomField::value("external_memory", v8_statistics.external_memory()));
        }

        jsb_force_inline static void set_as_interruptible(v8::Isolate* isolate) {}
    };
}

#endif

