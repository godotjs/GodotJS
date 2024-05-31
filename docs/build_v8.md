
## Options Currently Used for Building V8

Windows x64
```toml
is_component_build = false
is_debug = false
target_cpu = "x64"
target_os = "win"
v8_enable_i18n_support = false
v8_monolithic = true
v8_use_external_startup_data = false
v8_enable_pointer_compression = true
v8_jitless = false                  # jit enabled

use_custom_libcxx = true            # false will produce warnings
treat_warnings_as_errors = false    # 
v8_symbol_level = 0                 # smaller lib 
v8_enable_sandbox = false 
```

Macos arm64
```toml
# v8_enable_backtrace = true
# v8_enable_disassembler = true
# v8_enable_object_print = true
# v8_enable_verify_heap = true

dcheck_always_on = false

is_component_build = false
is_debug = false
target_cpu = "arm64"
v8_target_cpu = "arm64"
target_os = "mac"
v8_enable_i18n_support = false
v8_monolithic = true
v8_use_external_startup_data = false
v8_enable_pointer_compression = true
v8_jitless = false                  # jit enabled
v8_enable_webassembly = false

use_custom_libcxx = false            # false will produce warnings
treat_warnings_as_errors = false    # 
v8_symbol_level = 0                 # smaller lib 
v8_enable_sandbox = false 
use_rtti = true
```


---

[Go Back](../README.md)
