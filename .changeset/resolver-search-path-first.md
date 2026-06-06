---
"@godot-js/editor": patch
---

**Fix:** Bare module specifiers now resolve against configured search paths before the parent-relative `node_modules` walk, so curated pre-bundled deps in `.godot/GodotJS/<dep>.js` win over raw CJS reached via the symlink chain.
