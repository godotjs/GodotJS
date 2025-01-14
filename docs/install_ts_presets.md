
Install Preset files with `Godot Editor` menu item `Project > Tools > GodotJS > Install Preset files`.
> All `jsb` premade configurations/scripts will be generated at the root of the project (`res://`).
> `d.ts` files of godot classes will also be generated at the same time.

> [!NOTE] 
> `typescript` is required to compile all typescript sources, `npm i` is needed to be run before writing your scripts.

Since the `d.ts` files for godot classes are generated in the TS project, `IntelliSense` works perfectly in VSCode for better coding efficiency.

![intellisense](./assets/vscode_intellisense.png)

Install javascript packages:
```sh
cd YourGodotProject/
npm i
```

Write and compile your typescript sources:
```sh
cd YourGodotProject/
# remove the option `-w` if no continuous compilation required
npx tsc -w
```


---

[Go Back](../README.md)
