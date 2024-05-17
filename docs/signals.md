
# Signals

## Callable

`jsb.callable` returns a `Callable` javascript object.  

> [!WARNING]
> Please cautious that `jsb.callable(this, this.xxx) === jsb.callable(this, this.xxx)` returns `false`.   
> But it's compared internally in C++ to check equality when using them for `connect` and `disconnect`.

```ts
class MyClass extends Node {
    foo() {
        // subscribe
        this.onclick.connect(jsb.callable(this, this.handle_onclick), 0);

        // unsubscribe
        this.onclick.disconnect(jsb.callable(this, this.handle_onclick));
    }
}
```

> [!NOTE]
> `jsb.callable` does not hold a strong reference on `this` which given as the first parameter. It becomes invalid after the corresponding javascript object is garbage collected.  

> [!WARNING]
> However, it may cause object leaks if `this` is captured in a lambda function. So avoid coding in this way `jsb.callable(this, () => this.xxx())`.

## async/await

```ts
// draft
// not implemented
async function test() {
    await $(this.onclick); 
}

```
