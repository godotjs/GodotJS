#include "jsb_quickjs_serializer.h"

#include "jsb_quickjs_context.h"
#include "jsb_quickjs_maybe.h"
#include "jsb_quickjs_handle.h"
#include "jsb_quickjs_isolate.h"
#include "jsb_quickjs_object.h"
#include "jsb_quickjs_container.h"
#include "jsb_quickjs_array_buffer.h"
#include "jsb_quickjs_function.h"
#include "jsb_quickjs_helper.h"

#include <unordered_map>
#include <vector>
#include <cstdlib>

namespace v8
{
    enum class SerializedTag : uint8_t
    {
        kUndefined = 0,
        kNull = 1,
        kBoolFalse = 2,
        kBoolTrue = 3,
        kNumber = 4,
        kString = 5,
        kArray = 6,
        kObject = 7,
        kBackRef = 8,
        kHostObject = 9,
        kDate = 10,
        kRegExp = 11,
        kMap = 12,
        kSet = 13,
        kArrayBuffer = 14,
        kTypedArray = 15,
        kBigInt = 16,
        kDataView = 17,
    };

    enum class TypedArrayKind : uint32_t
    {
        kInt8 = 1,
        kUint8 = 2,
        kUint8Clamped = 3,
        kInt16 = 4,
        kUint16 = 5,
        kInt32 = 6,
        kUint32 = 7,
        kFloat32 = 8,
        kFloat64 = 9,
        kBigInt64 = 10,
        kBigUint64 = 11,
    };

    struct EncodeState
    {
        std::vector<uint8_t>& stream;
        std::unordered_map<void*, uint32_t> object_indices;
        Isolate* isolate = nullptr;
        Local<Context> context;
        ValueSerializer::Delegate* delegate = nullptr;
    };

    struct DecodeState
    {
        const uint8_t* data = nullptr;
        size_t size = 0;
        size_t offset = 0;
        std::vector<Local<Value>> objects;
        Isolate* isolate = nullptr;
        Local<Context> context;
        ValueDeserializer* deserializer = nullptr;
        ValueDeserializer::Delegate* delegate = nullptr;
    };

    static void append_varint(std::vector<uint8_t>& stream, uint32_t value)
    {
        constexpr uint32_t kVarintMask = 0x7Fu;
        constexpr uint32_t kVarintHasMoreBit = 0x80u;

        while (value >= kVarintHasMoreBit)
        {
            stream.push_back(static_cast<uint8_t>((value & kVarintMask) | kVarintHasMoreBit));
            value >>= 7;
        }

        stream.push_back(static_cast<uint8_t>(value));
    }

    static bool read_varint(const uint8_t* data, size_t size, size_t& offset, uint32_t& out_value)
    {
        constexpr uint32_t kVarintMask = 0x7Fu;
        constexpr uint32_t kVarintHasMoreBit = 0x80u;
        constexpr uint32_t kMaxVarintShift = 28u;

        uint32_t result = 0;
        uint32_t shift = 0;

        while (offset < size)
        {
            const uint8_t byte = data[offset++];
            result |= static_cast<uint32_t>(byte & kVarintMask) << shift;

            if ((byte & kVarintHasMoreBit) == 0)
            {
                out_value = result;
                return true;
            }

            if (shift >= kMaxVarintShift)
            {
                return false;
            }
            shift += 7;
        }

        return false;
    }

    static bool write_tag(std::vector<uint8_t>& stream, SerializedTag tag)
    {
        stream.push_back(static_cast<uint8_t>(tag));
        return true;
    }

    static bool read_tag(DecodeState& state, SerializedTag& out_tag)
    {
        if (state.offset >= state.size)
        {
            return false;
        }

        out_tag = static_cast<SerializedTag>(state.data[state.offset++]);
        return true;
    }

    static bool write_bytes(std::vector<uint8_t>& stream, const uint8_t* bytes, size_t length)
    {
        if (length == 0)
        {
            return true;
        }

        stream.insert(stream.end(), bytes, bytes + length);
        return true;
    }

    static bool read_bytes(DecodeState& state, size_t length, const uint8_t*& out_bytes)
    {
        if (state.offset > state.size || length > state.size - state.offset)
        {
            return false;
        }

        out_bytes = state.data + state.offset;
        state.offset += length;
        return true;
    }

    static bool write_string_utf8(std::vector<uint8_t>& stream, const ::String& str)
    {
        const CharString str_utf8 = str.utf8();
        const uint32_t len = static_cast<uint32_t>(str_utf8.length());
        append_varint(stream, len);
        return write_bytes(stream, reinterpret_cast<const uint8_t*>(str_utf8.get_data()), len);
    }

