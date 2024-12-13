
# Worker

## Limitations (Currently): 
* Can not use script classes (GodotJSScript) in workers 
* `transferable objects` are not supported
* `onerror` event is not implemented

## A Simple Example

```ts
// tests/master.ts
// ...

let worker = new Worker("tests/worker");
worker.onmessage = function (m: any) {
    console.log("master: get message", m);
    worker.terminate();
}
worker.postMessage("hello");
```

```ts
// tests/worker.ts

onmessage = function (m: any) {
    console.log("worker: get message", m);
    postMessage("worker result");

    // worker can terminate itself by calling `close()`
    // close();
}

```

---

[Go Back](../README.md)
