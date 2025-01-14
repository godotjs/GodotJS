
# Signals

Leveraging TypeScript's strong type checking, when you connect an incorrect callable object to a signal, the code editor will directly prompt you about the error.

![strongly_typed](./assets/strongly_typed_01.png)

## Callable

`Callable.create` returns a `Callable` object.  

> [!NOTE]
> Since `v0.9.8`, the function `callable` from module `godot-jsb` is deprecated. 
> Please directly use the static function `create` in `Callable` from module `godot`.

> [!WARNING]
> Please be cautious that `Callable.create(this, this.xxx) === Callable.create(this, this.xxx)` returns `false`.   
> But it's compared internally in C++ to check equality when using them for `connect` and `disconnect`.

```ts
import { Node, Callable } from "godot";

class MyClass extends Node {
    foo() {
        // subscribe
        this.onclick.connect(Callable.create(this, this.handle_onclick), 0);

        // unsubscribe
        this.onclick.disconnect(Callable.create(this, this.handle_onclick));
    }
}
```

> [!WARNING]
> `Callable` does not hold a strong reference on `this` which given as the first parameter. It becomes invalid after the corresponding javascript object is garbage collected.  
> **HOWEVER**, it may cause object leaks if `this` is captured in a lambda function. So avoid coding in this way `Callable.create(this, () => this.xxx())`.

## Await a Signal

`Signal` can be awaitable in javascript by calling `as_promise()`:

```ts
import { Node, Signal1 } from "godot";
import { signal } from "godot.annotations";

class ExampleClass extends Node {
    @signal()
    test_signal!: Signal1<number>;

    _ready() {
        test();
    }

    async test() {
        console.log("before signal emit");
        // result is 123
        const result = await this.test_signal.as_promise(); 
        console.log("after signal emit", result);
    }

    emit_somehow() {
        this.test_signal.emit(123);
    }
}
```


---

[Go Back](../README.md)
