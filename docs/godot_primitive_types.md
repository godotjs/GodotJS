
# Godot Primitive Types

All primitive types which represented as `Variant` are pooled in `Environment` if `JSB_WITH_VARIANT_POOL` is enabled to reduce unnecessary cost on repeatedly memory allocation.

## StringName

`StringName` optimization is completely transparent in javascript. When passing `StringName` parameters, a mapping between `StringName` and `v8::String` will be automatically cached to avoid repeatedly allocation of new `v8::String` objects and Godot `Variant` objects.

```ts
import { Input, Node2D } from 'godot';

class MyActor extends Node2D {
    _process() {
        // so it's relatively lightweight to directly use a string here
        if (Input.is_action_just_pressed("confirm", true)) {
            // ...
        }
    }
}

```
