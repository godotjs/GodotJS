
// FinalizationRegistry:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry

type ObjectID = number;
type ObjectType = number;

type ObjectFinalizerData = { id: ObjectID, type: number };
type ObjectFinalizer = (id: ObjectID) => void;

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

