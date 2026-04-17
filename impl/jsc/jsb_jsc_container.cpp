#include "jsb_jsc_container.h"

#include "jsb_jsc_typedef.h"
#include "jsb_jsc_isolate.h"

namespace v8
{
    namespace
    {
        Local<Array> _new_empty_array(Isolate* isolate)
        {
            JSValueRef error = nullptr;
            const JSObjectRef array = JSObjectMakeArray(isolate->ctx(), 0, nullptr, &error);
            if (jsb_unlikely(error))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(isolate->ctx(), error);
                return Local<Array>();
            }
            return Local<Array>(Data(isolate, isolate->push_copy(array)));
        }

        bool _get_property(Isolate* isolate, JSObjectRef object, const char* name, JSValueRef* out_value)
        {
            const JSContextRef ctx = isolate->ctx();
            const JSStringRef key = JSStringCreateWithUTF8CString(name);
            JSValueRef error = nullptr;
            const JSValueRef value = JSObjectGetProperty(ctx, object, key, &error);
            JSStringRelease(key);
            if (jsb_unlikely(error))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                return false;
            }
            *out_value = value;
            return true;
        }
    }

    Local<Array> Array::New(Isolate* isolate, int length)
    {
        JSValueRef error = nullptr;
        const JSObjectRef val = JSObjectMakeArray(isolate->ctx(), 0, nullptr, &error);
        jsb_check(val);
        return Local<Array>(Data(isolate, isolate->push_copy(val)));
    }

    uint32_t Array::Length() const
    {
        const JSObjectRef this_obj = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const JSValueRef rval = isolate_->_GetProperty(this_obj, jsb::impl::JS_ATOM_length);
        return rval ? JSValueToUInt32(isolate_->ctx(), rval, nullptr) : 0;
    }

    size_t Map::Size() const
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef map_obj = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);
        JSValueRef size_val = nullptr;
        if (!_get_property(isolate_, map_obj, "size", &size_val))
        {
            return 0;
        }

        JSValueRef error = nullptr;
        const double size = JSValueToNumber(ctx, size_val, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return 0;
        }
        return size < 0 ? 0 : (size_t) size;
    }

    Local<Array> Map::AsArray() const
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef map_obj = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);

        JSValueRef entries_val = nullptr;
        if (!_get_property(isolate_, map_obj, "entries", &entries_val) || !JSValueIsObject(ctx, entries_val))
        {
            return _new_empty_array(isolate_);
        }

        JSValueRef error = nullptr;
        const JSObjectRef entries_fn = jsb::impl::JavaScriptCore::AsObject(ctx, entries_val);
        const JSValueRef iterator_val = JSObjectCallAsFunction(ctx, entries_fn, map_obj, 0, nullptr, &error);
        if (jsb_unlikely(error) || !iterator_val || !JSValueIsObject(ctx, iterator_val))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return _new_empty_array(isolate_);
        }

        const JSObjectRef iterator = jsb::impl::JavaScriptCore::AsObject(ctx, iterator_val);
        JSValueRef next_val = nullptr;
        if (!_get_property(isolate_, iterator, "next", &next_val) || !JSValueIsObject(ctx, next_val))
        {
            return _new_empty_array(isolate_);
        }

        const JSObjectRef next_fn = jsb::impl::JavaScriptCore::AsObject(ctx, next_val);
        const JSObjectRef result = JSObjectMakeArray(ctx, 0, nullptr, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return Local<Array>();
        }

        uint32_t index = 0;
        while (true)
        {
            const JSValueRef next_result_val = JSObjectCallAsFunction(ctx, next_fn, iterator, 0, nullptr, &error);
            if (jsb_unlikely(error) || !next_result_val || !JSValueIsObject(ctx, next_result_val))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                break;
            }

            const JSObjectRef next_result = jsb::impl::JavaScriptCore::AsObject(ctx, next_result_val);
            JSValueRef done_val = nullptr;
            if (!_get_property(isolate_, next_result, "done", &done_val))
            {
                break;
            }
            if (JSValueToBoolean(ctx, done_val))
            {
                break;
            }

            JSValueRef entry_val = nullptr;
            if (!_get_property(isolate_, next_result, "value", &entry_val) || !JSValueIsObject(ctx, entry_val))
            {
                break;
            }

            const JSObjectRef entry = jsb::impl::JavaScriptCore::AsObject(ctx, entry_val);
            const JSValueRef key_val = JSObjectGetPropertyAtIndex(ctx, entry, 0, &error);
            if (jsb_unlikely(error))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                break;
            }

            const JSValueRef map_val = JSObjectGetPropertyAtIndex(ctx, entry, 1, &error);
            if (jsb_unlikely(error))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                break;
            }

            JSObjectSetPropertyAtIndex(ctx, result, index++, key_val, &error);
            if (jsb_unlikely(error))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                break;
            }

            JSObjectSetPropertyAtIndex(ctx, result, index++, map_val, &error);
            if (jsb_unlikely(error))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                break;
            }
        }

        return Local<Array>(Data(isolate_, isolate_->push_copy(result)));
    }

    MaybeLocal<Value> Map::Get(Local<Context> context, Local<Value> key)
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef map_obj = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);
        JSValueRef get_val = nullptr;
        if (!_get_property(isolate_, map_obj, "get", &get_val) || !JSValueIsObject(ctx, get_val))
        {
            return MaybeLocal<Value>();
        }

        JSValueRef error = nullptr;
        const JSObjectRef get_fn = jsb::impl::JavaScriptCore::AsObject(ctx, get_val);
        const JSValueRef args[] = { (JSValueRef) key };
        const JSValueRef result = JSObjectCallAsFunction(ctx, get_fn, map_obj, std::size(args), args, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return MaybeLocal<Value>();
        }

        return MaybeLocal<Value>(Data(isolate_, isolate_->push_copy(result)));
    }

    MaybeLocal<Map> Map::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef map_obj = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);
        JSValueRef set_val = nullptr;
        if (!_get_property(isolate_, map_obj, "set", &set_val) || !JSValueIsObject(ctx, set_val))
        {
            return MaybeLocal<Map>();
        }

        JSValueRef error = nullptr;
        const JSObjectRef set_fn = jsb::impl::JavaScriptCore::AsObject(ctx, set_val);
        const JSValueRef args[] = { (JSValueRef) key, (JSValueRef) value };
        JSObjectCallAsFunction(ctx, set_fn, map_obj, std::size(args), args, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return MaybeLocal<Map>();
        }
        return MaybeLocal<Map>(Data(isolate_, stack_pos_));
    }

    Local<Map> Map::New(Isolate* isolate)
    {
        return Local<Map>(Data(isolate, isolate->push_map()));
    }

    size_t Set::Size() const
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef set_obj = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);
        JSValueRef size_val = nullptr;
        if (!_get_property(isolate_, set_obj, "size", &size_val))
        {
            return 0;
        }

        JSValueRef error = nullptr;
        const double size = JSValueToNumber(ctx, size_val, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return 0;
        }
        return size < 0 ? 0 : (size_t) size;
    }

    Local<Array> Set::AsArray() const
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef set_obj = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);

        JSValueRef values_val = nullptr;
        if (!_get_property(isolate_, set_obj, "values", &values_val) || !JSValueIsObject(ctx, values_val))
        {
            return _new_empty_array(isolate_);
        }

        JSValueRef error = nullptr;
        const JSObjectRef values_fn = jsb::impl::JavaScriptCore::AsObject(ctx, values_val);
        const JSValueRef iterator_val = JSObjectCallAsFunction(ctx, values_fn, set_obj, 0, nullptr, &error);
        if (jsb_unlikely(error) || !iterator_val || !JSValueIsObject(ctx, iterator_val))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return _new_empty_array(isolate_);
        }

        const JSObjectRef iterator = jsb::impl::JavaScriptCore::AsObject(ctx, iterator_val);
        JSValueRef next_val = nullptr;
        if (!_get_property(isolate_, iterator, "next", &next_val) || !JSValueIsObject(ctx, next_val))
        {
            return _new_empty_array(isolate_);
        }

        const JSObjectRef next_fn = jsb::impl::JavaScriptCore::AsObject(ctx, next_val);
        const JSObjectRef result = JSObjectMakeArray(ctx, 0, nullptr, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return Local<Array>();
        }

        uint32_t index = 0;
        while (true)
        {
            const JSValueRef next_result_val = JSObjectCallAsFunction(ctx, next_fn, iterator, 0, nullptr, &error);
            if (jsb_unlikely(error) || !next_result_val || !JSValueIsObject(ctx, next_result_val))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                break;
            }

            const JSObjectRef next_result = jsb::impl::JavaScriptCore::AsObject(ctx, next_result_val);
            JSValueRef done_val = nullptr;
            if (!_get_property(isolate_, next_result, "done", &done_val))
            {
                break;
            }
            if (JSValueToBoolean(ctx, done_val))
            {
                break;
            }

            JSValueRef value_val = nullptr;
            if (!_get_property(isolate_, next_result, "value", &value_val))
            {
                break;
            }

            JSObjectSetPropertyAtIndex(ctx, result, index++, value_val, &error);
            if (jsb_unlikely(error))
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
                break;
            }
        }

        return Local<Array>(Data(isolate_, isolate_->push_copy(result)));
    }

    MaybeLocal<Set> Set::Add(Local<Context> context, Local<Value> key)
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef set_obj = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);
        JSValueRef add_val = nullptr;
        if (!_get_property(isolate_, set_obj, "add", &add_val) || !JSValueIsObject(ctx, add_val))
        {
            return MaybeLocal<Set>();
        }

        JSValueRef error = nullptr;
        const JSObjectRef add_fn = jsb::impl::JavaScriptCore::AsObject(ctx, add_val);
        const JSValueRef args[] = { (JSValueRef) key };
        JSObjectCallAsFunction(ctx, add_fn, set_obj, std::size(args), args, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return MaybeLocal<Set>();
        }

        return MaybeLocal<Set>(Data(isolate_, stack_pos_));
    }

    Local<Set> Set::New(Isolate* isolate)
    {
        return Local<Set>(Data(isolate, isolate->push_set()));
    }

}
