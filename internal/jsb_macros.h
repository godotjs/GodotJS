#ifndef GODOTJS_INTERNAL_MACROS_H
#define GODOTJS_INTERNAL_MACROS_H

#include "../jsb.config.h"
#include "../jsb.gen.h"
#include "../jsb_version.h"

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

#ifdef TOOLS_ENABLED
#   define JSB_GODOT_TOOLS 1
#else
#   define JSB_GODOT_TOOLS 0
#endif

#ifdef DEV_ENABLED
#   define JSB_GODOT_DEV 1
#else
#   define JSB_GODOT_DEV 0
#endif

#define JSB_STRINGIFY_2(a) #a
#define JSB_STRINGIFY(a) JSB_STRINGIFY_2(a)

#define JSB_MODULE_NAME_STRING JSB_STRINGIFY(JSB_MODULE_NAME)

#define jsb_errorf(Format, ...) vformat("[%s:%d %s] " Format, __FILE__, __LINE__, __FUNCTION__, ##__VA_ARGS__)

#define JSB_LOG_IMPL(CategoryName, Severity, Format, ...) ::jsb::internal::Logger::output<::jsb::internal::ELogSeverity::Severity>(__FILE__, __LINE__, __FUNCTION__, "[" #CategoryName "][" #Severity "] " Format, ##__VA_ARGS__)

#define JSB_LOG(Severity, Format, ...) JSB_LOG_IMPL(jsb, Severity, Format, ##__VA_ARGS__)

#if JSB_DEBUG
#   define jsb_check(Condition) CRASH_COND(!(Condition))
#   define jsb_checkf(Condition, Format, ...) CRASH_COND_MSG(!(Condition), vformat(Format, ##__VA_ARGS__))
#   define jsb_ensure(Condition) CRASH_COND(!(Condition))
#else
#   define jsb_check(Condition) (void) 0
#   define jsb_checkf(Condition, Format, ...) (void) 0
#   define jsb_ensure(Condition) CRASH_COND(!(Condition))
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

#define jsb_deprecated
#define jsb_deleteme
#define jsb_experimental
#define jsb_no_discard [[nodiscard]]

#define jsb_stackalloc(type, size) (type*) alloca(sizeof(type) * (size))

// help to trace the location of the throwing error in C++ code.
#define jsb_throw(isolate, literal) { ERR_PRINT((literal)); (isolate)->ThrowError((literal)); } (void) 0

#define jsb_underlying_value(enum_type, enum_value) (__underlying_type(enum_type) (enum_value))

#endif
