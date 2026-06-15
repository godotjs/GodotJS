use std::slice;

#[repr(C)]
pub struct TranspileResult {
    pub code: *mut u8,
    pub code_len: usize,
    pub sourcemap: *mut u8,
    pub sourcemap_len: usize,
    pub error: *mut u8,
    pub error_len: usize,
}

/// # Safety
/// `source`/`filename` must point to `*_len` valid bytes. The returned
/// pointer must be freed via [`godotjs_free_transpile_result`].
///
/// A panic inside the transpiler (e.g. an SWC internal assertion on malformed
/// input) is caught at this boundary and turned into an error result — it must
/// never unwind across the C ABI into the engine (that would be UB).
#[no_mangle]
pub unsafe extern "C" fn godotjs_transpile_ts(
    source: *const u8,
    source_len: usize,
    filename: *const u8,
    filename_len: usize,
    opts: u32,
) -> *mut TranspileResult {
    match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| unsafe {
        transpile_ts_impl(source, source_len, filename, filename_len, opts)
    })) {
        Ok(result) => result,
        Err(_) => make_error(b"transpiler panicked"),
    }
}

/// # Safety
/// Same contract as [`godotjs_transpile_ts`]; this is the inner implementation
/// run inside the panic boundary.
unsafe fn transpile_ts_impl(
    source: *const u8,
    source_len: usize,
    filename: *const u8,
    filename_len: usize,
    _opts: u32,
) -> *mut TranspileResult {
    let source_bytes = unsafe { slice::from_raw_parts(source, source_len) };
    let filename_bytes = unsafe { slice::from_raw_parts(filename, filename_len) };

    let source_str = match std::str::from_utf8(source_bytes) {
        Ok(s) => s,
        Err(_) => return make_error(b"source is not valid UTF-8"),
    };
    let filename_str = match std::str::from_utf8(filename_bytes) {
        Ok(s) => s,
        Err(_) => return make_error(b"filename is not valid UTF-8"),
    };

    match transpile(source_str, filename_str) {
        Ok((code, sourcemap)) => make_ok(code, sourcemap),
        Err(msg) => make_error(msg.as_bytes()),
    }
}

/// # Safety
/// `p` must be a pointer returned by [`godotjs_transpile_ts`].
#[no_mangle]
pub unsafe extern "C" fn godotjs_free_transpile_result(p: *mut TranspileResult) {
    if p.is_null() {
        return;
    }
    let r = unsafe { Box::from_raw(p) };
    if !r.code.is_null() {
        unsafe { drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(r.code, r.code_len))) };
    }
    if !r.sourcemap.is_null() {
        unsafe { drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(r.sourcemap, r.sourcemap_len))) };
    }
    if !r.error.is_null() {
        unsafe { drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(r.error, r.error_len))) };
    }
}

// Hand a buffer to C as (ptr, len). Round-trips through Box<[u8]> so capacity
// always equals len — freeing via Box::from_raw(slice_from_raw_parts_mut) is
// then sound. (A Vec's capacity may exceed its len, so reconstructing a Vec
// with capacity == len in the free path would be undefined behavior.)
fn vec_to_raw(v: Vec<u8>) -> (*mut u8, usize) {
    let boxed: Box<[u8]> = v.into_boxed_slice();
    let len = boxed.len();
    let ptr = Box::into_raw(boxed) as *mut u8;
    (ptr, len)
}

fn make_ok(code: Vec<u8>, sourcemap: Vec<u8>) -> *mut TranspileResult {
    let (code_ptr, code_len) = vec_to_raw(code);
    let (sm_ptr, sm_len) = if sourcemap.is_empty() {
        (std::ptr::null_mut(), 0)
    } else {
        vec_to_raw(sourcemap)
    };
    Box::into_raw(Box::new(TranspileResult {
        code: code_ptr,
        code_len,
        sourcemap: sm_ptr,
        sourcemap_len: sm_len,
        error: std::ptr::null_mut(),
        error_len: 0,
    }))
}

