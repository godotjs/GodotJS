---
"@godot-js/editor": patch
---

**Types:** Godot/GDScript best effort typing for nullability of Object types.

Although they're technically nullable everywhere (Ref<> in C++),
many APIs won't ever return to `null`. Unfortunately, properties do
not have flags to tell us this, so we are making best effort guesses
as follows:

- Getters/setters are nullable.
- Function return types are nullable, unless the function name
  starts with `"create"`.
- Function arguments are non-nullable.

This seems to be a reasonable starting point, and we will continue to manually tweak
types from here.
