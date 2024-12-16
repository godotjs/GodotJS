
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
    jsbi_StackDup: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).StackDup(stack_pos); },
    jsbi_GetOpaque: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetOpaque(stack_pos); },
    jsbi_GetExternal: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos).data; },
    jsbi_GetLength: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos).length; },

    jsbi_NewCFunction: function (engine_id, cb, data) { return jsbb_runtime.GetEngine(engine_id).NewCFunction(cb, data); },
    jsbi_NewClass: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewClass(); },
    jsbi_SetConstructor: function (engine_id, func, proto) { return jsbb_runtime.GetEngine(engine_id).SetConstructor(func, proto); },
    jsbi_SetPrototype: function (engine_id, proto, parent) { return jsbb_runtime.GetEngine(engine_id).SetPrototype(proto, parent); },

    jsbi_NewExternal: function (engine_id, data) { return jsbb_runtime.GetEngine(engine_id).NewExternal(data); },
    jsbi_NewSymbol: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewSymbol(); },
    
    jsbi_IsUndefined: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === undefined; },
    jsbi_IsNumber: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "number"; },
    jsbi_IsString: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "string"; },
    jsbi_IsBoolean: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "boolean"; },
    jsbi_IsSymbol: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "symbol"; },
    jsbi_IsFunction: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "function"; },
    jsbi_IsObject: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos) === "object"; },
    jsbi_IsExternal: function (engine_id, stack_pos) { return typeof jsbb_runtime.GetEngine(engine_id).IsExternal(stack_pos); },
}

// addToLibrary(GodotJSBrowserInterface);

autoAddDeps(GodotJSBrowserInterface, "$GodotJSBrowserInterface")
mergeInto(LibraryManager.library, GodotJSBrowserInterface);