fn make_error(msg: &[u8]) -> *mut TranspileResult {
    let (err_ptr, err_len) = vec_to_raw(msg.to_vec());
    Box::into_raw(Box::new(TranspileResult {
        code: std::ptr::null_mut(),
        code_len: 0,
        sourcemap: std::ptr::null_mut(),
        sourcemap_len: 0,
        error: err_ptr,
        error_len: err_len,
    }))
}

fn transpile(source: &str, filename: &str) -> Result<(Vec<u8>, Vec<u8>), String> {
    use swc_core::common::{sync::Lrc, FileName, Globals, Mark, SourceMap, GLOBALS};
    use swc_core::ecma::ast::{EsVersion, Pass};
    use swc_core::ecma::codegen::{text_writer::JsWriter, Config, Emitter};
    use swc_core::ecma::parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};
    use swc_core::ecma::transforms::base::fixer::fixer;
    use swc_core::ecma::transforms::base::helpers::{inject_helpers, Helpers, HELPERS};
    use swc_core::ecma::transforms::base::hygiene::hygiene;
    use swc_core::ecma::transforms::base::resolver;
    use swc_core::ecma::transforms::module::{common_js, path::Resolver as ModResolver};
    use swc_core::ecma::transforms::proposal::decorator_2022_03::decorator_2022_03;
    use swc_core::ecma::transforms::typescript::strip;

    let is_tsx = filename.ends_with(".tsx");

    let cm: Lrc<SourceMap> = Default::default();
    let fm = cm.new_source_file(
        Lrc::new(FileName::Custom(filename.to_string())),
        source.to_string(),
    );

    let lexer = Lexer::new(
        Syntax::Typescript(TsSyntax {
            tsx: is_tsx,
            decorators: true,
            ..Default::default()
        }),
        EsVersion::Es2022,
        StringInput::from(&*fm),
        None,
    );

    let mut parser = Parser::new_from(lexer);
    let mut program = parser
        .parse_program()
        .map_err(|e| format!("parse error: {e:?}"))?;

    let globals = Globals::new();
    let buf = GLOBALS.set(&globals, || -> Result<Vec<u8>, String> {
        // common_js (and other passes) reach into HELPERS — a separate scoped
        // TLS for the `_define`/`_object_spread`/etc. helper-injection table.
        // Without it, the lazy_require path inside <Cjs as VisitMut> panics.
        HELPERS.set(&Helpers::new(false), || -> Result<Vec<u8>, String> {
            let unresolved_mark = Mark::new();
            let top_level_mark = Mark::new();

            let mut passes = (
                resolver(unresolved_mark, top_level_mark, true),
                // Strip TS-only syntax (type annotations, declare, generics) first,
                // then lower TC39 decorators + `accessor` fields against plain JS.
                strip(unresolved_mark, top_level_mark),
                decorator_2022_03(),
                common_js(
                    ModResolver::default(),
                    unresolved_mark,
                    Default::default(),
                    Default::default(),
                ),
                // Inline definitions for _interop_require_default etc. that
                // common_js emits. Without this, the generated CJS references
                // helpers that the engine has no way to resolve at runtime.
                inject_helpers(unresolved_mark),
                // Disambiguates same-named identifiers by syntax context — the
                // decorator pass mints private `_dec` / `_init_*` placeholders
                // that collide without renaming, collapsing every decorator to
                // the last-assigned value.
                hygiene(),
                // Wraps low-precedence sub-expressions in parens so codegen is
                // syntactically correct — without it, common_js's `(0, foo.bar)()`
                // indirect-eval pattern emits as `0, foo.bar()` which parses as
                // two `const` declarators when the result is assigned to a const.
                fixer(None),
            );
            passes.process(&mut program);

            // Emitter must run inside GLOBALS — emit_program walks AST nodes
            // whose SyntaxContext lookups touch the thread-local globals.
            let mut buf = Vec::new();
            {
                let writer = JsWriter::new(cm.clone(), "\n", &mut buf, None);
                let mut emitter = Emitter {
                    cfg: Config::default(),
                    cm: cm.clone(),
                    comments: None,
                    wr: writer,
                };
                emitter
                    .emit_program(&program)
                    .map_err(|e| format!("emit error: {e:?}"))?;
            }
            Ok(buf)
        })
    })?;

    Ok((buf, Vec::new()))
}
