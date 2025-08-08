---
"@godot-js/editor": patch
---

**Feature:** Worker postMessage support for structured clone and transfer.

This enables bi-directional transfer of all Godot types between
workers and the host environment. The structured clone algorithm
uses referential equality of Variant rather than structural
equality. This both gives us a performance boost and also ensures
that if the same Variant is referred to in nested structures,
upon deserialization, these relationships will remain intact.

`JSWorkerParent.transfer()` is now deprecated since `postMessage` can
achieve the same and more.

As before, this is still a v8 only feature. I would say this makes
workers somewhat LESS experimental, but not yet stable.
