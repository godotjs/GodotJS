#include "jsb_web_interop.h"
#include "jsb_web_isolate.h"

#ifdef EMSCRIPTEN_KEEPALIVE

JSAPI_EXTERN EMSCRIPTEN_KEEPALIVE void jsapi_invoke_gc_callback(JSAPI_GC_CALLBACK cb, void* ptr)
{
    cb(ptr);
}

JSAPI_EXTERN EMSCRIPTEN_KEEPALIVE void jsapi_call(v8::Isolate* isolate, JSAPI_FUNC_CALLBACK cb, int stack, int argc)
{
    v8::HandleScope handle_scope(isolate, stack);
    v8::FunctionCallbackInfo<v8::Value> info(isolate, stack, argc);

    cb(info);
}

JSAPI_EXTERN EMSCRIPTEN_KEEPALIVE void jsapi_construct(v8::Isolate* isolate, JSAPI_FUNC_CALLBACK cb, int stack, int argc)
{
    v8::HandleScope handle_scope(isolate, stack);
    v8::FunctionCallbackInfo<v8::Value> info(isolate, stack, argc);

    cb(info);
}

#endif
