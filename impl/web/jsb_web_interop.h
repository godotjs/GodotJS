#ifndef GODOTJS_WEB_INTEROP_H
#define GODOTJS_WEB_INTEROP_H

#include <cstdint>

#ifdef WEB_ENABLED
#include <emscripten/emscripten.h>
#endif

#ifdef __cplusplus
#define JSBROWSER_API extern "C"
#else
#define JSBROWSER_API
#endif

// type placeholder
namespace jsb::impl
{
    // [reserved] unique id for jsbb_Engine
    typedef int JSRuntime;

    // 0 means OK
    typedef int ResultValue;

    // error caught if StackBase::Error
    typedef int StackPosition;

    // id of a saved value in GlobalHandle registry,
    // negative id is invalid.
    typedef int HandleID;

    typedef void* FunctionPointer;


    namespace PropertyFlags
    {
        enum
        {
            CONFIGURABLE = 1 << 0,
            WRITABLE = 1 << 1,
            ENUMERABLE = 1 << 2,
            GET = 1 << 3,
            SET = 1 << 4,
            VALUE = 1 << 5,
        };
    }
}

// global init
JSBROWSER_API void jsbi_init(
    jsb::impl::FunctionPointer gc_callback,
    jsb::impl::FunctionPointer unhandled_rejection,
    jsb::impl::FunctionPointer call_function,
    jsb::impl::FunctionPointer call_accessor,
    jsb::impl::FunctionPointer generate_internal_data);

// engine
JSBROWSER_API jsb::impl::JSRuntime jsbi_NewEngine(void* opaque);
JSBROWSER_API void jsbi_FreeEngine(jsb::impl::JSRuntime engine_id);
JSBROWSER_API void jsbi_log(const char* ptr);
JSBROWSER_API void jsbi_error(const char* ptr);
JSBROWSER_API void jsbi_free(void* ptr);
JSBROWSER_API void jsbi_debugbreak();
JSBROWSER_API void jsbi_GetStatistics(jsb::impl::JSRuntime engine_id, void* ptr);

JSBROWSER_API jsb::impl::StackPosition jsbi_CompileFunctionSource(jsb::impl::JSRuntime engine_id, const char* id, const char* source);
JSBROWSER_API jsb::impl::StackPosition jsbi_Eval(jsb::impl::JSRuntime engine_id, const char* id, const char* source);
JSBROWSER_API jsb::impl::StackPosition jsbi_Call(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition this_sp, jsb::impl::StackPosition func_sp, int argc, jsb::impl::StackPosition* argv);
JSBROWSER_API jsb::impl::StackPosition jsbi_CallAsConstructor(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition func_sp, int argc, jsb::impl::StackPosition* argv);
JSBROWSER_API jsb::impl::StackPosition jsbi_ParseJSON(jsb::impl::JSRuntime engine_id, const char* data, int len);
JSBROWSER_API void jsbi_ThrowError(jsb::impl::JSRuntime engine_id, const char* message);
JSBROWSER_API bool jsbi_HasError(jsb::impl::JSRuntime engine_id);

JSBROWSER_API void jsbi_SetHostPromiseRejectionTracker(jsb::impl::JSRuntime engine_id, jsb::impl::FunctionPointer cb);

