
# Worker

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
