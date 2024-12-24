#include "jsb_web_interop.h"
#include "jsb_web_isolate.h"
#include "jsb_web_function_interop.h"

#ifdef EMSCRIPTEN_KEEPALIVE

#ifdef __cplusplus
#define JSNATIVE_API extern "C"
#else
#define JSNATIVE_API
#endif

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void jsni_unhandled_rejection(v8::Isolate* isolate, v8::PromiseRejectCallback cb, jsb::impl::StackPosition promise_sp, jsb::impl::StackPosition reason_sp)
{
    v8::HandleScope handle_scope(isolate);
    const v8::PromiseRejectMessage message(isolate,
        v8::kPromiseRejectWithNoHandler,
        promise_sp,
        reason_sp
    );
    cb(message);
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void jsni_gc_callback(v8::Isolate* isolate, void* ptr)
{
    const jsb::impl::InternalDataID index = (jsb::impl::InternalDataID)(uintptr_t) ptr;
    {
        jsb::impl::InternalData* data;
        if (isolate->internal_data_.try_get_value_pointer(index, data))
        {
            if (const v8::WeakCallbackInfo<void>::Callback callback = (v8::WeakCallbackInfo<void>::Callback) data->weak.callback)
            {
                const v8::WeakCallbackInfo<void> info(isolate, data->weak.parameter, data->internal_fields);
                callback(info);
            }
            JSB_WEB_LOG(VeryVerbose, "remove internal data id:%s", index);
            isolate->internal_data_.remove_at(index);
        }
    }
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void jsni_call_function(v8::Isolate* isolate, v8::FunctionCallback cb, bool is_construct_call, jsb::impl::StackPosition stack_base, int argc)
{
    v8::FunctionCallbackInfo<v8::Value> callback_info(isolate, is_construct_call, stack_base, argc);
    cb(callback_info);
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void jsni_call_accessor(v8::Isolate* isolate, v8::AccessorNameGetterCallback cb, jsb::impl::StackPosition key_sp, jsb::impl::StackPosition rval_sp)
{
    const v8::Local<v8::Name> key = v8::Local<v8::Name>(Data(isolate, key_sp));
    v8::PropertyCallbackInfo<v8::Value> callback_info(isolate, rval_sp);
    cb(callback_info);
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void* jsni_generate_internal_data(v8::Isolate* isolate, int internal_field_count)
{
    const jsb::impl::InternalDataID index = isolate->add_internal_data(internal_field_count);
    return (void*)(uintptr_t) index;
}

#endif