    static bool read_string_utf8(DecodeState& state, ::String& out_str)
    {
        uint32_t len = 0;
        if (!read_varint(state.data, state.size, state.offset, len))
        {
            return false;
        }

        if (len == 0)
        {
            out_str = ::String();
            return true;
        }

        const uint8_t* bytes = nullptr;
        if (!read_bytes(state, len, bytes))
        {
            return false;
        }

        out_str = ::String::utf8(reinterpret_cast<const char*>(bytes), static_cast<int>(len));
        return true;
    }

    static bool get_named_property(
        Isolate* isolate,
        const Local<Context>& context,
        const Local<Object>& obj,
        const char* name,
        Local<Value>& out_value)
    {
        return obj->Get(context, jsb::impl::Helper::new_string(isolate, name)).ToLocal(&out_value);
    }

    static bool get_named_string_property(
        Isolate* isolate,
        const Local<Context>& context,
        const Local<Object>& obj,
        const char* name,
        ::String& out_value)
    {
        Local<Value> value;
        if (!get_named_property(isolate, context, obj, name, value) || !value->IsString())
        {
            return false;
        }

        out_value = jsb::impl::Helper::to_string(isolate, value);
        return true;
    }

    static bool get_named_uint32_property(
        Isolate* isolate,
        const Local<Context>& context,
        const Local<Object>& obj,
        const char* name,
        uint32_t& out_value)
    {
        Local<Value> value;
        if (!get_named_property(isolate, context, obj, name, value) || !value->IsNumber())
        {
            return false;
        }

        int32_t signed_value = 0;
        if (!value->Int32Value(context).To(&signed_value) || signed_value < 0)
        {
            return false;
        }

        out_value = static_cast<uint32_t>(signed_value);
        return true;
    }

    static bool try_get_constructor_name(
        Isolate* isolate,
        const Local<Context>& context,
        const Local<Object>& obj,
        ::String& out_name)
    {
        Local<Value> ctor_value;
        if (!get_named_property(isolate, context, obj, "constructor", ctor_value) || !ctor_value->IsObject())
        {
            return false;
        }

        return get_named_string_property(isolate, context, ctor_value.As<Object>(), "name", out_name);
    }

    static bool is_supported_typed_array_kind(const ::String& kind_name)
    {
        return kind_name == "Int8Array"
            || kind_name == "Uint8Array"
            || kind_name == "Uint8ClampedArray"
            || kind_name == "Int16Array"
            || kind_name == "Uint16Array"
            || kind_name == "Int32Array"
            || kind_name == "Uint32Array"
            || kind_name == "Float32Array"
            || kind_name == "Float64Array"
            || kind_name == "BigInt64Array"
            || kind_name == "BigUint64Array";
    }

    static bool is_data_view_kind(const ::String& kind_name)
    {
        return kind_name == "DataView";
    }

    static bool is_array_buffer_view_object(
        Isolate* isolate,
        const Local<Context>& context,
        const Local<Object>& obj)
    {
        Local<Object> global = context->Global();

        Local<Value> array_buffer_value;
        if (!get_named_property(isolate, context, global, "ArrayBuffer", array_buffer_value) || !array_buffer_value->IsObject())
        {
            return false;
        }

        Local<Value> is_view_value;
        if (!get_named_property(isolate, context, array_buffer_value.As<Object>(), "isView", is_view_value) || !is_view_value->IsFunction())
        {
            return false;
        }

        Local<Value> argv[] = { obj };
        Local<Value> result;
        if (!is_view_value.As<Function>()->Call(context, array_buffer_value, 1, argv).ToLocal(&result))
        {
            return false;
        }

        return result->BooleanValue(isolate);
    }

    static bool typed_array_kind_to_id(const ::String& kind_name, uint32_t& out_id)
    {
        if (kind_name == "Int8Array") out_id = static_cast<uint32_t>(TypedArrayKind::kInt8);
        else if (kind_name == "Uint8Array") out_id = static_cast<uint32_t>(TypedArrayKind::kUint8);
        else if (kind_name == "Uint8ClampedArray") out_id = static_cast<uint32_t>(TypedArrayKind::kUint8Clamped);
        else if (kind_name == "Int16Array") out_id = static_cast<uint32_t>(TypedArrayKind::kInt16);
        else if (kind_name == "Uint16Array") out_id = static_cast<uint32_t>(TypedArrayKind::kUint16);
        else if (kind_name == "Int32Array") out_id = static_cast<uint32_t>(TypedArrayKind::kInt32);
        else if (kind_name == "Uint32Array") out_id = static_cast<uint32_t>(TypedArrayKind::kUint32);
        else if (kind_name == "Float32Array") out_id = static_cast<uint32_t>(TypedArrayKind::kFloat32);
        else if (kind_name == "Float64Array") out_id = static_cast<uint32_t>(TypedArrayKind::kFloat64);
        else if (kind_name == "BigInt64Array") out_id = static_cast<uint32_t>(TypedArrayKind::kBigInt64);
        else if (kind_name == "BigUint64Array") out_id = static_cast<uint32_t>(TypedArrayKind::kBigUint64);
        else return false;
        return true;
    }

