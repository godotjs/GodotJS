#include "jsb_web_interop.h"
#include "jsb_web_isolate.h"

#ifdef EMSCRIPTEN_KEEPALIVE

JSAPI_EXTERN EMSCRIPTEN_KEEPALIVE void jsni_gc_callback(void* opaque, JSAPI_GC_CALLBACK cb, void* ptr)
{
    v8::Isolate *isolate = (v8::Isolate *) opaque;

    const jsb::impl::InternalDataID index = (jsb::impl::InternalDataID)(uintptr_t) JS_GetOpaque(val, get_class_id());
    {
        jsb::impl::InternalData* data;
        if (isolate->internal_data_.try_get_value_pointer(index, data))
        {
            if (const WeakCallbackInfo<void>::Callback callback = (WeakCallbackInfo<void>::Callback) data->weak.callback)
            {
                const WeakCallbackInfo<void> info(isolate, data->weak.parameter, data->internal_fields);
                callback(info);
            }
            JSB_WEB_LOG(VeryVerbose, "remove internal data JSObject:%s id:%s", (uintptr_t) JS_VALUE_GET_PTR(val), index);
            isolate->internal_data_.remove_at(index);
        }
    }
}

JSAPI_EXTERN EMSCRIPTEN_KEEPALIVE void jsni_ccal(void* opaque, JSAPI_FUNC_CALLBACK cb, int stack, int argc)
{
    //TODO
}

#endif
