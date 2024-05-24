
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

## Cyclic imports
Cyclic imports are allowed in `GodotJS` with some limits.

```ts
// file: cyclic_import_1.ts

import { CyclicClass2 } from "./cyclic_import_2";

// NOT OK: The behaviour is undefined if anything from cyclic imported modules is referenced in the script compile-run scope
// let a_name = CyclicClass2.something;

// NOT OK: extends a class from cyclic imported modules
// class BehaviorUndefined extends CyclicClass2 {}

// OK: references at runtime
export class CyclicClass1 {
    static call1() {
        console.log("call1");
        CyclicClass2.call2();
    }

    static call3() {
        console.log("call3");
    }
}
```

```ts
// file: cyclic_import_2.ts

import { CyclicClass1 } from "./cyclic_import_1";

export class CyclicClass2 {
    static call2() {
        console.log("call2");
        CyclicClass1.call3();
    }
}
```

## Exported Variables
WRITE SOMETHING HERE

## Signals
WRITE SOMETHING HERE

## Reloading
WRITE SOMETHING HERE
