#ifndef GODOTJS_WEB_INTEROP_H
#define GODOTJS_WEB_INTEROP_H

#include <emscripten/emscripten.h>

#ifdef __cplusplus
#define JSB_WEB_EXTERN extern "C"
#else
#define JSB_WEB_EXTERN
#endif

#define JSB_WEB_TYPE(HandleTypeName) int

typedef void(*JSB_WEB_GC_CALLBACK)(void*);

JSB_WEB_EXTERN void jsb_web_init(void);
JSB_WEB_EXTERN JSB_WEB_TYPE(EngineHandle) jsb_web_create_engine(void);
JSB_WEB_EXTERN void jsb_web_drop_engine(JSB_WEB_TYPE(EngineHandle) id);

JSB_WEB_EXTERN void jsb_web_eval(JSB_WEB_TYPE(EngineHandle) id, const char* code);
JSB_WEB_EXTERN void jsb_web_set_finalizer(JSB_WEB_TYPE(EngineHandle) id, JSB_WEB_GC_CALLBACK cb);

JSB_WEB_EXTERN JSB_WEB_TYPE(ObjectHandle) jsb_web_new_binding_object(JSB_WEB_TYPE(EngineHandle) id, void *ptr);
JSB_WEB_EXTERN void* jsb_web_get_binding_object(JSB_WEB_TYPE(EngineHandle) id, JSB_WEB_TYPE(ObjectHandle) object_id);

#endif