    static const char* typed_array_id_to_name(uint32_t id)
    {
        switch (static_cast<TypedArrayKind>(id))
        {
            case TypedArrayKind::kInt8: return "Int8Array";
            case TypedArrayKind::kUint8: return "Uint8Array";
            case TypedArrayKind::kUint8Clamped: return "Uint8ClampedArray";
            case TypedArrayKind::kInt16: return "Int16Array";
            case TypedArrayKind::kUint16: return "Uint16Array";
            case TypedArrayKind::kInt32: return "Int32Array";
            case TypedArrayKind::kUint32: return "Uint32Array";
            case TypedArrayKind::kFloat32: return "Float32Array";
            case TypedArrayKind::kFloat64: return "Float64Array";
            case TypedArrayKind::kBigInt64: return "BigInt64Array";
            case TypedArrayKind::kBigUint64: return "BigUint64Array";
        }

        return nullptr;
    }

    static void* object_identity(const Local<Object>& obj)
    {
        const JSValue value = static_cast<JSValue>(obj);
        return JS_VALUE_GET_TAG(value) < 0 ? JS_VALUE_GET_PTR(value) : nullptr;
    }

    static bool encode_value(const Local<Value>& value, EncodeState& state, int depth = 0)
    {
        constexpr int kMaxEncodeDepth = 256;
        if (depth > kMaxEncodeDepth)
        {
            JSB_QUICKJS_LOG(Error, "encode_value: max recursion depth exceeded");
            return false;
        }

        Isolate* isolate = state.isolate;
        const Local<Context>& context = state.context;

        if (value->IsUndefined())
        {
            return write_tag(state.stream, SerializedTag::kUndefined);
        }

        if (value->IsNull())
        {
            return write_tag(state.stream, SerializedTag::kNull);
        }

        if (value->IsBoolean())
        {
            return write_tag(state.stream, value->BooleanValue(isolate) ? SerializedTag::kBoolTrue : SerializedTag::kBoolFalse);
        }

        if (value->IsNumber())
        {
            if (!write_tag(state.stream, SerializedTag::kNumber))
            {
                return false;
            }

            const double num = value.As<Number>()->Value();
            return write_bytes(state.stream, reinterpret_cast<const uint8_t*>(&num), sizeof(double));
        }

        if (value->IsString())
        {
            if (!write_tag(state.stream, SerializedTag::kString))
            {
                return false;
            }

            return write_string_utf8(state.stream, jsb::impl::Helper::to_string(isolate, value));
        }

        if (value->IsBigInt())
        {
            if (!write_tag(state.stream, SerializedTag::kBigInt))
            {
                return false;
            }

            Local<String> text;
            if (!value->ToString(context).ToLocal(&text))
            {
                return false;
            }

            return write_string_utf8(state.stream, jsb::impl::Helper::to_string(isolate, text));
        }

        if (!value->IsObject())
        {
            return false;
        }

        const Local<Object> obj = value.As<Object>();

        if (state.delegate != nullptr)
        {
            const size_t stream_size_before = state.stream.size();

            if (obj->InternalFieldCount() > 0)
            {
                if (!write_tag(state.stream, SerializedTag::kHostObject))
                {
                    return false;
                }

                bool handled = false;
                if (!state.delegate->WriteHostObject(isolate, obj).To(&handled))
                {
                    return false;
                }

                if (handled)
                {
                    return true;
                }

                state.stream.resize(stream_size_before);
            }
        }

        const void* identity = object_identity(obj);
        if (identity != nullptr)
        {
            const auto existing = state.object_indices.find(const_cast<void*>(identity));
            if (existing != state.object_indices.end())
            {
                if (!write_tag(state.stream, SerializedTag::kBackRef))
                {
                    return false;
                }

                append_varint(state.stream, existing->second);
                return true;
            }

            const uint32_t obj_index = static_cast<uint32_t>(state.object_indices.size());
            state.object_indices.emplace(const_cast<void*>(identity), obj_index);
        }

        if (obj->IsMap())
        {
            if (!write_tag(state.stream, SerializedTag::kMap))
            {
                return false;
            }

            const Local<Array> entries = obj.As<Map>()->AsArray();
            const uint32_t len = entries->Length();
            const uint32_t count = len / 2;
            append_varint(state.stream, count);

            for (uint32_t i = 0; i + 1 < len; i += 2)
            {
#if JSB_WITH_QUICKJS
                HandleScope loop_scope(isolate);
#endif
                Local<Value> key;
                Local<Value> val;
                if (!entries->Get(context, i).ToLocal(&key) || !entries->Get(context, i + 1).ToLocal(&val))
                {
                    return false;
                }

                if (!encode_value(key, state, depth + 1) || !encode_value(val, state, depth + 1))
                {
                    return false;
                }
            }

            return true;
        }

        if (obj->IsSet())
        {
            if (!write_tag(state.stream, SerializedTag::kSet))
            {
                return false;
            }

            const Local<Array> values = obj.As<Set>()->AsArray();
            const uint32_t len = values->Length();
            append_varint(state.stream, len);

            for (uint32_t i = 0; i < len; ++i)
            {
#if JSB_WITH_QUICKJS
                HandleScope loop_scope(isolate);
#endif
                Local<Value> elem;
                if (!values->Get(context, i).ToLocal(&elem) || !encode_value(elem, state, depth + 1))
                {
                    return false;
                }
            }

            return true;
        }

        if (obj->IsArrayBuffer())
        {
            if (!write_tag(state.stream, SerializedTag::kArrayBuffer))
            {
                return false;
            }

            const Local<ArrayBuffer> buffer = obj.As<ArrayBuffer>();
            const uint32_t length = static_cast<uint32_t>(buffer->ByteLength());
            append_varint(state.stream, length);
            return write_bytes(state.stream, reinterpret_cast<const uint8_t*>(buffer->Data()), length);
        }

        ::String constructor_name;
        const bool has_constructor_name = try_get_constructor_name(isolate, context, obj, constructor_name);

        if (has_constructor_name && constructor_name == "Date")
        {
            Local<Value> get_time_value;
            if (!get_named_property(isolate, context, obj, "getTime", get_time_value) || !get_time_value->IsFunction())
            {
                return false;
            }

            Local<Value> ms_value;
            if (!get_time_value.As<Function>()->Call(context, obj, 0, nullptr).ToLocal(&ms_value) || !ms_value->IsNumber())
            {
                return false;
            }

            const double ms = ms_value.As<Number>()->Value();
            if (!write_tag(state.stream, SerializedTag::kDate))
            {
                return false;
            }

            return write_bytes(state.stream, reinterpret_cast<const uint8_t*>(&ms), sizeof(double));
        }

        if (has_constructor_name && constructor_name == "RegExp")
        {
            ::String source;
            ::String flags;
            if (!get_named_string_property(isolate, context, obj, "source", source)
                || !get_named_string_property(isolate, context, obj, "flags", flags))
            {
                return false;
            }

            if (!write_tag(state.stream, SerializedTag::kRegExp))
            {
                return false;
            }

            return write_string_utf8(state.stream, source) && write_string_utf8(state.stream, flags);
        }

        if (is_array_buffer_view_object(isolate, context, obj))
        {
            if (!has_constructor_name)
            {
                return false;
            }

            Local<Value> buffer_value;
            uint32_t byte_offset = 0;
            uint32_t length = 0;
            if (!get_named_property(isolate, context, obj, "buffer", buffer_value)
                || !buffer_value->IsObject()
                || !buffer_value.As<Object>()->IsArrayBuffer()
                || !get_named_uint32_property(isolate, context, obj, "byteOffset", byte_offset))
            {
                return false;
            }

            if (is_data_view_kind(constructor_name))
            {
                if (!get_named_uint32_property(isolate, context, obj, "byteLength", length))
                {
                    return false;
                }

                if (!write_tag(state.stream, SerializedTag::kDataView))
                {
                    return false;
                }

                append_varint(state.stream, byte_offset);
                append_varint(state.stream, length);
                return encode_value(buffer_value, state, depth + 1);
            }

            uint32_t kind_id = 0;
            if (!is_supported_typed_array_kind(constructor_name)
                || !get_named_uint32_property(isolate, context, obj, "length", length)
                || !typed_array_kind_to_id(constructor_name, kind_id))
            {
                return false;
            }

            if (!write_tag(state.stream, SerializedTag::kTypedArray))
            {
                return false;
            }

            append_varint(state.stream, kind_id);
            append_varint(state.stream, byte_offset);
            append_varint(state.stream, length);
            return encode_value(buffer_value, state, depth + 1);
        }

        if (obj->IsArray())
        {
            if (!write_tag(state.stream, SerializedTag::kArray))
            {
                return false;
            }

            const Local<Array> arr = obj.As<Array>();
            const uint32_t len = arr->Length();
            append_varint(state.stream, len);

            for (uint32_t i = 0; i < len; ++i)
            {
#if JSB_WITH_QUICKJS
                HandleScope loop_scope(isolate);
#endif
                Local<Value> elem;
                if (!arr->Get(context, i).ToLocal(&elem) || !encode_value(elem, state, depth + 1))
                {
                    return false;
                }
            }

            return true;
        }

        if (!write_tag(state.stream, SerializedTag::kObject))
        {
            return false;
        }

        MaybeLocal<Array> maybe_keys = obj->GetOwnPropertyNames(context, ONLY_ENUMERABLE, KeyConversionMode::kNoNumbers);
        if (maybe_keys.IsEmpty())
        {
            return false;
        }

        const Local<Array> keys = maybe_keys.ToLocalChecked();
        const uint32_t key_count = keys->Length();
        std::vector<::String> serializable_keys;
        serializable_keys.reserve(key_count);

        for (uint32_t i = 0; i < key_count; ++i)
        {
#if JSB_WITH_QUICKJS
            HandleScope loop_scope(isolate);
#endif
            Local<Value> key;
            if (!keys->Get(context, i).ToLocal(&key) || !key->IsString())
            {
                continue;
            }

            serializable_keys.push_back(jsb::impl::Helper::to_string(isolate, key));
        }

        append_varint(state.stream, static_cast<uint32_t>(serializable_keys.size()));

        for (const ::String& key_str : serializable_keys)
        {
#if JSB_WITH_QUICKJS
            HandleScope loop_scope(isolate);
#endif
            if (!write_string_utf8(state.stream, key_str))
            {
                return false;
            }

            Local<Value> val;
            if (!obj->Get(context, jsb::impl::Helper::new_string(isolate, key_str)).ToLocal(&val))
            {
                return false;
            }

            if (!encode_value(val, state, depth + 1))
            {
                return false;
            }
        }

        return true;
    }

