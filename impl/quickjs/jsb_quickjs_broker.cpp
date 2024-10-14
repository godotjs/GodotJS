#include "jsb_quickjs_broker.h"
#include "jsb_quickjs_isolate.h"

namespace jsb::impl
{
    void Broker::SetWeak(v8::Isolate* isolate, JSValue value, void* parameter, void* callback)
    {
        const jsb::impl::InternalDataID index = (jsb::impl::InternalDataID)(uintptr_t) JS_GetOpaque(value, v8::Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate->get_internal_data(index);
        jsb_checkf(!callback || !data->weak.callback, "overriding an existing value is not allowed");
        data->weak.parameter = (void*) parameter;
        data->weak.callback = (void*) callback;
    }

    JSValue Broker::stack_val(v8::Isolate* isolate, uint16_t index)
    {
        return isolate->stack_val(index);
    }

    JSValue Broker::stack_dup(v8::Isolate* isolate, uint16_t index)
    {
        return isolate->stack_dup(index);
    }

    uint16_t Broker::push_copy(v8::Isolate* isolate, JSValue value)
    {
        return isolate->push_copy(value);
    }

    void Broker::add_phantom(v8::Isolate* isolate, void* token)
    {
        return isolate->add_phantom(token);
    }

    void Broker::remove_phantom(v8::Isolate* isolate, void* token)
    {
        return isolate->remove_phantom(token);
    }

    bool Broker::is_phantom_alive(v8::Isolate* isolate, void* token)
    {
        return isolate->is_phantom_alive(token);
    }

    void Broker::_add_reference(v8::Isolate* isolate)
    {
        isolate->_add_reference();;
    }

    void Broker::_remove_reference(v8::Isolate* isolate)
    {
        isolate->_remove_reference();;
    }

    JSValue Broker::_dup(v8::Isolate* isolate, JSValueConst value)
    {
        return JS_DupValue(isolate->ctx(), value);
    }

    void Broker::_free(v8::Isolate* isolate, JSValueConst value)
    {
        JS_FreeValue(isolate->ctx(), value);
    }

}
