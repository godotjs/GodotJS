
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

Godot `Variant` values are automatically translated to the primitive types in javascript if available.

| Variant Type in Godot | Counterpart in JS | Caveats |
|---|---|---|
| NIL | `any` | `NIL` used as a type stands for any variant type parameter in Godot |
| INT | `number` | `INT` is represented as `int64` in Godot, therefore only values less than the max value of int32 can be translated without loss. |
| FLOAT | `number` |  |
| STRING | `string` |  |
| STRING_NAME | `string` |  |

All variant types not mentioned above are exposed as `class` in javascript (such as `Vector2` `Vector3` `PackedStringArray` etc.).

> [!NOTE] 
> All primitive types which represented as `Variant` are pooled in `Environment` if `JSB_WITH_VARIANT_POOL` is enabled to reduce unnecessary cost on repeatedly memory allocation.

## Pitfalls

The javascript class variant values behave like value type when passing between `JS` and `C++`, they are **NOT** by-reference. But in pure javascript, they are still by-reference.

```ts
let value = new Vector3();

// Input get a copy of the value since it's implemented in C++
Input.set_gyroscope(value); 

function modify(v: Vector3) {
    v.x = 1;
}

// after this statement, `value.x` will be 1, since value itself is passed by-reference
modify(value); 

// node.position is NOT modified, since `node.position` is actually a getter implemented in C++ which returns a copy of it.
modify(node.position); 

```


And, avoid coding property assignments like this: `node.position.x = 0;`, although, it works in GDScript.

**It's not an error in javascript (which is more DANGEROUS)**, the actually modifed value is just a copy of `node.position`.

## StringName

`StringName` optimization is completely transparent in javascript. When passing `StringName` parameters, a mapping between `StringName` and `v8::String` will be automatically cached to avoid repeatedly allocation of new `v8::String` objects and Godot `Variant` objects.

```ts
import { Input, Node2D } from 'godot';

class MyActor extends Node2D {
    _process() {
        // so it's relatively lightweight to directly use a string here
        if (Input.is_action_just_pressed("confirm")) {
            // ...
        }
    }
}

```

## Packed Array (`Vector<T>`)

If `JSB_IMPLICIT_PACKED_ARRAY_CONVERSION` is defined as `true`, `Packed Array` will be implicitly converted from javascript `Array`.

```ts
let a1 = new PackedStringArray();
let a2 = new PackedStringArray();
a2.append("test2");

a1.append_array(["hey", "there"]); // implicit, it will fail if `JSB_IMPLICIT_PACKED_ARRAY_CONVERSION` is `0`
a1.append_array(a2); // explicit

// To get value from PackedArray use `get_indexed`
a1.get_indexed(2);

// To set value in PackedArray use `set_indexed`
a1.set_indexed(2, "new value");

let b1 = new PackedByteArray();
b1.append_array([20, 1, 6, 5]); 

// ArrayBuffer is implicitly treated as PackedByteBuffer even if `JSB_IMPLICIT_PACKED_ARRAY_CONVERSION` is `0`
// See `PackedByteArray and ArrayBuffer`
b1.append_array(new ArrayBuffer(16)); 
```

### PackedByteArray and ArrayBuffer

A javascript `ArrayBuffer` can be used as a `PackedByteArray` implicitly.

```ts
let file = FileAccess.open(filePath, FileAccess.ModeFlags.WRITE);
let buffer = new ArrayBuffer(16);
let view = new Uint8Array(buffer);

view.fill(0);
file.store_buffer(buffer);
```

But reversely, `PackedByteArray.to_array_buffer` is required to get an `ArrayBuffer` from `PackedByteArray`.

```ts
let packed = FileAccess.get_file_as_bytes("res://something.txt");

// 'packed' is a `PackedByteArray`
console.log(packed.size()); 

// 'buffer' is a `ArrayBuffer`
let buffer = packed.to_array_buffer(); 
console.log(buffer.byteLength);
```


---

[Go Back](../README.md)
