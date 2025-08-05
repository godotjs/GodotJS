---
"@godot-js/editor": patch
---

**Fix:** Bind script instance during default prop evaluation.

If properties are implemented in JavaScript as properties (getters)
they'll often want to call Godot methods on self. Without the
script instance being bound this led to a crash.
