---
"@godot-js/editor": patch
---

fix: exported property hint_string regression w/ camel-case bindings

This was causing enums, ranges etc. to display incorrectly in the Godot Editor.