
# GodotJS Scripts
A javascript class can extend a Godot Object class (like GDScript):

> This example is written in TypeScript.

```ts
import { Node, Signal } from "godot";
import { signal } from "./jsb/jsb.core";

export default class MyJSNode extends Node {
    @signal
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

Attach the compiled file to a Node:

![attach a script](./assets/attach_script.png)

## Exported Variables
TODO

## Signals
TODO

## Reloading
TODO
