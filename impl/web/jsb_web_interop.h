#ifndef GODOTJS_WEB_INTEROP_H
#define GODOTJS_WEB_INTEROP_H

#include "jsb_web_stub_types.h"

#ifdef WEB_ENABLED
#include <emscripten/emscripten.h>
#endif

#ifdef __cplusplus
#define JSAPI_EXTERN extern "C"
#else
#define JSAPI_EXTERN
#endif

JSAPI_EXTERN void jsapi_init(void);
JSAPI_EXTERN int jsapi_create_engine(v8::Isolate* isolate);
JSAPI_EXTERN void jsapi_drop_engine(int engine_id);

JSAPI_EXTERN void jsapi_eval(int engine_id, const char* code);
JSAPI_EXTERN void* jsapi_get_global(int engine_id);

// stack calls

JSAPI_EXTERN int jsapi_stack_enter(int engine_id);
JSAPI_EXTERN void jsapi_stack_exit(int engine_id);

JSAPI_EXTERN int jsapi_stack_push_global(int engine_id);
JSAPI_EXTERN int jsapi_stack_push_undefined(int engine_id);
JSAPI_EXTERN int jsapi_stack_push_null(int engine_id);
JSAPI_EXTERN int jsapi_stack_push_symbol(int engine_id);
JSAPI_EXTERN int jsapi_stack_push_object(int engine_id);

JSAPI_EXTERN int jsapi_stack_push_pv(int engine_id, int pid);
JSAPI_EXTERN int jsapi_stack_push_boolean(int engine_id, bool value);
JSAPI_EXTERN int jsapi_stack_push_int(int engine_id, int32_t value);
JSAPI_EXTERN int jsapi_stack_push_number(int engine_id, double value);

// stack-based calls

JSAPI_EXTERN int64_t jsapi_sv_to_integer(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_int32(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_number(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_boolean(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_string(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_array(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_undefined(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_null(int engine_id, int depth, int index);
JSAPI_EXTERN bool jsapi_sv_is_object(int engine_id, int depth, int index);
JSAPI_EXTERN void jsapi_sv_internal_set(int engine_id, int depth, int index, int slot, void* value);
JSAPI_EXTERN void* jsapi_sv_internal_get(int engine_id, int depth, int index, int slot);
JSAPI_EXTERN int jsapi_sv_internal_num(int engine_id, int depth, int index);

JSAPI_EXTERN bool jsapi_stack_equals(int engine_id, int from_depth, int from_index, int to_depth, int to_index);
JSAPI_EXTERN void jsapi_sv_copy(int engine_id, int from_depth, int from_index, int to_depth, int to_index);

// persistent-based value calls

JSAPI_EXTERN int jsapi_pv_add(int engine_id, int depth, int index);
JSAPI_EXTERN void jsapi_pv_remove(int engine_id, int pid);
JSAPI_EXTERN void jsapi_pv_set_weak(int engine_id, int pid, void* cb, void* parameter);
JSAPI_EXTERN void jsapi_pv_clear_weak(int engine_id, int pid);

// exception calls

JSAPI_EXTERN bool jsapi_exception_check(int engine_id);
JSAPI_EXTERN void jsapi_exception_clear(int engine_id);

#endif
