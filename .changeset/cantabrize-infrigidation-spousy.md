---
"@godot-js/editor": patch
---

**Feature:** Constructor params support and GDScript compatible `new`

Support for `new` is very important for improving interop with
other scripting languages, allowing them to instantiate objects
from a Script reference. Crucially, this allows native
GDExtension to instantiate Nodes/Objects/Resources implemented
in GodotJS.

Object construction has been refactored. Previously we had three
cases to handle:

1. new SomeJSWrapperAroundAGodotObject() – JS construction
2. CDO (Class default object) construction - used to determine
   default parameters on a class (for use in the editor).
3. Cross binding. Which is when a Godot Object is constructed and
   our script latter needs to attach to it.

In the past, case 1 was the only situation in which instantiating
a JS class ought to also instantiate the Godot native object.
However, in my previous commit I changed CDOs so also instantiate
the underlying native object. So case 2 was eliminated.

Case 3 (cross binding) is a common situation, it was previously
implemented in a somewhat intrusive fashion. All JS objects were
being constructed and passed a parameter as their first argument.
This indicated whether the object was cross binding (or a CDO).
This prevented users from (easily) implementing constructors, the
user had to know about the internal parameter and pass this
up through to super(). For the most part I imagine users (myself
included) simply avoided using constructors. However, this
complicated some code that would otherwise be trivial in GDScript
or C# because the latter has constructors and the former _init.

Consequently, I've implemented a new strategy to determine whether
a constructor is being called from C++ (cross binding) or from JS.
The implementation is quite straight forward, but arriving at this
solution was not necessarily obvious. V8 doesn't expose APIs to
intercept construction, and we can't naively use shared flags
to mark a native constructor in progress because the solution
needs to support reentrancy since during construction an object
may instantiate other objects. Additionally, we can't just use
different constructors (V8 templates) because there's issues with
both sub-classing and `instanceof` detection.

The solution was to take advantage of JS' `Reflect.construct` API.
This allows us to call a constructor but have `new.target` set to
an arbitrary constructable. `new.target` survives whilst
traversing up through super() constructors (similar to how we
previously passed arguments up). This let's us mark a particular
instantiation as coming from C++. `Reflect.construct` instantiates
`this` to match the prototype chain from the provided `newTarget`
so we simply set it to the prototype of the original constructor
and we're on our way.

Using `Reflect.construct` is also standard JS, so it's available
on our support JS runtimes without needing to resort to any
runtime-specific code.
