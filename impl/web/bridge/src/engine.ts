
const Hidden = Symbol();

type ObjectID = number;
type ObjectType = number;

interface ObjectHidden {
    pointer: any;
    type: number;
}

type ObjectFinalizerData = { id: ObjectID, hidden: ObjectHidden };
type ObjectFinalizer = (id: ObjectID) => void;

type IntPtr = number;

export interface InteropProtocol {
    UTF8ToString(ptr: any): string;
    
    jsapi_invoke_gc_callback(fn: any, ptr: any): void;
    jsapi_call(isolate: IntPtr, fn: any, stack_depth: number, argc: number): void;
    jsapi_construct(isolate: IntPtr, fn: any, stack_depth: number, argc: number): void;
};

// FinalizationRegistry:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry

// index starts from 1
type UnsafeIndex = number;

class UnsafeArray<T> {
    items: Array<T>;
    freelist: Array<number>;

    constructor() {
        this.items = [];
        this.freelist = [];
    }

    Add(o: T): UnsafeIndex {
        const available = this.freelist.length - 1;
        let index: number;
        if (available >= 0) {
            index = this.freelist[available];
            this.freelist.length = available;
        } else {
            index = this.items.length;
        }
        this.items[index] = o;
        return index + 1;
    }

    Get(index: UnsafeIndex): T {
        return this.items[index - 1];
    }

    Remove(index: UnsafeIndex): T {
        const abs_index = index - 1;
        const o = this.items[abs_index];
        this.items[abs_index] = <any>undefined;
        this.freelist.push(abs_index);
        return o;
    }
}

type StackOffset = number;
type StackDepth = number;

// Stack for Locals
class Stack<T> {
    private frames: Array<number> = [];
    private values: Array<T> = [];

    // get frame value
    GetValue(depth: StackDepth, offset: StackOffset): T {
        const abs_depth = depth - 1;
        if (abs_depth < 0 || abs_depth >= this.frames.length) {
            throw new RangeError();
        }
        return this.values[this.frames[abs_depth] + offset];
    }

    // return stack offset
    Push(val: T): StackOffset {
        const abs_depth = this.frames.length - 1;
        if (abs_depth < 0) {
            throw new RangeError("no stack frame entered");
        }
        const index = this.values.length;
        const frame = this.frames[abs_depth];
        this.values.push(val);
        return index - frame;
    }

    Enter(): StackDepth {
        const depth = this.frames.length;
        this.frames.push(this.values.length);
        return depth + 1;
    }

    Exit() {
        const frame = this.frames.pop()!;
        this.values.length = frame;
    }
}

interface PersistentObject {
    version: number;
    target: object | WeakRef<object> | undefined;
    parameter?: number;  // callback parameter
    callback?: number;   // function pointer
}
type PersistentID = number;
interface FinalizationCallbackInfo {
    id: PersistentID;
    version: number;
}

// Globals
class PersistentObjects {
    private version: number;
    private handles: UnsafeArray<PersistentObject>;
    private watcher: FinalizationRegistry<FinalizationCallbackInfo>;

    constructor() {
        this.version = 0;
        this.handles = new UnsafeArray();
        this.watcher = new FinalizationRegistry((info: FinalizationCallbackInfo) => {
            const handle = this.handles.Get(info.id);
            if (typeof handle === "undefined" || handle.version != info.version) {
                // expired
                return;
            }

            if (typeof handle.callback === "number") {
                handle.callback = undefined;
                NativeAPI.jsapi_invoke_gc_callback(handle.callback, handle.parameter);
            }
            // console.assert(typeof handle.target === "undefined" || handle.target instanceof WeakRef);
        });
    }

    /**
     * New Global
     * @returns global handle id
     */
    Add(o: Object): PersistentID {
        const version = ++this.version;
        const handle_id: PersistentID = this.handles.Add({ version: version, target: o, parameter: undefined, callback: undefined });
        this.watcher.register(o, { id: handle_id, version: version });
        return handle_id + 1;
    }

    Remove(handle_id: number) {
        this.handles.Remove(handle_id - 1);
    }

    Get(handle_id: number): object {
        const handle = this.handles.Get(handle_id - 1);
        return handle.target!;
    }

    SetWeak(handle_id: number, cb?: number, parameter?: number) {
        const handle = this.handles.Get(handle_id - 1);
        if (typeof handle.target === "undefined") {
            throw new ReferenceError();
        }

        handle.callback = cb;
        handle.parameter = parameter;
        if (!(handle.target instanceof WeakRef)) {
            handle.target = new WeakRef(handle.target!);
        }
    }

