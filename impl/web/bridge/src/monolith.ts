
type ObjectID = number;
type ObjectType = number;

// -1 for return value to indicate an error thrown in jsbb_Engine internally (not JS throw)
type ResultValue = number;

interface ObjectHidden {
    pointer: any;
    type: number;
}

type ObjectFinalizerData = { id: ObjectID, hidden: ObjectHidden };
type ObjectFinalizer = (id: ObjectID) => void;

type IntPtr = number;

interface InteropProtocol {
    UTF8ToString(ptr: Pointer): string;
    stringToUTF8(str: string): Pointer;
    lengthBytesUTF8(str: string): number;

    HEAPU8: Uint8Array,
    HEAP32: Int32Array, 
    HEAP64: BigInt64Array, 

    gc_callback(engine_opaque: IntPtr, internal_opaque: Pointer): void;

    ccall(opaque: IntPtr, fn: any, argc: number): void;
};

// FinalizationRegistry (ES2021):
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry

// starts from 1
type UnsafeIndex = number;
type jsbb_AtomID = UnsafeIndex;

class jsbb_UnsafeArray<T> {
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

    // remove an entry and return it's value
    Remove(index: UnsafeIndex): T {
        const abs_index = index - 1;
        const o = this.items[abs_index];
        this.items[abs_index] = <any>undefined;
        this.freelist.push(abs_index);
        return o;
    }
}

// starts from zero
type StackPosition = number;
const jsbb_kMaxStackSize = 512;

const jsbb_StackPos = {
    Undefined: 0,
    Null: 1,
    True: 2,
    False: 3,
    EmptyString: 4,
    SymbolClass: 5,
    MapClass: 6,
    Exception: 7,

    Num: 8,
}

// Stack for Locals (starts from zero)
class jsbb_Stack<T> {
    private frames: Array<number> = [];
    private values: Array<T> = [];

    get pos() { return this.values.length; }

    // get frame value
    GetValue(pos: StackPosition): T {
        if (pos >= this.values.length) {
            throw new RangeError("invalidated stack position");
        }
        return this.values[pos];
    }

    // return undefined if n is zero, otherwise return the last n values on stack
    GetValues(n: number): Array<T> | undefined {
        if (n == 0) return undefined;
        if (n > this.values.length) throw new RangeError("unsatisfied stack size");
        return this.values.slice(-n);
    }

    // return stack offset
    Push(val: T): StackPosition {
        if (this.values.length >= jsbb_kMaxStackSize) {
            throw new RangeError("stack overflow");
        }
        return this.values.push(val) - 1;
    }

    EnterScope(): void {
        this.frames.push(this.values.length);
    }

    ExitScope(): void {
        const frame = this.frames.pop()!;
        this.values.length = frame;
    }
}

// a wrapper for primitive types (number, string etc.)
class jsbb_Wrapper {
    target: any;

    constructor(target: any) {
        this.target = target;
    }
}

type GlobalID = number;
type Pointer = number;
type CString = number;
type FunctionPointer = number;

interface GlobalEntry {
    // a weak reference to a target object
    // jsbb_Wrapper is used as target if the original target is primitive (number, bigint, string etc.)
    token: WeakRef<object>;

    // (optional) a strong reference to target
    sref: object | undefined;
}

class jsbb_Globals {
    private handles: jsbb_UnsafeArray<GlobalEntry>;

    static isTraceable(o: any): boolean {
        const type = typeof o;
        return o !== null && type !== "function" && type !== "object";
    }

    constructor() {
        this.handles = new jsbb_UnsafeArray();
    }

    // trace an object (it's weak-referenced by default)
    Add(o: any) {
        if (!jsbb_Globals.isTraceable(o)) {
            o = new jsbb_Wrapper(o);
        }
        const token = new WeakRef(o);
        const handle_id: GlobalID = this.handles.Add({
            token: token,
            sref: undefined,
        });
        return handle_id;
    }

    // unsafe, must ensure a valid index by yourself
    Remove(handle_id: GlobalID) {
        this.handles.Remove(handle_id);
    }

    // return the original target object in registry
    Get(handle_id: number): any {
        const handle = this.handles.Get(handle_id);
        const target = handle.token.deref();
        if (target instanceof jsbb_Wrapper) {
            return target.target;
        }
        return target!;
    }

    SetWeak(handle_id: number) {
        const handle = this.handles.Get(handle_id);
        handle.sref = undefined;
    }

