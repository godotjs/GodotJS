
// FinalizationRegistry:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry

type ObjectID = number;
type ObjectType = number;

type ObjectFinalizerData = { id: ObjectID, type: number };
type ObjectFinalizer = (id: ObjectID) => void;

interface ObjectReference {
    target: any;
    rc: number;
}

class ReferenceCollector {
    items: Array<ObjectReference> = [];
    freelist: Array<number> = [];

    add(target: any): number {
        let oc: ObjectReference;
        let index: number = this.freelist.length - 1;
        if (index >= 0) {
            oc = this.items[this.freelist[index]];
            oc.target = target;
            oc.rc = 1;
            this.freelist.length = index;
        } else {
            oc = { target: target, rc: 1 };
            index = this.items.length;
            this.items.push(oc);
        }
        return index;
    }

    remove(index: number): void {
        const oc = this.items[index];
        if (--oc.rc == 0) {
            oc.target = undefined;
            this.freelist.push(index);
        }
    }
}

class JSRuntime {
    finalizers: Array<Function>;
    gc_watch: FinalizationRegistry<any>;

    constructor() {
        this.finalizers = [];
        this.gc_watch = new FinalizationRegistry((data: ObjectFinalizerData) => {
            const finalizer = this.get_finalizer(data.type);
            if (typeof finalizer === "function") {
                finalizer(data.id);
            }
        });
    }

    destroy() {
        this.finalizers.splice(0);
    }

    private get_finalizer(type: ObjectType): ObjectFinalizer {
        throw new Error("not implemented:  get_finalizer");
    }

    trace_object(obj: Object, id: ObjectID, type: ObjectType) {
        //...

        this.gc_watch.register(obj, { id: id, type: type });
    }
}

