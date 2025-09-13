---
"@godot-js/editor": patch
---

**Fix:** Improved TypeScript class matching regex.

It was failing in the presence of generics which contain an `extends`
clause e.g.

```ts
export default class GameNode<Map extends Record<string, Node> = {}> extends Node3D<Map>
```

The regex will now look for the last `extends` on the line in order
to detect the base class. This is only an improvement, it's not
fool-proof and will fail if the base class has a generic that
contains a conditional type expression. Since we only have access
to PCRE2, this is probably the best we can do with just regex.
