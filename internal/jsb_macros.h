#ifndef JSB_MACROS_H
#define JSB_MACROS_H

#include <cstdint>

#include "../jsb_version.h"

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

#define jsb_errorf(Format, ...) vformat("[%s:%d %s] " Format, __FILE__, __LINE__, __FUNCTION__, ##__VA_ARGS__)

#if JSB_LOG_WITH_SOURCE
#   define JSB_LOG_FORMAT(CategoryName, Severity, Format, ...) vformat("[" #CategoryName "][" #Severity "][%s:%d %s] " Format, __FILE__, __LINE__, __FUNCTION__, ##__VA_ARGS__)
#else
#   define JSB_LOG_FORMAT(CategoryName, Severity, Format, ...) vformat("[" #CategoryName "][" #Severity "] " Format, ##__VA_ARGS__)
#endif

#define JSB_LOG_IMPL(CategoryName, Severity, Format, ...) \
    if constexpr (jsb::internal::ELogSeverity::Severity >= jsb::internal::ELogSeverity::JSB_MIN_LOG_LEVEL) \
    {\
        if constexpr (jsb::internal::ELogSeverity::Severity >= jsb::internal::ELogSeverity::Error) { _err_print_error(FUNCTION_STR, __FILE__, __LINE__, "Method/function failed.", JSB_LOG_FORMAT(CategoryName, Severity, Format, ##__VA_ARGS__)); } \
        else if constexpr (jsb::internal::ELogSeverity::Severity >= jsb::internal::ELogSeverity::Warning) { _err_print_error(FUNCTION_STR, __FILE__, __LINE__, JSB_LOG_FORMAT(CategoryName, Severity, Format, ##__VA_ARGS__), false, ERR_HANDLER_WARNING); }\
        else if constexpr (jsb::internal::ELogSeverity::Severity > jsb::internal::ELogSeverity::Verbose) { print_line(JSB_LOG_FORMAT(CategoryName, Severity, Format, ##__VA_ARGS__)); } \
        else if (OS::get_singleton()->is_stdout_verbose()) { print_line(JSB_LOG_FORMAT(CategoryName, Severity, Format, ##__VA_ARGS__)); } \
    } (void) 0

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

namespace jsb::internal
{
    namespace ELogSeverity
    {
        enum Type : uint8_t
        {
#pragma push_macro("DEF")
#   undef   DEF
#   define  DEF(FieldName) FieldName,
#   include "jsb_log_severity.h"
#pragma pop_macro("DEF")
        };
    }
}

#endif
