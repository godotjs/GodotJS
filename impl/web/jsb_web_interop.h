#ifndef GODOTJS_WEB_INTEROP_H
#define GODOTJS_WEB_INTEROP_H

#include "../../jsb.gen.h"

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
JSB_WEB_EXTERN void* jsb_web_get_global(JSB_WEB_TYPE(EngineHandle) id);

JSB_WEB_EXTERN JSB_WEB_TYPE(ObjectHandle) jsb_web_new_binding_object(JSB_WEB_TYPE(EngineHandle) id, void *ptr);
JSB_WEB_EXTERN void* jsb_web_get_binding_object(JSB_WEB_TYPE(EngineHandle) id, JSB_WEB_TYPE(ObjectHandle) object_id);

JSB_WEB_EXTERN void* jsb_web_new_symbol(JSB_WEB_TYPE(EngineHandle) id);
JSB_WEB_EXTERN void* jsb_web_new_object(JSB_WEB_TYPE(EngineHandle) id);

JSB_WEB_EXTERN void jsb_web_value_add_ref(JSB_WEB_TYPE(EngineHandle) id, void* ptr);
JSB_WEB_EXTERN void jsb_web_value_remove_ref(JSB_WEB_TYPE(EngineHandle) id, void* ptr);

JSB_WEB_EXTERN void* jsb_web_value_set_weak(JSB_WEB_TYPE(EngineHandle) id, void* ptr, JSB_WEB_GC_CALLBACK cb, void* parameter);
JSB_WEB_EXTERN void jsb_web_value_clear_weak(JSB_WEB_TYPE(EngineHandle) id, void* ptr);

JSB_WEB_EXTERN void jsb_web_value_set_internal_field(JSB_WEB_TYPE(EngineHandle) id, void* ptr, int index, void* data);

#endif
