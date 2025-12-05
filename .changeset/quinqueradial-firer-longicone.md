---
"@godot-js/editor": patch
---

fix: exported properties no longer leak into the base class.
feat: inherited properties now class categorized in the Editor.

Previously sub-classes were reusing the same [[ClassProperties]]
and [[ClassSignals]] as super classes. Thus sub-classes were
exporting properties against super-classes. This also meant that
classes with a shared parent were receiving each others'
properties. Each class no longer looks up the prototype chain
for these objects.

Consequently, to ensure properties are exported and appear in the
Editor, we now recurse in a similar fashion to GDScript.
Fortunately, we don't need to worry about the cycle detection
logic that GDScript implements, since TypeScript handles this for
us and cycles won't compile. Added benefit is now that properties
appear in the editor categorized appropriately by class.
