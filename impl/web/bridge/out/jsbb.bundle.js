"use strict";
;
class jsbb_UnsafeArray {
    constructor() {
        this.items = [];
        this.freelist = [];
    }
    Add(o) {
        const available = this.freelist.length - 1;
        let index;
        if (available >= 0) {
            index = this.freelist[available];
            this.freelist.length = available;
        }
        else {
            index = this.items.length;
        }
        this.items[index] = o;
        return index + 1;
    }
    Get(index) {
        return this.items[index - 1];
    }
    // remove an entry and return it's value
    Remove(index) {
        const abs_index = index - 1;
        const o = this.items[abs_index];
        this.items[abs_index] = undefined;
        this.freelist.push(abs_index);
        return o;
    }
}
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
// Stack for Locals (starts from zero)
class jsbb_Stack {
    constructor() {
        this.frames = [];
        this.values = [];
    }
    get pos() { return this.values.length; }
    SetValue(pos, value) {
        if (pos < 0 || pos >= this.values.length) {
            throw new RangeError("invalid stack position");
        }
        this.values[pos] = value;
    }
    // get frame value
    GetValue(pos) {
        if (pos < 0 || pos >= this.values.length) {
            throw new RangeError("invalid stack position");
        }
        return this.values[pos];
    }
    // return undefined if n is zero, otherwise return the last n values on stack
    GetValues(n) {
        if (n <= 0)
            return undefined;
        if (n > this.values.length)
            throw new RangeError("unsatisfied stack size");
        return this.values.slice(-n);
    }
    // return stack offset
    Push(val) {
        if (this.values.length >= jsbb_kMaxStackSize) {
            throw new RangeError("stack overflow");
        }
        return this.values.push(val) - 1;
    }
    EnterScope() {
        this.frames.push(this.values.length);
    }
    ExitScope() {
        const frame = this.frames.pop();
        this.values.length = frame;
    }
}
// a wrapper for primitive types (number, string etc.)
class jsbb_Wrapper {
    constructor(target) {
        this.target = target;
    }
}
class jsbb_Globals {
    static isTraceable(o) {
        const type = typeof o;
        return o !== null && type !== "function" && type !== "object";
    }
    constructor() {
        this.handles = new jsbb_UnsafeArray();
    }
    // trace an object (it's weak-referenced by default)
    AddValue(o) {
        if (!jsbb_Globals.isTraceable(o)) {
            o = new jsbb_Wrapper(o);
        }
        const token = new WeakRef(o);
        const handle_id = this.handles.Add({
            token: token,
            sref: undefined,
        });
        return handle_id;
    }
    IsValid(handle_id) {
        //TODO IMPLEMENT IT NOW
        //TODO IMPLEMENT IT NOW
        //TODO IMPLEMENT IT NOW
        throw new Error("not implemented");
    }
    // unsafe, must ensure a valid index by yourself
    Remove(handle_id) {
        this.handles.Remove(handle_id);
    }
    // return the original target object in registry
    GetValue(handle_id) {
        const handle = this.handles.Get(handle_id);
        const target = handle.token.deref();
        if (target instanceof jsbb_Wrapper) {
            return target.target;
        }
        return target;
    }
    SetWeak(handle_id) {
        const handle = this.handles.Get(handle_id);
        handle.sref = undefined;
    }
    SetStrong(handle_id) {
        const handle = this.handles.Get(handle_id);
        handle.sref = handle.token.deref();
    }
}
class jsbb_Registry {
    constructor(opaque) {
        this.watcher = new FinalizationRegistry(function (info) {
            NativeAPI.gc_callback(opaque, info);
        });
    }
    Add(obj, opaque) {
        // opaque saved in obj[opaque.symbol] for GetOpaque(), it's never changed.
        obj[jsbb_opaque] = opaque;
        this.watcher.register(obj, opaque);
    }
}
function jsbb_ensure(condition) {
    console.assert(condition);
}
class jsbb_External {
    get data() { return this._data; }
    constructor(data) {
        this._data = data;
    }
}
class jsbb_Atom {
    constructor(value) {
        this.value = value;
        this.rc = 1;
    }
}
class jsbb_Engine {
    get stack() { return this._stack; }
    get globals() { return this._globals; }
    // last error thrown (Error | undefined)
    get error() { return this._stack.GetValue(jsbb_StackPos.Error); }
    set error(value) {
        const last = this._stack.GetValue(jsbb_StackPos.Error);
        if (last !== undefined) {
            console.error("discarding an unhandled error", last);
        }
        this._stack.SetValue(jsbb_StackPos.Error, value);
    }
    constructor(engine_id, opaque) {
        this._opaque = 0;
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
        jsbb_ensure(this._stack.Push(null) === jsbb_StackPos.Error);
        jsbb_ensure(this._stack.pos === jsbb_StackPos._Num);
    }
    Release() {
        this._global = undefined;
        this._stack = undefined;
        this._registry = undefined;
    }
    SetHostPromiseRejectionTracker(cb, data) {
        //TODO
        window.addEventListener("unhandledrejection", function (ev) {
            console.log("unhandled promise rejection");
        });
    }
    static GetStringHash(val) {
        let hash = 0;
        const len = val.length;
        for (let i = 0; i < len; ++i) {
            hash = (hash << 5) - hash + val.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }
    static GetNumberHash(val) {
        if ((val | 0) != 0)
            return val;
        return jsbb_Engine.GetStringHash(val.toString());
    }
    // must return a stable hash for value.
    // 0 is OK but introduce additional strict_eq evaluation.
    GetIdentityHash(stack_pos) {
        const val = this._stack.GetValue(stack_pos);
        if (typeof val === "undefined" || val === null)
            return 0;
        if (typeof val === "number")
            return jsbb_Engine.GetNumberHash(val);
        if (typeof val === "boolean")
            return val ? 1 : 0;
        if (typeof val === "string")
            return jsbb_Engine.GetStringHash(val);
        if (typeof val === "bigint")
            return jsbb_Engine.GetStringHash(val.toString());
        // if (typeof val === "function")
        // if (typeof val === "object")
        // if (typeof val === "symbol") 
        // internal data index as hash since it's never changed
        if (typeof val[jsbb_opaque] !== "undefined")
            return val[jsbb_opaque] | 0;
        return 0;
    }
    NewAtom(stack_pos) {
        return this._atoms.Add(new jsbb_Atom(this._stack.GetValue(stack_pos)));
    }
    NewAtomStr(ptr) {
        let str = NativeAPI.UTF8ToString(ptr);
        return this._atoms.Add(new jsbb_Atom(str));
    }
    DupAtom(atom_id) {
        let atom = this._atoms.Get(atom_id);
        ++atom.rc;
        return atom_id;
    }
    FreeAtom(atom_id) {
        let atom = this._atoms.Get(atom_id);
        if (--atom.rc == 0) {
            this._atoms.Remove(atom_id);
        }
    }
    //TODO need type check?
    ToCStringLen(o_size, str_sp) {
        const str = this._stack.GetValue(str_sp);
        const len = NativeAPI.lengthBytesUTF8(str);
        NativeAPI.HEAP32[o_size >> 2] = len;
        return NativeAPI.stringToUTF8(str);
    }
    ToString(stack_pos) {
        const val = this._stack.GetValue(stack_pos);
        return this._stack.Push(String(val));
    }
    NumberValue(stack_pos) {
        const val = this._stack.GetValue(stack_pos);
        return Number(val);
    }
    BooleanValue(stack_pos) {
        const val = this._stack.GetValue(stack_pos);
        return Boolean(val);
    }
    Int32Value(stack_pos) {
        const val = this._stack.GetValue(stack_pos);
        return Number(val) | 0;
    }
    Uint32Value(stack_pos) {
        const val = this._stack.GetValue(stack_pos);
        return (Number(val) | 0) >>> 0;
    }
    Int64Value(stack_pos, o_value_ptr) {
        const val = this._stack.GetValue(stack_pos);
        NativeAPI.HEAP64[o_value_ptr >> 3] = val;
        return true;
    }
    // duplicate a value to the stack top
    StackDup(stack_pos) {
        return this._stack.Push(this._stack.GetValue(stack_pos));
    }
    GetOpaque(stack_pos) {
        let obj = this._stack.GetValue(stack_pos);
        if (typeof obj !== "object") {
            return 0;
        }
        return obj[jsbb_opaque];
    }
    NewExternal(data) {
        return this._stack.Push(new jsbb_External(data));
    }
    NewInt32(value) {
        return this._stack.Push(value);
    }
    NewUint32(value) {
        return this._stack.Push(value >>> 0);
    }
    NewNumber(value) {
        return this._stack.Push(value);
    }
    NewBigInt64(val_ptr) {
        const val = NativeAPI.HEAP64[val_ptr >> 3];
        return this._stack.Push(val);
    }
    NewSymbol() {
        return this._stack.Push(Symbol());
    }
    NewMap() {
        return this._stack.Push(new Map());
    }
    NewArray() {
        return this._stack.Push([]);
    }
    IsExternal(stack_pos) {
        return this._stack.GetValue(stack_pos) instanceof jsbb_External;
    }
    //TODO return error int
    SetProperty(obj_sp, key_sp, val_sp) {
        const obj = this._stack.GetValue(obj_sp);
        const key = this._stack.GetValue(key_sp);
        const val = this._stack.GetValue(val_sp);
        if (obj instanceof Map) {
            obj.set(key, val);
        }
        else {
            obj[key] = val;
        }
        return 0;
    }
    //
    SetPropertyUint32(obj_sp, index, value_sp) {
        const obj = this._stack.GetValue(obj_sp);
        const val = this._stack.GetValue(value_sp);
        try {
            obj[index] = val;
        }
        catch (err) {
            this.error = err;
            //TODO save error 
            return -1;
        }
        return 0;
    }
    // push global to stack, return it's stack position
    GetGlobalObject() {
        return this._stack.Push(this._global);
    }
    CompileModuleSource(id, src) {
        let module_id = NativeAPI.UTF8ToString(id);
        let module_source = NativeAPI.UTF8ToString(src);
        let source = `jsbb_runtime.GetEngine(${this._id}).SetModuleEvaluator('${module_id}', ${module_source}});`;
        try {
            eval(source);
        }
        catch (err) {
            // eval not supported
            if (err instanceof EvalError) {
                //TODO if async module is implemented, we can use dynamic scripts which support debugging in browser devtools
                // but for now, we need a method to eval source synchronously
                let script = document.createElement("script");
                script.type = "type/javascript";
                script.text = source;
                document.head.appendChild(script);
            }
            else {
                //TODO exception in source
                console.error(module_id, err);
            }
        }
    }
    // internal 
    SetModuleEvaluator(module_id, evaluator) {
        this._scripts.set(module_id, evaluator);
    }
    // stack-based call
    GetModuleEvaluator(module_id_sp) {
        const module_id = this._stack.GetValue(module_id_sp);
        const module_eval = this._scripts.get(module_id);
        console.log("GetModuleEvaluator", module_id, typeof module_eval);
        return this._stack.Push(module_eval);
    }
    Call(this_sp, func_sp, argc, argv) {
        const thiz = this._stack.GetValue(this_sp);
        const func = this._stack.GetValue(func_sp);
        if (typeof func !== "function") {
            this.error = new TypeError("not a function");
            return jsbb_StackPos.Error;
        }
        let args = undefined;
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
        }
        catch (error) {
            this.error = error;
            return jsbb_StackPos.Error;
        }
    }
    // [stack-based]
    // cb: C++ Function Pointer
    // return: stack position of the wrapper function 
    NewCFunction(cb, data_pos) {
        const self = this;
        const data = this._stack.GetValue(data_pos);
        return this._stack.Push(function () {
            self._stack.EnterScope();
            // prepare: fixed initial call stack positions
            const rval_pos = self._stack.Push(undefined); // 0 return value (placeholder)
            self._stack.Push(self); // 1 this
            self._stack.Push(data); // 2 data
            self._stack.Push(new.target); // 3 new.target
            // prepare: arguments
            const argc = arguments.length;
            for (let i = 0; i < argc; ++i) {
                self._stack.Push(arguments[i]);
            }
            try {
                NativeAPI.ccall(self._opaque, cb, argc);
            }
            catch (error) {
                self.error = error;
                self._stack.ExitScope();
                return jsbb_StackPos.Error;
            }
            const rval = self._stack.GetValue(rval_pos);
            // cleanup
            self._stack.ExitScope();
            return rval;
        });
    }
    NewClass() {
        return this._stack.Push(function () { });
    }
    NewObjectProtoClass(proto_pos, obj_opaque) {
        try {
            const proto = this._stack.GetValue(proto_pos);
            const obj = new proto.constructor();
            this._registry.Add(obj, obj_opaque);
            return this._stack.Push(obj);
        }
        catch (error) {
            this.error = error;
            return jsbb_StackPos.Error;
        }
    }
    SetConstructor(func, proto) {
        const p = this._stack.GetValue(proto);
        const f = this._stack.GetValue(func);
        p.constructor = f;
    }
    SetPrototype(proto_pos, parent_pos) {
        const a = this._stack.GetValue(proto_pos);
        const b = this._stack.GetValue(parent_pos);
        a.prototype = b.prototype;
    }
}
// opaque for UniversalBridgeClass
const jsbb_opaque = Symbol();
let engine;
let NativeAPI;
const browser = global || globalThis || window;
class jsbb_runtime {
    static init(api) {
        if (typeof NativeAPI !== "undefined") {
            console.error("Already initialized, do not call it twice");
        }
        NativeAPI = api;
    }
    static NewEngine(opaque) {
        if (typeof engine !== "undefined") {
            throw new Error();
        }
        engine = new jsbb_Engine(0, opaque);
        return 0;
    }
    static FreeEngine(engine_id) {
        if (engine_id !== 0) {
            throw new Error();
        }
        engine.Release();
        engine = undefined;
    }
    static GetEngine(engine_id) { return engine; }
}
browser["jsbb_runtime"] = jsbb_runtime;
