
const Hidden = Symbol();

type ObjectID = number;
type ObjectType = number;

interface ObjectHidden {
    pointer: any;
    type: number;
}

type ObjectFinalizerData = { id: ObjectID, hidden: ObjectHidden };
type ObjectFinalizer = (id: ObjectID) => void;

export interface InteropApi {
    UTF8ToString(ptr: any): string;
    jsb_web_invoke_gc_callback(fn: any, ptr: any): void;
};

// FinalizationRegistry:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry

class ObjectDB {
    items: Array<WeakRef<any>>;
    freeslots: Array<number>;

    constructor() {
        this.items = [];
        this.freeslots = [];
    }

    add(o: any) {
        const available = this.freeslots.length - 1;
        let id: ObjectID;
        if (available >= 0) {
            id = this.freeslots[available];
            this.freeslots.length = available;
            this.items[id] = new WeakRef(o);
        } else {
            id = this.items.length;
            this.items.push(new WeakRef(o));
        }
        return id;
    }

    get(id: ObjectID): any {
        return this.items[id].deref();
    }

    remove(id: ObjectID) {
        this.items[id] = <any>null;
        this.freeslots.push(id);
    }
}

class Stack {
    private values: Array<any> = [];

    get(index: number) {
        return this.values[index];
    }

    // return stack pos
    push(val: any): number {
        const index = this.values.length;
        this.values.push(val);
        return index;
    }

    pop(n = 1) {
        this.values.length -= n;
    }
}

let API: InteropApi;
export class Engine {
    finalizers: Array<number>;
    objects: ObjectDB;
    gc_watch: FinalizationRegistry<any>;

    constructor() {
        console.log("new engine");
        this.finalizers = [];
        this.objects = new ObjectDB();
        this.gc_watch = new FinalizationRegistry((data: ObjectFinalizerData) => {
            this.objects.remove(data.id);
            API.jsb_web_invoke_gc_callback(this.finalizers[0], data.hidden.pointer);
        });
    }

    static init(api: InteropApi) {
        API = api;
    }

    set_finalizer(cb: any) {
        this.finalizers.push(cb);
    }

    drop() {
        console.log("drop engine");
    }

    eval(ptr: number) {
        eval(API.UTF8ToString(ptr));
    }

    new_binding_object(pointer: any) {
        const type = 0;
        const hidden: ObjectHidden = {
            pointer: pointer,
            type: type,
        };
        const o = { [Hidden]: hidden, };
        const object_id = this.objects.add(o);
        this.gc_watch.register(o, { id: object_id, hidden: hidden, });
        return object_id;
    }

    get_binding_object(object_id: number) {
        return this.objects.get(object_id)[Hidden].pointer;
    }
}

