---
"@godot-js/editor": patch
---

**Feature:** Optionally embed an SWC-based TypeScript transpiler as a Rust staticlib and load `.ts` modules directly by transpiling them in-process. Opt-in via the `use_typescript_transpiler=yes` build flag (off by default; the default build is unchanged and needs no Rust toolchain).