    static bool decode_value(DecodeState& state, Local<Value>& out_value)
    {
        Isolate* isolate = state.isolate;
        const Local<Context>& context = state.context;

        SerializedTag tag = SerializedTag::kUndefined;
        if (!read_tag(state, tag))
        {
            return false;
        }

        switch (tag)
        {
            case SerializedTag::kUndefined:
                out_value = Undefined(isolate);
                return true;

            case SerializedTag::kNull:
                out_value = Null(isolate);
                return true;

            case SerializedTag::kBoolFalse:
                out_value = Boolean::New(isolate, false);
                return true;

            case SerializedTag::kBoolTrue:
                out_value = Boolean::New(isolate, true);
                return true;

            case SerializedTag::kNumber:
            {
                const uint8_t* bytes = nullptr;
                if (!read_bytes(state, sizeof(double), bytes))
                {
                    return false;
                }

                double num = 0.0;
                memcpy(&num, bytes, sizeof(double));
                out_value = Number::New(isolate, num);
                return true;
            }

            case SerializedTag::kString:
            {
                ::String str;
                if (!read_string_utf8(state, str))
                {
                    return false;
                }

                out_value = jsb::impl::Helper::new_string(isolate, str);
                return true;
            }

            case SerializedTag::kBackRef:
            {
                uint32_t index = 0;
                if (!read_varint(state.data, state.size, state.offset, index) || index >= state.objects.size())
                {
                    return false;
                }

                out_value = state.objects[index];
                return true;
            }

            case SerializedTag::kHostObject:
            {
                if (state.delegate == nullptr || state.deserializer == nullptr)
                {
                    return false;
                }

                if (!state.deserializer->SetReadOffset(state.offset))
                {
                    return false;
                }

                Local<Object> object;
                if (!state.delegate->ReadHostObject(isolate).ToLocal(&object))
                {
                    return false;
                }

                state.offset = state.deserializer->GetReadOffset();
                out_value = object;
                return true;
            }

            case SerializedTag::kDate:
            {
                const uint8_t* bytes = nullptr;
                if (!read_bytes(state, sizeof(double), bytes))
                {
                    return false;
                }

                double ms = 0.0;
                memcpy(&ms, bytes, sizeof(double));

                Local<Object> global = context->Global();
                Local<Value> date_ctor_value;
                if (!get_named_property(isolate, context, global, "Date", date_ctor_value) || !date_ctor_value->IsFunction())
                {
                    return false;
                }

                Local<Value> argv[] = { Number::New(isolate, ms) };
                Local<Value> date_value;
                if (!date_ctor_value.As<Object>()->CallAsConstructor(context, 1, argv).ToLocal(&date_value) || !date_value->IsObject())
                {
                    return false;
                }

                out_value = date_value;
                state.objects.push_back(date_value);
                return true;
            }

            case SerializedTag::kRegExp:
            {
                ::String source;
                ::String flags;
                if (!read_string_utf8(state, source) || !read_string_utf8(state, flags))
                {
                    return false;
                }

                Local<Object> global = context->Global();
                Local<Value> regexp_ctor_value;
                if (!get_named_property(isolate, context, global, "RegExp", regexp_ctor_value) || !regexp_ctor_value->IsFunction())
                {
                    return false;
                }

                Local<Value> argv[] = {
                    jsb::impl::Helper::new_string(isolate, source),
                    jsb::impl::Helper::new_string(isolate, flags),
                };

                Local<Value> regexp_value;
                if (!regexp_ctor_value.As<Object>()->CallAsConstructor(context, 2, argv).ToLocal(&regexp_value) || !regexp_value->IsObject())
                {
                    return false;
                }

                out_value = regexp_value;
                state.objects.push_back(regexp_value);
                return true;
            }

            case SerializedTag::kMap:
            {
                uint32_t count = 0;
                if (!read_varint(state.data, state.size, state.offset, count))
                {
                    return false;
                }

                Local<Map> map = Map::New(isolate);
                out_value = map;
                state.objects.push_back(map);

                for (uint32_t i = 0; i < count; ++i)
                {
                    Local<Value> key;
                    Local<Value> val;
                    if (!decode_value(state, key) || !decode_value(state, val) || map->Set(context, key, val).IsEmpty())
                    {
                        return false;
                    }
                }

                return true;
            }

            case SerializedTag::kSet:
            {
                uint32_t count = 0;
                if (!read_varint(state.data, state.size, state.offset, count))
                {
                    return false;
                }

                Local<Set> set = Set::New(isolate);
                out_value = set;
                state.objects.push_back(set);

                for (uint32_t i = 0; i < count; ++i)
                {
                    Local<Value> elem;
                    if (!decode_value(state, elem) || set->Add(context, elem).IsEmpty())
                    {
                        return false;
                    }
                }

                return true;
            }

            case SerializedTag::kArrayBuffer:
            {
                uint32_t byte_length = 0;
                if (!read_varint(state.data, state.size, state.offset, byte_length))
                {
                    return false;
                }

                const uint8_t* bytes = nullptr;
                if (!read_bytes(state, byte_length, bytes))
                {
                    return false;
                }

                Local<ArrayBuffer> buffer = ArrayBuffer::New(isolate, byte_length);
                if (byte_length > 0)
                {
                    memcpy(buffer->Data(), bytes, byte_length);
                }

                out_value = buffer;
                state.objects.push_back(buffer);
                return true;
            }

            case SerializedTag::kTypedArray:
            {
                uint32_t kind_id = 0;
                uint32_t byte_offset = 0;
                uint32_t length = 0;

                if (!read_varint(state.data, state.size, state.offset, kind_id)
                    || !read_varint(state.data, state.size, state.offset, byte_offset)
                    || !read_varint(state.data, state.size, state.offset, length))
                {
                    return false;
                }

                Local<Value> buffer_value;
                if (!decode_value(state, buffer_value) || !buffer_value->IsObject() || !buffer_value.As<Object>()->IsArrayBuffer())
                {
                    return false;
                }

                const char* ctor_name = typed_array_id_to_name(kind_id);
                if (ctor_name == nullptr)
                {
                    return false;
                }

                Local<Object> global = context->Global();
                Local<Value> ctor_value;
                if (!get_named_property(isolate, context, global, ctor_name, ctor_value) || !ctor_value->IsFunction())
                {
                    return false;
                }

                Local<Value> argv[] = {
                    buffer_value,
                    Uint32::NewFromUnsigned(isolate, byte_offset),
                    Uint32::NewFromUnsigned(isolate, length),
                };

                Local<Value> typed_array;
                if (!ctor_value.As<Object>()->CallAsConstructor(context, 3, argv).ToLocal(&typed_array) || !typed_array->IsObject())
                {
                    return false;
                }

                out_value = typed_array;
                state.objects.push_back(typed_array);
                return true;
            }

            case SerializedTag::kDataView:
            {
                uint32_t byte_offset = 0;
                uint32_t byte_length = 0;
                if (!read_varint(state.data, state.size, state.offset, byte_offset)
                    || !read_varint(state.data, state.size, state.offset, byte_length))
                {
                    return false;
                }

                Local<Value> buffer_value;
                if (!decode_value(state, buffer_value) || !buffer_value->IsObject() || !buffer_value.As<Object>()->IsArrayBuffer())
                {
                    return false;
                }

                Local<Object> global = context->Global();
                Local<Value> ctor_value;
                if (!get_named_property(isolate, context, global, "DataView", ctor_value) || !ctor_value->IsFunction())
                {
                    return false;
                }

                Local<Value> argv[] = {
                    buffer_value,
                    Uint32::NewFromUnsigned(isolate, byte_offset),
                    Uint32::NewFromUnsigned(isolate, byte_length),
                };
                Local<Value> data_view;
                if (!ctor_value.As<Object>()->CallAsConstructor(context, 3, argv).ToLocal(&data_view) || !data_view->IsObject())
                {
                    return false;
                }

                out_value = data_view;
                state.objects.push_back(data_view);
                return true;
            }

            case SerializedTag::kBigInt:
            {
                ::String big_str;
                if (!read_string_utf8(state, big_str))
                {
                    return false;
                }

                Local<Object> global = context->Global();
                Local<Value> big_int_fn_value;
                if (!get_named_property(isolate, context, global, "BigInt", big_int_fn_value) || !big_int_fn_value->IsFunction())
                {
                    return false;
                }

                Local<Value> argv[] = { jsb::impl::Helper::new_string(isolate, big_str) };
                Local<Value> big_int;
                if (!big_int_fn_value.As<Function>()->Call(context, Undefined(isolate), 1, argv).ToLocal(&big_int))
                {
                    return false;
                }

                out_value = big_int;
                return true;
            }

            case SerializedTag::kArray:
            {
                uint32_t length = 0;
                if (!read_varint(state.data, state.size, state.offset, length))
                {
                    return false;
                }

                Local<Array> arr = Array::New(isolate, static_cast<int>(length));
                out_value = arr;
                state.objects.push_back(arr);

                for (uint32_t i = 0; i < length; ++i)
                {
                    Local<Value> elem;
                    if (!decode_value(state, elem) || !arr->Set(context, i, elem).FromMaybe(false))
                    {
                        return false;
                    }
                }

                return true;
            }

            case SerializedTag::kObject:
            {
                uint32_t count = 0;
                if (!read_varint(state.data, state.size, state.offset, count))
                {
                    return false;
                }

                Local<Object> obj = Object::New(isolate);
                out_value = obj;
                state.objects.push_back(obj);

                for (uint32_t i = 0; i < count; ++i)
                {
                    ::String key;
                    if (!read_string_utf8(state, key))
                    {
                        return false;
                    }

                    Local<Value> val;
                    if (!decode_value(state, val))
                    {
                        return false;
                    }

                    if (!obj->Set(context, jsb::impl::Helper::new_string(isolate, key), val).FromMaybe(false))
                    {
                        return false;
                    }
                }

                return true;
            }
        }

        return false;
    }

