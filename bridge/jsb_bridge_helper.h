#ifndef GODOTJS_BRIDGE_HELPER_H
#define GODOTJS_BRIDGE_HELPER_H
#include "jsb_bridge_pch.h"

namespace jsb
{
    namespace internal
    {
        struct SourcePosition;
    }

    struct BridgeHelper
    {
        static String stringify(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val);

        // return enum typed p_val as int32
        template<typename TEnum>
        static TEnum to_enum(const v8::Local<v8::Context>& context, v8::MaybeLocal<v8::Value> p_val, const TEnum p_default_value)
        {
            int32_t value;
            v8::Local<v8::Value> local;
            if (p_val.ToLocal(&local) && local->Int32Value(context).To(&value)) return (TEnum) value;
            return p_default_value;
        }

        static PackedByteArray to_packed_byte_array(v8::Isolate* isolate, const v8::Local<v8::ArrayBuffer>& array_buffer)
        {
            const size_t size = array_buffer->ByteLength();
            PackedByteArray packed;
            const Error err = packed.resize((int) size);
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

        static v8::Local<v8::Object> to_global_enum(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& name)
        {
            HashMap<StringName, int64_t> enum_values;
            CoreConstants::get_enum_values(name, &enum_values);
            return to_global_enum(isolate, context, enum_values);
        }

        static v8::Local<v8::Object> to_global_enum(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const HashMap<StringName, int64_t>& enum_values)
        {
            const v8::Local<v8::Object> enumeration = v8::Object::New(isolate);
            for (const KeyValue<StringName, int64_t>& kv : enum_values)
            {
                const v8::Local<v8::String> name = impl::Helper::new_string(isolate, kv.key);
                const v8::Local<v8::Value> value = impl::Helper::new_integer(isolate, kv.value);
                enumeration->Set(context, name, value).Check();
                // represents the value back to string for convenient uses, such as MyColor[MyColor.White] => 'White'
                enumeration->DefineOwnProperty(context, value->ToString(context).ToLocalChecked(), name, v8::DontEnum).Check();
            }
            return enumeration;
        }

        // Get full exception info (Message+Stacktrace)
        static String get_exception(const impl::TryCatch& p_catch);

        // Get stacktrace info from exception
        static String get_stacktrace(const impl::TryCatch& p_catch, internal::SourcePosition& r_position);
    };
}
#endif
