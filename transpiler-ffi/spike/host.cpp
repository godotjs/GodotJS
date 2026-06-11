// M0 spike: read .ts from stdin, transpile via the godotjs_transpiler_ffi
// staticlib, write JS to stdout (error → stderr, nonzero exit).

#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <sstream>
#include <string>

extern "C" {

struct TranspileResult {
    uint8_t* code;
    size_t   code_len;
    uint8_t* sourcemap;
    size_t   sourcemap_len;
    uint8_t* error;
    size_t   error_len;
};

TranspileResult* godotjs_transpile_ts(
    const uint8_t* source, size_t source_len,
    const uint8_t* filename, size_t filename_len,
    uint32_t opts);

void godotjs_free_transpile_result(TranspileResult* r);

} // extern "C"

int main(int argc, char** argv) {
    std::string filename = (argc > 1) ? argv[1] : "<stdin>.ts";

    std::stringstream ss;
    ss << std::cin.rdbuf();
    std::string source = ss.str();

    TranspileResult* r = godotjs_transpile_ts(
        reinterpret_cast<const uint8_t*>(source.data()), source.size(),
        reinterpret_cast<const uint8_t*>(filename.data()), filename.size(),
        0);

    if (!r) {
        std::fprintf(stderr, "godotjs_transpile_ts returned null\n");
        return 2;
    }

    int rc = 0;
    if (r->error) {
        std::fwrite(r->error, 1, r->error_len, stderr);
        std::fputc('\n', stderr);
        rc = 1;
    } else if (r->code) {
        std::fwrite(r->code, 1, r->code_len, stdout);
        if (r->sourcemap) {
            std::fprintf(stderr, "[sourcemap %zu bytes] ", r->sourcemap_len);
            std::fwrite(r->sourcemap, 1, r->sourcemap_len, stderr);
            std::fputc('\n', stderr);
        }
    }

    godotjs_free_transpile_result(r);
    return rc;
}
