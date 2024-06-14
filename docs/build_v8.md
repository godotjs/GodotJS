
# Build V8 (static,monolithic) from source

**STEP 1**  
Download `depot_tools` from https://storage.googleapis.com/chrome-infra/depot_tools.zip if using `Windows`, and extract it to a path you want. 

Otherwise, get `depot_tools` from the git repository:

```
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```

**STEP 2**  

Add the `depot_tools` path into the environment variable `PATH`.

On `windows`:

```bat
set PATH=Your\Path\To\depot_tools;%PATH%
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
```

> [!NOTE]
> If `DEPOT_TOOLS_WIN_TOOLCHAIN` is not set, `depot_tools` will fail to build because it will try to use the google internal toolchain instead of the locally installed Visual Studio.

On `linux`, `macos`:
```sh
export PATH=Your/Path/To/depot_tools:$PATH
```

**STEP 3**  

Sync and fetch v8:

```sh
cd Your/Path/To/depot_tools
gclient 

mkdir -p Your/Path/To/v8 
cd Your/Path/To/v8
fetch v8
cd v8
git checkout refs/tags/12.4.254.20
gclient sync
```

**STEP 4**  

Generate build configurations:

```sh
gn gen ./out.gn/x64.release
```

Modify the options in `out.gn/x64.release/args.gn`. See [Options](#options-currently-used-for-building-v8)


**STEP 5**  

Build:

```sh
ninja -C ./out.gn/x64.release v8_monolith
```

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

use_custom_libcxx = false            # false will produce warnings
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
