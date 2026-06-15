---
"@godot-js/editor": patch
---

**Fix:** Serialize V8 platform init and isolate creation across threads so shadow/worker environments created concurrently no longer race V8's first-time lazy mutex init and crash.
