
# GodotJS 
Add TypeScript/JavaScript Support for Godot 4.x with v8.

[![windows](https://github.com/ialex32x/GodotJS-Build/actions/workflows/build_editor_windows.yml/badge.svg)](https://github.com/ialex32x/GodotJS-Build/actions/workflows/build_editor_windows.yml)
[![macos](https://github.com/ialex32x/GodotJS-Build/actions/workflows/build_editor_macos.yml/badge.svg)](https://github.com/ialex32x/GodotJS-Build/actions/workflows/build_editor_macos.yml)
[![linux](https://github.com/ialex32x/GodotJS-Build/actions/workflows/build_editor_linux.yml/badge.svg)](https://github.com/ialex32x/GodotJS-Build/actions/workflows/build_editor_linux.yml)

> [!NOTE]
> This project is still in the very early stage of development.

## Features
* [x] Godot ScriptLanguage integration
* [x] Debug with Chrome devtools when using V8
* [x] REPL in Editor
* [ ] Hot-reloading
* [ ] Asynchronous module loading (`import` function)
* [ ] Sandboxed scripting (not multi-threading)
* [ ] Worker threads

## Get Started

**STEP 1:** Download or clone the repo into the `modules` directory of your Godot engine source:
```sh
cd YourGodotEngineSource/modules
git clone https://github.com/ialex32x/GodotJS.git
```

**STEP 2:** Put `v8` headers and libraries into `GodotJS`, or directly download the prebuilt `v8` from [GodotJS-Dependencies](https://github.com/ialex32x/GodotJS-Dependencies/releases):

```sh
# download the archive of prebuilt v8 
curl https://github.com/ialex32x/GodotJS-Dependencies/releases/download/v8_r6/v8_r6.zip --output your/download/path/v8.zip

# extract the zip file into your `GodotJS` directory, 
# NOTE: no white space after the switch `-o`
7z x -o"YourGodotEngineSource/modules/GodotJS" your/download/path/v8.zip 
```

The module directroy structure looks like this:
```
┗━ godot
    ┗━ modules
        ┣━ ...
        ┣━ gltf
        ┣━ GodotJS
        ┃    ┣━ bridge-quickjs
        ┃    ┣━ bridge-v8
        ┃    ┣━ ...
        ┃    ┣━ lws
        ┃    ┗━ v8
        ┃        ┣━ include
        ┃        ┣━ linux.x86_64.release
        ┃        ┣━ macos.arm64.release
        ┃        ┗━ windows.x86_64.release
        ┣━ gridmap
        ┣━ ...
```

The currently used version of `v8` is `12.4.254.20`.

**STEP 3:** Compile and launch `Godot Editor`. Then, [install TypeScript/JavaScript presets](./docs/install_ts_presets.md) into a Godot project.

For more information on how to use `GodotJS` in a project, check out [GodotJSExample](https://github.com/ialex32x/GodotJSExample.git) for examples written in typescript.

A prebuilt version of `Godot Editor` can be downloaded from [GodotJS-Build](https://github.com/ialex32x/GodotJS-Build/releases).

> [!NOTE]
> Encountering `Unresolved external symbol` errors during linkage with `v8_monolith.lib` or `libucrt.lib` may be addressed by updating to the latest version of the `MSVC v143` toolchain (if VS2022 is used).

[![Example: Snake](./docs/assets/snake_01.gif)](https://github.com/ialex32x/GodotJSExample.git)
[![Example: Jummpy Bird](./docs/assets/jumpybird.gif)](https://github.com/ialex32x/GodotJSExample.git)

### Scripting
* [GodotJS Scripts](./docs/godotjs_scripts.md)
* [Godot Bindings](./docs/godot_binding.md)
* [Running code in the editor](./docs/running_code_in_editor.md)
* [Signals](./docs/signals.md)

### Utilities
* [REPL](./docs/repl.md)
* [SourceMap](./docs/source_map.md)
* [Debugger](./docs/debugger.md)

### Advanced
* [Build V8](./docs/build_v8.md)
* [QuickJS (PLANNED)](./docs/quickjs.md)
* [Dependencies](./docs/deps.md)
* [Compiler Options](./docs/compiler_options.md)

## Supported Platforms
- [x] Windows: x86_64
- [ ] Windows: arm64, UWP
- [x] MacOS: arm64
- [ ] MacOS: x86_64
- [x] Linux: x86_64
- [ ] Linux: arm64
- [ ] Android
- [ ] iOS
- [ ] WebAssembly (quickjs only)