    void ValueSerializer::Delegate::ThrowDataCloneError(Local<String> message)
    {
        Isolate* isolate = message.IsEmpty() ? nullptr : message->isolate_;
        if (isolate)
        {
            isolate->ThrowException(Exception::Error(message));
        }
    }

    Maybe<bool> ValueSerializer::Delegate::WriteHostObject(Isolate* isolate, Local<Object> object)
    {
        JSB_QUICKJS_LOG(Error, "ValueSerializer::Delegate::WriteHostObject is not implemented");
        jsb_checkf(false, "unsupported serializer delegate hook was invoked: WriteHostObject");
        return Maybe<bool>();
    }

    Maybe<uint32_t> ValueSerializer::Delegate::GetSharedArrayBufferId(Isolate* isolate, Local<SharedArrayBuffer> shared_array_buffer)
    {
        JSB_QUICKJS_LOG(Error, "ValueSerializer::Delegate::GetSharedArrayBufferId is not implemented");
        jsb_checkf(false, "unsupported serializer delegate hook was invoked: GetSharedArrayBufferId");
        return Maybe<uint32_t>();
    }

    Maybe<uint32_t> ValueSerializer::Delegate::GetWasmModuleTransferId(Isolate* isolate, Local<WasmModuleObject> module)
    {
        JSB_QUICKJS_LOG(Error, "ValueSerializer::Delegate::GetWasmModuleTransferId is not implemented");
        jsb_checkf(false, "unsupported serializer delegate hook was invoked: GetWasmModuleTransferId");
        return Maybe<uint32_t>();
    }

