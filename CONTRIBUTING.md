# Contributing

## Installation

- Clone the source code of [godot](https://github.com/godotengine/godot):
  - `git clone git@github.com:godotengine/godot.git` or
  - `git clone https://github.com/godotengine/godot.git`
- This branch uses version `4.4` so checkout the version with: `git checkout 4.4`
- Clone this module and put it into `godot/modules/GodotJS`:
  - `git clone git@github.com:godotjs/GodotJS.git godot/modules/GodotJS` or
  - `git clone https://github.com/godotjs/GodotJS.git godot/modules/GodotJS`
- Download the prebuilt v8 from [GodotJS-Dependencies](https://github.com/ialex32x/GodotJS-Dependencies/releases):
  - `curl https://github.com/ialex32x/GodotJS-Dependencies/releases/download/v8_12.4.254.21_r13/v8_12.4.254.21_r13.zip --output your/download/path/v8.zip`
  - `7z x -o "YourGodotEngineSource/modules/GodotJS" your/download/path/v8.zip`
- [Recompile the godot engine](https://docs.godotengine.org/en/4.4/development/compiling/index.html)
  - Windows: `scons platform=windows`
  - MacOS: `scons platform=macos arch=arm64`
  - **Hint**: To enable unit tests you need to add `tests=true` to `scons` arguments

## Project Structure

```
┗━ godot
    ┗━ modules
        ┣━ ...
        ┣━ gltf
        ┣━ GodotJS
        ┃    ┣━ bridge
        ┃    ┣━ compat
        ┃    ┣━ docs
        ┃    ┣━ impl
        ┃    ┣━ internal
        ┃    ┣━ lws
        ┃    ┣━ quickjs
        ┃    ┣━ quickjs-ng
        ┃    ┣━ scripts
        ┃    ┣━ tests
        ┃    ┣━ v8
        ┃    ┃   ┣━ include
        ┃    ┃   ┣━ linux.x86_64.release
        ┃    ┃   ┣━ macos.arm64.release
        ┃    ┃   ┣━ windows_x86_64_release
        ┃    ┃   ┗━ ...
        ┃    ┣━ weaver
        ┃    ┗━ weaver-editor
        ┣━ gridmap
        ┣━ ...
```

## Preparing your PR

Before submitting your PR add a [Changeset](https://github.com/changesets/changesets) entry:

- From the root, run `pnpm run changeset` and follow the CLI instructions
- You can add a full description of your change in Markdown format
