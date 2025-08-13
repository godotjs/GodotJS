---
"@godot-js/editor": patch
---

**Fix:** Ensure usercode triggered from `get('prop')`/`set('prop')` does not crash the process, JS runtime errors are caught and logged.