    SetStrong(handle_id: number) {
        const handle = this.handles.Get(handle_id);
        handle.sref = handle.token.deref();
    }
}

type FinalizationRegistryCallbackInfo = Pointer;
class jsbb_Registry {
    private watcher: FinalizationRegistry<FinalizationRegistryCallbackInfo>;

    constructor(opaque: Pointer) {
        this.watcher = new FinalizationRegistry(function (info) {
            NativeAPI.gc_callback(opaque, info);
        });
    }

    Add(obj: any, opaque: Pointer): void {
        // opaque saved in obj[opaque.symbol] for GetOpaque(), it's never changed.
        obj[jsbb_opaque] = opaque;
        this.watcher.register(obj, opaque);
    }
}

function jsbb_ensure(condition: boolean) {
    console.assert(condition);
}

class jsbb_External {
    private _data: Pointer;

    get data() { return this._data; }

    constructor(data: Pointer) {
        this._data = data;
    }
}

class jsbb_Atom {
    rc: number;
    value: any;

    constructor(value: any) {
        this.value = value;
        this.rc = 1;
    }
}

class jsbb_Engine {
    private _id: EngineID;

    // a fake global for Environment
    private _global: object;
    private _stack: jsbb_Stack<any>;
    private _globals: jsbb_Globals;
    private _registry: jsbb_Registry;
    private _atoms: jsbb_UnsafeArray<jsbb_Atom>;

    private _scripts: Map<string, Function>;

    private _opaque: IntPtr = 0;
    last_error: any = undefined;

    get stack() { return this._stack; }

    constructor(engine_id: EngineID, opaque: Pointer) {
        this._id = engine_id;
        this._opaque = opaque;
        this._global = {};
        this._stack = new jsbb_Stack();
        this._globals = new jsbb_Globals();
        this._registry = new jsbb_Registry(opaque);
        this._atoms = new jsbb_UnsafeArray();
        this._scripts = new Map();

        jsbb_ensure(this._stack.Push(undefined) === jsbb_StackPos.Undefined);
        jsbb_ensure(this._stack.Push(null) === jsbb_StackPos.Null);
        jsbb_ensure(this._stack.Push(true) === jsbb_StackPos.True);
        jsbb_ensure(this._stack.Push(false) === jsbb_StackPos.False);
        jsbb_ensure(this._stack.Push("") === jsbb_StackPos.EmptyString);
        jsbb_ensure(this._stack.Push(Symbol) === jsbb_StackPos.SymbolClass);
        jsbb_ensure(this._stack.Push(Map) === jsbb_StackPos.MapClass);
        jsbb_ensure(this._stack.Push(null) === jsbb_StackPos.Exception);
        jsbb_ensure(this._stack.pos === jsbb_StackPos.Num);
    }

    Release() {
        this._global = <any>undefined;
        this._stack = <any>undefined;
        this._registry = <any>undefined;
    }

    SetHostPromiseRejectionTracker(cb: FunctionPointer, data: Pointer) {
        //TODO
        window.addEventListener("unhandledrejection", function (ev: PromiseRejectionEvent) {
            console.log("unhandled promise rejection");
        })
    }