    ValueSerializer::ValueSerializer(Isolate* isolate, Delegate* delegate)
        : delegate_(delegate)
    {
        (void) isolate;
    }

    void ValueSerializer::WriteHeader()
    {
        stream_buffer_.clear();

        if (buffer_ != nullptr)
        {
            jsb::impl::Helper::free(buffer_);
            buffer_ = nullptr;
        }

        size_ = 0;
    }

    Maybe<bool> ValueSerializer::WriteValue(Local<Context> context, Local<Value> value)
    {
        Isolate* isolate = context->GetIsolate();

        EncodeState state{ stream_buffer_, {}, isolate, context, delegate_ };
        const bool ok = encode_value(value, state);
        if (!ok)
        {
            return Maybe<bool>();
        }

        return Maybe<bool>(true);
    }

    void ValueSerializer::WriteUint32(uint32_t value)
    {
        append_varint(stream_buffer_, value);
    }

    void ValueSerializer::WriteRawBytes(const void* source, size_t length)
    {
        if (length == 0)
        {
            return;
        }

        const uint8_t* bytes = reinterpret_cast<const uint8_t*>(source);
        stream_buffer_.insert(stream_buffer_.end(), bytes, bytes + length);
    }

    std::pair<uint8_t*, size_t> ValueSerializer::Release()
    {
        if (!stream_buffer_.empty())
        {
            const size_t stream_size = stream_buffer_.size();
            uint8_t* output = nullptr;
#if JSB_PREFER_QUICKJS_NG
            output = reinterpret_cast<uint8_t*>(malloc(stream_size));
#else
            output = reinterpret_cast<uint8_t*>(memalloc(stream_size));
#endif
            memcpy(output, stream_buffer_.data(), stream_size);
            stream_buffer_.clear();
            return { output, stream_size };
        }

        std::pair<uint8_t*, size_t> rval = { buffer_, size_ };
        buffer_ = nullptr;
        size_ = 0;
        return rval;
    }

