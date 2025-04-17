#ifndef GODOTJS_CONFIG_H
#define GODOTJS_CONFIG_H

#include "jsb.gen.h"

#if __has_include(<gdextension_interface.h>)
#define JSB_GDEXTENSION 1
#else
#define JSB_GDEXTENSION 0
#endif

#ifndef JSB_DEBUG
#   if defined(DEBUG_ENABLED)
#       define JSB_DEBUG 1
#   else
#       define JSB_DEBUG 0
#   endif
#endif

#define JSB_WITH_ESSENTIALS !JSB_WITH_WEB

// Enable the debugger bridge.
// For v8, use Chrome devtools with the following link by default:
//      devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9229/1
// For JavaScriptCore, use Safari.
#define JSB_WITH_DEBUGGER JSB_DEBUG

// lower log levels are completely skipped (at compile-time)
// see `internal/jsb_log_severity.def.h`
#ifndef JSB_MIN_LOG_LEVEL
#   if JSB_DEBUG
#       define JSB_MIN_LOG_LEVEL Verbose
#   else
#       define JSB_MIN_LOG_LEVEL Warning
#   endif
#endif // JSB_MIN_LOG_LEVEL

// enable jsb_check
#ifndef JSB_WITH_CHECK
#define JSB_WITH_CHECK JSB_DEBUG
#endif

// output verbose log anyway even if `OS::get_singleton()->is_stdout_verbose()` is false
#define JSB_VERBOSE_ENABLED 0

// print benchmark
#define JSB_BENCHMARK 1

// [EXPERIMENTAL] enable auto-complete feature in the input field of REPL.
//NOTE this feature introduces side effects since it will try to evaluate the input string before you submit.
#define JSB_REPL_AUTO_COMPLETE 1

// (only available when using v8)
// enable `RequestGarbageCollectionForTesting` (not recommended)
#define JSB_EXPOSE_GC_FOR_TESTING 0

// (only available when using v8)
// print gc time cost in milliseconds
#define JSB_PRINT_GC_TIME 1

// (only available in editor build)
// support hot-reload for javascript modules
#define JSB_SUPPORT_RELOAD 1

// EXPERIMENTAL, LIMITED SUPPORT
// only implemented in v8.impl, jsc.impl and quickjs.impl, temporarily.
// ---
//
// module 'godot-jsb':
//    - set_async_module_loader
//    - $import
#define JSB_SUPPORT_ASYNC_MODULE_LOADER JSB_WITH_V8 || JSB_WITH_QUICKJS || JSB_WITH_JAVASCRIPTCORE

// translate the js source stacktrace with source map (currently, the `.map` file must locate at the same filename & directory of the js source)
#define JSB_WITH_SOURCEMAP 1

// log with C++ [source filename, line number, function name]
#define JSB_LOG_WITH_SOURCE 0

// construct a Variant with `Variant::construct` instead of `VariantUtilityFunctions::type_convert`
#define JSB_CONSTRUCT_DEFAULT_VARIANT_SLOW 0

// NOT IMPLEMENTED YET
#define JSB_WITH_STATIC_BINDINGS 0

// utf16 conversion may have less overhead, but uses more memory?
#define JSB_UTF16_CONV_PREFERRED 1

// quickjs.impl only, all Object(JSValue) must be explicitly free-ed on the Isolate disposing
#define JSB_STRICT_DISPOSE 1

// use bigint if a value can not represented as Integer(Number)
#define JSB_WITH_BIGINT 1

// use `BigInt` if a value from godot greater than JSB_MAX_SAFE_INTEGER which can not represented as Integer(Number).
// used only if `JSB_WITH_BIGINT` is enabled.
// DO NOT CHANGE THIS VALUE.
#define JSB_MAX_SAFE_INTEGER (((int64_t)1 << 53) - 1) // 9007199254740991

// [EXPERIMENTAL] use optimized wrapper function calls if possible
#define JSB_FAST_REFLECTION 1

// implicitly convert a javascript array as godot Vector<T> which is convenient but less performant if massively used
#define JSB_IMPLICIT_PACKED_ARRAY_CONVERSION 1

// not to generate method declaration if already defined as get/set property
#define JSB_EXCLUDE_GETSET_METHODS 1

// [low level] debug value add/remove issues in SArray
#define JSB_SARRAY_DEBUG 0
#define JSB_SARRAY_CONSISTENCY_CHECK 0

// use url scheme to avoid the file separator conversion on windows.
// disable if not supported by the remote debugger.
#define JSB_WITH_URI_SCRIPT_ORIGIN 0

// [EXPERIMENTAL] DONT CHANGE IT
#define JSB_THREADING 1

// [EXPERIMENTAL] DONT CHANGE IT, AND NEED CLANG TOOLSET IF USING MSVC
#if !defined(_MSC_VER) || defined(__clang__)
#   define JSB_V8_CPPGC 0 // 1
#else 
#   define JSB_V8_CPPGC 0
#endif

#define JSB_SHADOW_ENVIRONMENT_AS_PARSER 1
#define JSB_MAX_CACHED_SHADOW_ENVIRONMENTS 2

// size limitation for string name cache.
// all least recently used item will be removed if the cache size exceeds this value.
// 0 or negative values means unlimited cache size. 
#define JSB_STRING_NAME_CACHE_SIZE 512

// slots for object/script/class info is reallocated on heap (as a whole block of memory)
// a suitable value can avoid unnecessary reallocation
#define JSB_MASTER_INITIAL_OBJECT_SLOTS (1024 * 64)
#define JSB_MASTER_INITIAL_SCRIPT_SLOTS 1024
#define JSB_MASTER_INITIAL_CLASS_EXTRA_SLOTS 0

#define JSB_WORKER_INITIAL_OBJECT_SLOTS (1024 * 8)
#define JSB_WORKER_INITIAL_SCRIPT_SLOTS 1024
#define JSB_WORKER_INITIAL_CLASS_SLOTS 512

// always exclude the worker scripts (end with `.worker.js/ts`) from ResourceLoader.
// they should only be loaded by JSWorker.
#define JSB_EXCLUDE_WORKER_RES_SCRIPTS 1

// always exclude the test scripts (end with `.test.js/ts`) from ResourceLoader.
// they usually used for testing (like mocha, jest, etc).
#define JSB_EXCLUDE_TEST_RES_SCRIPTS 1

#define JSB_DTS_EXT        "d.ts"
#define JSB_TYPESCRIPT_EXT "ts"
#define JSB_JAVASCRIPT_EXT "js"
#define JSB_COMMONJS_EXT   "cjs"
#define JSB_JSON_EXT       "json"

// A helper version tag for the jsb.*.bundle.js scripts (which is embedded in .cpp source).
// It could ensure your engine built with the expected version of the jsb bundle scripts.
// If static_assert in `jsb_project_preset.gen.cpp` fails, please run your `scons` command again to update all bundle scripts.
#define JSB_BUNDLE_VERSION 11

#endif
