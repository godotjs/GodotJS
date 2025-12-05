---
"@godot-js/editor": patch
---

**Feature:** Improved user project type configurability.

- Codegen for scenes and resources now default to being stored in
  `gen/types` rather  than `typings/`. However, a setting has been
  introduced to configure this. `typings/` is no longer used
  because the directory is configured as a type root, which means
  directories contained within are expected to be module
  definitions.
- `"types": ["node"]` in the default tsconfig was hiding type errors.
  This is no longer set. Essentially, this setting was disabling
  all types except node types from our type roots.
- `@types/node` removed from the default `package.json`. It was
  misleading and made it easy to accidentally use non-existent
  functionality. We no longer need these types because...
- Our JS essentials (console, timeout and intervals APIs) are now
  included in our `godot.minimal.d.ts`.
- No longer including `<reference no-default-lib=true/>` in our TS
  files. This seemed to be interfering with user tsconfig options,
  and it was not required. Not that it's been removed you're able to
  more freely make changes to your tsconfig. For example, you may set
  `libs` (or `target`) to make use of newer JS APIs.
