#include "jsb_web_global_init.h"
#include "../../internal/jsb_logger.h"
#include "../../internal/jsb_variant_util.h"
#include "../../bridge/jsb_worker.h"
#include "../../bridge/jsb_environment.h"
#include "../../bridge/jsb_type_convert.h"

#include <cstdint>

#ifdef WEB_ENABLED
#include <emscripten/emscripten.h>
#endif

#include "jsb_web_isolate.h"
#include "jsb_web_function_interop.h"
#include "core/core_bind.h"

#ifdef __EMSCRIPTEN__

#define JSNATIVE_API extern "C"

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
        if (!isolate->internal_data_.try_get_value_pointer(index, data))
        {
            return;
        }

        // Callback execution can mutate/reallocate internal_data_.
        // Copy callback payload out of slot storage before invoking callback.
        const v8::WeakCallbackInfo<void>::Callback callback = (v8::WeakCallbackInfo<void>::Callback) data->weak.callback;
        void* callback_parameter = data->weak.parameter;
        void* internal_fields_copy[2] = {
            data->internal_fields[0],
            data->internal_fields[1],
        };

        if (callback)
        {
            const v8::WeakCallbackInfo<void> info(isolate, callback_parameter, internal_fields_copy);
            callback(info);
        }

        jsb::impl::InternalData* post_callback_data;
        if (isolate->internal_data_.try_get_value_pointer(index, post_callback_data))
        {
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
    const v8::Local<v8::Name> key = v8::Local<v8::Name>(v8::Data(isolate, key_sp));
    v8::PropertyCallbackInfo<v8::Value> callback_info(isolate, rval_sp);
    cb(key, callback_info);
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void* jsni_generate_internal_data(v8::Isolate* isolate, int internal_field_count)
{
    const jsb::impl::InternalDataID index = isolate->add_internal_data(internal_field_count);
    return (void*)(uintptr_t) *index;
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void jsni_on_worker_message(jsb::impl::StackPosition data_sp, uint32_t transfer_id)
{
    jsb::Worker::on_web_message(data_sp, transfer_id);
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE void jsni_on_worker_message_from_pthread(uintptr_t sender_pthread_id, jsb::impl::StackPosition data_sp, uint32_t transfer_id)
{
    jsb::Worker::on_web_message_from_pthread(sender_pthread_id, data_sp, transfer_id);
}

JSNATIVE_API EMSCRIPTEN_KEEPALIVE int32_t jsni_worker_get_or_add_native_transfer(uintptr_t pthread_id, uintptr_t engine_token, uint32_t transfer_id, jsb::impl::StackPosition value_sp)
{
    if (!engine_token)
    {
        return static_cast<int32_t>(jsb::Worker::WebNativeTransferError::EnvMissing);
    }

    const std::shared_ptr<jsb::Environment> env = jsb::Environment::_access(reinterpret_cast<void*>(engine_token));

    if (!env)
    {
        return static_cast<int32_t>(jsb::Worker::WebNativeTransferError::EnvMissing);
    }

    v8::Isolate* isolate = env->get_isolate();

    if (!isolate)
    {
        return static_cast<int32_t>(jsb::Worker::WebNativeTransferError::IsolateMissing);
    }

    v8::HandleScope handle_scope(isolate);
    const v8::Local<v8::Context> context = isolate->GetCurrentContext();
    const v8::Local<v8::Value> value = v8::Local<v8::Value>(v8::Data(isolate, value_sp));

    if (!value->IsObject())
    {
        return static_cast<int32_t>(jsb::Worker::WebNativeTransferError::NonObjectValue);
    }

    Variant variant;
    if (!jsb::TypeConvert::js_to_gd_var(isolate, context, value.As<v8::Object>(), variant))
    {
        JSB_WEB_LOG(Error, "worker native transfer conversion failed for value: %s", jsb::impl::Helper::to_string(isolate, value));
        return static_cast<int32_t>(jsb::Worker::WebNativeTransferError::VariantConversionFailed);
    }

    uint32_t transfer_index = 0;
    jsb::Worker::WebNativeTransferError error = jsb::Worker::WebNativeTransferError::None;
    if (!jsb::Worker::web_get_or_add_transfer(pthread_id, transfer_id, variant, transfer_index, error))
    {
        const jsb::Worker::WebNativeTransferError stable_error =
            error == jsb::Worker::WebNativeTransferError::None
                ? jsb::Worker::WebNativeTransferError::TransferAppendFailed
                : error;
        return static_cast<int32_t>(stable_error);
    }

    return static_cast<int32_t>(transfer_index);
}

// NOTE: jsni_bind_object, jsni_get_binding_type, jsni_clone_variant, jsni_restore_variant
// were removed with the old JS-side walker. Web worker transfer handling now uses
// JS-side extraction (`extract_message_variants`) plus native transfer queues.

static void _custom_print_verbose(const String& p_str)
{
    const CharString str8 = p_str.utf8();
    jsbi_log(str8.get_data());
}

static void _custom_print_line(const String& p_str)
{
    const CharString str8 = p_str.utf8();
    jsbi_log(str8.get_data());
}

static void _custom_print_error(const char *p_function, const char *p_file, int p_line, const String &p_error, bool p_editor_notify, bool p_is_warning)
{
    const String str = jsb::internal::format("[%s] %s [at %s %s:%d]",
        p_is_warning ? "WARN" : "ERROR", p_error, p_function,
        p_file, p_line);
    const CharString str8 = str.utf8();
    jsbi_error(str8.get_data());
}

#define JSNI_FUNC(name) (jsb::impl::FunctionPointer) jsni_##name

namespace jsb::impl
{
    static bool s_logger_initialized = false;
    static thread_local bool tls_js_bridge_initialized = false;

    GlobalInitialize::GlobalInitialize()
    {
        if (!s_logger_initialized)
        {
            s_logger_initialized = true;
            internal::Logger::set_callbacks(_custom_print_verbose, _custom_print_line, _custom_print_error);
        }
    }

    void GlobalInitialize::init()
    {
        static GlobalInitialize global_initialize;
        jsb_unused(global_initialize);

        if (!tls_js_bridge_initialized)
        {
            tls_js_bridge_initialized = true;
            JSB_WEB_LOG(Verbose, "initializing JS bridge for thread");
            jsbi_init(
                JSNI_FUNC(gc_callback),
                JSNI_FUNC(unhandled_rejection),
                JSNI_FUNC(call_function),
                JSNI_FUNC(call_accessor),
                JSNI_FUNC(generate_internal_data),
                JSNI_FUNC(on_worker_message),
                JSNI_FUNC(on_worker_message_from_pthread),
                JSNI_FUNC(worker_get_or_add_native_transfer),
                CoreBind::OS::get_singleton()->is_debug_build(),
                internal::Settings::is_bridge_logging_enabled());
        }
    }

}

#else

namespace jsb::impl
{
    void GlobalInitialize::init() {}
}

#endif
