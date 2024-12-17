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

namespace jsb::impl
{
    typedef int JSRuntime;
    typedef int JSAtom;

    typedef int StackPosition;
    typedef void* FunctionPointer;
}

// global init
JSAPI_EXTERN void jsbi_init(void);

// engine
JSAPI_EXTERN jsb::impl::JSRuntime jsbi_NewEngine(void* opaque);
JSAPI_EXTERN void jsbi_FreeEngine(jsb::impl::JSRuntime engine_id);

JSAPI_EXTERN void jsbi_SetHostPromiseRejectionTracker(jsb::impl::JSRuntime engine_id, jsb::impl::FunctionPointer cb, void* data);

JSAPI_EXTERN void  jsbi_StackEnter(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN void  jsbi_StackExit(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN void* jsbi_GetOpaque(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_GetGlobalObject(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_StackDup(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewCFunction(jsb::impl::JSRuntime engine_id, jsb::impl::FunctionPointer cb, void* data);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewSymbol(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewMap(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewArray(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewExternal(jsb::impl::JSRuntime engine_id, void* data);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewClass(jsb::impl::JSRuntime engine_id);

JSAPI_EXTERN void jsbi_SetConstructor(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition func, jsb::impl::StackPosition proto);
JSAPI_EXTERN void jsbi_SetPrototype(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition proto, jsb::impl::StackPosition parent);
JSAPI_EXTERN void jsbi_SetProperty(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj, jsb::impl::StackPosition key, jsb::impl::StackPosition value);

JSAPI_EXTERN void* jsbi_GetExternal(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN int   jsbi_GetLength(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

JSAPI_EXTERN int   jsbi_hash(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_strict_eq(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos1, jsb::impl::StackPosition stack_pos2);

JSAPI_EXTERN bool  jsbi_IsNullOrUndefined(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsUndefined(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsExternal(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsObject(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsSymbol(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsString(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsFunction(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsBoolean(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsNumber(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsBigInt(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

JSAPI_EXTERN bool  jsbi_IsInt32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsUint32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

JSAPI_EXTERN bool  jsbi_IsPromise(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsArray(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsMap(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_IsArrayBuffer(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

#endif
