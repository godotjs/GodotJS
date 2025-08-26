---
"@godot-js/editor": patch
---

**Fix:** Make Variant constants (e.g., `Vector3.ZERO`) Readonly<> so they can't (easily) be accidentally mutated.
