---
"@godot-js/editor": patch
---

**Types:** ResolveNodePathMap utility type.

This type makes it easier to dynamically define your own `NodePathMap` types derived from generated SceneNodes.

It's also useful for creating Node scripts that don't live at the top level of a scene e.g.

```ts
export default class Table extends Node3D<ResolveNodePathMap<SceneNodes['scenes/example/table.tscn'], 'Table'>> {
    // ...
}
```

The above assumes a `Table` node exists as a child of the root in scenes/example/table.tscn. Now
`this.get_node`/`this.getNode` will auto-complete (and provided types for) children of `Table`.
