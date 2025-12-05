---
"@godot-js/editor": patch
---

**Types:** "Generate Godot d.ts" in the UI is now "Generate types" and in addition to
generating all Godot and project types (which it already did), the
autogen directory will now be wiped of all files/directories before
commencing generation. This ensures old generated files no longer
pollute the project.


