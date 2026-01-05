#include "jsb_jsc_container.h"

#include "jsb_jsc_typedef.h"
#include "jsb_jsc_isolate.h"

namespace v8
{
    Local<Array> Array::New(Isolate* isolate, int length)
    {
        JSValueRef error = nullptr;
        const JSObjectRef val = JSObjectMakeArray(isolate->ctx(), 0, nullptr, &error);
        jsb_check(val);
        return Local<Array>(Data(isolate, isolate->push_copy(val)));
    }

    uint32_t Array::Length() const
    {
        const JSObjectRef this_obj = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) * this);
        const JSValueRef rval = isolate_->_GetProperty(this_obj, jsb::impl::JS_ATOM_length);
        return rval ? JSValueToUInt32(isolate_->ctx(), rval, nullptr) : 0;
    }

    MaybeLocal<Map> Map::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        const JSObjectRef this_obj = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) * this);
        JSValueRef error = nullptr;
        JSObjectSetPropertyForKey(isolate_->ctx(), this_obj, (JSValueRef) key, (JSValueRef) value, kJSPropertyAttributeNone, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(isolate_->ctx(), error);
            return MaybeLocal<Map>();
        }
        return MaybeLocal<Map>(Data(isolate_, stack_pos_));
    }

    Local<Map> Map::New(Isolate* isolate)
    {
        return Local<Array>(Data(isolate, isolate->push_map()));
    }

} // namespace v8
