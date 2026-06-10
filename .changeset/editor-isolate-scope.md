---
"@godot-js/editor": patch
---

**Fix:** Enter the V8 isolate and context scopes before editor codegen compile to stop a SIGSEGV on batch reimport.
