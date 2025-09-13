---
"@godot-js/editor": patch
---

**Feature:** Introduced settings to ensure dependencies are included in exported builds.

- "Referenced Node Modules" can be enabled to package an _entire_ node module when any file belonging to that module is referenced.
- "Include directories" is another setting that allows you to explicitly add additional directories you want included in your exported builds.
