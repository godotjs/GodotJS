---
"@godot-js/editor": patch
---

**Feature:** Godot String methods now exposed as static methods on `String`.

This doesn't change anything about how strings are used within
JavaScript i.e. we're still using JS native string type, not
Godot's String. However, Godot's String class has many utility
functions, some of them static and some of them as instance
methods. These are now all available for consumption in JavaScript.
Godot String instance methods are mapped to static methods that
take a `target: string` as their first parameter.

In general, if there's an equivalent native JS string method, you
should always use it instead since it will be much more performant.
