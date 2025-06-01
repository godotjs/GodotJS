# @godot-js/editor

## 1.0.0

### Major Changes
* Implement a [*Monitor*](https://github.com/godotjs/GodotJS/wiki/Statistics) of the runtime statistics of a running project
* Implement *console.time/console.timeEnd*
* Refactor [*Worker*](https://github.com/godotjs/GodotJS/wiki/Worker) to support *Godot Object* transfer

### Minor Changes
* Add *worker.onready* callback
* Add threading support for *InstanceBindingCallback*
* Improve multi-threading support for *IConsoleOutput*
* Refactor *GodotJSScript* to support loading in *Worker*
* Add a setting entry for *Exporter* to manually include source files
* More strict type check for native object bindings
* *TypeConvert* returns *true* and *nullptr* for dead object pointers
* Ignore *Thread* class in d.ts codegen

### Patch Changes
* Fix a godot profiler crash on *GodotJSScriptLanguage::profiling_get_*
* Fix a possible crash in *Worker::finish()*
* Fix an access violation issue in *Worker*

## 0.9.9

### Minor Changes

* Add prebuilt libs of lws/v8 for Windows/Linux on ARM64
* Add support for hooking godot typeloader
* Add support for JavaScriptCore

### Patch Changes
* Minor bugfix

## 0.9.8

### Patch Changes

* Fix a crash issue in `jsb::Buffer` destructor when using *quickjs-ng* as runtime
* Support for pure JavaScript projects (still with typings)
* Refactor annotations and helper functions in `jsb.core`

### Breaking Changes
* All annotations are moved into `godot.annotations` module (from `jsb.core`).
* `GLOBAL_GET` and `EDITOR_GET` are moved into `godot` module (from `jsb.core`).
* `callable()` is removed from `jsb.core`, use `Callable.create` in `godot` module instead.
* `to_array_buffer()` is removed from `jsb.core`, use `PackedByteArray.to_array_buffer()` instead.
* `$wait` is removed from `jsb.core`, use `SignalN<...>.as_promise()` instead.

> [!NOTE]
> Regenerating `.d.ts` files in your project will help you a lot to fix most errors caused by the breaking changes below.
> *VSCode* (or `tsc`) will report all relevant changes as errors.
> Old annotations still work temporarily in this version but will be removed in a future version. Please update your codes.

