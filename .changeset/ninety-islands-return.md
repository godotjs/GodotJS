---
"@godot-js/editor": patch
---

fix: .ts/.js files not included in game export

Exporting GodotJS games was fundamentally broken by
a Godot engine change which altered the way .skip()
behaved on exported files. Basically, we were skipping
.ts files because we don't want them in the export,
only .js files which we added as extra files. However,
the change to skip's behavior meant extra files are
also skipped. Instead .ts files are now remapped to
the .js file, not skipped. The result is as
previously intended i.e. only .js files ship.
