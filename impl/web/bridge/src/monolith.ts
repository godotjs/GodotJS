
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

enum jsbb_PropertyFlags {
    CONFIGURABLE = 1 << 0,
    WRITABLE = 1 << 1,
    ENUMERABLE = 1 << 2,
    GET = 1 << 3,
    SET = 1 << 4,
    VALUE = 1 << 5,
}

const jsbb_PropertyFilter = {
    SKIP_STRINGS: 8,
    SKIP_SYMBOLS: 16
};
    
interface InteropProtocol {
    UTF8ToString(ptr: Pointer): string;
    stringToUTF8(str: string): Pointer;
    lengthBytesUTF8(str: string): number;

    HEAPU8: Uint8Array,
    HEAP32: Int32Array, 
    HEAP64: BigInt64Array, 

    gc_callback(engine_opaque: IntPtr, internal_opaque: Pointer): void;
    unhandled_rejection(engine_opaque: IntPtr, cb: FunctionPointer, promise_sp: StackPosition, reason_sp: StackPosition): void;

    // is_construct_call: true if it's a constructor call, it's just a shorthand for `new.target !== undefined` on C++ side
    call_function(opaque: IntPtr, fn: any, is_construct_call: boolean, base_sp: number, argc: number): void;

    call_accessor(opaque: IntPtr, fn: any, key_sp: number, rval_sp: number): void;

    generate_internal_data(opaque: IntPtr, internal_field_count: number): IntPtr;
};

// FinalizationRegistry (ES2021):
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry

// starts from 1
type UnsafeIndex = number;
type jsbb_AtomID = number;

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
    Error: 7,

    _Num: 8,
};

const JS_ATOM_message = 0;
const JS_ATOM_stack = 1;
const _JS_ATOM_Num = 2;

// Stack for Locals (starts from zero)
class jsbb_Stack<T> {
    private frames: Array<number> = [];
    private values: Array<T> = [];

    get pos() { return this.values.length; }

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
            console.warn("stack overflow", this.values.length);
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

interface jsbb_HandleEntry {
    // a weak reference to a target object
    // jsbb_Wrapper is used as target if the original target is primitive (number, bigint, string etc.)
    token: WeakRef<object>;

    // (optional) a strong reference to target
    sref: object | undefined;
}

function jsbb_IsTraceable(o: any): boolean {
    const type = typeof o;
    return !(o !== null && type !== "function" && type !== "object");
}

class jsbb_Handles {
    private idgen: number = 0;
    private handles: Array<jsbb_HandleEntry | undefined> = [];

    constructor() {
        this.handles[999] = undefined;
    }

    // trace an object (it's strongly referenced by default)
    AddValue(o: any) {
        if (!jsbb_IsTraceable(o)) {
            o = new jsbb_Wrapper(o);
        }
        const token = new WeakRef(o);
        const id = this.idgen++;
        this.handles[id] = {
            token: token,
            sref: undefined,
        };
        return id;
    }

    IsValid(handle_id: GlobalID): boolean {
        const handle = this.handles[handle_id];
        if (typeof handle === "undefined") {
            return false;
        }
        if (handle.sref != undefined || handle.token.deref() != undefined) {
            return true;
        }

        console.warn("obsolete handle", handle_id);
        delete this.handles[handle_id];
        return false;
    }

    // unsafe, must ensure a valid index by yourself
    Remove(handle_id: GlobalID) {
        delete this.handles[handle_id];
    }

    // return the original target object in registry
    GetValue(handle_id: number): any {
        const handle = this.handles[handle_id];
        if (typeof handle === "undefined") {
            console.warn("invalid handle id", handle_id);
            return;
        }
        const target = handle.token.deref();
        if (target instanceof jsbb_Wrapper) {
            return target.target;
        }
        return target!;
    }

    SetWeak(handle_id: number) {
        const handle = this.handles[handle_id];
        if (typeof handle === "undefined") {
            console.warn("invalid handle id", handle_id);
            return;
        }
        handle.sref = undefined;
    }

