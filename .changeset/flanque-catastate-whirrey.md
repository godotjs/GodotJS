---
"@godot-js/editor": patch
---

**Feature:** `GDictionary`/`GArray` recursive handling and `toJSON()`/`toString()`

`GArrayProxy` (now a named type) will now JSON encode like a regular
JS array i.e. `[1,2,3]` instead of `{"0": 1, "1": 2, "2": 3}`.

We previously ensured that values accessed via a proxy were
themselves proxied. Thus allowing access to nested properties
via chained access e.g. dict_proxy.a.b. However, when setting or
inserting a proxy-wrapped value, we previously inserted the proxy
itself, rather than the wrapped target. This has now been rectified,
it's not safe to do something like:

```ts
const a = new GDictionary().proxy();
a.b = new Dictionary().proxy();
```

The above will result in a `GDictionary` containing a `b`
property that is an empty `GDictionary`.
