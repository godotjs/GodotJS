#ifndef GODOTJS_WEB_INTEROP_H
#define GODOTJS_WEB_INTEROP_H

#ifdef WEB_ENABLED
#include <emscripten/emscripten.h>
#endif

#ifdef __cplusplus
#define JSAPI_EXTERN extern "C"
#else
#define JSAPI_EXTERN
#endif

// global init
JSAPI_EXTERN void jsbi_init(void);

// engine 
JSAPI_EXTERN int   jsbi_NewEngine(void* opaque);
JSAPI_EXTERN int   jsbi_FreeEngine(int engine_id);
JSAPI_EXTERN int   jsbi_SetHostPromiseRejectionTracker(int engine_id, void* cb, void* data);
JSAPI_EXTERN void* jsbi_GetOpaque(int engine_id, int stack_pos);
JSAPI_EXTERN void  jsbi_SetOpaque(int engine_id, int stack_pos, void* data);

JSAPI_EXTERN void  jsbi_StackEnter(int engine_id);
JSAPI_EXTERN void  jsbi_StackExit(int engine_id);
JSAPI_EXTERN int   jsbi_StackDup(int engine_id, int stack_pos);

JSAPI_EXTERN int   jsbi_NewCFunction(int engine_id, void* cb, int data);

#endif