    SetStrong(handle_id: number) {
        const handle = this.handles[handle_id];
        if (typeof handle === "undefined") {
            console.warn("invalid handle id", handle_id);
            return;
        }
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

class jsbb_Engine {
    private _id: EngineID;

    // a fake global for Environment
    private _global: object;
    private _stack: jsbb_Stack<any>;
    private _handles: jsbb_Handles;
    private _registry: jsbb_Registry;
    private _atoms: Array<string>;

    private _opaque: IntPtr = 0;

    get stack() { return this._stack; }

    get handles() { return this._handles; }

    // last error thrown (Error | undefined)
    set error(value: any) {
        const last = this._stack.GetValue(jsbb_StackPos.Error);
        if (last !== undefined) {
            console.error("discarding an unhandled error", last);
        }
        this._stack.SetValue(jsbb_StackPos.Error, value);
    }

    constructor(engine_id: EngineID, opaque: Pointer) {
        this._id = engine_id;
        this._opaque = opaque;
        this._global = {};
        this._stack = new jsbb_Stack();
        this._handles = new jsbb_Handles();
        this._registry = new jsbb_Registry(opaque);
        this._atoms = new Array(_JS_ATOM_Num);
        this._atoms[JS_ATOM_message] = "message";
        this._atoms[JS_ATOM_stack] = "stack";

        jsbb_ensure(this._stack.Push(undefined) === jsbb_StackPos.Undefined);
        jsbb_ensure(this._stack.Push(null) === jsbb_StackPos.Null);
        jsbb_ensure(this._stack.Push(true) === jsbb_StackPos.True);
        jsbb_ensure(this._stack.Push(false) === jsbb_StackPos.False);
        jsbb_ensure(this._stack.Push("") === jsbb_StackPos.EmptyString);
        jsbb_ensure(this._stack.Push(Symbol) === jsbb_StackPos.SymbolClass);
        jsbb_ensure(this._stack.Push(Map) === jsbb_StackPos.MapClass);
        jsbb_ensure(this._stack.Push(null) === jsbb_StackPos.Error);
        jsbb_ensure(this._stack.pos === jsbb_StackPos._Num);
    }

    Release() {
        this._global = <any>undefined;
        this._handles = <any>undefined;
        this._stack = <any>undefined;
        this._registry = <any>undefined;
    }
    
    /**
     * get the last error thrown in native calls, and meanwhile, erase it from stack
     */
    GetLastError(): any {
        const error = this._stack.GetValue(jsbb_StackPos.Error);
        this._stack.SetValue(jsbb_StackPos.Error, undefined)
        return error;
    }

    SetHostPromiseRejectionTracker(cb: FunctionPointer, data: Pointer) {
        const self = this;
        window.addEventListener("unhandledrejection", function (ev: PromiseRejectionEvent) {
            self._stack.EnterScope();
            try {
                NativeAPI.unhandled_rejection(self._opaque, cb, self._stack.Push(ev.promise), self._stack.Push(ev.reason));
            } catch (err) {
                // rejection handler must do not throw error
                console.error("unexpected error", err);
            }
            self._stack.ExitScope();
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

    ReadArrayBufferData(stack_pos: StackPosition, size: number, data_dst: Pointer): void{
        const val = this._stack.GetValue(stack_pos);
        if (val instanceof ArrayBuffer) {
            if (val.byteLength < size) {
                console.error("ArrayBuffer: not enough data to read");
                return;
            }
            NativeAPI.HEAPU8.set(new Uint8Array(val), data_dst);
            return;
        }
        console.error("not ArrayBuffer");
    }

    NewArrayBuffer(data_src: Pointer, size: number): StackPosition {
        const data = new Uint8Array(NativeAPI.HEAPU8.buffer, data_src, size).slice();
        return this._stack.Push(data.buffer);
    }

    GetExternal(stack_pos: StackPosition): Pointer {
        const val = this._stack.GetValue(stack_pos);
        if (val instanceof jsbb_External) {
            return val.data;
        }
        return 0;
    }

    GetStringLength(stack_pos: StackPosition): number{
        const val = this._stack.GetValue(stack_pos);
        if (typeof val === "string") {
            return val.length;
        }
        return 0;
    }

    GetArrayLength(stack_pos: StackPosition): number{
        const val = this._stack.GetValue(stack_pos);
        if (val instanceof Array) {
            return val.length;
        }
        return 0;
    }

    //TODO need type check?
    ToCStringLen(o_size: Pointer, str_sp: StackPosition): Pointer {
        const str = String(this._stack.GetValue(str_sp));
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
        NativeAPI.HEAP64[o_value_ptr >> 3] = val;
        return true;
    }

    // duplicate a value to the stack top
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

    ThrowError(message_ptr: CString): void {
        let message = NativeAPI.UTF8ToString(message_ptr);
        this.error = new Error(message);
    }

    GetOpaque(stack_pos: StackPosition): Pointer {
        let obj = this._stack.GetValue(stack_pos);
        if (typeof obj !== "object") {
            return 0;
        }
        const opaque = obj[jsbb_opaque];
        return typeof opaque === "number" ? opaque : 0;
    }

    // len: is ignored
    NewString(cstr_ptr: CString, len: number): StackPosition {
        let str = NativeAPI.UTF8ToString(cstr_ptr);
        return this._stack.Push(str);
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

    DefineProperty(obj_sp: StackPosition, key_sp: StackPosition, value_sp: StackPosition, get_sp: StackPosition, set_sp: StackPosition, flags: jsbb_PropertyFlags): ResultValue {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._stack.GetValue(key_sp);

        const descriptor: PropertyDescriptor = {
            configurable: (flags & jsbb_PropertyFlags.CONFIGURABLE) !== 0,
            enumerable: (flags & jsbb_PropertyFlags.ENUMERABLE) !== 0,
            writable: (flags & jsbb_PropertyFlags.WRITABLE) !== 0,
            get: (flags & jsbb_PropertyFlags.GET) !== 0 ? this._stack.GetValue(get_sp) : undefined,
            set: (flags & jsbb_PropertyFlags.SET) !== 0 ? this._stack.GetValue(set_sp) : undefined,
            value: (flags & jsbb_PropertyFlags.VALUE) !== 0 ? this._stack.GetValue(value_sp) : undefined
        };
        Object.defineProperty(obj, key, descriptor);
        return 0;
    }

    DefineLazyProperty(obj_sp: StackPosition, key_sp: StackPosition, cb: FunctionPointer): ResultValue {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._stack.GetValue(key_sp);
        const self = this;

        Object.defineProperty(obj, key, {
            get: function () {
                self._stack.EnterScope();

                // prepare: fixed initial call stack positions
                const rval_sp = self._stack.Push(undefined);  // 0 return value (placeholder)
                const key_sp = self._stack.Push(key);

                try {
                    NativeAPI.call_accessor(self._opaque, cb, key_sp, rval_sp);
                } catch (error) {
                    console.error("unexpected error", error);
                    self.error = error;
                }

                const error = self.GetLastError();
                if (error !== undefined) {
                    // cleanup 
                    self._stack.ExitScope();
                    throw error;
                }

                const rval = self._stack.GetValue(rval_sp);

                // cleanup
                self._stack.ExitScope();

                // overwrite 
                Object.defineProperty(this, key, {
                    value: rval, 
                    configurable: true,
                    enumerable: true, 
                    writable: true
                });
                
                return rval;
            },
            configurable: true,
            enumerable: true
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
            this.error = err;
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
            this.error = err;
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
            this.error = new TypeError("GetOwnPropertyDescriptor: unexpected");
            return jsbb_StackPos.Error;
        } catch (err) {
            this.error = err;
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
            this.error = new TypeError("GetOwnPropertyDescriptor: unexpected");
            return jsbb_StackPos.Error;
        } catch (err) {
            this.error = err;
            return jsbb_StackPos.Error;
        }
    }

    GetPropertyAtomID(obj_sp: StackPosition, atom_id: jsbb_AtomID): StackPosition {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._atoms[atom_id];
        if (typeof key !== "string") {
            this.error = new Error("invalid atom id");
            return jsbb_StackPos.Error;
        }
        const val = obj[key];
        if (typeof val === "undefined") {
            return jsbb_StackPos.Undefined;
        }
        return this._stack.Push(val);
    }

    GetProperty(obj_sp: StackPosition, key_sp: StackPosition): StackPosition {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._stack.GetValue(key_sp);
        if (typeof key !== "string" && typeof key !== "symbol") {
            this.error = new Error("invalid atom id");
            return jsbb_StackPos.Error;
        }


        try {
            const val = obj instanceof Map ? obj.get(key) : obj[key];
        
            // saving stack space
            if (typeof val === "undefined") {
                return jsbb_StackPos.Undefined;
            }
            return this._stack.Push(val);
        } catch (err) {
            this.error = err;
            return jsbb_StackPos.Error;
        }
    }

    GetPropertyUint32(obj_sp: StackPosition, index: number): StackPosition {
        const obj = this._stack.GetValue(obj_sp);
        if (typeof index !== "number") {
            this.error = new Error("invalid atom id");
            return jsbb_StackPos.Error;
        }


        try {
            const val = obj[index];
        
            // saving stack space
            if (typeof val === "undefined") {
                return jsbb_StackPos.Undefined;
            }
            return this._stack.Push(val);
        } catch (err) {
            this.error = err;
            return jsbb_StackPos.Error;
        }
    }

    // push global to stack, return it's stack position
    GetGlobalObject(): StackPosition {
        return this._stack.Push(this._global);
    }

    CompileFunctionSource(filename_ptr: CString, source_ptr: CString): StackPosition {
        let source = NativeAPI.UTF8ToString(source_ptr);
        let rval: any = undefined;
        try {
            rval = eval(source);
        } catch (err) {
            // eval not supported (CSP restriction)
            if (err instanceof EvalError) {
                // module_source must be a bare function source (like '(function(){ ... })')

                //TODO if async module is implemented, we can use dynamic scripts which support debugging in browser devtools
                // but for now, we need a method to eval source synchronously
                let script = document.createElement("script");
                script.type = "type/javascript";
                script.text = `_jsbb_.eval = ${source};`;

                document.head.appendChild(script);
                rval = _jsbb_.eval;
                _jsbb_.eval = undefined;
                document.head.removeChild(script);
            } else {
                let filename = NativeAPI.UTF8ToString(filename_ptr);
                console.error(filename, err);

                this.error = err;
                return jsbb_StackPos.Error;
            }
        }
        
        if (typeof rval === "undefined") {
            return jsbb_StackPos.Undefined;
        }
        return this._stack.Push(rval);
    }

    /**
     * eval source code. 
     * not supported if CSP is enabled.
     */
    Eval(filename_ptr: CString, source_ptr: CString): StackPosition {
        let source = NativeAPI.UTF8ToString(source_ptr);
        let rval: any = undefined;
        try {
            rval = eval(source);
        } catch (err) {
            // it's difficult to emulate the behaviour of eval with script element (get the result without 'return').
            // just throw error for easier life.
            let filename = NativeAPI.UTF8ToString(filename_ptr);
            console.error(filename, err);

            this.error = err;
            return jsbb_StackPos.Error;
        }
        
        if (typeof rval === "undefined") {
            return jsbb_StackPos.Undefined;
        }
        return this._stack.Push(rval);
    }

    Call(this_sp: StackPosition, func_sp: StackPosition, argc: number, argv: IntPtr): StackPosition {
        const thiz = this._stack.GetValue(this_sp);
        const func: Function = this._stack.GetValue(func_sp);
        if (typeof func !== "function") {
            this.error = new TypeError("not a function");
            return jsbb_StackPos.Error;
        }

        let args: Array<any> | undefined = undefined;
        if (argc > 0) {
            args = new Array(argc);
            for (let i = 0; i < argc; ++i) {
                const arg_sp = NativeAPI.HEAP32[(argv >> 2) + i];
                args[i] = this._stack.GetValue(arg_sp);
            }
        }
        try {
            const rval = func.apply(thiz, args);
            return this._stack.Push(rval);
        } catch (error) {
            this.error = error;
            return jsbb_StackPos.Error;
        }
    }

    CallAsConstructor(func_sp: StackPosition, argc: number, argv: IntPtr): StackPosition {
        const func = this._stack.GetValue(func_sp);
        if (typeof func !== "function") {
            this.error = new TypeError("not a function");
            return jsbb_StackPos.Error;
        }

        let args: Array<any> | undefined = undefined;
        if (argc > 0) {
            args = new Array(argc);
            for (let i = 0; i < argc; ++i) {
                const arg_sp = NativeAPI.HEAP32[(argv >> 2) + i];
                args[i] = this._stack.GetValue(arg_sp);
            }
        }
        try {
            const rval = args === undefined ? new func() : new func(...args);
            return this._stack.Push(rval);
        } catch (error) {
            this.error = error;
            return jsbb_StackPos.Error;
        }
    }

    // push `obj.__proto__` to stack
    GetPrototypeOf(obj_sp: StackPosition): StackPosition {
        const obj = this._stack.GetValue(obj_sp);
        return this._stack.Push(Object.getPrototypeOf(obj));
    }

    // push `obj.__proto__` to stack
    SetPrototypeOf(obj_sp: StackPosition, proto_sp: StackPosition): ResultValue {
        const obj = this._stack.GetValue(obj_sp);
        const proto = this._stack.GetValue(proto_sp);
        if (typeof obj !== "object" || typeof proto !== "object") {
            this.error = new TypeError("invalid object or prototype");
            return -1;
        }
        Object.setPrototypeOf(obj, proto);
        return 1;
    }

    HasOwnProperty(obj_sp: StackPosition, key_sp: StackPosition): ResultValue {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._stack.GetValue(key_sp);
        if (typeof obj !== "object" || (typeof key !== "string" && typeof key !== "symbol")) {
            this.error = new TypeError("invalid object or key");
            return -1;
        }
        return obj.hasOwnProperty(key) ? 1 : 0;
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
            self._stack.Push(this);                        // 1 this (not an error, it's intentionally to be the original this)
            self._stack.Push(data);                        // 2 data
            self._stack.Push(undefined);                   // 3 new.target

            // prepare: arguments
            const argc = arguments.length;
            for (let i = 0; i < argc; ++i) {
                self._stack.Push(arguments[i]);
            }

            try {
                NativeAPI.call_function(self._opaque, cb, false, rval_pos, argc);
            } catch (error) {
                console.error("unexpected error", error);
                self.error = error;
            }
            
            const error = self.GetLastError();
            if (error !== undefined) {
                // cleanup 
                self._stack.ExitScope();
                throw error;
            }

            const rval = self._stack.GetValue(rval_pos);

            // cleanup
            self._stack.ExitScope();
            return rval;
        });
    }

    // generate a constructor wrapper function for native class
    NewClass(cb: FunctionPointer, data_sp: StackPosition, internal_field_count: number): StackPosition {
        const self = this;
        const data = this._stack.GetValue(data_sp);

        return this._stack.Push(function () {
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
            self._registry.Add(this, NativeAPI.generate_internal_data(self._opaque, internal_field_count));

            try {
                NativeAPI.call_function(self._opaque, cb, is_construct_call, rval_pos, argc);
            } catch (error) {
                console.error("unexpected error", error);
                self.error = error;
            }
            
            const error = self.GetLastError();
            if (error !== undefined) {
                // cleanup 
                self._stack.ExitScope();
                throw error;
            }
            const rval = self._stack.GetValue(rval_pos);

            // cleanup
            self._stack.ExitScope();
            return rval;
        });
    }

    NewInstance(proto_sp: StackPosition): StackPosition {
        const proto = this._stack.GetValue(proto_sp);
        return this._stack.Push(new proto.constructor());
    }

    NewObject(): StackPosition {
        return this._stack.Push({});
    }

    SetConstructor(func_sp: StackPosition, proto_sp: StackPosition): void {
        const p = this._stack.GetValue(proto_sp);
        const f = this._stack.GetValue(func_sp);
        f.prototype = p;
        p.constructor = f;
    }

    SetPrototype(proto_sp: StackPosition, parent_sp: StackPosition): void {
        const a = this._stack.GetValue(proto_sp);
        const b = this._stack.GetValue(parent_sp);
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

class _jsbb_ {
    static eval: Function | undefined = undefined;

    static init(api: InteropProtocol) {
        if (typeof NativeAPI !== "undefined") {
            console.error("Already initialized, do not call it twice");
        }
        NativeAPI = api;
    }

    static NewEngine(opaque: Pointer) {
        if (typeof engine !== "undefined") {
            console.error("temporarily support only one engine");
            return -1;
        }
        engine = new jsbb_Engine(0, opaque);
        return 0;
    }

    static FreeEngine(engine_id: EngineID) {
        if (engine_id !== 0) {
            console.error("invalid engine id");
            return;
        }
        engine!.Release();
        engine = undefined;
    }

    static GetEngine(engine_id: EngineID) {
        if (engine_id !== 0) {
            console.error("invalid engine id");
            return undefined;
        }
        return engine;
    }
}

(<any>browser)["_jsbb_"] = _jsbb_;

