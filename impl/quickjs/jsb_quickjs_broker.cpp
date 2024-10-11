#include "jsb_quickjs_broker.h"
#include "jsb_quickjs_isolate.h"

namespace jsb::impl
{
    JSContext* Broker::GetContext(v8::Isolate* isolate)
    {
        return isolate->ctx();
    }

    JSRuntime* Broker::GetRuntime(v8::Isolate* isolate)
    {
        return isolate->rt();
    }

    void Broker::SetWeak(v8::Isolate* isolate, JSValue value, void* parameter, void* callback)
    {
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(value, v8::Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate->get_internal_data(index);
        jsb_check(!data->weak.callback);
        data->weak.parameter = (void*) parameter;
        data->weak.callback = (void*) callback;
    }

    uint16_t Broker::push_copy(v8::Isolate* isolate, JSValue value)
    {
        return isolate->push_copy(value);
    }

    bool Broker::is_valid_internal_data(v8::Isolate* isolate, jsb::internal::Index64 value)
    {
        return isolate->internal_data_.is_valid_index(value);
    }

}
