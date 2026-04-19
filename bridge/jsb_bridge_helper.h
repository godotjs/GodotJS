#ifndef GODOTJS_BRIDGE_HELPER_H
#define GODOTJS_BRIDGE_HELPER_H
#include "jsb_bridge_pch.h"
#include "jsb_type_convert.h"

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
                const v8::Local<v8::String> name = impl::Helper::new_string(isolate, internal::NamingUtil::get_enum_value_name(kv.key));
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

        template<typename T>
        struct TVariantArray
        {
            static v8::Local<v8::Array> from_vector(v8::Isolate* p_isolate, const v8::Local<v8::Context>& p_context, Variant::Type p_type, const Vector<T>& vector)
            {
                typename Vector<T>::Size size = vector.size();
                v8::Local<v8::Array> array = v8::Array::New(p_isolate);

                for (typename Vector<T>::Size index = 0; index < size; ++index)
                {
                    const auto& variant = vector[index];

                    v8::Local<v8::Value> value;

                    if (!TypeConvert::gd_var_to_js(p_isolate, p_context, variant, p_type, value))
                    {
                        jsb_throw(p_isolate, "Failed to convert vector element");
                        return v8::Local<v8::Array>();
                    }

                    array->Set(p_context, index, value);
                }

                return array;
            }
        };
    };
}
#endif
