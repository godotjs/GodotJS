---
"@godot-js/editor": patch
---

**Fix:** Editing a script on disk now reloads script-bearing modules and rebinds live `GodotJSScript` instances. `scan_external_changes()` no longer skips script modules, cascades the reload through transitive dependents, and resets `module.exports` so ES-module-style default exports survive a second run.
