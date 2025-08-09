---
"@godot-js/editor": patch
---

**Feature:** New decorator syntax for exporting properties.

TC39 (JavaScript standard body) have progressed a new decorator
syntax to Stage 3, and TypeScript 5.0 implemented support. The new
syntax is not quite as flexible but is type-safe and will be
more performant when implemented directly in JS engines.
Consequently, all existing decorators have deprecated (but
remain for backwards compatibility). In their place a new API,
`createClassBinder`, has been introduced.

Our default `tsconfig.json` has been updated to turn off legacy
decorators, unlocking access to the newer syntax. You cannot use
both at once. Both sets of decorators contain warnings if used
with in incompatible tsconfig.

The new decorator syntax looks something like:

```
const bind = createClassBinder();

@bind()
@bind.tool()
export default class Player extends CharacterBody2D {
  @bind.export.cache()
  @bind.export.object(SceneSynchronizer)
  accessor synchronizer!: SceneSynchronizer;

  @bind.export.cache()
  @bind.export(Variant.Type.TypeInt)
  accessor walkSpeed: number = 350;

  @bind.export.cache()
  @bind.export(Variant.Type.TypeInt)
  accessor dashSpeed: number = 1000;

  @bind.export(Variant.Type.TypeInt)
  accessor dashCooldownMs: number = 500;

  @bind.export.enum(Direction)
  accessor facing = Direction.Down;

  @bind.export(Variant.Type.TypeInt)
  accessor useCooldownMs: number = 500;
}
```

A few key points:

1. You must create a ClassBinder using createClassBinder().
   This is a function and contains properties/APIs on it.
   You can use any variable name, but the convention I'll be
   using going forward is to use a variable named `bind`.
2. The decorator APIs are all functions that return a decorator
   i.e. It's `@bind()` and `@bind.export.cache()` not `@bind`
   or `@bind.export.cache`.
3. We're using JavaScript's new/upcoming auto-accessor syntax.
   This is not a requirement for all decorators, but not all
   decorators (e.g., the new cache() decorator) are supported
   on fields.
4. The new cache decorator enables caching of variants on the
   Godot side of the JS <-> Godot bridge.
   The decorator generates a `set` accessor that updates the cache
   automatically whenever a value is assigned to the JS property.
   The purpose of the cache is that is provides a fairly sizeable
   performance improvement when using Godot's general purpose
   .get("property_name") method. This is particularly useful if
   you want to expose data to performance sensitive GDExtensions.
5. The order of decorators matters!
   Decorators are evaluated "inside->out" and class decorators are
   evaluated after all property decorators. `bind()` MUST be
   executed AFTER all other decorators. The `@bind.export.cache()`
   decorator MUST be evaluated AFTER the property export.
