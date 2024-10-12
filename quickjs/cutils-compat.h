#ifndef QUICKJS_CUTILS_COMPAT_H
#define QUICKJS_CUTILS_COMPAT_H

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

#else // _MSC_VER

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

#endif // _MSC_VER

#endif // QUICKJS_CUTILS_COMPAT_H
