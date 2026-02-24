---
"@godot-js/editor": patch
---

**Fix:** Disable closure compiler for web debug templates so browser DevTools are usable for debugging web exports. Release templates still use closure compiler.

**Fix:** Add Godot 4.6 compatibility guards for `ClassDB::get_class_list` signature change, `VariantHasher` removal, and `has_named_classes()` virtual removal.
