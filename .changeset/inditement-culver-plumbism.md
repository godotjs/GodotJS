---
"@godot-js/editor": patch
---

**Fix:** Don't crash when a GodotJS class implementation's parent class does not match the attached node.

Instead, we log an error and prevent the script from being instantiated.
