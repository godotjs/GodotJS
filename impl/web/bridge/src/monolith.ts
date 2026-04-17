// -1 for return value to indicate an error thrown in jsbb_Engine internally (not JS throw)
type ResultValue = number;

type IntPtr = number;

interface WasmProtocol {
    UTF8ToString(ptr: Pointer): string;
    stringToUTF8(str: string, buf: Pointer, size: number): void;
    lengthBytesUTF8(str: string): number;
    _malloc(size: number): Pointer;
    _free(ptr: Pointer): void;
}

interface InteropProtocol {
    gc_callback(engine_opaque: IntPtr, internal_opaque: Pointer): void;
    unhandled_rejection(engine_opaque: IntPtr, cb: FunctionPointer, promise_sp: StackPosition, reason_sp: StackPosition): void;

    // is_construct_call: true if it's a constructor call, it's just a shorthand for `new.target !== undefined` on C++ side
    call_function(opaque: IntPtr, fn: any, is_construct_call: boolean, base_sp: number, argc: number): void;

    call_accessor(opaque: IntPtr, fn: any, key_sp: number, rval_sp: number): void;

    generate_internal_data(opaque: IntPtr, internal_field_count: number): IntPtr;

    on_worker_message(data_sp: StackPosition, transfer_id: number): void;
    on_worker_message_from_pthread(sender_pthread_id: number, data_sp: StackPosition, transfer_id: number): void;
    worker_get_or_add_native_transfer(pthread_id: number, engine_opaque: IntPtr, transfer_id: number, value_sp: StackPosition): number;
}

type InitOptions = Record<keyof InteropProtocol, number> & {
    bridge_logging: boolean;
    debug_build: boolean;
};

enum jsbb_PropertyFlags {
    CONFIGURABLE = 1 << 0,
    WRITABLE = 1 << 1,
    ENUMERABLE = 1 << 2,
    GET = 1 << 3,
    SET = 1 << 4,
    VALUE = 1 << 5,
}

// FinalizationRegistry (ES2021):
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry

type AtomID = number;
type EngineID = number;
type GlobalID = number;

type CString = number;
type Pointer = number;
type FunctionPointer = number;
type FinalizationRegistryCallbackInfo = Pointer;

interface jsbb_HandleEntry {
    // a weak reference to a target object
    // jsbb_Wrapper is used as target if the original target is primitive (number, bigint, string etc.)
    token: WeakRef<object>;

    // (optional) a strong reference to target
    sref: object | undefined;
}

// starts from zero
type StackPosition = number;

type JSWorkerOnMessage = (this: JSWorkerLike, data: unknown) => void;

type JSWorkerLike = { onmessage: JSWorkerOnMessage };
type GodotWorkerModule = { JSWorkerParent: JSWorkerLike };
type GodotWorkerGlobal = { require?: (module_name: "godot.worker") => GodotWorkerModule };

let JSWorkerParent: null | undefined | JSWorkerLike = ENVIRONMENT_IS_PTHREAD ? undefined : null;

function getJSWorkerParent(): null | JSWorkerLike {
    if (typeof JSWorkerParent !== "undefined") {
        return JSWorkerParent;
    }

    const require = (globalThis as GodotWorkerGlobal).require;
    JSWorkerParent = require?.("godot.worker").JSWorkerParent ?? null;
    return JSWorkerParent;
}

// A recommended warning threshold (not a hard limit).
const jsbb_kMaxStackSize = 4096;

const jsbb_StackPos = {
    Undefined: 0,
    Null: 1,
    True: 2,
    False: 3,
    EmptyString: 4,
    SymbolClass: 5,
    MapClass: 6,
    Error: 7,

    _Num: 8,
};

const jsbb_PropertyFilter = {
    SKIP_STRINGS: 8,
    SKIP_SYMBOLS: 16
};

interface jsbb_TransferMarker {
    __jsb_type: "transfer";
    data: number;
}

interface jsbb_TransferEncodeContext {
    native_transfers_used: boolean;
    transfer_index_by_object: Map<object, number>;
    seen: WeakMap<object, unknown>;
}

const jsbb_TransferType = "transfer";

const enum jsbb_WorkerTransferErrorCode {
    ObjectNotInTransferList = -1,
    EnvMissing = -2,
    IsolateMissing = -3,
    NonObjectValue = -4,
    VariantConversionFailed = -5,
    VariantCloneFailed = -6,
    TransferAppendFailed = -7,
}

const enum jsbb_PostMessageResult {
    Failed = -1,
    Success = 0,
    NativeTransfersUnused = 1,
}

function jsbb_create_transfer_marker(transfer_index: number): jsbb_TransferMarker {
    return {
        __jsb_type: jsbb_TransferType,
        data: transfer_index >>> 0,
    };
}

function jsbb_is_transfer_marker(value: unknown): value is jsbb_TransferMarker {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as Partial<jsbb_TransferMarker>;

    if (candidate.__jsb_type !== jsbb_TransferType) {
        return false;
    }

    const transfer_index = Number(candidate.data);
    return Number.isInteger(transfer_index) && transfer_index >= 0;
}

function jsbb_is_worker_message(value: unknown): value is WorkerMessage {
    return typeof value === "object" && (value as null | Partial<WorkerMessage>)?.__jsbMessage || false;
}

function jsbb_IsTraceable(o: any): boolean {
    const type = typeof o;
    return !(o !== null && type !== "function" && type !== "object");
}

function jsbb_ensure(condition: boolean) {
    console.assert(condition);
}

const jsbb_console = {
    log: function (...args: any[]) {
        console.log("[jsbb]", ...args);
    },
    warn: function (...args: any[]) {
        console.warn("[jsbb]", ...args);
    },
    error: function (...args: any[]) {
        console.error("[jsbb]", ...args);
    },
    debug: function (...args: any[]) {
        console.log("[jsbb]", ...args);
    },
    trace: function (...args: any[]) {
        console.log("[jsbb]", ...args);
    },
}

// opaque for UniversalBridgeClass
const jsbb_opaque = Symbol();
const jsbb_internal_field_count = Symbol();

//TODO fastpath to verify a UniversalBridgeClass
// const jsbb_hidden = Symbol();

// Stack for Locals (starts from zero)
class jsbb_Stack<T> {
    private frames: Array<number> = [];
    private values: Array<T> = [];
    private _depth = 0;

    /** stack used */
    get pos() { return this.values.length; }

    /** depth of scope entered */
    get depth() { return this._depth; }

    SetValue(pos: StackPosition, value: T): void {
        if (pos < 0 || pos >= this.values.length) {
            throw new RangeError("invalid stack position");
        }
        this.values[pos] = value;
    }

    // get frame value
    GetValue(pos: StackPosition): T {
        if (pos < 0 || pos >= this.values.length) {
            throw new RangeError("invalid stack position");
        }
        return this.values[pos];
    }

    // return stack offset
    Push(val: T): StackPosition {
        if (this.values.length >= jsbb_kMaxStackSize) {
            jsbb_console.warn("stack overflow", this.values.length);
        }
        return this.values.push(val) - 1;
    }

    EnterScope(): void {
        ++this._depth;
        this.frames.push(this.values.length);
    }

