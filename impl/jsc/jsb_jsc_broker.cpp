#include "jsb_jsc_broker.h"
#include "jsb_jsc_isolate.h"

namespace jsb::impl
{
    void Broker::SetWeak(v8::Isolate* isolate, JSObjectRef value, void* parameter, void* callback)
    {
        jsb_check(value);
        jsb::impl::InternalData* data = (jsb::impl::InternalData*) JSObjectGetPrivate(value);
        jsb_check(data);
        JSB_JSC_LOG(VeryVerbose, "update internal data JSObject:%s id:%s pc:%s,%s (last:%s,%s)",
            (uintptr_t) value, (uintptr_t) data,
            (uintptr_t) parameter, (uintptr_t) callback,
            (uintptr_t) data->weak.parameter, (uintptr_t) data->weak.callback);
        jsb_checkf(!callback || !data->weak.callback, "overriding an existing value is not allowed");
        data->weak.parameter = (void*) parameter;
        data->weak.callback = (void*) callback;
    }

    JSValueRef Broker::stack_val(v8::Isolate* isolate, uint16_t index)
    {
        return isolate->stack_val(index);
    }

    JSValueRef Broker::stack_dup(v8::Isolate* isolate, uint16_t index)
    {
        return isolate->stack_dup(index);
    }

    uint16_t Broker::push_copy(v8::Isolate* isolate, JSValueRef value)
    {
        return isolate->push_copy(value);
    }

    void Broker::_add_reference(v8::Isolate* isolate)
    {
        isolate->_add_reference();;
    }

    void Broker::_remove_reference(v8::Isolate* isolate)
    {
        isolate->_remove_reference();;
    }

    bool Broker::IsStrictEqual(v8::Isolate* isolate, JSValueRef a, JSValueRef b)
    {
        return JSValueIsStrictEqual(isolate->ctx(), a, b);
    }

    JSContextRef Broker::ctx(v8::Isolate* isolate)
    {
        return isolate->ctx();
    }

    JSContextGroupRef Broker::rt(v8::Isolate* isolate)
    {
        return isolate->rt();
    }

}
