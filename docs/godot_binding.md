
# Bindings of Godot Type

All godot types (Object & Primitive) are defined in the built-in module `godot` in javascript. Most of them are lazily loaded until actually used in scripts.

# Godot Object Types

## Enum

Godot enums are exposed in javascript as `enum`, and the underlying constant values which already defined in enums are eliminated from bindings.

> [!NOTE] 
> The name of enum value can be retrieved by reading from enum type with the value as the key.  

For example:
```ts
import { Image } from "godot";

// read enum value from the nested enum in class
let mode: Image.AlphaMode = Image.AlphaMode.ALPHA_NONE;

// can not read enum constant value from class
// Image.ALPHA_NONE is not defined in GodotJS.

// this statement prints '0'
console.log(mode); 

// this statement prints 'ALPHA_NONE'
console.log(Image.AlphaMode[mode]);
```

# Godot Primitive Types (Variant)

`Variant` values in C++ are automatically translated to the underlying primitive types in javascript. (such as `Vector2` `Vector3` `PackedStringArray` etc.).

| Variant Type in Godot | Counterpart in JS | Caveats |
|---|---|---|
| NIL | `any` | `NIL` used as a type stands for any variant type parameter in Godot |
| INT | `number` | `INT` is represented as `int64` in Godot, therefore only values less than the max value of int32 can be translated without loss. |
| FLOAT | `number` |  |
| STRING | `string` |  |
| STRING_NAME | `string` |  |

All variant types not mentioned above are exposed as `class` in javascript.

> [!NOTE] 
> All primitive types which represented as `Variant` are pooled in `Environment` if `JSB_WITH_VARIANT_POOL` is enabled to reduce unnecessary cost on repeatedly memory allocation.

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

---

[Go Back](../README.md)
