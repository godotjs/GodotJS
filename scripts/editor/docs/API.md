# API - @godot-js/editor

Manages GodotJS editor

> You can use `godot-js.json` as a config file. 
  By default it tries to search for the configuration otherwise use a correct path by passing `--config=./godot-js.json`.

## build

Build game with export templates

| long             | short | description                                                      | required | defaultValue  |
| :--------------- | :---: | :--------------------------------------------------------------- | :------: | :------------ |
| `--tsConfigPath` |       | Relative path where tsconfig.json is located                     |    `❌`   | `"."`         |
| `--dry`          |       | Do a dry run with this command - prints/returns output           |    `❌`   |               |
| `--rootPath`     |       | Root path for your project                                       |    `❌`   | `"."`         |
| `--editorPath`   |       | Relative path from root where editor is downloaded               |    `❌`   | `"./.editor"` |
| `--buildPath`    |       | Relative path from root where build is written                   |    `❌`   | `"./build"`   |
| `--buildType`    |       | If the export should use the debug or release template           |    `❌`   | `"release"`   |
| `--preset`       |       | The name of the preset which should be build otherwise build all |    `❌`   |               |

## dev

Start TypeScript compilation and opens editor

| long             | short | description                                            | required | defaultValue  |
| :--------------- | :---: | :----------------------------------------------------- | :------: | :------------ |
| `--tsConfigPath` |       | Relative path where tsconfig.json is located           |    `❌`   | `"."`         |
| `--dry`          |       | Do a dry run with this command - prints/returns output |    `❌`   |               |
| `--rootPath`     |       | Root path for your project                             |    `❌`   | `"."`         |
| `--editorPath`   |       | Relative path from root where editor is downloaded     |    `❌`   | `"./.editor"` |

## init

Creates a new GodotJS project with TypeScript support

| long              | short | description                                                   | required | defaultValue            |
| :---------------- | :---: | :------------------------------------------------------------ | :------: | :---------------------- |
| `--name`          |       | The name of your project                                      |    `✅`   | `"my-game"`             |
| `--out`           |       | Relative path where project is written                        |    `❌`   | `"."`                   |
| `--forceDelete`   |       | Removes project dir if it's already there                     |    `❌`   |                         |
| `--dry`           |       | Do a dry run with this command - prints/returns output        |    `❌`   |                         |
| `--buildPath`     |       | Relative path from root where build is written                |    `❌`   | `"./build"`             |
| `--editorPath`    |       | Relative path from root where editor is downloaded            |    `❌`   | `"./.editor"`           |
| `--templatesPath` |       | Relative path from root where export templates are downloaded |    `❌`   | `"./.editor/templates"` |

## prepare

Downloads editor and export templates

| long                | short | description                                                   | required | defaultValue            |
| :------------------ | :---: | :------------------------------------------------------------ | :------: | :---------------------- |
| `--dry`             |       | Do a dry run with this command - prints/returns output        |    `❌`   |                         |
| `--godotVersion`    |       | The version for the Godot editor                              |    `❌`   | `"4.5"`                 |
| `--editorJSEngine`  |       | The version for the JavaScript engine                         |    `❌`   | `"v8"`                  |
| `--exportTemplates` |       | An array of export templates to download                      |    `❌`   |                         |
| `--gitTag`          |       | Change to another gitTag for download                         |    `❌`   |                         |
| `--editorPath`      |       | Relative path from root where editor is downloaded            |    `❌`   | `"./.editor"`           |
| `--templatesPath`   |       | Relative path from root where export templates are downloaded |    `❌`   | `"./.editor/templates"` |
| `--rootPath`        |       | Root path for your project                                    |    `❌`   | `"."`                   |

