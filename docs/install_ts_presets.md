
Install TS project presets with `Godot Editor` menu item `Project > Tools > GodotJS > Install TS Project`.
> All `jsb` premade config/scripts will be generated at `res://typescripts` and `res://javascripts` (the location will be configurable in a future version).
> `d.ts` files of godot classes will also be generated at the same time.

> **NOTE** The directory `typescripts` is automatically ignored in `Godot Editor`. Edit typescript source from the `typescripts` directory with any code editor (like VSCode).

Since the `d.ts` files for godot classes are generated in the TS project, `IntelliSense` works perfectly in VSCode for better coding efficiency.

![intellisense](./assets/vscode_intellisense.png)

Install javascript packages:
```sh
cd YourGodotProject/typescripts
npm i
```

Write and compile your typescript sources:
```sh
cd YourGodotProject/typescripts
# remove the option `-w` if no continuous compilation required
npx tsc -w
```
