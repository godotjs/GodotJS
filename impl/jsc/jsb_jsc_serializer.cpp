#include "jsb_jsc_serializer.h"

#include "jsb_jsc_context.h"
#include "jsb_jsc_maybe.h"
#include "jsb_jsc_handle.h"
#include "jsb_jsc_isolate.h"
#include "jsb_jsc_container.h"

#include <unordered_map>
#include <vector>

namespace v8
{
    static void typed_array_bytes_deallocator(void* bytes, void* deallocator_context)
    {
        if (bytes)
        {
            memfree(bytes);
        }
    }

    static bool get_named_property(JSContextRef ctx, JSObjectRef object, const char* name, JSValueRef& out_value)
    {
        JSStringRef key = JSStringCreateWithUTF8CString(name);
        if (!key)
        {
            return false;
        }

        JSValueRef error = nullptr;
        out_value = JSObjectGetProperty(ctx, object, key, &error);
        JSStringRelease(key);

        if (error != nullptr)
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return false;
        }

        return true;
    }

    static bool is_regexp_object(JSContextRef ctx, JSObjectRef object)
    {
        JSValueRef constructor_value = nullptr;
        if (!get_named_property(ctx, object, "constructor", constructor_value) || !JSValueIsObject(ctx, constructor_value))
        {
            return false;
        }

        JSValueRef name_value = nullptr;
        if (!get_named_property(ctx, JSValueToObject(ctx, constructor_value, nullptr), "name", name_value) || !JSValueIsString(ctx, name_value))
        {
            return false;
        }

        JSStringRef name = JSValueToStringCopy(ctx, name_value, nullptr);
        if (!name)
        {
            return false;
        }

        bool is_regexp = false;
        if (const size_t len = JSStringGetMaximumUTF8CStringSize(name); len > 0)
        {
            std::vector<char> utf8(len);
            if (JSStringGetUTF8CString(name, utf8.data(), len) > 0)
            {
                is_regexp = strcmp(utf8.data(), "RegExp") == 0;
            }
        }
        JSStringRelease(name);
        return is_regexp;
    }

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
            result |= (byte & kVarintMask) << shift;

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

    static bool get_named_uint32_property(JSContextRef ctx, JSObjectRef object, const char* name, uint32_t& out_value)
    {
        JSValueRef value = nullptr;
        if (!get_named_property(ctx, object, name, value) || !JSValueIsNumber(ctx, value))
        {
            return false;
        }

        JSValueRef error = nullptr;
        const double number = JSValueToNumber(ctx, value, &error);
        if (error != nullptr || number < 0.0 || number > static_cast<double>(UINT32_MAX))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return false;
        }

        out_value = static_cast<uint32_t>(number);
        return true;
    }

    static bool is_data_view_object(JSContextRef ctx, JSObjectRef object)
    {
        JSValueRef constructor_value = nullptr;
        if (!get_named_property(ctx, object, "constructor", constructor_value) || !JSValueIsObject(ctx, constructor_value))
        {
            return false;
        }

        JSValueRef name_value = nullptr;
        if (!get_named_property(ctx, JSValueToObject(ctx, constructor_value, nullptr), "name", name_value) || !JSValueIsString(ctx, name_value))
        {
            return false;
        }

        JSStringRef name = JSValueToStringCopy(ctx, name_value, nullptr);
        if (!name)
        {
            return false;
        }

        bool is_data_view = false;
        if (const size_t len = JSStringGetMaximumUTF8CStringSize(name); len > 0)
        {
            std::vector<char> utf8(len);
            if (JSStringGetUTF8CString(name, utf8.data(), len) > 0)
            {
                is_data_view = strcmp(utf8.data(), "DataView") == 0;
            }
        }
        JSStringRelease(name);
        return is_data_view;
    }

    struct EncodeState
    {
        std::vector<uint8_t>& stream;
        std::unordered_map<JSObjectRef, uint32_t> object_indices;
        Isolate* isolate = nullptr;
        ValueSerializer::Delegate* delegate = nullptr;
    };

    struct DecodeState
    {
        const uint8_t* data = nullptr;
        size_t size = 0;
        size_t offset = 0;
        std::vector<JSObjectRef> objects;
        Isolate* isolate = nullptr;
        ValueDeserializer* deserializer = nullptr;
        ValueDeserializer::Delegate* delegate = nullptr;
    };

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

    static bool write_string_utf8(std::vector<uint8_t>& stream, JSStringRef str)
    {
        if (str == nullptr)
        {
            append_varint(stream, 0);
            return true;
        }

        const size_t utf8_with_nul = JSStringGetMaximumUTF8CStringSize(str);
        if (utf8_with_nul == 0)
        {
            append_varint(stream, 0);
            return true;
        }

        std::vector<char> utf8(utf8_with_nul);
        const size_t written = JSStringGetUTF8CString(str, utf8.data(), utf8_with_nul);
        if (written == 0)
        {
            return false;
        }

        const uint32_t payload_len = static_cast<uint32_t>(written - 1);
        append_varint(stream, payload_len);
        return write_bytes(stream, reinterpret_cast<const uint8_t*>(utf8.data()), payload_len);
    }

    static bool read_string_utf8(DecodeState& state, JSStringRef& out_str)
    {
        uint32_t len = 0;

        if (!read_varint(state.data, state.size, state.offset, len))
        {
            return false;
        }

        if (len == 0)
        {
            out_str = JSStringCreateWithUTF8CString("");
            return out_str != nullptr;
        }

        const uint8_t* bytes = nullptr;

        if (!read_bytes(state, len, bytes))
        {
            return false;
        }

        std::vector<char> utf8(static_cast<size_t>(len) + 1);
        memcpy(utf8.data(), bytes, len);
        utf8[len] = '\0';
        out_str = JSStringCreateWithUTF8CString(utf8.data());
        return out_str != nullptr;
    }

    static bool encode_value(JSContextRef ctx, JSValueRef value, EncodeState& state)
    {
        if (JSValueIsUndefined(ctx, value))
        {
            return write_tag(state.stream, SerializedTag::kUndefined);
        }

        if (JSValueIsNull(ctx, value))
        {
            return write_tag(state.stream, SerializedTag::kNull);
        }

        if (JSValueIsBoolean(ctx, value))
        {
            return write_tag(state.stream, JSValueToBoolean(ctx, value) ? SerializedTag::kBoolTrue : SerializedTag::kBoolFalse);
        }

        if (JSValueIsNumber(ctx, value))
        {
            if (!write_tag(state.stream, SerializedTag::kNumber))
            {
                return false;
            }
            const double num = JSValueToNumber(ctx, value, nullptr);
            return write_bytes(state.stream, reinterpret_cast<const uint8_t*>(&num), sizeof(double));
        }

        if (JSValueIsString(ctx, value))
        {
            if (!write_tag(state.stream, SerializedTag::kString))
            {
                return false;
            }
            JSValueRef error = nullptr;
            JSStringRef str = JSValueToStringCopy(ctx, value, &error);
            if (error != nullptr || str == nullptr)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            const bool ok = write_string_utf8(state.stream, str);
            JSStringRelease(str);
            return ok;
        }

        if (JSValueGetType(ctx, value) == kJSTypeBigInt)
        {
            if (!write_tag(state.stream, SerializedTag::kBigInt))
            {
                return false;
            }
            JSStringRef str = JSValueToStringCopy(ctx, value, nullptr);
            if (!str)
            {
                return false;
            }
            const bool ok = write_string_utf8(state.stream, str);
            JSStringRelease(str);
            return ok;
        }

        if (!JSValueIsObject(ctx, value))
        {
            return false;
        }

        JSObjectRef obj = JSValueToObject(ctx, value, nullptr);
        if (obj == nullptr)
        {
            return false;
        }

        // Delegate host object serialization for bridged objects with internal fields.
        // This mirrors V8's WriteHostObject flow and allows worker transfer hooks.
        if (state.delegate != nullptr)
        {
            const size_t stream_size_before = state.stream.size();
            const Local<Object> local_obj(Data(state.isolate, state.isolate->push_copy(obj)));
            if (local_obj->InternalFieldCount() > 0)
            {
                if (!write_tag(state.stream, SerializedTag::kHostObject))
                {
                    return false;
                }

                bool handled = false;
                if (!state.delegate->WriteHostObject(state.isolate, local_obj).To(&handled))
                {
                    return false;
                }
                if (handled)
                {
                    return true;
                }

                // Delegate declined this object type; remove host-object marker and continue normal encode.
                state.stream.resize(stream_size_before);
            }
        }

        const auto existing = state.object_indices.find(obj);
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
        state.object_indices.emplace(obj, obj_index);

        if (JSValueIsDate(ctx, value))
        {
            if (!write_tag(state.stream, SerializedTag::kDate))
            {
                return false;
            }
            JSValueRef error = nullptr;
            const double ms = JSValueToNumber(ctx, value, &error);
            if (error != nullptr)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            return write_bytes(state.stream, reinterpret_cast<const uint8_t*>(&ms), sizeof(double));
        }

        if (is_regexp_object(ctx, obj))
        {
            if (!write_tag(state.stream, SerializedTag::kRegExp))
            {
                return false;
            }

            JSValueRef source_value = nullptr;
            JSValueRef flags_value = nullptr;
            if (!get_named_property(ctx, obj, "source", source_value) || !JSValueIsString(ctx, source_value)
                || !get_named_property(ctx, obj, "flags", flags_value) || !JSValueIsString(ctx, flags_value))
            {
                return false;
            }

            JSStringRef source = JSValueToStringCopy(ctx, source_value, nullptr);
            JSStringRef flags = JSValueToStringCopy(ctx, flags_value, nullptr);
            if (!source || !flags)
            {
                if (source) JSStringRelease(source);
                if (flags) JSStringRelease(flags);
                return false;
            }

            const bool ok_source = write_string_utf8(state.stream, source);
            const bool ok_flags = write_string_utf8(state.stream, flags);
            JSStringRelease(source);
            JSStringRelease(flags);
            return ok_source && ok_flags;
        }

        JSValueRef typed_array_error = nullptr;
        const JSTypedArrayType typed_array_type = JSValueGetTypedArrayType(ctx, value, &typed_array_error);
        if (typed_array_error != nullptr)
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, typed_array_error);
            return false;
        }
        if (typed_array_type == kJSTypedArrayTypeArrayBuffer)
        {
            if (!write_tag(state.stream, SerializedTag::kArrayBuffer))
            {
                return false;
            }

            JSValueRef error = nullptr;
            const size_t byte_length = JSObjectGetArrayBufferByteLength(ctx, obj, &error);
            if (error != nullptr)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            if (byte_length > UINT32_MAX)
            {
                return false;
            }

            append_varint(state.stream, static_cast<uint32_t>(byte_length));
            if (byte_length == 0)
            {
                return true;
            }

            const void* bytes = JSObjectGetArrayBufferBytesPtr(ctx, obj, &error);
            if (error != nullptr || !bytes)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            return write_bytes(state.stream, reinterpret_cast<const uint8_t*>(bytes), byte_length);
        }
        if (typed_array_type != kJSTypedArrayTypeNone)
        {
            if (!write_tag(state.stream, SerializedTag::kTypedArray))
            {
                return false;
            }

            append_varint(state.stream, static_cast<uint32_t>(typed_array_type));

            JSValueRef error = nullptr;
            const size_t byte_offset = JSObjectGetTypedArrayByteOffset(ctx, obj, &error);
            if (error != nullptr || byte_offset > UINT32_MAX)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            append_varint(state.stream, static_cast<uint32_t>(byte_offset));

            const size_t length = JSObjectGetTypedArrayLength(ctx, obj, &error);
            if (error != nullptr || length > UINT32_MAX)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            append_varint(state.stream, static_cast<uint32_t>(length));

            JSObjectRef buffer = JSObjectGetTypedArrayBuffer(ctx, obj, &error);
            if (error != nullptr || !buffer)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            return encode_value(ctx, buffer, state);
        }

        if (is_data_view_object(ctx, obj))
        {
            if (!write_tag(state.stream, SerializedTag::kDataView))
            {
                return false;
            }

            uint32_t byte_offset = 0;
            uint32_t byte_length = 0;
            if (!get_named_uint32_property(ctx, obj, "byteOffset", byte_offset)
                || !get_named_uint32_property(ctx, obj, "byteLength", byte_length))
            {
                return false;
            }
            append_varint(state.stream, byte_offset);
            append_varint(state.stream, byte_length);

            JSValueRef buffer_value = nullptr;
            if (!get_named_property(ctx, obj, "buffer", buffer_value) || !JSValueIsObject(ctx, buffer_value))
            {
                return false;
            }
            return encode_value(ctx, buffer_value, state);
        }

        if (state.isolate->_IsMap(value))
        {
            if (!write_tag(state.stream, SerializedTag::kMap))
            {
                return false;
            }

            const Local<Map> map(Data(state.isolate, state.isolate->push_copy(obj)));
            const Local<Array> entries = map->AsArray();
            const uint32_t len = entries->Length();
            if ((len & 1u) != 0)
            {
                return false;
            }
            append_varint(state.stream, len / 2);

            const JSObjectRef entries_obj = JSValueToObject(ctx, static_cast<JSValueRef>(entries), nullptr);
            if (!entries_obj)
            {
                return false;
            }

            for (uint32_t i = 0; i < len; i += 2)
            {
                JSValueRef error = nullptr;
                const JSValueRef key = JSObjectGetPropertyAtIndex(ctx, entries_obj, i, &error);
                if (error != nullptr || !encode_value(ctx, key, state))
                {
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }

                const JSValueRef val = JSObjectGetPropertyAtIndex(ctx, entries_obj, i + 1, &error);
                if (error != nullptr || !encode_value(ctx, val, state))
                {
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }
            }

            return true;
        }

        if (state.isolate->_IsSet(value))
        {
            if (!write_tag(state.stream, SerializedTag::kSet))
            {
                return false;
            }

            const Local<Set> set(Data(state.isolate, state.isolate->push_copy(obj)));
            const Local<Array> values = set->AsArray();
            const uint32_t len = values->Length();
            append_varint(state.stream, len);

            const JSObjectRef values_obj = JSValueToObject(ctx, static_cast<JSValueRef>(values), nullptr);
            if (!values_obj)
            {
                return false;
            }

            for (uint32_t i = 0; i < len; ++i)
            {
                JSValueRef error = nullptr;
                const JSValueRef val = JSObjectGetPropertyAtIndex(ctx, values_obj, i, &error);
                if (error != nullptr || !encode_value(ctx, val, state))
                {
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }
            }

            return true;
        }

        if (JSValueIsArray(ctx, value))
        {
            if (!write_tag(state.stream, SerializedTag::kArray))
            {
                return false;
            }

            JSStringRef length_name = JSStringCreateWithUTF8CString("length");
            if (length_name == nullptr)
            {
                return false;
            }
            JSValueRef error = nullptr;
            JSValueRef length_value = JSObjectGetProperty(ctx, obj, length_name, &error);
            JSStringRelease(length_name);
            if (error != nullptr)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }

            const double length_num = JSValueToNumber(ctx, length_value, &error);
            if (error != nullptr || length_num < 0)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }

            const uint32_t length = static_cast<uint32_t>(length_num);
            append_varint(state.stream, length);
            for (uint32_t i = 0; i < length; ++i)
            {
                JSValueRef elem_error = nullptr;
                JSValueRef elem = JSObjectGetPropertyAtIndex(ctx, obj, i, &elem_error);
                if (elem_error != nullptr)
                {
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, elem_error);
                    return false;
                }
                if (!encode_value(ctx, elem, state))
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

        JSPropertyNameArrayRef names = JSObjectCopyPropertyNames(ctx, obj);
        if (names == nullptr)
        {
            return false;
        }

        const size_t count = JSPropertyNameArrayGetCount(names);
        append_varint(state.stream, static_cast<uint32_t>(count));

        for (size_t i = 0; i < count; ++i)
        {
            JSStringRef key = JSPropertyNameArrayGetNameAtIndex(names, i);
            if (!write_string_utf8(state.stream, key))
            {
                JSPropertyNameArrayRelease(names);
                return false;
            }

            JSValueRef prop_error = nullptr;
            JSValueRef prop = JSObjectGetProperty(ctx, obj, key, &prop_error);
            if (prop_error != nullptr)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, prop_error);
                JSPropertyNameArrayRelease(names);
                return false;
            }

            if (!encode_value(ctx, prop, state))
            {
                JSPropertyNameArrayRelease(names);
                return false;
            }
        }

        JSPropertyNameArrayRelease(names);
        return true;
    }

    static bool decode_value(JSContextRef ctx, DecodeState& state, JSValueRef& out_value)
    {
        SerializedTag tag;

        if (!read_tag(state, tag))
        {
            JSB_JSC_LOG(Error, "decode_value: failed to read tag");
            return false;
        }

        switch (tag)
        {
            case SerializedTag::kUndefined:
                out_value = JSValueMakeUndefined(ctx);
                return true;

            case SerializedTag::kNull:
                out_value = JSValueMakeNull(ctx);
                return true;

            case SerializedTag::kBoolFalse:
                out_value = JSValueMakeBoolean(ctx, false);
                return true;

            case SerializedTag::kBoolTrue:
                out_value = JSValueMakeBoolean(ctx, true);
                return true;

            case SerializedTag::kNumber:
            {
                const uint8_t* bytes = nullptr;

                if (!read_bytes(state, sizeof(double), bytes))
                {
                    return false;
                }

                double num;
                memcpy(&num, bytes, sizeof(double));
                out_value = JSValueMakeNumber(ctx, num);
                return true;
            }

            case SerializedTag::kString:
            {
                JSStringRef str = nullptr;

                if (!read_string_utf8(state, str))
                {
                    return false;
                }

                out_value = JSValueMakeString(ctx, str);
                JSStringRelease(str);
                return true;
            }

            case SerializedTag::kBackRef:
            {
                uint32_t index = 0;

                if (!read_varint(state.data, state.size, state.offset, index))
                {
                    return false;
                }

                if (index >= state.objects.size())
                {
                    JSB_JSC_LOG(Error, "decode_value: backref out of range (%d >= %d)", index, state.objects.size());
                    return false;
                }

                out_value = state.objects[index];
                return true;
            }

            case SerializedTag::kHostObject:
            {
                if (state.delegate == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: host object without delegate");
                    return false;
                }

                if (state.deserializer == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: host object missing deserializer");
                    return false;
                }

                if (!state.deserializer->SetReadOffset(state.offset))
                {
                    JSB_JSC_LOG(Error, "decode_value: failed to sync deserializer offset");
                    return false;
                }

                Local<Object> object;
                if (!state.delegate->ReadHostObject(state.isolate).ToLocal(&object))
                {
                    JSB_JSC_LOG(Error, "decode_value: delegate ReadHostObject failed");
                    return false;
                }

                state.offset = state.deserializer->GetReadOffset();
                out_value = static_cast<JSValueRef>(object);
                return out_value != nullptr;
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
                const JSValueRef arg = JSValueMakeNumber(ctx, ms);
                JSValueRef error = nullptr;
                JSObjectRef date_obj = JSObjectMakeDate(ctx, 1, &arg, &error);
                if (error != nullptr || date_obj == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: failed to create Date");
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }

                state.objects.push_back(date_obj);
                out_value = date_obj;
                return true;
            }

            case SerializedTag::kRegExp:
            {
                JSStringRef source = nullptr;
                JSStringRef flags = nullptr;
                if (!read_string_utf8(state, source) || !read_string_utf8(state, flags))
                {
                    if (source) JSStringRelease(source);
                    if (flags) JSStringRelease(flags);
                    return false;
                }

                JSValueRef args[2] = {
                    JSValueMakeString(ctx, source),
                    JSValueMakeString(ctx, flags),
                };
                JSStringRelease(source);
                JSStringRelease(flags);

                JSValueRef error = nullptr;
                JSObjectRef regexp_obj = JSObjectMakeRegExp(ctx, 2, args, &error);
                if (error != nullptr || regexp_obj == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: failed to create RegExp");
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }

                state.objects.push_back(regexp_obj);
                out_value = regexp_obj;
                return true;
            }

            case SerializedTag::kMap:
            {
                uint32_t count = 0;
                if (!read_varint(state.data, state.size, state.offset, count))
                {
                    return false;
                }

                const uint16_t map_pos = state.isolate->push_map();
                JSObjectRef map_obj = JSValueToObject(ctx, state.isolate->stack_val(map_pos), nullptr);
                if (!map_obj)
                {
                    return false;
                }
                state.objects.push_back(map_obj);

                JSValueRef set_fn_val = nullptr;
                if (!get_named_property(ctx, map_obj, "set", set_fn_val) || !JSValueIsObject(ctx, set_fn_val))
                {
                    JSB_JSC_LOG(Error, "decode_value: map.set not found");
                    return false;
                }
                JSObjectRef set_fn = JSValueToObject(ctx, set_fn_val, nullptr);
                if (!set_fn || !JSObjectIsFunction(ctx, set_fn))
                {
                    JSB_JSC_LOG(Error, "decode_value: map.set not callable");
                    return false;
                }

                for (uint32_t i = 0; i < count; ++i)
                {
                    JSValueRef key = nullptr;
                    JSValueRef val = nullptr;
                    if (!decode_value(ctx, state, key) || !decode_value(ctx, state, val))
                    {
                        JSB_JSC_LOG(Error, "decode_value: failed to decode map entry");
                        return false;
                    }

                    JSValueRef args[2] = { key, val };
                    JSValueRef error = nullptr;
                    JSObjectCallAsFunction(ctx, set_fn, map_obj, 2, args, &error);
                    if (error != nullptr)
                    {
                        JSB_JSC_LOG(Error, "decode_value: failed map.set()");
                        jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                        return false;
                    }
                }

                out_value = map_obj;
                return true;
            }

            case SerializedTag::kSet:
            {
                uint32_t count = 0;
                if (!read_varint(state.data, state.size, state.offset, count))
                {
                    return false;
                }

                const uint16_t set_pos = state.isolate->push_set();
                JSObjectRef set_obj = JSValueToObject(ctx, state.isolate->stack_val(set_pos), nullptr);
                if (!set_obj)
                {
                    return false;
                }
                state.objects.push_back(set_obj);

                JSValueRef add_fn_val = nullptr;
                if (!get_named_property(ctx, set_obj, "add", add_fn_val) || !JSValueIsObject(ctx, add_fn_val))
                {
                    JSB_JSC_LOG(Error, "decode_value: set.add not found");
                    return false;
                }
                JSObjectRef add_fn = JSValueToObject(ctx, add_fn_val, nullptr);
                if (!add_fn || !JSObjectIsFunction(ctx, add_fn))
                {
                    JSB_JSC_LOG(Error, "decode_value: set.add not callable");
                    return false;
                }

                for (uint32_t i = 0; i < count; ++i)
                {
                    JSValueRef val = nullptr;
                    if (!decode_value(ctx, state, val))
                    {
                        JSB_JSC_LOG(Error, "decode_value: failed to decode set value");
                        return false;
                    }

                    JSValueRef args[1] = { val };
                    JSValueRef error = nullptr;
                    JSObjectCallAsFunction(ctx, add_fn, set_obj, 1, args, &error);
                    if (error != nullptr)
                    {
                        JSB_JSC_LOG(Error, "decode_value: failed set.add()");
                        jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                        return false;
                    }
                }

                out_value = set_obj;
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
                if (byte_length > 0 && !read_bytes(state, byte_length, bytes))
                {
                    return false;
                }

                void* copy = nullptr;
                if (byte_length > 0)
                {
                    copy = memalloc(byte_length);
                    memcpy(copy, bytes, byte_length);
                }

                JSValueRef error = nullptr;
                JSObjectRef buffer = JSObjectMakeArrayBufferWithBytesNoCopy(
                    ctx, copy, byte_length, typed_array_bytes_deallocator, nullptr, &error);
                if (error != nullptr || buffer == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: failed to create ArrayBuffer");
                    if (copy) memfree(copy);
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }

                state.objects.push_back(buffer);
                out_value = buffer;
                return true;
            }

            case SerializedTag::kTypedArray:
            {
                uint32_t array_type_u32 = 0;
                uint32_t byte_offset = 0;
                uint32_t length = 0;
                if (!read_varint(state.data, state.size, state.offset, array_type_u32)
                    || !read_varint(state.data, state.size, state.offset, byte_offset)
                    || !read_varint(state.data, state.size, state.offset, length))
                {
                    return false;
                }

                JSValueRef buffer_value = nullptr;
                if (!decode_value(ctx, state, buffer_value) || !JSValueIsObject(ctx, buffer_value))
                {
                    JSB_JSC_LOG(Error, "decode_value: typed array buffer decode failed");
                    return false;
                }
                JSObjectRef buffer = JSValueToObject(ctx, buffer_value, nullptr);
                if (!buffer)
                {
                    return false;
                }

                JSValueRef error = nullptr;
                JSObjectRef typed_array = JSObjectMakeTypedArrayWithArrayBufferAndOffset(
                    ctx, static_cast<JSTypedArrayType>(array_type_u32), buffer, byte_offset, length, &error);
                if (error != nullptr || typed_array == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: failed to create typed array type=%d offset=%d length=%d", array_type_u32, byte_offset, length);
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }

                state.objects.push_back(typed_array);
                out_value = typed_array;
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

                JSValueRef buffer_value = nullptr;
                if (!decode_value(ctx, state, buffer_value) || !JSValueIsObject(ctx, buffer_value))
                {
                    JSB_JSC_LOG(Error, "decode_value: DataView buffer decode failed");
                    return false;
                }
                JSObjectRef buffer = JSValueToObject(ctx, buffer_value, nullptr);
                if (!buffer)
                {
                    return false;
                }

                JSObjectRef global = JSContextGetGlobalObject(ctx);
                JSValueRef data_view_ctor_value = nullptr;
                if (!get_named_property(ctx, global, "DataView", data_view_ctor_value) || !JSValueIsObject(ctx, data_view_ctor_value))
                {
                    JSB_JSC_LOG(Error, "decode_value: DataView ctor missing");
                    return false;
                }
                JSObjectRef data_view_ctor = JSValueToObject(ctx, data_view_ctor_value, nullptr);
                if (!data_view_ctor || !JSObjectIsFunction(ctx, data_view_ctor))
                {
                    JSB_JSC_LOG(Error, "decode_value: DataView ctor not callable");
                    return false;
                }

                JSValueRef args[3] = {
                    buffer,
                    JSValueMakeNumber(ctx, byte_offset),
                    JSValueMakeNumber(ctx, byte_length),
                };
                JSValueRef error = nullptr;
                JSObjectRef data_view = JSObjectCallAsConstructor(ctx, data_view_ctor, 3, args, &error);
                if (error != nullptr || data_view == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: failed to create DataView");
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                    return false;
                }

                state.objects.push_back(data_view);
                out_value = data_view;
                return true;
            }

            case SerializedTag::kBigInt:
            {
                JSStringRef value_str = nullptr;
                if (!read_string_utf8(state, value_str))
                {
                    return false;
                }

                JSObjectRef global = JSContextGetGlobalObject(ctx);
                JSValueRef big_int_ctor_value = nullptr;
                if (!get_named_property(ctx, global, "BigInt", big_int_ctor_value) || !JSValueIsObject(ctx, big_int_ctor_value))
                {
                    JSB_JSC_LOG(Error, "decode_value: BigInt ctor missing");
                    JSStringRelease(value_str);
                    return false;
                }
                JSObjectRef big_int_ctor = JSValueToObject(ctx, big_int_ctor_value, nullptr);
                if (!big_int_ctor || !JSObjectIsFunction(ctx, big_int_ctor))
                {
                    JSB_JSC_LOG(Error, "decode_value: BigInt ctor not callable");
                    JSStringRelease(value_str);
                    return false;
                }

                JSValueRef args[1] = { JSValueMakeString(ctx, value_str) };
                JSStringRelease(value_str);
                JSValueRef error = nullptr;
                JSValueRef big_int = JSObjectCallAsFunction(ctx, big_int_ctor, global, 1, args, &error);
                if (error != nullptr || big_int == nullptr)
                {
                    JSB_JSC_LOG(Error, "decode_value: BigInt call failed");
                    jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
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

                JSObjectRef arr = JSObjectMakeArray(ctx, 0, nullptr, nullptr);

                if (arr == nullptr)
                {
                    return false;
                }

                state.objects.push_back(arr);

                for (uint32_t i = 0; i < length; ++i)
                {
                    JSValueRef elem = nullptr;

                    if (!decode_value(ctx, state, elem))
                    {
                        return false;
                    }

                    JSObjectSetPropertyAtIndex(ctx, arr, i, elem, nullptr);
                }

                out_value = arr;
                return true;
            }

            case SerializedTag::kObject:
            {
                uint32_t count = 0;

                if (!read_varint(state.data, state.size, state.offset, count))
                {
                    return false;
                }

                JSObjectRef obj = JSObjectMake(ctx, nullptr, nullptr);

                if (obj == nullptr)
                {
                    return false;
                }

                state.objects.push_back(obj);

                for (uint32_t i = 0; i < count; ++i)
                {
                    JSStringRef key = nullptr;
                    if (!read_string_utf8(state, key))
                    {
                        return false;
                    }

                    JSValueRef prop = nullptr;
                    if (!decode_value(ctx, state, prop))
                    {
                        JSStringRelease(key);
                        return false;
                    }

                    JSObjectSetProperty(ctx, obj, key, prop, kJSPropertyAttributeNone, nullptr);
                    JSStringRelease(key);
                }

                out_value = obj;
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
        JSB_JSC_LOG(Error, "ValueSerializer::Delegate::WriteHostObject is not implemented");
        jsb_checkf(false, "unsupported serializer delegate hook was invoked: WriteHostObject");
        return Maybe<bool>();
    }

    Maybe<uint32_t> ValueSerializer::Delegate::GetSharedArrayBufferId(Isolate* isolate, Local<SharedArrayBuffer> shared_array_buffer)
    {
        JSB_JSC_LOG(Error, "ValueSerializer::Delegate::GetSharedArrayBufferId is not implemented");
        jsb_checkf(false, "unsupported serializer delegate hook was invoked: GetSharedArrayBufferId");
        return Maybe<uint32_t>();
    }

    Maybe<uint32_t> ValueSerializer::Delegate::GetWasmModuleTransferId(Isolate* isolate, Local<WasmModuleObject> module)
    {
        JSB_JSC_LOG(Error, "ValueSerializer::Delegate::GetWasmModuleTransferId is not implemented");
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
            memfree(buffer_);
            buffer_ = nullptr;
        }

        size_ = 0;
    }

    Maybe<bool> ValueSerializer::WriteValue(Local<Context> context, Local<Value> value)
    {
        Isolate* isolate = context->GetIsolate();
        JSContextRef ctx = isolate->ctx();

        EncodeState state{ stream_buffer_, {}, isolate, delegate_ };
        const bool ok = encode_value(ctx, static_cast<JSValueRef>(value), state);

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
            uint8_t* output = reinterpret_cast<uint8_t*>(memalloc(stream_size));
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
        JSB_JSC_LOG(Error, "ValueDeserializer::Delegate::ReadHostObject is not implemented");
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
        JSContextRef ctx = isolate->ctx();

        if (buffer_ == nullptr)
        {
            return MaybeLocal<Value>();
        }

        DecodeState state;
        state.data = buffer_;
        state.size = size_;
        state.offset = read_offset_;
        state.isolate = isolate;
        state.deserializer = this;
        state.delegate = delegate_;

        JSValueRef decoded = nullptr;

        if (!decode_value(ctx, state, decoded))
        {
            return MaybeLocal<Value>();
        }

        read_offset_ = state.offset;
        return MaybeLocal<Value>(Data(isolate, isolate->push_copy(decoded)));
    }

}
