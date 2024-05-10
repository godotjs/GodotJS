
# WRITE SOMETHING HERE

## StringName

Optimizing `StringName` is completely transparent. When passing `StringName` parameters, a mapping relationship between `StringName` and `v8::String` will be automatically cached to avoid repeatedly creating `v8::String` objects.

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