    static GetStringHash(val: string): number {
        let hash = 0;
        const len = val.length;
        for (let i = 0; i < len; ++i) {
            hash = (hash << 5) - hash + val.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    static GetNumberHash(val: number): number {
        if ((val | 0) != 0) return val;
        return jsbb_Engine.GetStringHash(val.toString());
    }

    GetIdentityHash(stack_pos: StackPosition) {
        const val = this._stack.GetValue(stack_pos);
        if (typeof val === "undefined" || val === null) return 0;
        if (typeof val === "number") return jsbb_Engine.GetNumberHash(val);
        if (typeof val === "boolean") return val ? 1 : 0;
        if (typeof val === "string") return jsbb_Engine.GetStringHash(val);
        if (typeof val === "bigint") return jsbb_Engine.GetStringHash(val.toString());
        // if (typeof val === "function")
        // if (typeof val === "object")
        // if (typeof val === "symbol") 
        if (typeof val[jsbb_opaque] !== "undefined") return val[jsbb_opaque] | 0;
        return 0;
    }

    NewAtom(stack_pos: StackPosition): jsbb_AtomID {
        return this._atoms.Add(new jsbb_Atom(this._stack.GetValue(stack_pos)));
    }

    NewAtomStr(ptr: Pointer) {
        let str = NativeAPI.UTF8ToString(ptr);
        return this._atoms.Add(new jsbb_Atom(str));
    }

    DupAtom(atom_id: jsbb_AtomID): jsbb_AtomID {
        let atom = this._atoms.Get(atom_id);
        ++atom.rc;
        return atom_id;
    }

    FreeAtom(atom_id: jsbb_AtomID) {
        let atom = this._atoms.Get(atom_id);
        if (--atom.rc == 0) {
            this._atoms.Remove(atom_id);
        }
    }

    ToCStringLen(o_size: Pointer, str_sp: StackPosition): Pointer {
        const str = this._stack.GetValue(str_sp);
        const len = NativeAPI.lengthBytesUTF8(str);

        NativeAPI.HEAP32[o_size >> 2] = len;
        return NativeAPI.stringToUTF8(str);
    }

    ToString(stack_pos: StackPosition): StackPosition {
        const val = this._stack.GetValue(stack_pos);
        return this._stack.Push(String(val));
    }

    NumberValue(stack_pos: StackPosition): number {
        const val = this._stack.GetValue(stack_pos);
        return Number(val) + 0;
    }

    BooleanValue(stack_pos: StackPosition): boolean {
        const val = this._stack.GetValue(stack_pos);
        return Boolean(val);
    }

    Int32Value(stack_pos: StackPosition): number {
        const val = this._stack.GetValue(stack_pos);
        return Number(val) | 0;
    }

    Uint32Value(stack_pos: StackPosition): number {
        const val = this._stack.GetValue(stack_pos);
        return (Number(val) | 0) >>> 0;
    }

    Int64Value(stack_pos: StackPosition, o_value_ptr: Pointer): boolean {
        const val = this._stack.GetValue(stack_pos);
        NativeAPI.HEAP64[o_value_ptr >> 3] = val;
        return true;
    }

    // duplicate a value to the stack top
    StackDup(stack_pos: StackPosition): StackPosition {
        return this._stack.Push(this._stack.GetValue(stack_pos));
    }

    GetOpaque(stack_pos: StackPosition): Pointer {
        let obj = this._stack.GetValue(stack_pos);
        return obj[jsbb_opaque];
    }

    NewExternal(data: Pointer): StackPosition {
        return this._stack.Push(new jsbb_External(data));
    }

    NewInt32(value: number): StackPosition {
        return this._stack.Push(value);
    }

    NewUint32(value: number): StackPosition {
        return this._stack.Push(value >>> 0);
    }

    NewNumber(value: number): StackPosition {
        return this._stack.Push(value);
    }

    NewBigInt64(val_ptr: Pointer): StackPosition {
        const val = NativeAPI.HEAP64[val_ptr >> 3];
        return this._stack.Push(val);
    }

    NewSymbol(): StackPosition {
        return this._stack.Push(Symbol());
    }

    NewMap(): StackPosition {
        return this._stack.Push(new Map());
    }

    NewArray(): StackPosition {
        return this._stack.Push([]);
    }

    IsExternal(stack_pos: StackPosition): boolean {
        return this._stack.GetValue(stack_pos) instanceof jsbb_External;
    }

    SetProperty(obj: StackPosition, key: StackPosition, val: StackPosition) {
        const obj_sv = this._stack.GetValue(obj);
        const key_sv = this._stack.GetValue(key);
        const val_sv = this._stack.GetValue(val);

        if (obj_sv instanceof Map) {
            obj_sv.set(key_sv, val_sv);
        } else {
            obj_sv[key_sv] = val_sv;
        }
    }

    SetPropertyUint32(obj_sp: StackPosition, index: number, value_sp: StackPosition): ResultValue {
        const obj = this._stack.GetValue(obj_sp);
        const val = this._stack.GetValue(value_sp);

        try {
            obj[index] = val;
        } catch (err) {
            //TODO save error 
            return -1;
        }
        return 0;
    }

    // push global to stack, return it's stack position
    GetGlobalObject(): StackPosition {
        return this._stack.Push(this._global);
    }

    CompileModuleSource(id: CString, src: CString) {
        let module_id = NativeAPI.UTF8ToString(id);
        let module_source = NativeAPI.UTF8ToString(src);
        let source = `jsbb_runtime.GetEngine(${this._id}).SetModuleEvaluator('${module_id}', ${module_source}});`;

        try {
            eval(source);
        } catch (err) {
            // eval not supported
            if (err instanceof EvalError) {
                //TODO if async module is implemented, we can use dynamic scripts which support debugging in browser devtools
                // but for now, we need a method to eval source synchronously
                let script = document.createElement("script");
                script.type = "type/javascript";
                script.text = source;
                document.head.appendChild(script);
            } else {
                //TODO exception in source
                console.error(module_id, err);
            }
        }
    }

    // internal 
    SetModuleEvaluator(module_id: string, evaluator: Function) {
        this._scripts.set(module_id, evaluator);
    }

    // stack-based call
    GetModuleEvaluator(module_id_sp: StackPosition): StackPosition {
        const module_id = this._stack.GetValue(module_id_sp);
        const module_eval = this._scripts.get(module_id);
        console.log("GetModuleEvaluator", module_id, typeof module_eval);
        return this._stack.Push(module_eval);
    }

    Call(this_sp: StackPosition, func_sp: StackPosition, argc: number): StackPosition {
        const thiz = this._stack.GetValue(this_sp);
        const func: Function = this._stack.GetValue(func_sp);
        if (typeof func !== "function") {
            //TODO error 
        }

        const args = this._stack.GetValues(argc);
        const rval = func.apply(thiz, args);
        return this._stack.Push(rval);
    }

    // [stack-based]
    // cb: C++ Function Pointer
    // return: stack position of the wrapper function 
    NewCFunction(cb: FunctionPointer, data_pos: StackPosition): StackPosition {
        const self = this;
        const data = this._stack.GetValue(data_pos);

        return this._stack.Push(function () {
            self._stack.EnterScope();

            // prepare: fixed initial call stack positions
            const rval_pos = self._stack.Push(undefined);  // 0 return value (placeholder)
            self._stack.Push(self);                        // 1 this
            self._stack.Push(data);                        // 2 data
            self._stack.Push(new.target);                  // 3 new.target

            // prepare: arguments
            const argc = arguments.length;
            for (let i = 0; i < argc; ++i) {
                self._stack.Push(arguments[i]);
            }

            try {
                if (typeof self.last_error !== "undefined") {
                    self.last_error = undefined;
                    console.error("Last exeption not handled");
                }

                NativeAPI.ccall(self._opaque, cb, argc);
            } catch (error) {
                self.last_error = error;
            }
            const rval = self._stack.GetValue(rval_pos);

            // cleanup
            self._stack.ExitScope();
            return rval;
        });
    }

    NewClass(): StackPosition {
        return this._stack.Push(function () { });
    }

    NewObjectProtoClass(proto_pos: StackPosition, obj_opaque: Pointer): StackPosition {
        const proto = this._stack.GetValue(proto_pos);
        const obj = new proto.constructor();
        this._registry.Add(obj, obj_opaque);
        return this._stack.Push(obj);
    }

    SetConstructor(func: StackPosition, proto: StackPosition) {
        const p = this._stack.GetValue(proto);
        const f = this._stack.GetValue(func);
        p.constructor = f;
    }

    SetPrototype(proto_pos: StackPosition, parent_pos: StackPosition) {
        const a = this._stack.GetValue(proto_pos);
        const b = this._stack.GetValue(parent_pos);
        a.prototype = b.prototype;
    }
}

// opaque for UniversalBridgeClass
const jsbb_opaque = Symbol();

//TODO fastpath to verify a UniversalBridgeClass
// const jsbb_hidden = Symbol();

type EngineID = number;
let engine: jsbb_Engine | undefined;
let NativeAPI: InteropProtocol;

declare const global: any;
const browser = global || globalThis || window;

class jsbb_runtime {
    static init(api: InteropProtocol) {
        if (typeof NativeAPI !== "undefined") {
            console.error("Already initialized, do not call it twice");
        }
        NativeAPI = api;
    }

    static NewEngine(opaque: Pointer) {
        if (typeof engine !== "undefined") {
            throw new Error();
        }
        engine = new jsbb_Engine(0, opaque);
        return 0;
    }

    static FreeEngine(engine_id: EngineID) {
        if (engine_id !== 0) {
            throw new Error();
        }
        engine!.Release();
        engine = undefined;
    }

    static GetEngine(engine_id: EngineID) { return engine; }
}

(<any>browser)["jsbb_runtime"] = jsbb_runtime;

