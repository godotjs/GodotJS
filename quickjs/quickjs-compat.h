#ifndef QUICKJS_COMPAT_H_
#define QUICKJS_COMPAT_H_

// CONFIG_VERSION may conflict with the definition in godot
#define QUICKJS_CONFIG_VERSION "2024-01-13"

#if defined(__GNUC__) || defined(__clang__)
#   define js_likely(x)          __builtin_expect(!!(x), 1)
#   define js_unlikely(x)        __builtin_expect(!!(x), 0)
#   define js_force_inline       inline __attribute__((always_inline))
#   define __js_printf_like(f, a)   __attribute__((format(printf, f, a)))
#else
#   define js_likely(x)     (x)
#   define js_unlikely(x)   (x)
#   if defined(_MSC_VER)
#       define js_force_inline  __forceinline
#   else
#       define js_force_inline  inline
#   endif
#   define __js_printf_like(a, b)
#endif


#endif