JSBROWSER_API void  jsbi_StackEnter(jsb::impl::JSRuntime engine_id);
JSBROWSER_API void  jsbi_StackExit(jsb::impl::JSRuntime engine_id);
JSBROWSER_API void* jsbi_GetOpaque(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API jsb::impl::StackPosition jsbi_GetGlobalObject(jsb::impl::JSRuntime engine_id);
JSBROWSER_API jsb::impl::StackPosition jsbi_StackDup(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API void jsbi_StackSet(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition to_sp, jsb::impl::StackPosition from_sp);
JSBROWSER_API void jsbi_StackSetInt32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition to_sp, int32_t value);

JSBROWSER_API jsb::impl::StackPosition jsbi_NewCFunction(jsb::impl::JSRuntime engine_id, jsb::impl::FunctionPointer cb, jsb::impl::StackPosition data_sp, const char *func_name_ptr);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewNoopFunction(jsb::impl::JSRuntime engine_id);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewSymbol(jsb::impl::JSRuntime engine_id);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewMap(jsb::impl::JSRuntime engine_id);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewArray(jsb::impl::JSRuntime engine_id);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewExternal(jsb::impl::JSRuntime engine_id, void* data);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewInt32(jsb::impl::JSRuntime engine_id, int32_t val);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewUint32(jsb::impl::JSRuntime engine_id, uint32_t val);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewNumber(jsb::impl::JSRuntime engine_id, double val);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewBigInt64(jsb::impl::JSRuntime engine_id, int64_t* val_ptr);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewObject(jsb::impl::JSRuntime engine_id);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewClass(jsb::impl::JSRuntime engine_id, jsb::impl::FunctionPointer cb_ptr, jsb::impl::StackPosition data_sp, int field_count, const char* class_name_ptr);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewInstance(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition proto_sp);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewString(jsb::impl::JSRuntime engine_id, const char* str, int len);

JSBROWSER_API jsb::impl::ResultValue jsbi_SetConstructor(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition func_sp, jsb::impl::StackPosition proto_sp);
JSBROWSER_API jsb::impl::ResultValue jsbi_SetPrototype(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition proto_sp, jsb::impl::StackPosition parent_sp);
JSBROWSER_API jsb::impl::ResultValue jsbi_SetProperty(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj, jsb::impl::StackPosition key, jsb::impl::StackPosition value);
JSBROWSER_API jsb::impl::ResultValue jsbi_DefineProperty(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, jsb::impl::StackPosition key_sp, jsb::impl::StackPosition value_sp, jsb::impl::StackPosition get_sp, jsb::impl::StackPosition set_sp, /*jsb::impl::PropertyFlags*/ int flags);
JSBROWSER_API jsb::impl::ResultValue jsbi_DefineLazyProperty(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, jsb::impl::StackPosition key_sp, jsb::impl::FunctionPointer cb);
JSBROWSER_API jsb::impl::ResultValue jsbi_SetPropertyUint32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj, uint32_t index, jsb::impl::StackPosition value);
JSBROWSER_API jsb::impl::StackPosition jsbi_GetPropertyAtomID(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, int atom_id);
JSBROWSER_API jsb::impl::StackPosition jsbi_GetProperty(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, jsb::impl::StackPosition key_sp);
JSBROWSER_API jsb::impl::StackPosition jsbi_GetPropertyUint32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, uint32_t index);
JSBROWSER_API jsb::impl::StackPosition jsbi_GetOwnPropertyNames(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, int filter, int key_conversion);
JSBROWSER_API jsb::impl::StackPosition jsbi_GetOwnPropertyDescriptor(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, jsb::impl::StackPosition key_sp);
JSBROWSER_API jsb::impl::StackPosition jsbi_GetPrototypeOf(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp);
JSBROWSER_API jsb::impl::ResultValue jsbi_SetPrototypeOf(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, jsb::impl::StackPosition proto_sp);
JSBROWSER_API jsb::impl::ResultValue jsbi_HasOwnProperty(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition obj_sp, jsb::impl::StackPosition key_sp);

// return 0 if stackval is not ArrayBuffer
JSBROWSER_API int jsbi_GetByteLength(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API jsb::impl::ResultValue jsbi_ReadArrayBufferData(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos, int size, void* data_dst);
JSBROWSER_API jsb::impl::StackPosition jsbi_NewArrayBuffer(jsb::impl::JSRuntime engine_id, const uint8_t* data, int size);
// return nullptr if stackval is not External
JSBROWSER_API void* jsbi_GetExternal(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
// return 0 if stackval is not Array
JSBROWSER_API int   jsbi_GetArrayLength(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
// return 0 if stackval is not String
JSBROWSER_API int   jsbi_GetStringLength(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API char* jsbi_ToCStringLen(jsb::impl::JSRuntime engine_id, int32_t* o_size, jsb::impl::StackPosition str_sp);
JSBROWSER_API jsb::impl::StackPosition jsbi_ToString(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API double jsbi_NumberValue(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool   jsbi_BooleanValue(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API int32_t  jsbi_Int32Value(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API uint32_t jsbi_Uint32Value(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_Int64Value(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos, int64_t* o_value);

JSBROWSER_API int   jsbi_hash(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_stack_eq(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos1, jsb::impl::StackPosition stack_pos2);

// GLOBAL HANDLE MANAGEMENT
JSBROWSER_API bool jsbi_handle_eq(jsb::impl::JSRuntime engine_id, jsb::impl::HandleID handle1, jsb::impl::StackPosition handle2);
JSBROWSER_API bool jsbi_handle_IsValid(jsb::impl::JSRuntime engine_id, jsb::impl::HandleID handle);

JSBROWSER_API void jsbi_handle_ClearWeak(jsb::impl::JSRuntime engine_id, jsb::impl::HandleID handle);
JSBROWSER_API void jsbi_handle_SetWeak(jsb::impl::JSRuntime engine_id, jsb::impl::HandleID handle);
JSBROWSER_API void jsbi_handle_Reset(jsb::impl::JSRuntime engine_id, jsb::impl::HandleID handle);
JSBROWSER_API jsb::impl::HandleID jsbi_handle_New(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition val_sp);
JSBROWSER_API jsb::impl::StackPosition jsbi_handle_PushStack(jsb::impl::JSRuntime engine_id, jsb::impl::HandleID handle);

// JS VALUE TYPE CHECKING
JSBROWSER_API bool  jsbi_IsNullOrUndefined(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsNull(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsUndefined(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsExternal(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsObject(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsSymbol(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsString(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsFunction(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsBoolean(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsNumber(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsBigInt(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

JSBROWSER_API bool  jsbi_IsInt32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsUint32(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

JSBROWSER_API bool  jsbi_IsPromise(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsArray(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsMap(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);
JSBROWSER_API bool  jsbi_IsArrayBuffer(jsb::impl::JSRuntime engine_id, jsb::impl::StackPosition stack_pos);

#endif