    ClearWeak(handle_id: number) {
        const handle = this.handles.Get(handle_id - 1);
        if (typeof handle.target === "undefined") {
            throw new ReferenceError();
        }

        handle.callback = undefined;
        handle.parameter = undefined;
        if (handle.target instanceof WeakRef) {
            handle.target = handle.target.deref();
        }
    }
}

let NativeAPI: InteropProtocol;
export function Initialize(api: InteropProtocol) {
    if (typeof NativeAPI !== "undefined") {
        console.error("Already initialized, do not call it twice");
    }
    NativeAPI = api;
}

export class Engine {
    alive: boolean;
    stack: Stack<any>;
    persistents: PersistentObjects;
    global: object;
    isolate: IntPtr;
    last_exception: any;

    constructor(isolate: IntPtr) {
        this.alive = true;
        this.isolate = isolate;
        this.global = {};
        this.stack = new Stack();
        this.persistents = new PersistentObjects();
        this.last_exception = undefined;
    }

    private CheckAlive() {
        if (!this.alive) {
            throw new Error("Engine has been released");
        }
    }

    Release() {
        this.CheckAlive();

        this.alive = false;
        this.global = <any>undefined;
        this.stack = <any>undefined;
        this.persistents = <any>undefined;
    }

    Eval(ptr: number) {
        this.CheckAlive();
        eval(NativeAPI.UTF8ToString(ptr));
    }

    // ptr: C++ Function Pointer
    InvokeFunc(self: any, new_target: any, data: any, ptr: number, args?: any[]): any {
        this.CheckAlive();

        const depth = this.stack.Enter();

        // prepare
        this.stack.Push(undefined); // return value
        this.stack.Push(self); // this
        this.stack.Push(new_target); // new.target
        this.stack.Push(data);
        const argc = typeof args === "undefined" ? 0 : args.length;
        for (let i = 0; i < argc; ++i) {
            this.stack.Push(args![i]);
        }

        try {
            //TODO wrong way
            if (typeof this.last_exception !== "undefined") {
                this.last_exception = undefined;
                console.error("Last exeption not handled");
            }

            if (typeof new_target === "undefined") {
                NativeAPI.jsapi_call(this.isolate, ptr, depth, argc);
            } else {
                NativeAPI.jsapi_construct(this.isolate, ptr, depth, argc);
            }
        } catch (error) {
            //TODO wrong way
            this.last_exception = error;
        }
        const rval = this.stack.GetValue(depth, 0);

        // cleanup
        this.stack.Exit();
        return rval;
    }

    AddPersistent(depth: number, index: number): PersistentID {
        return this.persistents.Add(this.stack.GetValue(depth, index));
    }

    RemovePersistent(handle_id: PersistentID): void {
        this.persistents.Remove(handle_id);
    }

    PushPersistent(handle_id: PersistentID) {
        const obj = this.persistents.Get(handle_id);
        return this.stack.Push(obj);
    }

    HasException(): boolean { return typeof this.last_exception !== "undefined"; }
    ClearException() { this.last_exception = undefined; }

    IsUndefined(depth: number, index: number) { return this.stack.GetValue(depth, index) === undefined; }
    IsNumber(depth: number, index: number) { return typeof this.stack.GetValue(depth, index) === "number"; }
    IsString(depth: number, index: number) { return typeof this.stack.GetValue(depth, index) === "string"; }
    IsBoolean(depth: number, index: number) { return typeof this.stack.GetValue(depth, index) === "boolean"; }
    IsSymbol(depth: number, index: number) { return typeof this.stack.GetValue(depth, index) === "symbol"; }
    IsFunction(depth: number, index: number) { return typeof this.stack.GetValue(depth, index) === "function"; }
    IsObject(depth: number, index: number) { return typeof this.stack.GetValue(depth, index) === "object"; }

    // new_binding_object(pointer: any) {
    //     const type = 0;
    //     const hidden: ObjectHidden = {
    //         pointer: pointer,
    //         type: type,
    //     };
    //     const o = { [Hidden]: hidden, };
    //     const object_id = this.objects.add(o);
    //     this.gc_watch.register(o, { id: object_id, hidden: hidden, });
    //     return object_id;
    // }

    // get_binding_object(object_id: number) {
    //     return this.objects.get(object_id)[Hidden].pointer;
    // }
}

