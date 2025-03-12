#ifndef GODOTJS_INTERNAL_MACROS_H
#define GODOTJS_INTERNAL_MACROS_H

#include "jsb_engine_version_comparison.h"

#include "../jsb.config.h"
#include "../jsb.gen.h"
#include "../jsb_version.h"

#define JSB_STRINGIFY_2(a) #a
#define JSB_STRINGIFY(a) JSB_STRINGIFY_2(a)
#define JSB_CONCAT_IMPL(a, b) a##b
#define JSB_CONCAT(a, b) JSB_CONCAT_IMPL(a, b)

#define JSB_OPERATOR_NAME(op_code) #op_code

#define JSB_MODULE_NAME_STRING JSB_STRINGIFY(JSB_MODULE_NAME)

#define jsb_nop() (void) 0

#define JSB_LOG_FORMAT(CategoryName, Severity, Format) "[" #CategoryName "][" #Severity "] " Format
#define JSB_LOG_SEVERITY(Severity) ::jsb::internal::ELogSeverity::Severity

#define JSB_LOG_IMPL(CategoryName, Severity, Format, ...) \
    if constexpr (JSB_LOG_SEVERITY(Severity) >= JSB_LOG_SEVERITY(JSB_MIN_LOG_LEVEL))\
    {\
        if constexpr (JSB_LOG_SEVERITY(Severity) >= JSB_LOG_SEVERITY(Error)) ::jsb::internal::Logger::error<JSB_LOG_SEVERITY(Severity)>(__FILE__, __LINE__, __FUNCTION__, JSB_LOG_FORMAT(CategoryName, Severity, Format), ##__VA_ARGS__);\
        else if constexpr (JSB_LOG_SEVERITY(Severity) >= JSB_LOG_SEVERITY(Warning)) ::jsb::internal::Logger::warn<JSB_LOG_SEVERITY(Severity)>(__FILE__, __LINE__, __FUNCTION__, JSB_LOG_FORMAT(CategoryName, Severity, Format), ##__VA_ARGS__);\
        else if constexpr (JSB_LOG_SEVERITY(Severity) > JSB_LOG_SEVERITY(Verbose)) ::jsb::internal::Logger::info<JSB_LOG_SEVERITY(Severity)>(__FILE__, __LINE__, __FUNCTION__, JSB_LOG_FORMAT(CategoryName, Severity, Format), ##__VA_ARGS__);\
        else ::jsb::internal::Logger::verbose<JSB_LOG_SEVERITY(Severity)>(__FILE__, __LINE__, __FUNCTION__, JSB_LOG_FORMAT(CategoryName, Severity, Format), ##__VA_ARGS__);\
    } (void) 0

#define JSB_LOG(Severity, Format, ...) JSB_LOG_IMPL(jsb, Severity, Format, ##__VA_ARGS__)

// similar to assert() in C, jsb_check() will be thoroughly omitted if not JSB_WITH_CHECK, otherwise it traps the execution on false evaluation
#if JSB_WITH_CHECK
#   define jsb_check(Condition) CRASH_COND(!(Condition))
#   define jsb_checkf(Condition, Format, ...) CRASH_COND_MSG(!(Condition), jsb_format(Format, ##__VA_ARGS__))
#else
#   define jsb_check(Condition) (void) 0
#   define jsb_checkf(Condition, Format, ...) (void) 0
#endif

// only check if compiling with QuickJS impl
#if JSB_WITH_QUICKJS
#   define jsb_quickjs_check(Condition) jsb_check(Condition)
#   define jsb_quickjs_checkf(Condition, Format, ...) jsb_checkf(Condition, Format, ...)
#else
#   define jsb_quickjs_check(Condition) (void) 0
#   define jsb_quickjs_checkf(Condition, Format, ...) (void) 0
#endif

// only check if compiling with v8 impl
#if JSB_WITH_V8
#   define jsb_v8_check(Condition) jsb_check(Condition)
#   define jsb_v8_checkf(Condition, Format, ...) jsb_checkf(Condition, Format, ...)
#else
#   define jsb_v8_check(Condition) (void) 0
#   define jsb_v8_checkf(Condition, Format, ...) (void) 0
#endif

// jsb_ensure() is always evaluated, but only trap the execution if JSB_DEBUG
#if JSB_DEBUG
#   define jsb_ensure(Condition) (jsb_likely(Condition) || ([] { JSB_LOG(Error, "ensure(%s) failed", #Condition); GENERATE_TRAP(); } (), false))
#   define jsb_ensuref(Condition, Format, ...) (jsb_likely(Condition) || ([=] { JSB_LOG(Error, Format, ##__VA_ARGS__); GENERATE_TRAP(); } (), false))
#else
#   define jsb_ensure(Condition) (!!(Condition))
#   define jsb_ensuref(Condition, Format, ...) (!!(Condition))
#endif

#if JSB_DEBUG
#   define jsb_notice(Condition, Format, ...) if (!!(Condition)) { JSB_LOG_IMPL(jsb, Warning, Format, ##__VA_ARGS__); } (void) 0
#else
#   define jsb_notice(Condition, Format, ...) (void) 0
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
#define jsb_not_implemented(Condition, Format, ...) CRASH_COND_MSG((Condition), jsb_format(Format, ##__VA_ARGS__))

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
#if JSB_DEBUG
#   define jsb_throw(isolate, literal) impl::Helper::throw_error((isolate), "[" __FILE__ ":" JSB_STRINGIFY(__LINE__) "] " literal)
#else
#   define jsb_throw(isolate, literal) impl::Helper::throw_error((isolate), (literal))
#endif

#define jsb_underlying_value(enum_type, enum_value) (__underlying_type(enum_type) (enum_value))

#define jsb_format(Format, ...) ::jsb::internal::format(Format, ##__VA_ARGS__)

// generate an error string with source position info
#define jsb_errorf(Format, ...) jsb_format("[%s:%d %s] " Format, __FILE__, __LINE__, __FUNCTION__, ##__VA_ARGS__)

#define JSB_NEW_FUNCTION(context, callback, data) jsb::impl::Helper::NewFunction(context, #callback, callback, data)

// helper macros to create a handle scope with a unique name
#define JSB_HANDLE_SCOPE(isolate) v8::HandleScope JSB_CONCAT(unique_, __COUNTER__)(isolate)

#if GODOT_4_3_OR_NEWER
#    define ConstStringRefCompat const String&
#    define ConstStringNameRefCompat const StringName&
#else
#    define ConstStringRefCompat String
#    define ConstStringNameRefCompat StringName
#endif

#endif
