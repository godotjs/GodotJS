#ifndef GODOTJS_INTERNAL_MACROS_H
#define GODOTJS_INTERNAL_MACROS_H

#include "../jsb.config.h"
#include "../jsb.gen.h"
#include "../jsb_version.h"

#include <memory>

#include "jsb_console_output.h"
#include "jsb_logger.h"

#include "core/object/object.h"
#include "core/variant/variant_utility.h"
#include "core/string/print_string.h"
#include "core/templates/hash_map.h"
#include "core/io/file_access.h"
#include "core/io/dir_access.h"
#include "core/os/thread.h"
#include "core/os/os.h"

#define JSB_STRINGIFY_2(a) #a
#define JSB_STRINGIFY(a) JSB_STRINGIFY_2(a)

#define JSB_MODULE_NAME_STRING JSB_STRINGIFY(JSB_MODULE_NAME)

#define JSB_LOG_IMPL(CategoryName, Severity, Format, ...) ::jsb::internal::Logger::output<::jsb::internal::ELogSeverity::Severity>(__FILE__, __LINE__, __FUNCTION__, "[" #CategoryName "][" #Severity "] " Format, ##__VA_ARGS__)

#define JSB_LOG(Severity, Format, ...) JSB_LOG_IMPL(jsb, Severity, Format, ##__VA_ARGS__)

// similar to assert() in C, jsb_check() will be thoroughly omitted if not JSB_WITH_CHECK, otherwise it traps the execution on false evaluation
#if JSB_WITH_CHECK
#   define jsb_check(Condition) CRASH_COND(!(Condition))
#   define jsb_checkf(Condition, Format, ...) CRASH_COND_MSG(!(Condition), vformat(Format, ##__VA_ARGS__))
#else
#   define jsb_check(Condition) (void) 0
#   define jsb_checkf(Condition, Format, ...) (void) 0
#endif

// jsb_ensure() is always evaluated, but only trap the execution if JSB_DEBUG
#if JSB_DEBUG
#   define jsb_ensure(Condition) (jsb_likely(Condition) || ([] { GENERATE_TRAP(); } (), false))
#   define jsb_ensuref(Condition, Format, ...) (jsb_likely(Condition) || ([] { JSB_LOG(Error, Format, ##__VA_ARGS__); GENERATE_TRAP(); } (), false))
#else
#   define jsb_ensure(Condition) (Condition)
#   define jsb_ensuref(Condition, Format, ...) (Condition)
#endif

#if JSB_DEBUG
#   define jsb_verify_int64(Value64, Format, ...) { if (Value64 != (int64_t) (int32_t) Value64) { JSB_LOG(Warning, "(lossy conversion) " Format, ##__VA_ARGS__); } } (void) 0
#else
#   define jsb_verify_int64(Value64, Format, ...) (void) 0
#endif

#define jsb_likely(Expression) likely(Expression)
#define jsb_unlikely(Expression) unlikely(Expression)

#define jsb_typename(TypeName) ((void) sizeof(TypeName), #TypeName)
#define jsb_nameof(TypeName, MemberName) ((void) sizeof(TypeName::MemberName), #MemberName)
#define jsb_methodbind(TypeName, MemberName) &TypeName::MemberName, #MemberName
#define jsb_not_implemented(Condition, Format, ...) CRASH_COND_MSG((Condition), vformat(Format, ##__VA_ARGS__))

#if defined(__GNUC__) || defined(__clang__)
#   define jsb_force_inline  __attribute__((always_inline))
#elif defined(_MSC_VER)
#   define jsb_force_inline  __forceinline
#else
#   define jsb_force_inline
#endif

#define jsb_deprecated(...)
#define jsb_experimental(...)
#define jsb_no_discard [[nodiscard]]
#define jsb_unused(value) ((void) (value))

#define jsb_stackalloc(type, size) (type*) alloca(sizeof(type) * (size))

// help to trace the location of the throwing error in C++ code.
#define jsb_throw(isolate, literal) { ERR_PRINT((literal)); (isolate)->ThrowError((literal)); } (void) 0

#define jsb_underlying_value(enum_type, enum_value) (__underlying_type(enum_type) (enum_value))

// generate an error string with source position info
#define jsb_errorf(Format, ...) vformat("[%s:%d %s] " Format, __FILE__, __LINE__, __FUNCTION__, ##__VA_ARGS__)

#endif