    MaybeLocal<Object> ValueDeserializer::Delegate::ReadHostObject(Isolate* isolate)
    {
        JSB_QUICKJS_LOG(Error, "ValueDeserializer::Delegate::ReadHostObject is not implemented");
        jsb_checkf(false, "unsupported deserializer delegate hook was invoked: ReadHostObject");
        return MaybeLocal<Object>();
    }

    ValueDeserializer::ValueDeserializer(Isolate* isolate, const uint8_t* data, size_t size, Delegate* delegate)
        : buffer_(const_cast<uint8_t*>(data)), size_(size), delegate_(delegate), read_offset_(0)
    {
        (void) isolate;
    }

    Maybe<bool> ValueDeserializer::ReadHeader(Local<Context> context)
    {
        (void) context;
        read_offset_ = 0;
        return Maybe(true);
    }

    bool ValueDeserializer::ReadUint32(uint32_t* value)
    {
        if (value == nullptr || buffer_ == nullptr)
        {
            return false;
        }

        return read_varint(buffer_, size_, read_offset_, *value);
    }

    bool ValueDeserializer::ReadRawBytes(size_t length, const void** data)
    {
        if (data == nullptr || buffer_ == nullptr || read_offset_ > size_ || length > size_ - read_offset_)
        {
            return false;
        }

        *data = buffer_ + read_offset_;
        read_offset_ += length;
        return true;
    }

    size_t ValueDeserializer::GetReadOffset() const
    {
        return read_offset_;
    }

    bool ValueDeserializer::SetReadOffset(size_t offset)
    {
        if (offset > size_)
        {
            return false;
        }

        read_offset_ = offset;
        return true;
    }

    MaybeLocal<Value> ValueDeserializer::ReadValue(Local<Context> context)
    {
        Isolate* isolate = context->GetIsolate();

        if (buffer_ == nullptr)
        {
            return MaybeLocal<Value>();
        }

        DecodeState state;
        state.data = buffer_;
        state.size = size_;
        state.offset = read_offset_;
        state.isolate = isolate;
        state.context = context;
        state.deserializer = this;
        state.delegate = delegate_;

        Local<Value> decoded;
        if (!decode_value(state, decoded))
        {
            return MaybeLocal<Value>();
        }

        read_offset_ = state.offset;
        return MaybeLocal<Value>(decoded);
    }
}
