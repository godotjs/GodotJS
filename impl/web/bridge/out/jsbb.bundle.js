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
    Exception: 7,
    Num: 8,
};
// Stack for Locals (starts from zero)
class jsbb_Stack {
    constructor() {
        this.frames = [];
        this.values = [];
    }
    get pos() { return this.values.length; }
    // get frame value
    GetValue(pos) {
        if (pos >= this.values.length) {
            throw new RangeError("invalidated stack position");
        }
        return this.values[pos];
    }
    // return undefined if n is zero, otherwise return the last n values on stack
    GetValues(n) {
        if (n == 0)
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
    Add(o) {
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
    // unsafe, must ensure a valid index by yourself
    Remove(handle_id) {
        this.handles.Remove(handle_id);
    }
    // return the original target object in registry
    Get(handle_id) {
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
    constructor(engine_id, opaque) {
        this._opaque = 0;
        this.last_error = undefined;
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
        return Number(val) + 0;
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
    SetProperty(obj, key, val) {
        const obj_sv = this._stack.GetValue(obj);
        const key_sv = this._stack.GetValue(key);
        const val_sv = this._stack.GetValue(val);
        if (obj_sv instanceof Map) {
            obj_sv.set(key_sv, val_sv);
        }
        else {
            obj_sv[key_sv] = val_sv;
        }
    }
    SetPropertyUint32(obj_sp, index, value_sp) {
        const obj = this._stack.GetValue(obj_sp);
        const val = this._stack.GetValue(value_sp);
        try {
            obj[index] = val;
        }
        catch (err) {
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
    Call(this_sp, func_sp, argc) {
        const thiz = this._stack.GetValue(this_sp);
        const func = this._stack.GetValue(func_sp);
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
                if (typeof self.last_error !== "undefined") {
                    self.last_error = undefined;
                    console.error("Last exeption not handled");
                }
                NativeAPI.ccall(self._opaque, cb, argc);
            }
            catch (error) {
                self.last_error = error;
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
        const proto = this._stack.GetValue(proto_pos);
        const obj = new proto.constructor();
        this._registry.Add(obj, obj_opaque);
        return this._stack.Push(obj);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNiYi5idW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbW9ub2xpdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQTZCQyxDQUFDO0FBU0YsTUFBTSxnQkFBZ0I7SUFJbEI7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsR0FBRyxDQUFDLENBQUk7UUFDSixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDM0MsSUFBSSxLQUFhLENBQUM7UUFDbEIsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDakIsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3JDLENBQUM7YUFBTSxDQUFDO1lBQ0osS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQzlCLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixPQUFPLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFrQjtRQUNsQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsTUFBTSxDQUFDLEtBQWtCO1FBQ3JCLE1BQU0sU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFRLFNBQVMsQ0FBQztR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