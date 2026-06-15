---
"@godot-js/editor": patch
---

**Feature:** Pre-transpile `.ts` sources via SWC at export time so exported builds need no `tsc`, and drop the hard `tsc`-install gate on the editor Start button. On export targets without the embedded transpiler (web/mobile), the runtime now resolves a `.ts` module to its pre-transpiled `.js` sibling, so autoloads and direct `.ts` script references load correctly instead of failing with "cannot load .ts at runtime".
