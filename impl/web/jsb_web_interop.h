#ifndef GODOTJS_WEB_INTEROP_H
#define GODOTJS_WEB_INTEROP_H

#include <cstdint>

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
    // [reserved] unique id for jsbb_Engine
    typedef int JSRuntime;

    // cached string index in jsbb_Engine
    typedef int JSAtom;

    // 0 means OK
    typedef int ResultValue;

    // error caught if StackBase::Error
    typedef int StackPosition;

    // id of a saved value in GlobalHandle registry,
    // negative id is invalid.
    typedef int GlobalID;

    typedef void* FunctionPointer;
}

// global init
JSAPI_EXTERN void jsbi_init(void);

// engine
JSAPI_EXTERN jsb::impl::JSRuntime jsbi_NewEngine(void* opaque);
JSAPI_EXTERN void jsbi_FreeEngine(jsb::impl::JSRuntime engine_id);

JSAPI_EXTERN jsb::impl::StackPosition jsbi_CompileFunctionSource(jsb::impl::JSRuntime engine_id, const char* id, const char* source);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_Eval(jsb::impl::JSRuntime engine_id, const char* id, const char* source);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_Call(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition this_sp, jsb::impl::StackPosition func_sp, int argc, jsb::impl::StackPosition* argv);

JSAPI_EXTERN void jsbi_SetHostPromiseRejectionTracker(jsb::impl::JSRuntime engine_id, jsb::impl::FunctionPointer cb, void* data);

JSAPI_EXTERN void  jsbi_StackEnter(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN void  jsbi_StackExit(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN void* jsbi_GetOpaque(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_GetGlobalObject(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_StackDup(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

JSAPI_EXTERN jsb::impl::JSAtom jsbi_NewAtom(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition key_sp);
JSAPI_EXTERN jsb::impl::JSAtom jsbi_DupAtom(jsb::impl::JSRuntime engine_id, jsb::impl::JSAtom atom_id);
JSAPI_EXTERN void jsbi_FreeAtom(jsb::impl::JSRuntime engine_id, jsb::impl::JSAtom atom_id);

JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewCFunction(jsb::impl::JSRuntime engine_id, jsb::impl::FunctionPointer cb, jsb::impl::StackPosition data_sp);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewSymbol(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewMap(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewArray(jsb::impl::JSRuntime engine_id);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewExternal(jsb::impl::JSRuntime engine_id, void* data);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewInt32(jsb::impl::JSRuntime engine_id, int32_t val);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewUint32(jsb::impl::JSRuntime engine_id, uint32_t val);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewNumber(jsb::impl::JSRuntime engine_id, double val);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewBigInt64(jsb::impl::JSRuntime engine_id, int64_t* val_ptr);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewClass(jsb::impl::JSRuntime engine_id);

JSAPI_EXTERN void jsbi_SetConstructor(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition func, jsb::impl::StackPosition proto);
JSAPI_EXTERN void jsbi_SetPrototype(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition proto, jsb::impl::StackPosition parent);
JSAPI_EXTERN jsb::impl::ResultValue jsbi_SetProperty(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj, jsb::impl::StackPosition key, jsb::impl::StackPosition value);
JSAPI_EXTERN jsb::impl::ResultValue jsbi_SetPropertyUint32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj, uint32_t index, jsb::impl::StackPosition value);

// return 0 if stackval is not ArrayBuffer
JSAPI_EXTERN int   jsbi_GetByteLength(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN void  jsbi_ReadArrayBufferData(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos, int size, void* data_dst);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_NewArrayBuffer(jsb::impl::JSRuntime engine_id, const uint8_t* data, int size);
// return nullptr if stackval is not External
JSAPI_EXTERN void* jsbi_GetExternal(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
// return 0 if stackval is not Array
JSAPI_EXTERN int   jsbi_GetArrayLength(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
// return 0 if stackval is not String
JSAPI_EXTERN int   jsbi_GetStringLength(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN char* jsbi_ToCStringLen(jsb::impl::JSRuntime engine_id, int32_t* o_size, jsb::impl::StackPosition str_sp);
JSAPI_EXTERN jsb::impl::StackPosition jsbi_ToString(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN double jsbi_NumberValue(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool   jsbi_BooleanValue(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN int32_t  jsbi_Int32Value(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN uint32_t jsbi_Uint32Value(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_Int64Value(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos, int64_t* o_value);

JSAPI_EXTERN int   jsbi_hash(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSAPI_EXTERN bool  jsbi_stack_eq(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos1, jsb::impl::StackPosition stack_pos2);

JSAPI_EXTERN bool  jsbi_handle_is_valid(jsb::impl::JSRuntime engine_id, jsb::impl::GlobalID handle);
JSAPI_EXTERN bool  jsbi_handle_eq(jsb::impl::JSRuntime engine_id, jsb::impl::GlobalID handle1, jsb::impl::StackPosition handle2);

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
