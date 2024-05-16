
TypScript/JavaScript for Godot with V8.

> [!NOTE]
> This project is still in the very early stage of development.

## Features
* [x] On-demand binding
* [x] Godot Object types binding
* [x] Godot Primitive types binding
* [x] Debug with Chrome devtools when using V8
* [x] SourceMap translated debug info
* [x] REPL in Godot Editor
* [x] Godot `ScriptLanguage` integration
* [x] Essential javascript builtins (`require` `timers` `console`)
* [ ] Hot-reloading
* [ ] Asynchronous module loading (`import` function)
* [ ] Sandboxed scripting (not multi-threading)
* [ ] Worker threads

## Get Started

Download or clone the repo into the `modules` directory of your Godot engine source:
```sh
cd YourGodotEngineSource/modules
git lfs clone https://github.com/ialex32x/GodotJS.git
```

Compile and launch `Godot Editor`. Then, [install TypeScript/JavaScript presets](./docs/install_ts_presets.md) into a Godot project.

For more information on how to use `GodotJS` in a project, check out [GodotJSExample](https://github.com/ialex32x/GodotJSExample.git). 

### Scripting
* [GodotJS Scripts](./docs/godotjs_scripts.md)
* [Running code in the editor](./docs/running_code_in_editor.md)
* [Godot Primitive Types](./docs/godot_primitive_types.md)

### Utilities
* [REPL](./docs/repl.md)
* [Debugger](./docs/debugger.md)

### Advanced
* [Build V8](./docs/build_v8.md)
* [QuickJS (PLANNED)](./docs/quickjs.md)
* [Dependencies](./docs/deps.md)
* [Compile Options](./docs/compile_options.md)

## Supported Platforms
- [x] Windows: x86_64 (TODO ARM64, UWP)
- [x] MacOS: AppleSilicon
- [ ] Android
- [ ] iOS
- [ ] Linux
- [ ] WebAssembly (quickjs only)
