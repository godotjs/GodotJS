"use strict";
// FinalizationRegistry:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
class JSRuntime {
    constructor() {
        this.finalizers = [];
        this.gc_watch = new FinalizationRegistry((data) => {
            const finalizer = this.get_finalizer(data.type);
            if (typeof finalizer === "function") {
                finalizer(data.id);
            }
        });
    }
    destroy() {
        this.finalizers.splice(0);
    }
    get_finalizer(type) {
        throw new Error("not implemented:  get_finalizer");
    }
    trace_object(obj, id, type) {
        //...
        this.gc_watch.register(obj, { id: id, type: type });
    }
}
