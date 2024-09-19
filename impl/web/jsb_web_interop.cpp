#include "jsb_web_interop.h"

#ifdef EMSCRIPTEN_KEEPALIVE

JSB_WEB_EXTERN EMSCRIPTEN_KEEPALIVE void jsb_web_invoke_gc_callback(JSB_WEB_GC_CALLBACK cb, void* ptr) {
    cb(ptr);
}

#endif
