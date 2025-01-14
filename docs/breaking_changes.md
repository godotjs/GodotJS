
# v0.9.8 (1.0.0-pre)

> [!NOTE]
> Regenerating `.d.ts` files in your project will help you a lot to fix most errors caused by the broken changes below.
> Old annotations still work temporarily in this version, please update your codes before the next version.

* All annotations are moved into `godot.annotations` module (from `jsb.core`). 
* `GLOBAL_GET` and `EDITOR_GET` are moved into `godot` module (from `jsb.core`).
* `callable()` is removed from `jsb.core`, use `Callable.create` in `godot` module instead.
* `to_array_buffer()` is removed from `jsb.core`, use `PackedByteArray.to_array_buffer()` instead.
* `$wait` is removed from `jsb.core`, use `Signal<..., R>.as_promise()` instead.
