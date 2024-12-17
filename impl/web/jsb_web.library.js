
const GodotJSBrowserInterface = {
    jsbi_init: function () {
        return jsbb_runtime.init({
            UTF8ToString: UTF8ToString,

            gc_callback: Module._jsni_gc_callback,
            ccall: Module._jsni_ccal,
        });
    },

    jsbi_NewEngine: function (opaque) { return jsbb_runtime.NewEngine(opaque); },
    jsbi_FreeEngine: function (engine_id) { jsbb_runtime.FreeEngine(engine_id); },

    jsbi_SetHostPromiseRejectionTracker: function (engine_id, cb, data) { jsbb_runtime.GetEngine(engine_id).SetHostPromiseRejectionTracker(cb, data); },

    jsbi_StackEnter: function (engine_id) { jsbb_runtime.GetEngine(engine_id).stack.EnterScope(); },
    jsbi_StackExit: function (engine_id) { jsbb_runtime.GetEngine(engine_id).stack.ExitScope(); },
    jsbi_GetOpaque: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetOpaque(stack_pos); },
    jsbi_GetGlobalObject: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetGlobalObject(); },
    jsbi_StackDup: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).StackDup(stack_pos); },
    
    jsbi_NewCFunction: function (engine_id, cb, data) { return jsbb_runtime.GetEngine(engine_id).NewCFunction(cb, data); },
    jsbi_NewSymbol: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewSymbol(); },
    jsbi_NewMap: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewMap(); },
    jsbi_NewArray: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewArray(); },
    jsbi_NewExternal: function (engine_id, data) { return jsbb_runtime.GetEngine(engine_id).NewExternal(data); },
    jsbi_NewClass: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewClass(); },

    jsbi_SetConstructor: function (engine_id, func, proto) { return jsbb_runtime.GetEngine(engine_id).SetConstructor(func, proto); },
    jsbi_SetPrototype: function (engine_id, proto, parent) { return jsbb_runtime.GetEngine(engine_id).SetPrototype(proto, parent); },
    jsbi_SetProperty: function (engine_id, obj, key, value) { return jsbb_runtime.GetEngine(engine_id).SetProperty(obj, key, value); },
    
    jsbi_GetExternal: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos).data; },
    jsbi_GetLength: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos).length; },

    jsbi_hash: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetIdentityHash(stack_pos); },
    jsbi_strict_eq: function (engine_id, stack_pos1, stack_pos2) {
        const v1 = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos1);
        const v2 = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos2);
        return v1 === v2;
    },
    
    jsbi_IsNullOrUndefined: function (engine_id, stack_pos) {
        const val = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos);
        return val === null || val === undefined;
    },
    jsbi_IsUndefined: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === undefined; },
    jsbi_IsExternal: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).IsExternal(stack_pos); },
    jsbi_IsObject: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "object"; },
    jsbi_IsSymbol: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "symbol"; },
    jsbi_IsString: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "string"; },
    jsbi_IsFunction: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "function"; },
    jsbi_IsBoolean: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "boolean"; },
    jsbi_IsNumber: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "number"; },
    jsbi_IsBigInt: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "bigint"; },

    jsbi_IsInt32: function (engine_id, stack_pos) {
        const val = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos);
        return typeof val === "number" && Number.isInteger(val);
    },
    // not really supported
    jsbi_IsUint32: function (engine_id, stack_pos) {
        const val = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos);
        return typeof val === "number" && Number.isInteger(val);
    },
    
    jsbi_IsPromise: function (engine_id, stack_pos) { const val = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos);  return val instanceof Promise; },
    jsbi_IsArray: function (engine_id, stack_pos) { const val = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos);  return val instanceof Array; },
    jsbi_IsMap: function (engine_id, stack_pos) { const val = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos);  return val instanceof Map; },
    jsbi_IsArrayBuffer: function (engine_id, stack_pos) { const val = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos);  return val instanceof ArrayBuffer; },
    
}

// addToLibrary(GodotJSBrowserInterface);

autoAddDeps(GodotJSBrowserInterface, "$GodotJSBrowserInterface")
mergeInto(LibraryManager.library, GodotJSBrowserInterface);
