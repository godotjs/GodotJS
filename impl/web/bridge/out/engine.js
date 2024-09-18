"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const Hidden = Symbol();
;
// FinalizationRegistry:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
class ObjectDB {
    constructor() {
        this.items = [];
        this.freeslots = [];
    }
    add(o) {
        const available = this.freeslots.length - 1;
        let id;
        if (available >= 0) {
            id = this.freeslots[available];
            this.freeslots.length = available;
            this.items[id] = new WeakRef(o);
        }
        else {
            id = this.items.length;
            this.items.push(new WeakRef(o));
        }
        return id;
    }
    get(id) {
        return this.items[id].deref();
    }
    remove(id) {
        this.items[id] = null;
        this.freeslots.push(id);
    }
}
let API;
class Engine {
    constructor() {
        console.log("new engine");
        this.finalizers = [];
        this.objects = new ObjectDB();
        this.gc_watch = new FinalizationRegistry((data) => {
            this.objects.remove(data.id);
            API.invoke_gc_callback(this.finalizers[0], data.hidden.pointer);
        });
    }
    static init(api) {
        API = api;
    }
    set_finalizer(cb) {
        this.finalizers.push(cb);
    }
    drop() {
        console.log("drop engine");
    }
    eval(ptr) {
        eval(API.UTF8ToString(ptr));
    }
    new_binding_object(pointer) {
        const type = 0;
        const hidden = {
            pointer: pointer,
            type: type,
        };
        const o = { [Hidden]: hidden, };
        const object_id = this.objects.add(o);
        this.gc_watch.register(o, { id: object_id, hidden: hidden, });
        return object_id;
    }
    get_binding_object(object_id) {
        return this.objects.get(object_id)[Hidden].pointer;
    }
}
exports.Engine = Engine;
