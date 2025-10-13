---
"@godot-js/editor": patch
---

fix: Background/async resource loading where scripts are present.

Shadow script instance replacement was failing due to calling the
wrong GodotJSScript::instance_create() overload. The overloads
have been replaced with separate functions to mitigate future
occurrences.

Additionally, shadow script instance replacement was not properly
handling user types, only built-ins. This broke in a subtle hard
to debug fashion, whereby you received back a valid JS class
instance for the expected Godot object, however its prototype
chain was incomplete. The JS object was an instance of the base
Godot native object rather than the script on the object.
