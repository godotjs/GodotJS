// FFI surface for godotjs_transpiler_ffi (Rust staticlib).
//
// Owns the implementation in transpiler-ffi/src/lib.rs. Hand-written instead
// of cbindgen-generated — the surface is two functions and one struct, so the
// bookkeeping cost of cbindgen exceeds its value.

#ifndef GODOTJS_TRANSPILER_H
#define GODOTJS_TRANSPILER_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct GodotJSTranspileResult {
    uint8_t* code;
    size_t   code_len;
    uint8_t* sourcemap;
    size_t   sourcemap_len;
    uint8_t* error;
    size_t   error_len;
} GodotJSTranspileResult;

// Transpile TypeScript source to CommonJS JavaScript.
//
// `source`/`filename` must point to `*_len` valid UTF-8 bytes (neither is
// expected to be null-terminated). `opts` is reserved (pass 0).
//
// On success, `code`/`code_len` hold the emitted JS and `error` is null.
// `sourcemap`/`sourcemap_len` hold the `data:application/json;…;base64,<…>`
// URL of an inline source map (suitable for embedding directly after
// `//# sourceMappingURL=`); both are zero when sourcemap generation is
// skipped or empty. On failure, `error`/`error_len` hold a UTF-8 message
// and `code` is null.
//
// The returned pointer is always non-null and must be freed via
// godotjs_free_transpile_result().
GodotJSTranspileResult* godotjs_transpile_ts(
    const uint8_t* source, size_t source_len,
    const uint8_t* filename, size_t filename_len,
    uint32_t opts);

void godotjs_free_transpile_result(GodotJSTranspileResult* r);

#ifdef __cplusplus
} // extern "C"
#endif

#endif // GODOTJS_TRANSPILER_H
