#ifndef GODOTJS_BRIDGE_HELPER_H
#define GODOTJS_BRIDGE_HELPER_H
#include "jsb_pch.h"

namespace jsb
{
    namespace internal
    {
        struct SourcePosition;
    }

    struct BridgeHelper
    {
        static String stringify(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val);

        // convert int64 to int32 anyway
        jsb_force_inline static v8::Local<v8::Integer> to_int32(v8::Isolate* isolate, int64_t p_val)
        {
            return v8::Int32::New(isolate, (int32_t) p_val);
        }

        static int32_t to_int32(const v8::Local<v8::Context>& context, v8::MaybeLocal<v8::Value> obj, const int32_t p_default_value)
        {
            int32_t value = 0;
            v8::Local<v8::Value> local;
            if (obj.ToLocal(&local) && local->Int32Value(context).To(&value)) return value;
            return p_default_value;
        }

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
            v8::Local<v8::Object> enumeration = v8::Object::New(isolate);
            for (const KeyValue<StringName, int64_t>& kv : enum_values)
            {
                jsb_verify_int64(kv.value, "%s %s", kv.key, uitos(kv.value));
                v8::Local<v8::String> name = impl::Helper::new_string(isolate, kv.key);
                v8::Local<v8::Integer> value = BridgeHelper::to_int32(isolate, kv.value);
                enumeration->Set(context, name, value).Check();
                // represents the value back to string for convenient uses, such as MyColor[MyColor.White] => 'White'
                enumeration->DefineOwnProperty(context, value->ToString(context).ToLocalChecked(), name, v8::DontEnum).Check();
            }
            return enumeration;
        }

        static v8::Local<v8::ObjectTemplate> to_template_enum(v8::Isolate* isolate, const v8::Local<v8::Context>& context,
            const ClassDB::ClassInfo::EnumInfo& p_info, const HashMap<StringName, int64_t>& p_constants,
            HashSet<StringName>* o_names)
        {
            v8::Local<v8::ObjectTemplate> enumeration = v8::ObjectTemplate::New(isolate);
            for (const StringName& enum_name : p_info.constants)
            {
                const String& enum_name_str = (String) enum_name;
                jsb_not_implemented(enum_name_str.contains("."), "hierarchically nested definition is currently not supported");
                const auto& const_it = p_constants.find(enum_name);
                jsb_check(const_it);
                jsb_verify_int64(const_it->value, "%s %s", enum_name, const_it->value);
                v8::Local<v8::String> name = impl::Helper::new_string(isolate, enum_name_str);
                v8::Local<v8::Integer> value = to_int32(isolate, const_it->value);
                enumeration->Set(name, value);
                // represents the value back to string for convenient uses, such as MyColor[MyColor.White] => 'White'
                enumeration->Set(value->ToString(context).ToLocalChecked(), name, v8::DontEnum);
                if (o_names) o_names->insert(enum_name);
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
