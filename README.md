
GodotJS - TypScript/JavaScript for Godot with V8.

> [!NOTE]
> This project is still in the very early stage of development.

## Features
* [x] [`ScriptLanguage` integration](./docs/godotjs_scripts.md)
* [x] [Debug with Chrome devtools when using V8](./docs/debugger.md)
* [x] [REPL in Editor](./docs/repl.md)
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

**STEP 2:** Pull all lfs objects (since the prebuilt `v8` library is too big to push as a common file on github):

> [!NOTE]
> `git-lfs` must be installed as a prerequisite. Follow the instructions on [Github Docs](https://docs.github.com/en/repositories/working-with-files/managing-large-files/installing-git-large-file-storage) to install `git-lfs`.

```sh
cd YourGodotEngineSource/modules/GodotJS
git lfs install
git lfs pull
```

**STEP 3:** Compile and launch `Godot Editor`. Then, [install TypeScript/JavaScript presets](./docs/install_ts_presets.md) into a Godot project.

For more information on how to use `GodotJS` in a project, check out [GodotJSExample](https://github.com/ialex32x/GodotJSExample.git) for examples written in typescript.

A prebuilt version of `Godot Editor` can be downloaded from [GodotJS-Build](https://github.com/ialex32x/GodotJS-Build).

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
- [ ] Windows: ARM64, UWP
- [x] MacOS: AppleSilicon
- [ ] Android
- [ ] iOS
- [ ] Linux
- [ ] WebAssembly (quickjs only)
