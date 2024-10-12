#ifndef QUICKJS_COMPAT_H_
#define QUICKJS_COMPAT_H_

// CONFIG_VERSION may conflict with the definition in godot
#define QUICKJS_CONFIG_VERSION "2024-01-13"

#ifdef _MSC_VER
#include <windows.h>
#include <intrin.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef size_t ssize_t;

inline int __builtin_clz(unsigned int a)
{
    unsigned long idx;
    _BitScanReverse(&idx, a);
    return 31 ^ idx;
}

inline int __builtin_clzll(uint64_t a)
{
    unsigned long idx;
    _BitScanReverse64(&idx, a);
    return 63 ^ idx;
}

/* WARNING: undefined if a = 0 */
inline int __builtin_ctz(unsigned int a)
{
    unsigned long idx;
    _BitScanForward(&idx, a);
    return 31 ^ idx;
}

/* WARNING: undefined if a = 0 */
inline int __builtin_ctzll(uint64_t a)
{
    unsigned long idx;
    _BitScanForward64(&idx, a);
    return 63 ^ idx;
}

#pragma pack(push, 1)
struct packed_u64 {
    uint64_t v;
};

struct packed_u32 {
    uint32_t v;
};

struct packed_u16 {
    uint16_t v;
};
#pragma pack(pop)

#ifdef __cplusplus
}
#endif

#else

#ifdef __cplusplus
extern "C" {
#endif

struct __attribute__((packed)) packed_u64 {
    uint64_t v;
};

struct __attribute__((packed)) packed_u32 {
    uint32_t v;
};

struct __attribute__((packed)) packed_u16 {
    uint16_t v;
};

#ifdef __cplusplus
}
#endif

#endif

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
