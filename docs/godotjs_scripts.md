
# GodotJS Scripts
A javascript class can extend a Godot Object class:

> This example is written in TypeScript.

```ts
import { Node, Signal } from "godot";
import { signal_ } from "./jsb/jsb.core";

export default class MyJSNode extends Node {
    @signal_()
    test!: Signal;

    constructor() {
        super();
        console.log("my js node class");

        this.test.connect(jsb.callable(this, this._on_test), 0);
        this.test.emit();
        this.test.disconnect(jsb.callable(this, this._on_test));
    }

    private _on_test() {

    }

    _ready() {
        console.log("MyJSNode _ready");
    }

}
```

> [!NOTE]
> The class must be exported as `default`, otherwise the script will not recognized as Godot class extension.

Compile the typescript source into javascript, and attach the compiled script to a Node:

![attach a script](./assets/attach_script.png)

## Exported Variables
WRITE SOMETHING HERE

## Signals
WRITE SOMETHING HERE

## Reloading
WRITE SOMETHING HERE
