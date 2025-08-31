---
"@godot-js/editor": patch
---

**Feature:** Native object now guaranteed bound during JS initializaation.

Previously, when a JS class was being instantiated for an existing
native Godot object (e.g. ResourceLoader.load('...')) the JS
instance wasn't actually being bound to the native Godot object
until _after_ the JS instance was constructed/initialized. This
created a problem in which field/property initializers and the
constructor were unable to call any native functions, but could
call JS functions.

Now, the Godot object is always bound to our instantiated object
as part of our Godot native class constructor. Thus, we can now
safely call methods during initialization. Importantly, this also
fixes TC39 Stage 3 decorator `@bind.signal()` support for fields.
