#include "jsb_web_broker.h"
#include "jsb_web_isolate.h"

namespace jsb::impl
{
    void Broker::SetWeakCallback(v8::Isolate* isolate, HandleID value, void* parameter, void* callback)
    {
        const v8::HandleScope handle_scope(isolate);
        const jsb::impl::StackPosition sp = jsbi_handle_PushStack(isolate->rt(), value);
        const jsb::impl::InternalDataID index = (jsb::impl::InternalDataID)(uintptr_t) jsbi_GetOpaque(isolate->rt(), sp);
        const jsb::impl::InternalDataPtr data = isolate->get_internal_data(index);
        JSB_WEB_LOG(VeryVerbose, "update internal data JSObject:%d id:%d pc:%d,%d (last:%d,%d)", sp, index, (uintptr_t) parameter, (uintptr_t) callback, (uintptr_t) data->weak.parameter, (uintptr_t) data->weak.callback);
        jsb_checkf(!callback || !data->weak.callback, "overriding an existing value is not allowed");
        data->weak.parameter = (void*) parameter;
        data->weak.callback = (void*) callback;
    }

    JSRuntime Broker::get_engine(v8::Isolate* isolate)
    {
        return isolate->rt();
    }
} // namespace jsb::impl
