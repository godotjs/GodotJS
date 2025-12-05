---
"@godot-js/editor": patch
---

**Types:** `get_tree()`/`getTree()` no longer types as returning `null`.

Although it _will_ return `null` when not inside a tree. This is a runtime error, with an error message
being logged i.e., you should not ever call this function expecting a `null` result.
