
TypScript/JavaScript for Godot with V8

> **NOTE** This project is still in the very early stage of development.

## Features
* [x] Support on-demand binding
* [x] Essential NodeJS compatibilities (`console` , `timers` and `CommonJS` modules)
* [x] Godot Object types binding
* [x] Godot Primitive types binding
* [x] Debug with Chrome devtools when using V8
* [x] Support SourceMap
* [x] Support REPL in Godot Editor
* [x] Godot `ScriptLanguage` integration
* [ ] Support hot-reload
* [ ] Asynchronous module loading support (`import` function)
* [ ] Multiple contexts for sandboxing script environments (not multi-threading)
* [ ] Worker threads implementation
* [ ] Seamlessly switch to QuickJS when targeting web

## Get Started

Download or clone the repo into the `modules` directory of your Godot engine source:
```sh
cd YourGodotEngineSource/modules
git lfs clone https://github.com/ialex32x/GodotJS.git
```

Compile and launch `Godot Editor`.

For more information on how to use `GodotJS` in a project, check out [GodotJSExample](https://github.com/ialex32x/GodotJSExample.git) and [Documents](./docs/get_started.md). 