    ExitScope(): void {
        --this._depth;
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

class jsbb_Handles {
    private _idgen: number = 0;
    private _count = 0;
    private _handles: Array<jsbb_HandleEntry | undefined> = [];

    get count() { return this._count; }

    constructor() {
        this._handles[999] = undefined;
    }

    // trace an object (it's strongly referenced by default)
    AddValue(o: any) {
        if (!jsbb_IsTraceable(o)) {
            o = new jsbb_Wrapper(o);
        }
        const token = new WeakRef(o);
        const id = this._idgen++;
        this._handles[id] = {
            token: token,
            sref: o,
        };
        ++this._count;
        return id;
    }

    IsValid(handle_id: GlobalID): boolean {
        const handle = this._handles[handle_id];
        if (typeof handle === "undefined") {
            return false;
        }
        if (handle.sref != undefined || handle.token.deref() != undefined) {
            return true;
        }

        //TODO gc finalizer is run after the object dead, it's impossible to get a valid internal_data in gc_callback
        jsbb_console.trace("obsolete handle", handle_id);
        delete this._handles[handle_id];
        --this._count;
        return false;
    }

    // unsafe, must ensure a valid index by yourself
    Remove(handle_id: GlobalID) {
        if (typeof this._handles[handle_id] === "undefined") {
            return;
        }
        delete this._handles[handle_id];
        --this._count;
    }

    // return the original target object in registry
    GetValue(handle_id: number): any {
        const handle = this._handles[handle_id];
        if (typeof handle === "undefined") {
            jsbb_console.warn("invalid handle id", handle_id);
            return;
        }
        const target = handle.token.deref();
        if (target instanceof jsbb_Wrapper) {
            return target.target;
        }
        return target!;
    }

    SetWeak(handle_id: number) {
        const handle = this._handles[handle_id];
        if (typeof handle === "undefined") {
            jsbb_console.warn("invalid handle id", handle_id);
            return;
        }
        handle.sref = undefined;
    }

    SetStrong(handle_id: number) {
        const handle = this._handles[handle_id];
        if (typeof handle === "undefined") {
            jsbb_console.warn("invalid handle id", handle_id);
            return;
        }
        handle.sref = handle.token.deref();
    }
}

class jsbb_Registry {
    private _count = 0;
    private engine_opaque: Pointer;
    private watcher: FinalizationRegistry<FinalizationRegistryCallbackInfo>;

    get count() { return this._count; }

    constructor(engine_opaque: Pointer) {
        const self = this;
        this.engine_opaque = engine_opaque;
        this.watcher = new FinalizationRegistry(function (internal_data) {
            jsbb_console.trace("gc.dealloc", internal_data);
            --self._count;
            _jsbb_.interop.gc_callback(self.engine_opaque, internal_data);
        });
    }

    Add(obj: any, internal_data: Pointer): void {
        jsbb_console.trace("gc.alloc", internal_data);

        // opaque saved in obj[opaque.symbol] for GetOpaque(), it's never changed.
        obj[jsbb_opaque] = internal_data;
        this.watcher.register(obj, internal_data);
        ++this._count;
    }
}

class jsbb_External {
    private _data: Pointer;

    get data() { return this._data; }

    constructor(data: Pointer) {
        this._data = data;
    }
}

class jsbb_Engine {
    private _id: EngineID;

    // a fake global for Environment
    // private _global: object;

    private _stack: jsbb_Stack<any>;
    private _handles: jsbb_Handles;
    private _registry: jsbb_Registry;
    private _atoms: Array<string>;

    private _opaque: IntPtr = 0;

    get stack() { return this._stack; }

    get handles() { return this._handles; }

    get opaque() { return this._opaque; }

    /** If calling from C++ side, use `_throw(err)` to raise an error instead of `throw`. */
    private _throw(value: any) {
        const last = this._stack.GetValue(jsbb_StackPos.Error);
        if (last !== undefined) {
            jsbb_console.error("discarding an unhandled error:", last);
        }
        if (value !== undefined) {
            jsbb_console.error("throwing an error in native execution context:", typeof value, value);
        }
        this._stack.SetValue(jsbb_StackPos.Error, value);
    }

    //TODO
    private _throw_trivial(value: any) {
        //TODO not sure, temporarily throw all trivial errors
        this._throw(value);
    }

    constructor(engine_id: EngineID, opaque: Pointer) {
        jsbb_console.trace("new engine", engine_id, opaque);
        this._id = engine_id;
        this._opaque = opaque;
        // this._global = {};
        this._stack = new jsbb_Stack();
        this._handles = new jsbb_Handles();
        this._registry = new jsbb_Registry(opaque);

        // init all commonly used string here
        this._atoms = new Array(3);
        this._atoms[0] = "message";
        this._atoms[1] = "stack";
        this._atoms[2] = "name";

        // init fixed stack objects
        jsbb_ensure(this._stack.Push(undefined) === jsbb_StackPos.Undefined);
        jsbb_ensure(this._stack.Push(null) === jsbb_StackPos.Null);
        jsbb_ensure(this._stack.Push(true) === jsbb_StackPos.True);
        jsbb_ensure(this._stack.Push(false) === jsbb_StackPos.False);
        jsbb_ensure(this._stack.Push("") === jsbb_StackPos.EmptyString);
        jsbb_ensure(this._stack.Push(Symbol) === jsbb_StackPos.SymbolClass);
        jsbb_ensure(this._stack.Push(Map) === jsbb_StackPos.MapClass);
        jsbb_ensure(this._stack.Push(undefined) === jsbb_StackPos.Error);
        jsbb_ensure(this._stack.pos === jsbb_StackPos._Num);
    }

    GetStatistics(data_ptr: Pointer) {
        if (data_ptr === 0) return;

        const offset = data_ptr >> 2;
        _jsbb_.i32[offset + 0] = this._stack.pos;
        _jsbb_.i32[offset + 1] = this._handles.count;
        _jsbb_.i32[offset + 2] = this._registry.count;
    }

    Release() {
        // this._global = <any>undefined;
        this._handles = <any>undefined;
        this._stack = <any>undefined;
        this._registry = <any>undefined;
    }

    SetHostPromiseRejectionTracker(cb: FunctionPointer, data: Pointer) {
        const self = this;
        globalThis.addEventListener("unhandledrejection", function (event: Event) {
            if (!self._stack) {
                return;
            }

            const ev = event as PromiseRejectionEvent;
            jsbb_console.warn("unhandled_rejection", ev.promise, ev.reason);
            const stack = self._stack;
            stack.EnterScope();
            try {
                _jsbb_.interop.unhandled_rejection(self._opaque, cb, stack.Push(ev.promise), stack.Push(ev.reason));
            } catch (err) {
                // rejection handler must do not throw error
                jsbb_console.error("unexpected error", err);
            }
            stack.ExitScope();
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

    // must return a stable hash for value.
    // 0 is OK but introduce additional strict_eq evaluation.
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

        // internal data index as hash since it's never changed
        if (typeof val[jsbb_opaque] !== "undefined") return val[jsbb_opaque] | 0;
        return 0;
    }

    GetByteLength(buf_sp: StackPosition): number {
        const buf = this._stack.GetValue(buf_sp);
        if (buf instanceof ArrayBuffer) {
            return buf.byteLength;
        }
        return 0;
    }

    /** copy the data of a buffer at stack_pos into HEAP at `data_dst`  */
    ReadArrayBufferData(stack_pos: StackPosition, size: number, data_dst: Pointer): ResultValue {
        const val = this._stack.GetValue(stack_pos);
        if (val instanceof ArrayBuffer) {
            if (val.byteLength < size) {
                jsbb_console.error("ArrayBuffer: not enough data to read");
                return -1;
            }
            _jsbb_.u8.set(new Uint8Array(val), data_dst);
            return 1;
        }
        jsbb_console.error("ReadArrayBufferData: not an ArrayBuffer");
        return -1;
    }

    NewArrayBuffer(data_src: Pointer, size: number): StackPosition {
        // make a copy of the memory from data_src with size
        const data = new Uint8Array(_jsbb_.u8.buffer, data_src, size).slice();
        return this._stack.Push(data.buffer);
    }

    GetExternal(stack_pos: StackPosition): Pointer {
        const val = this._stack.GetValue(stack_pos);
        if (val instanceof jsbb_External) {
            return val.data;
        }
        return 0;
    }

    GetStringLength(stack_pos: StackPosition): number {
        const val = this._stack.GetValue(stack_pos);
        if (typeof val === "string") {
            return val.length;
        }
        return 0;
    }

    GetArrayLength(stack_pos: StackPosition): number {
        const val = this._stack.GetValue(stack_pos);
        if (val instanceof Array) {
            return val.length;
        }
        return 0;
    }

    /**
     * get a native copy of a javascript string (convert if not a string) .
     * @param o_size [output] size of the returned buffer
     * @returns pointer the the buffer (HEAP)
     */
    ToCStringLen(o_size: Pointer, str_sp: StackPosition): Pointer {
        const val = this._stack.GetValue(str_sp);
        const str = String(val);
        const len = _jsbb_.wasmop.lengthBytesUTF8(str);

        _jsbb_.i32[o_size >> 2] = len;
        if (len <= 0) {
            if (typeof val !== "string" || val.length !== 0) {
                jsbb_console.warn("alloc.CString (failed)", len, typeof val);
            }
            return 0;
        }
        const size = len + 1;
        const buf = _jsbb_.wasmop._malloc(size);
        _jsbb_.wasmop.stringToUTF8(str, buf, size);
        jsbb_console.trace("alloc.CString", str, buf, size);
        return buf;
    }

    /** push the given value as string on the stack */
    ToString(stack_pos: StackPosition): StackPosition {
        const val = this._stack.GetValue(stack_pos);
        return this._stack.Push(String(val));
    }

    NumberValue(stack_pos: StackPosition): number {
        const val = this._stack.GetValue(stack_pos);
        return Number(val);
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
        _jsbb_.i64[o_value_ptr >> 3] = val;
        return true;
    }

    /** duplicate a value to the stack top */
    StackDup(stack_pos: StackPosition): StackPosition {
        return this._stack.Push(this._stack.GetValue(stack_pos));
    }

    StackSet(to_sp: StackPosition, from_sp: StackPosition): void {
        this._stack.SetValue(to_sp, this._stack.GetValue(from_sp));
    }

    StackSetInt32(to_sp: StackPosition, value: number): void {
        this._stack.SetValue(to_sp, value);
    }

    HasError(): boolean {
        return this._stack.GetValue(jsbb_StackPos.Error) !== undefined;
    }

    /** throw an error with a message in native execution context */
    ThrowError(message_ptr: CString): void {
        let message = _jsbb_.wasmop.UTF8ToString(message_ptr);
        this._throw(new Error(message));
    }

    GetOpaque(stack_pos: StackPosition): Pointer {
        let obj = this._stack.GetValue(stack_pos);
        if (obj === null || typeof obj !== "object") {
            return 0;
        }
        const opaque = obj[jsbb_opaque];
        return typeof opaque === "number" ? opaque : 0;
    }

    NewString(cstr_ptr: CString, len: number): StackPosition {
        if (len === 0) {
            return this._stack.Push("");
        }
        let str = _jsbb_.wasmop.UTF8ToString(cstr_ptr);
        if (typeof str !== "string") {
            jsbb_console.error("invalid string", cstr_ptr, len);
        }
        return this._stack.Push(str);
    }

    NewExternal(data: Pointer): StackPosition {
        return this._stack.Push(new jsbb_External(data));
    }

    NewInt32(value: number): StackPosition {
        return this._stack.Push(value);
    }

    /** treated as an integer, uint32 is not really fully supported */
    NewUint32(value: number): StackPosition {
        return this._stack.Push(value >>> 0);
    }

    NewNumber(value: number): StackPosition {
        return this._stack.Push(value);
    }

    NewBigInt64(val_ptr: Pointer): StackPosition {
        const val = _jsbb_.i64[val_ptr >> 3];
        return this._stack.Push(val);
    }

    NewSymbol(): StackPosition {
        return this._stack.Push(Symbol());
    }

    NewMap(): StackPosition {
        return this._stack.Push(new Map());
    }

    MapSize(stack_pos: StackPosition): number {
        const val = this._stack.GetValue(stack_pos);
        return (val instanceof Map || val instanceof Set) ? val.size : 0;
    }

    MapAsArray(stack_pos: StackPosition): StackPosition {
        const map = this._stack.GetValue(stack_pos);
        if (!(map instanceof Map)) {
            return this._stack.Push([]);
        }
        const result: Array<any> = [];
        map.forEach(function (value, key) {
            result.push(key, value);
        });
        return this._stack.Push(result);
    }

    MapGetEntry(map_sp: StackPosition, key_sp: StackPosition): StackPosition {
        const map = this._stack.GetValue(map_sp);
        if (!(map instanceof Map)) {
            return -1;
        }
        const key = this._stack.GetValue(key_sp);
        const value = map.get(key);
        return this._stack.Push(value);
    }

    MapSetEntry(map_sp: StackPosition, key_sp: StackPosition, value_sp: StackPosition): ResultValue {
        const map = this._stack.GetValue(map_sp);
        if (!(map instanceof Map)) {
            return -1;
        }
        const key = this._stack.GetValue(key_sp);
        const value = this._stack.GetValue(value_sp);
        map.set(key, value);
        return 0;
    }

    NewSet(): StackPosition {
        return this._stack.Push(new Set());
    }

    SetAsArray(stack_pos: StackPosition): StackPosition {
        const set = this._stack.GetValue(stack_pos);
        if (!(set instanceof Set)) {
            return this._stack.Push([]);
        }
        const result: Array<any> = [];
        set.forEach(function (value) {
            result.push(value);
        });
        return this._stack.Push(result);
    }

    SetAdd(set_sp: StackPosition, value_sp: StackPosition): ResultValue {
        const set = this._stack.GetValue(set_sp);
        if (!(set instanceof Set)) {
            return -1;
        }
        const value = this._stack.GetValue(value_sp);
        set.add(value);
        return 0;
    }

    IsSet(stack_pos: StackPosition): boolean {
        return this._stack.GetValue(stack_pos) instanceof Set;
    }

    NewArray(): StackPosition {
        return this._stack.Push([]);
    }

    IsExternal(stack_pos: StackPosition): boolean {
        return this._stack.GetValue(stack_pos) instanceof jsbb_External;
    }

    DefineProperty(obj_sp: StackPosition, key_sp: StackPosition, value_sp: StackPosition, get_sp: StackPosition, set_sp: StackPosition, flags: jsbb_PropertyFlags): ResultValue {
        try {
            const obj = this._stack.GetValue(obj_sp);
            const key = this._stack.GetValue(key_sp);

            if ((flags & jsbb_PropertyFlags["VALUE"]) !== 0) {
                // with value
                jsbb_console.trace("define property value", obj, key, flags, value_sp);
                if ((flags & jsbb_PropertyFlags["GET"]) !== 0 || (flags & jsbb_PropertyFlags["SET"]) !== 0) {
                    jsbb_console.warn("do not define a property with value and get/set at the same time");
                }
                Object.defineProperty(obj, key, {
                    "configurable": (flags & jsbb_PropertyFlags["CONFIGURABLE"]) !== 0,
                    "enumerable": (flags & jsbb_PropertyFlags["ENUMERABLE"]) !== 0,
                    "writable": (flags & jsbb_PropertyFlags["WRITABLE"]) !== 0,
                    "value": this._stack.GetValue(value_sp)
                });
            } else {
                // with get/set
                jsbb_console.trace("define property getset", obj, key, flags, get_sp, set_sp);
                if ((flags & jsbb_PropertyFlags["WRITABLE"]) !== 0) {
                    jsbb_console.warn("can not define a getset property with writable flag");
                }
                if (this._stack.GetValue(get_sp) === undefined && this._stack.GetValue(set_sp) === undefined) {
                    jsbb_console.warn("can not define a getset property with getter and setter not defined both");
                }
                Object.defineProperty(obj, key, {
                    "configurable": (flags & jsbb_PropertyFlags["CONFIGURABLE"]) !== 0,
                    "enumerable": (flags & jsbb_PropertyFlags["ENUMERABLE"]) !== 0,
                    "get": (flags & jsbb_PropertyFlags["GET"]) !== 0 ? this._stack.GetValue(get_sp) : undefined,
                    "set": (flags & jsbb_PropertyFlags["SET"]) !== 0 ? this._stack.GetValue(set_sp) : undefined
                });
            }
            return 1;
        } catch (err) {
            this._throw_trivial(err);
            return -1;
        }
    }

    DefineLazyProperty(obj_sp: StackPosition, key_sp: StackPosition, cb: FunctionPointer): ResultValue {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._stack.GetValue(key_sp);
        const self = this;

        Object.defineProperty(obj, key, {
            "get": function () {
                self._stack.EnterScope();

                // prepare: fixed initial call stack positions
                const rval_sp = self._stack.Push(undefined);  // 0 return value (placeholder)
                const key_sp = self._stack.Push(key);

                try {
                    _jsbb_.interop.call_accessor(self._opaque, cb, key_sp, rval_sp);
                    self.rethrow_native_error();
                } catch (err) {
                    jsbb_console.error("DefineLazyProperty: unexpected error", err);
                    // cleanup
                    self._stack.ExitScope();
                    // in javascript execution context
                    throw err;
                }

                const rval = self._stack.GetValue(rval_sp);

                // cleanup
                self._stack.ExitScope();

                jsbb_console.trace("evaluated lazy property", key, rval);
                // overwrite
                Object.defineProperty(this, key, {
                    "value": rval,
                    "configurable": true,
                    "enumerable": true,
                    "writable": true
                });

                return rval;
            },
            "configurable": true,
            "enumerable": true
        });
        return 1;
    }

    SetProperty(obj_sp: StackPosition, key_sp: StackPosition, val_sp: StackPosition): ResultValue {
        try {
            const obj = this._stack.GetValue(obj_sp);
            const key = this._stack.GetValue(key_sp);
            const val = this._stack.GetValue(val_sp);

            if (obj instanceof Map) {
                obj.set(key, val);
            } else {
                obj[key] = val;
            }
            return 1;
        } catch (err) {
            this._throw_trivial(err);
            return -1;
        }
    }

    //
    SetPropertyUint32(obj_sp: StackPosition, index: number, value_sp: StackPosition): ResultValue {
        try {
            const obj = this._stack.GetValue(obj_sp);
            const val = this._stack.GetValue(value_sp);

            obj[index] = val;
            return 1;
        } catch (err) {
            this._throw_trivial(err);
            return -1;
        }
    }

    //TODO filter and key_conversion are not implemented (or not supported?)
    GetOwnPropertyNames(obj_sp: StackPosition, filter: number, key_conversion: number): StackPosition {
        try {
            const obj = this._stack.GetValue(obj_sp);
            const names = Object.getOwnPropertyNames(obj);
            if (names instanceof Array) {
                return this._stack.Push(names);
            }
            this._throw(new TypeError("GetOwnPropertyDescriptor: unexpected"));
            return jsbb_StackPos.Error;
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    GetOwnPropertyDescriptor(obj_sp: StackPosition, key_sp: StackPosition) {
        try {
            const key = this._stack.GetValue(key_sp);
            const obj = this._stack.GetValue(obj_sp);
            const desc = Object.getOwnPropertyDescriptor(obj, key);
            if (typeof desc === "object") {
                return this._stack.Push(desc);
            }
            this._throw(new TypeError("GetOwnPropertyDescriptor: unexpected"));
            return jsbb_StackPos.Error;
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    /** get property value by atom_id (a cached string) */
    GetPropertyAtomID(obj_sp: StackPosition, atom_id: AtomID): StackPosition {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._atoms[atom_id];
        if (typeof key !== "string") {
            this._throw(new Error(`invalid AtomID(${atom_id})`));
            return jsbb_StackPos.Error;
        }
        if (typeof obj !== "object") {
            this._throw(new Error(`invalid object to access property at ${obj_sp} with AtomID ${atom_id}`));
            return jsbb_StackPos.Error;
        }
        const val = obj[key];
        if (typeof val === "undefined") {
            return jsbb_StackPos.Undefined;
        }
        if (val === null) {
            return jsbb_StackPos.Null;
        }
        return this._stack.Push(val);
    }

    GetProperty(obj_sp: StackPosition, key_sp: StackPosition): StackPosition {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._stack.GetValue(key_sp);
        if (typeof key !== "string" && typeof key !== "symbol") {
            this._throw(new Error("invalid atom id"));
            return jsbb_StackPos.Error;
        }

        try {
            const val = obj instanceof Map ? obj.get(key) : obj[key];

            // saving stack space
            if (typeof val === "undefined") {
                return jsbb_StackPos.Undefined;
            }
            if (val === null) {
                return jsbb_StackPos.Null;
            }
            return this._stack.Push(val);
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    GetPropertyUint32(obj_sp: StackPosition, index: number): StackPosition {
        const obj = this._stack.GetValue(obj_sp);
        if (typeof index !== "number") {
            this._throw(new Error("invalid atom id"));
            return jsbb_StackPos.Error;
        }

        try {
            const val = obj[index];

            // saving stack space
            if (typeof val === "undefined") {
                return jsbb_StackPos.Undefined;
            }
            if (val === null) {
                return jsbb_StackPos.Null;
            }
            return this._stack.Push(val);
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    // push global to stack, return it's stack position
    GetGlobalObject(): StackPosition {
        //TODO temporarily use browser global object
        return this._stack.Push(jsbb_browser);
        // return this._stack.Push(this._global);
    }

    CompileFunctionSource(filename_ptr: CString, source_ptr: CString): StackPosition {
        let source = _jsbb_.wasmop.UTF8ToString(source_ptr);
        let rval: any = undefined;
        try {
            if (source == null) {
                this._throw(new Error("source is null"));
                return jsbb_StackPos.Error;
            }
            jsbb_console.trace("compile function source:", source);
            rval = eval(source);
        } catch (err) {
            if (err instanceof EvalError && typeof document !== "undefined") {
                jsbb_console.warn("eval not supported (CSP restriction), trying script element instead");
                // module_source must be a bare function source (like '(function(){ ... })')

                try {
                    //TODO if async module is implemented, we can use dynamic scripts which support debugging in browser devtools
                    // but for now, we need a method to eval source synchronously
                    let script = document.createElement("script");
                    script.type = "type/javascript";
                    script.text = `_jsbb_.evalResult = ${source};`;

                    document.head.appendChild(script);
                    rval = _jsbb_.evalResult;
                    _jsbb_.evalResult = undefined;
                    // document.head.removeChild(script);
                } catch (err2) {
                    jsbb_console.error("unexpected error", err2);
                    this._throw(err2);
                    return jsbb_StackPos.Error;
                }
            } else {
                let filename = _jsbb_.wasmop.UTF8ToString(filename_ptr);
                jsbb_console.error(filename, err);

                this._throw(err);
                return jsbb_StackPos.Error;
            }
        }

        if (typeof rval !== "function") {
            this._throw(new Error("source compiled with no function returned"));
            return jsbb_StackPos.Error;
        }

        jsbb_console.trace("function source is compiled successfully");
        return this._stack.Push(rval);
    }

    /**
     * eval source code.
     * not supported if CSP is enabled.
     */
    Eval(filename_ptr: CString, source_ptr: CString): StackPosition {
        let source = _jsbb_.wasmop.UTF8ToString(source_ptr);
        let rval: any = undefined;
        try {
            if (source == null) {
                this._throw(new Error("source is null"));
                return jsbb_StackPos.Error;
            }
            rval = eval(source);
        } catch (err) {
            // it's difficult to emulate the behaviour of eval with script element (get the result without 'return').
            // just throw error for easier life.
            let filename = _jsbb_.wasmop.UTF8ToString(filename_ptr);
            jsbb_console.error(filename, err);

            this._throw(err);
            return jsbb_StackPos.Error;
        }

        if (typeof rval === "undefined") {
            return jsbb_StackPos.Undefined;
        }
        return this._stack.Push(rval);
    }

    Call(this_sp: StackPosition, func_sp: StackPosition, argc: number, argv: IntPtr): StackPosition {
        jsbb_console.trace("Call", "this_sp", this_sp, "func_sp", func_sp, "argc", argc, "argv", argv);

        const thiz = this._stack.GetValue(this_sp);
        const func: Function = this._stack.GetValue(func_sp);
        if (typeof func !== "function") {
            this._throw(new TypeError("not a function"));
            return jsbb_StackPos.Error;
        }

        try {
            let args: Array<any> | undefined = undefined;
            if (argc > 0) {
                args = new Array(argc);
                for (let i = 0; i < argc; ++i) {
                    const arg_sp = _jsbb_.i32[(argv >> 2) + i];
                    args[i] = this._stack.GetValue(arg_sp);
                    // jsbb_console.trace(`arg:${i} sp:${arg_sp} arg:${typeof args[i]}`);
                }
            }
            jsbb_console.trace("[Call]", thiz, args);
            const rval = func.apply(thiz, args);
            if (rval === undefined) {
                return jsbb_StackPos.Undefined;
            }
            return this._stack.Push(rval);
        } catch (error) {
            this._throw(error);
            return jsbb_StackPos.Error;
        }
    }

    CallAsConstructor(func_sp: StackPosition, argc: number, argv: IntPtr): StackPosition {
        jsbb_console.trace("CallAsConstructor", func_sp, argc, argv);

        const func = this._stack.GetValue(func_sp);
        if (typeof func !== "function") {
            this._throw(new TypeError("not a function"));
            return jsbb_StackPos.Error;
        }

        try {
            let args: Array<any> | undefined = undefined;
            if (argc > 0) {
                args = new Array(argc);
                for (let i = 0; i < argc; ++i) {
                    const arg_sp = _jsbb_.i32[(argv >> 2) + i];
                    args[i] = this._stack.GetValue(arg_sp);
                }
            }
            const rval = args === undefined ? new func() : new func(...args);
            return this._stack.Push(rval);
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    ParseJSON(cstr_ptr: CString, len: number): StackPosition {
        if (len === 0) {
            this._throw(new Error("invalid input"));
            return jsbb_StackPos.Error;
        }
        let str = _jsbb_.wasmop.UTF8ToString(cstr_ptr);
        if (typeof str !== "string") {
            this._throw(new Error("invalid input"));
            return jsbb_StackPos.Error;
        }
        try {
            const parsed = JSON.parse(str);
            return this._stack.Push(parsed);
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    JSONStringify(value_sp: StackPosition): StackPosition {
        try {
            const value = this._stack.GetValue(value_sp);
            const json = JSON.stringify(value);
            return this._stack.Push(json);
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    // push `obj.__proto__` to stack
    GetPrototypeOf(obj_sp: StackPosition): StackPosition {
        try {
            const obj = this._stack.GetValue(obj_sp);
            return this._stack.Push(Object.getPrototypeOf(obj));
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
    }

    SetPrototypeOf(obj_sp: StackPosition, proto_sp: StackPosition): ResultValue {
        try {
            const obj = this._stack.GetValue(obj_sp);
            const proto = this._stack.GetValue(proto_sp);
            if (typeof obj !== "object" || typeof proto !== "object") {
                this._throw_trivial(new TypeError("invalid object or prototype"));
                return -1;
            }
            Object.setPrototypeOf(obj, proto);
            return 1;
        } catch (err) {
            this._throw_trivial(err);
            return -1;
        }
    }

    HasOwnProperty(obj_sp: StackPosition, key_sp: StackPosition): ResultValue {
        try {
            const obj = this._stack.GetValue(obj_sp);
            const key = this._stack.GetValue(key_sp);
            if (!_jsbb_.is_object(obj) || (typeof key !== "string" && typeof key !== "symbol")) {
                this._throw_trivial(new TypeError(`invalid object or key: ${key}`));
                return -1;
            }
            return obj.hasOwnProperty(key) ? 1 : 0;
        } catch (err) {
            this._throw_trivial(err);
            return -1;
        }
    }

    /**
     * Rethrow the last error thrown in native context to javascript execution context.
     * WILL NEVER RETURN IF ERROR THROWN.
     */
    private rethrow_native_error(): void {
        const error = this._stack.GetValue(jsbb_StackPos.Error);
        if (error !== undefined) {
            if (error === null) {
                jsbb_console.warn("rethrowing a null error (usually caused by fatal errors in native code?)");
            }
            this._stack.SetValue(jsbb_StackPos.Error, undefined);
            throw error;
        }
    }

    // [stack-based]
    // cb: C++ Function Pointer
    // return: stack position of the wrapper function
    NewCFunction(cb: FunctionPointer, data_pos: StackPosition, func_name_ptr: CString): StackPosition {
        const self = this;
        const data = this._stack.GetValue(data_pos);
        const func_name = func_name_ptr == 0 ? "(CFunction)" : _jsbb_.wasmop.UTF8ToString(func_name_ptr);
        jsbb_console.trace("NewCFunction", func_name, cb, data);

        return this._stack.Push(function (this: any) {
            if (!self._stack) {
                return undefined;
            }

            const stack = self._stack;
            stack.EnterScope();

            // prepare: fixed initial call stack positions
            const stack_base = stack.Push(undefined);  // 0 return value (placeholder)
            stack.Push(this);      // 1 this (not an error, it's intentionally to be the original this)
            stack.Push(data);      // 2 data
            stack.Push(undefined); // 3 new.target

            // prepare: arguments
            const argc = arguments.length;
            for (let i = 0; i < argc; ++i) {
                stack.Push(arguments[i]);
                jsbb_console.trace("call_function.arg", i, arguments[i]);
            }

            try {
                jsbb_console.trace("call_function.pre", func_name, self._opaque, cb, stack_base, argc);
                _jsbb_.interop.call_function(self._opaque, cb, false, stack_base, argc);
                self.rethrow_native_error();
                jsbb_console.trace("call_function.post", func_name);
            } catch (err) {
                jsbb_console.error("NewCFunction.call_function error:", func_name, typeof err, err);
                // cleanup
                stack.ExitScope();
                // in javascript execution context
                throw err;
            }

            const rval = stack.GetValue(stack_base);
            jsbb_console.trace("call_function.return", rval);

            // cleanup
            stack.ExitScope();
            return rval;
        });
    }

    // [stack-based]
    // return: stack position of the wrapper function
    NewNoopConstructor(): StackPosition {
        return this._stack.Push(function () {
        });
    }

    // generate a constructor wrapper function for native class
    NewClass(cb: FunctionPointer, data_sp: StackPosition, internal_field_count: number, class_name_ptr: CString): StackPosition {
        const self = this;
        const data = this._stack.GetValue(data_sp);
        const class_name = class_name_ptr == 0 ? "(CClass)" : _jsbb_.wasmop.UTF8ToString(class_name_ptr);
        jsbb_console.trace("NewClass", class_name, cb, data);

        const ctor = function (this: any) {
            jsbb_console.trace("new class", class_name);
            self._stack.EnterScope();

            const target = new.target;
            const is_construct_call = target !== undefined;

            // prepare: fixed initial call stack positions
            const rval_pos = self._stack.Push(undefined);  // 0 return value (placeholder)
            self._stack.Push(this);                        // 1 this (not an error, it's intentionally to be the original this)
            self._stack.Push(data);                        // 2 data
            self._stack.Push(target);                      // 3 new.target

            // prepare: arguments
            const argc = arguments.length;
            for (let i = 0; i < argc; ++i) {
                self._stack.Push(arguments[i]);
            }

            // register the instance with unique internal data
            const internal_data = _jsbb_.interop.generate_internal_data(self._opaque, internal_field_count);
            self._registry.Add(this, internal_data);

            try {
                jsbb_console.trace("new class dispatch", class_name, cb, is_construct_call, rval_pos, argc, internal_data);
                _jsbb_.interop.call_function(self._opaque, cb, is_construct_call, rval_pos, argc);
                self.rethrow_native_error();
            } catch (err) {
                jsbb_console.error("NewClass.call_function error:", class_name, err);
                // cleanup
                self._stack.ExitScope();
                // in javascript execution context
                throw err;
            }

            const rval = self._stack.GetValue(rval_pos);
            jsbb_console.trace("NewClass.return", rval);

            // cleanup
            self._stack.ExitScope();
            return rval;
        };
        ctor[jsbb_internal_field_count] = internal_field_count;
        return this._stack.Push(ctor);
    }

    // simulate the behaviour of JS_NewObjectProtoClass
    NewInstance(proto_sp: StackPosition): StackPosition {
        try {
            const proto = this._stack.GetValue(proto_sp);
            const thiz = {};
            const ctor = proto?.constructor;
            const internal_field_count = ctor?.[jsbb_internal_field_count];
            Object.setPrototypeOf(thiz, proto);
            // register the instance with unique internal data
            const internal_data = _jsbb_.interop.generate_internal_data(this._opaque, internal_field_count);
            this._registry.Add(thiz, internal_data);
            return this._stack.Push(thiz);
        } catch (err) {
            this._throw(err);
            return jsbb_StackPos.Error;
        }
        // return this._stack.Push(new proto.constructor());
    }

    NewObject(): StackPosition {
        return this._stack.Push({});
    }

    SetConstructor(func_sp: StackPosition, proto_sp: StackPosition): ResultValue {
        try {
            const p = this._stack.GetValue(proto_sp);
            const f = this._stack.GetValue(func_sp);
            f.prototype = p;
            p.constructor = f;
            return 1;
        } catch (err) {
            this._throw_trivial(err);
            return -1;
        }
    }

    SetPrototype(proto_sp: StackPosition, parent_sp: StackPosition): ResultValue {
        try {
            const proto = this._stack.GetValue(proto_sp);
            const parent = this._stack.GetValue(parent_sp);

            proto.__proto__ = parent;
            proto.constructor.__proto__ = parent;

            // should be equivalent to the above
            // Object.setPrototypeOf(proto, parent);
            // Object.setPrototypeOf(proto.constructor, parent);
            return 1;
        } catch (err) {
            this._throw_trivial(err);
            return -1;
        }
    }
}

class _jsbb_ {
    static evalResult: Function | undefined = undefined;
    static interop: InteropProtocol;
    static wasmop: WasmProtocol;
    static engine: jsbb_Engine | undefined;
    private static _i64: BigInt64Array;
    private static _pending_worker_messages: Array<QueuedWorkerMessage> = [];
    private static _worker_owner_cache_by_pthread = new Map<number, JSWorkerLike>();

    static queue_worker_message(message: QueuedWorkerMessage): void {
        this._pending_worker_messages.push(message);
    }

    static get u8(): Uint8Array {
        if (wasmMemory.buffer != HEAP8.buffer) {
            updateMemoryViews();
        }
        return HEAPU8;
    }
    static get i32(): Int32Array {
        if (wasmMemory.buffer != HEAP8.buffer) {
            updateMemoryViews();
        }
        return HEAP32;
    }

    //TODO may not be supported?
    static get i64(): BigInt64Array {
        if (wasmMemory.buffer != HEAP8.buffer) {
            updateMemoryViews();
            this._i64 = new BigInt64Array(wasmMemory.buffer);
        }
        return this._i64;
    }

    static init(interop: InitOptions) {
        if (!interop.debug_build) {
            jsbb_console.debug = function() {};
        }

        if (!interop.bridge_logging) {
            jsbb_console.trace = function() {};
        }

        jsbb_console.debug("Initialized GodotJS bridge");

        if (typeof interop === "undefined") {
            jsbb_console.error("invalid interop");
        }
        if (typeof this.interop !== "undefined") {
            jsbb_console.error("Already initialized, do not call it twice");
        }
        try {
            this.interop = {
                gc_callback: GodotRuntime.get_func(interop.gc_callback),
                unhandled_rejection: GodotRuntime.get_func(interop.unhandled_rejection),
                call_function: GodotRuntime.get_func(interop.call_function),
                call_accessor: GodotRuntime.get_func(interop.call_accessor),
                generate_internal_data: GodotRuntime.get_func(interop.generate_internal_data),
                on_worker_message: GodotRuntime.get_func(interop.on_worker_message),
                on_worker_message_from_pthread: GodotRuntime.get_func(interop.on_worker_message_from_pthread),
                worker_get_or_add_native_transfer: GodotRuntime.get_func(interop.worker_get_or_add_native_transfer),
            };
            this.wasmop = { UTF8ToString, stringToUTF8, lengthBytesUTF8, _malloc, _free };
            for (const key of Object.keys(this.interop) as Array<keyof InteropProtocol>) {
                jsbb_console.trace("define jsbi.interop", key, typeof this.interop[key]);
            }
            for (const key of Object.keys(this.wasmop) as Array<keyof WasmProtocol>) {
                jsbb_console.trace("define jsbi.wasmop", key, typeof this.wasmop[key]);
            }
            this.install_pthread_worker_listener_hook();
            this.flush_pending_worker_messages();
        } catch (err) {
            jsbb_console.error("unexpected error:", err);
        }
    }

    static NewEngine(opaque: Pointer) {
        if (typeof this.engine !== "undefined") {
            jsbb_console.error("temporarily support only one engine");
            return -1;
        }

        // currectly, engine_id is hardcoded.
        // only one single engine is supported to new simultaneously
        this.engine = new jsbb_Engine(0, opaque);
        this.flush_pending_worker_messages();
        return 0;
    }

    static FreeEngine(engine_id: EngineID) {
        if (engine_id !== 0) {
            jsbb_console.error("invalid engine id");
            return;
        }
        this.engine!.Release();
        this.engine = undefined;
    }

    static GetEngine(engine_id: EngineID) {
        if (engine_id !== 0) {
            jsbb_console.error("invalid engine id");
            return undefined;
        }
        return this.engine;
    }

    static is_object(val: unknown): val is object {
        //NOTE IsObject() expects a class (constructor, a function) as an Object
        return val !== null && (typeof val === "object" || typeof val === "function");
    }

    static free(ptr: Pointer): void {
        this.wasmop._free(ptr);
    }

    static debugbreak(): void{
        jsbb_console.debug("debugbreak");
    }

    static log(ptr: CString): void {
        if (typeof UTF8ToString === "function") {
            let str = UTF8ToString(ptr);
            if (typeof str === "string" && str.length > 0) {
                console.log(str);
            }
        }
    }

    static error(ptr: CString): void {
        if (typeof UTF8ToString === "function") {
            let str = UTF8ToString(ptr);
            if (typeof str === "string" && str.length > 0) {
                console.error(str);
            }
        }
    }

    private static is_godot_binding_object(value: unknown): value is (Record<PropertyKey, unknown> & { [jsbb_opaque]: number }) {
        return typeof value === "object" && value !== null && typeof (value as Record<PropertyKey, unknown>)[jsbb_opaque] === "number";
    }

    private static is_plain_object(value: object): value is Record<string, unknown> {
        const proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }

    private static get_or_add_native_transfer_index(
        engine: jsbb_Engine,
        engine_opaque: IntPtr,
        pthread_id: number,
        transfer_id: number,
        context: jsbb_TransferEncodeContext,
        value: object
    ): number {
        const existing_index = context.transfer_index_by_object.get(value);

        if (typeof existing_index === "number") {
            return existing_index;
        }

        const value_sp = engine.stack.Push(value);
        const native_index = this.interop.worker_get_or_add_native_transfer(pthread_id, engine_opaque, transfer_id, value_sp);

        if (!Number.isInteger(native_index) || native_index < 0) {
            const object_record = value as Record<PropertyKey, unknown>;
            const constructor_value = object_record.constructor;
            const constructor_name = typeof constructor_value === "function" ? constructor_value.name : "unknown";
            const opaque = object_record[jsbb_opaque];
            const descriptor = `ctor=${constructor_name} tag=${Object.prototype.toString.call(value)} opaque=${String(opaque)} engine_token=${String(engine_opaque)}`;

            if (native_index === jsbb_WorkerTransferErrorCode.ObjectNotInTransferList) {
                throw new Error(`A Godot Object was passed that was not in the transfer list. (${descriptor})`);
            }

            if (native_index === jsbb_WorkerTransferErrorCode.VariantConversionFailed) {
                throw new Error(`Failed to convert JS value to Variant for worker transfer. (${descriptor})`);
            }

            if (native_index === jsbb_WorkerTransferErrorCode.VariantCloneFailed) {
                throw new Error(`Failed to clone Godot Variant for worker transfer. (${descriptor})`);
            }

            if (
                native_index === jsbb_WorkerTransferErrorCode.EnvMissing
                || native_index === jsbb_WorkerTransferErrorCode.IsolateMissing
                || native_index === jsbb_WorkerTransferErrorCode.NonObjectValue
                || native_index === jsbb_WorkerTransferErrorCode.TransferAppendFailed
            ) {
                throw new Error(`Native worker transfer helper failed (code=${String(native_index)}; ${descriptor})`);
            }

            throw new Error(`Failed to append Godot binding to native worker transfer list (code=${String(native_index)}; ${descriptor}).`);
        }

        context.transfer_index_by_object.set(value, native_index >>> 0);
        return native_index >>> 0;
    }

    private static try_get_or_add_native_transfer_index(
        engine: jsbb_Engine,
        engine_opaque: IntPtr,
        pthread_id: number,
        transfer_id: number,
        context: jsbb_TransferEncodeContext,
        value: object
    ): number | undefined {
        const existing_index = context.transfer_index_by_object.get(value);

        if (typeof existing_index === "number") {
            return existing_index;
        }

        const value_sp = engine.stack.Push(value);
        const native_index = this.interop.worker_get_or_add_native_transfer(pthread_id, engine_opaque, transfer_id, value_sp);

        if (Number.isInteger(native_index) && native_index >= 0) {
            const index = native_index >>> 0;
            context.transfer_index_by_object.set(value, index);
            return index;
        }

        if (native_index === jsbb_WorkerTransferErrorCode.VariantConversionFailed) {
            return undefined;
        }

        const object_record = value as Record<PropertyKey, unknown>;
        const constructor_value = object_record.constructor;
        const constructor_name = typeof constructor_value === "function" ? constructor_value.name : "unknown";
        const opaque = object_record[jsbb_opaque];
        const descriptor = `ctor=${constructor_name} tag=${Object.prototype.toString.call(value)} opaque=${String(opaque)} engine_token=${String(engine_opaque)}`;

        if (native_index === jsbb_WorkerTransferErrorCode.ObjectNotInTransferList) {
            throw new Error(`A Godot Object was passed that was not in the transfer list. (${descriptor})`);
        }

        if (native_index === jsbb_WorkerTransferErrorCode.VariantCloneFailed) {
            throw new Error(`Failed to clone Godot Variant for worker transfer. (${descriptor})`);
        }

        if (
            native_index === jsbb_WorkerTransferErrorCode.EnvMissing
            || native_index === jsbb_WorkerTransferErrorCode.IsolateMissing
            || native_index === jsbb_WorkerTransferErrorCode.NonObjectValue
            || native_index === jsbb_WorkerTransferErrorCode.TransferAppendFailed
        ) {
            throw new Error(`Native worker transfer helper failed (code=${String(native_index)}; ${descriptor})`);
        }

        throw new Error(`Failed to append value to native worker transfer list (code=${String(native_index)}; ${descriptor}).`);
    }

    private static create_transfer_encode_context(): jsbb_TransferEncodeContext {
        return {
            native_transfers_used: false,
            transfer_index_by_object: new Map<object, number>(),
            seen: new WeakMap<object, unknown>(),
        };
    }

    private static seed_native_transfer_index_map(
        engine: jsbb_Engine,
        engine_opaque: IntPtr,
        pthread_id: number,
        transfer_id: number,
        context: jsbb_TransferEncodeContext,
        transfer_list: unknown
    ): void {
        if (transfer_list === null || transfer_list === undefined || typeof transfer_list !== "object") {
            return;
        }

        // Native transfer queues are already built from Godot-side containers (e.g. GArray).
        // Iterating those containers in JS can materialize proxy wrappers that fail round-trip
        // conversion back to Variant in this pre-seeding path. Resolve indices lazily from
        // rewritten message bindings instead.
        if (this.is_godot_binding_object(transfer_list)) {
            return;
        }

        if (Array.isArray(transfer_list)) {
            for (const item of transfer_list) {
                if (this.is_godot_binding_object(item)) {
                    this.get_or_add_native_transfer_index(engine, engine_opaque, pthread_id, transfer_id, context, item);
                }
            }
            return;
        }

        const iterable = (transfer_list as { [Symbol.iterator]?: unknown })[Symbol.iterator];

        if (typeof iterable === "function") {
            for (const item of transfer_list as Iterable<unknown>) {
                if (this.is_godot_binding_object(item)) {
                    this.get_or_add_native_transfer_index(engine, engine_opaque, pthread_id, transfer_id, context, item);
                }
            }
        }
    }

    private static extract_message_variants(
        engine: jsbb_Engine,
        engine_opaque: IntPtr,
        pthread_id: number,
        transfer_id: number,
        context: jsbb_TransferEncodeContext,
        value: unknown,
    ): unknown {
        if (!this.is_object(value)) {
            return value;
        }

        if (jsbb_is_transfer_marker(value)) {
            context.native_transfers_used = true;
            context.seen.set(value, value);
            return value;
        }

        const seen_value = context.seen.get(value);

        if (seen_value !== undefined) {
            return seen_value;
        }

        if (value instanceof ArrayBuffer
            || ArrayBuffer.isView(value)
            || value instanceof Date
            || value instanceof RegExp
        ) {
            context.seen.set(value, value);
            return value;
        }

        if (!Array.isArray(value) && !(value instanceof Map) && !(value instanceof Set) && !this.is_plain_object(value)) {
            const transfer_index = this.try_get_or_add_native_transfer_index(engine, engine_opaque, pthread_id, transfer_id, context, value);

            if (typeof transfer_index === "number") {
                context.native_transfers_used = true;
                const marker = jsbb_create_transfer_marker(transfer_index);
                context.seen.set(value, marker);
                return marker;
            }
        }

        if (this.is_godot_binding_object(value)) {
            const transfer_index = this.get_or_add_native_transfer_index(engine, engine_opaque, pthread_id, transfer_id, context, value);
            context.native_transfers_used = true;
            const marker = jsbb_create_transfer_marker(transfer_index);
            context.seen.set(value, marker);
            return marker;
        }

        context.seen.set(value, value);

        if (Array.isArray(value)) {
            let rewritten_array: Array<unknown> | null = null;

            for (let i = 0; i < value.length; i++) {
                const original = value[i];
                const rewritten = this.extract_message_variants(engine, engine_opaque, pthread_id, transfer_id, context, original);

                if (rewritten !== original && rewritten_array === null) {
                    rewritten_array = value.slice();
                    context.seen.set(value, rewritten_array);
                }

                if (rewritten_array !== null) {
                    rewritten_array[i] = rewritten;
                }
            }

            if (rewritten_array === null) {
                return value;
            }

            return rewritten_array;
        }

        if (value instanceof Map) {
            let rewritten_map: Map<unknown, unknown> | null = null;
            let map_entry_index = 0;

            for (const [key, map_value] of value.entries()) {
                const rewritten_key = this.extract_message_variants(engine, engine_opaque, pthread_id, transfer_id, context, key);
                const rewritten_value = this.extract_message_variants(engine, engine_opaque, pthread_id, transfer_id, context, map_value);

                if (rewritten_key !== key || rewritten_value !== map_value) {
                    if (rewritten_map === null) {
                        rewritten_map = new Map<unknown, unknown>();
                        let copied = 0;

                        for (const [prefix_key, prefix_value] of value.entries()) {
                            if (copied++ >= map_entry_index) {
                                break;
                            }

                            rewritten_map.set(prefix_key, prefix_value);
                        }

                        context.seen.set(value, rewritten_map);
                    }

                    rewritten_map.set(rewritten_key, rewritten_value);
                } else if (rewritten_map !== null) {
                    rewritten_map.set(key, map_value);
                }

                map_entry_index++;
            }

            if (rewritten_map === null) {
                return value;
            }

            return rewritten_map;
        }

        if (value instanceof Set) {
            let rewritten_set: Set<unknown> | null = null;
            let set_entry_index = 0;

            for (const original_value of value) {
                const rewritten_value = this.extract_message_variants(engine, engine_opaque, pthread_id, transfer_id, context, original_value);

                if (rewritten_value !== original_value) {
                    if (rewritten_set === null) {
                        rewritten_set = new Set<unknown>();
                        let copied = 0;

                        for (const prefix_value of value) {
                            if (copied++ >= set_entry_index) {
                                break;
                            }

                            rewritten_set.add(prefix_value);
                        }

                        context.seen.set(value, rewritten_set);
                    }

                    rewritten_set.add(rewritten_value);
                }

                set_entry_index++;
            }

            if (rewritten_set === null) {
                return value;
            }

            return rewritten_set;
        }

        if (!this.is_plain_object(value)) {
            return value;
        }

        let rewritten_object: Record<string, unknown> | null = null;
        const keys = Object.keys(value);

        for (const key of keys) {
            const original = value[key];
            const rewritten = this.extract_message_variants(engine, engine_opaque, pthread_id, transfer_id, context, original);

            if (rewritten !== original && rewritten_object === null) {
                rewritten_object = { ...value };
                context.seen.set(value, rewritten_object);
            }

            if (rewritten_object !== null) {
                rewritten_object[key] = rewritten;
            }
        }

        if (rewritten_object === null) {
            context.seen.set(value, value);
            return value;
        }

        return rewritten_object;
    }

    static post_message_to_worker(pthread_id: number, data: unknown, transfer_id?: number): boolean {
        try {
            const worker = PThread?.pthreads[pthread_id];

            if (!worker) {
                return false;
            }

            const payload: WorkerMessage = {
                __jsbMessage: true,
                data,
            };

            if (typeof transfer_id === "number") {
                payload.transfer_id = transfer_id;
            }

            worker.postMessage(payload);

            return true;
        } catch (err) {
            jsbb_console.error("post_message_to_worker failed:", err);
            return false;
        }
    }

    private static install_pthread_worker_listener_hook(): void {
        if (ENVIRONMENT_IS_PTHREAD || !PThread) {
            return;
        }

        const original_get_new_worker = PThread.getNewWorker;

        if (original_get_new_worker.__jsb_wrapped) {
            return;
        }

        const wrapped_get_new_worker: typeof original_get_new_worker = (() => {
            const worker = original_get_new_worker.call(PThread);

            if (worker) {
				// Install our own message listener (in addition to what Emscripten puts in place)
				worker.addEventListener("message", (event: MessageEvent) => {
					if (event.data?.__jsbMessage !== true) {
						return;
					}

					const sender_pthread_id = typeof event.data.sender_pthread_id === "number"
						? event.data.sender_pthread_id
						: undefined;

					this.queue_worker_message({
						data: event.data.data,
						transfer_id: event.data.transfer_id,
						sender_pthread_id,
					});

					event.stopImmediatePropagation();
				});
            }

            return worker;
        });
        wrapped_get_new_worker.__jsb_wrapped = true;

        PThread.getNewWorker = wrapped_get_new_worker;
    }

    private static dispatch_direct_worker_message(data: unknown, sender_pthread_id?: number): void {
        if (ENVIRONMENT_IS_PTHREAD) {
            const worker_parent = getJSWorkerParent();

            if (!worker_parent) {
                return;
            }

            worker_parent.onmessage.call(worker_parent, data);
            return;
        }

        if (typeof sender_pthread_id === "number") {
            const worker_owner = this._worker_owner_cache_by_pthread.get(sender_pthread_id);

            if (!worker_owner) {
                throw new Error(`JSWorker owner was not registered for pthread id ${String(sender_pthread_id)}`);
            }

            worker_owner.onmessage.call(worker_owner, data);
        }
    }

    static RegisterWorkerOwner(pthread_id: number, _engine_opaque: IntPtr, worker_owner_sp: StackPosition): boolean {
        const engine = this.engine;
        if (!engine) {
            return false;
        }

        if (worker_owner_sp < jsbb_StackPos._Num) {
            return false;
        }

        const worker_owner = engine.stack.GetValue(worker_owner_sp) as JSWorkerLike;
        if (typeof worker_owner?.onmessage !== "function") {
            return false;
        }
        this._worker_owner_cache_by_pthread.set(pthread_id, worker_owner);
        return true;
    }

    static PostMessage(
        pthread_id: number,
        engine_opaque: IntPtr,
        data_sp: StackPosition,
        transfer_id: number,
        native_transfers_stack_position: StackPosition): number {
        const engine = this.engine;

        if (!engine) {
            return jsbb_PostMessageResult.Failed;
        }

        engine.stack.EnterScope();

        try {
            const transfer_context = this.create_transfer_encode_context();
            const transfer_list = native_transfers_stack_position >= jsbb_StackPos._Num ? engine.stack.GetValue(native_transfers_stack_position) : undefined;

            this.seed_native_transfer_index_map(engine, engine_opaque, pthread_id, transfer_id, transfer_context, transfer_list);

            const message = engine.stack.GetValue(data_sp);

            const rewritten = this.extract_message_variants(
                engine,
                engine_opaque,
                pthread_id,
                transfer_id,
                transfer_context,
                message
            );
            const outbound_transfer_id = transfer_context.native_transfers_used ? transfer_id : undefined;

            if (ENVIRONMENT_IS_PTHREAD) {
                const payload: WorkerMessage = {
                    __jsbMessage: true,
                    data: rewritten,
                    sender_pthread_id: pthread_id,
                };
                if (typeof outbound_transfer_id === "number") {
                    payload.transfer_id = outbound_transfer_id;
                }
                postMessage(payload);

                return typeof outbound_transfer_id === "number"
                    ? jsbb_PostMessageResult.Success
                    : jsbb_PostMessageResult.NativeTransfersUnused;
                }

            if (!this.post_message_to_worker(pthread_id, rewritten, outbound_transfer_id)) {
                return jsbb_PostMessageResult.Failed;
            }

            return typeof outbound_transfer_id === "number"
                ? jsbb_PostMessageResult.Success
                : jsbb_PostMessageResult.NativeTransfersUnused;
        } finally {
            engine.stack.ExitScope();
        }
    }

    private static flush_pending_worker_messages(): void {
        if (this._pending_worker_messages.length === 0 || !this.engine || !this.interop) {
            return;
        }

        const queue = this._pending_worker_messages.splice(0, this._pending_worker_messages.length);

        for (const queued of queue) {
            this.handle_message(queued);
        }
    }

    static FlushPendingWorkerMessages(): void {
        this.flush_pending_worker_messages();
    }

    static handle_message(message: QueuedWorkerMessage): void {
        const { data, transfer_id, sender_pthread_id } = message;

        if (!this.engine || !this.interop) {
            this._pending_worker_messages.push(message);
            return;
        }

        if (typeof transfer_id !== "number") {
            this.dispatch_direct_worker_message(data, sender_pthread_id);
            return;
        }

        this.engine.stack.EnterScope();

        try {
            const data_sp = this.engine.stack.Push(data);

            if (typeof sender_pthread_id === "number") {
                this.interop.on_worker_message_from_pthread(sender_pthread_id, data_sp, transfer_id);
            } else {
                this.interop.on_worker_message(data_sp, transfer_id);
            }
        } finally {
            this.engine.stack.ExitScope();
        }
    }
}

// Sent via postMessage to/from a Worker.
interface WorkerMessage {
    __jsbMessage: true;
    /**
     * Worker messages are split into two parts. This is the browser-compatible component of the message that can safely
     * be delivered by a browser's postMessage. Any Godot variants that may have been present are replaced by markers
     * and delivered via a WASM-side message side-channel.
     */
    data: unknown;
    /**
     * Corresponding WASM-side message where Godot variants can be restored from.
     */
    transfer_id?: number;
    sender_pthread_id?: number;
}

interface QueuedWorkerMessage {
    data: unknown;
    transfer_id?: number;
    sender_pthread_id?: number;
}

interface GodotRuntime {
    get_func(ptr: number): (...args: any[]) => any;
}

type PThreadPointer = number;

// https://github.com/emscripten-core/emscripten/blob/bee9a1c2bc39cd33ff2f2b6b4642951eb473dcea/src/lib/libpthread.js#L93
interface EmscriptenPThreadWorker extends Worker {
    pthread_ptr?: PThreadPointer;
}

interface EmscriptenPThread {
	getNewWorker: (() => Worker) & { __jsb_wrapped?: true };
    pthreads: Record<PThreadPointer, EmscriptenPThreadWorker>;
}

// all symbols from godot generated wasm glue code
declare const updateMemoryViews: Function;
declare const GodotRuntime: GodotRuntime;
declare const wasmMemory: WebAssembly.Memory;
declare const HEAP8: Int8Array;
declare const HEAPU8: Uint8Array;
declare const HEAP32: Int32Array;
declare const global: any;
declare const require: undefined | ((module_name: string) => any);
declare const _malloc: EmscriptenModule['_malloc'];
declare const _free: EmscriptenModule['_free'];
declare const PThread: undefined | EmscriptenPThread;
declare const ENVIRONMENT_IS_PTHREAD: undefined | boolean;

if (ENVIRONMENT_IS_PTHREAD && typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener('message', (e: MessageEvent) => {
        if (!jsbb_is_worker_message(e.data)) {
            return;
        }

        const sender_pthread_id = typeof e.data.sender_pthread_id === "number"
            ? e.data.sender_pthread_id
            : undefined;

        _jsbb_.queue_worker_message({
            data: e.data.data,
            transfer_id: e.data.transfer_id,
            sender_pthread_id,
        });

        e.stopImmediatePropagation();
    }, true);
}

const jsbb_browser = (typeof globalThis === "object" && globalThis) || (typeof window === "object" && window) || (typeof global === "object" && global);
(<any>jsbb_browser)["_jsbb_"] = _jsbb_;
