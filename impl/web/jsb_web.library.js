
const GodotJSBrowserInterface = {
    jsbi_init: function () {
        return jsbb_runtime.init({
            UTF8ToString: UTF8ToString,
            stringToUTF8: stringToUTF8, 
            lengthBytesUTF8: lengthBytesUTF8, 

            HEAPU8: HEAPU8, 
            HEAP32: HEAP32, 
            HEAP64: HEAP64, 

            gc_callback: Module._jsni_gc_callback,
            ccall: Module._jsni_ccal,
        });
    },

    jsbi_NewEngine: function (opaque) { return jsbb_runtime.NewEngine(opaque); },
    jsbi_FreeEngine: function (engine_id) { jsbb_runtime.FreeEngine(engine_id); },

    jsbi_CompileFunctionSource: function (engine_id, filename, src) { return jsbb_runtime.GetEngine(engine_id).CompileFunctionSource(filename, src); }, 
    jsbi_Eval: function (engine_id, filename, src) { return jsbb_runtime.GetEngine(engine_id).Eval(filename, src); }, 
    jsbi_Call: function (engine_id, this_sp, func_sp, argc, argv) { return jsbb_runtime.GetEngine(engine_id).Call(this_sp, func_sp, argc, argv); }, 
    jsbi_ThrowError: function (engine_id, message_ptr) { return jsbb_runtime.GetEngine(engine_id).ThrowError(message_ptr); },
    jsbi_HasError: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).HasError(); },

    jsbi_SetHostPromiseRejectionTracker: function (engine_id, cb, data) { jsbb_runtime.GetEngine(engine_id).SetHostPromiseRejectionTracker(cb, data); },

    jsbi_StackEnter: function (engine_id) { jsbb_runtime.GetEngine(engine_id).stack.EnterScope(); },
    jsbi_StackExit: function (engine_id) { jsbb_runtime.GetEngine(engine_id).stack.ExitScope(); },
    jsbi_GetOpaque: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetOpaque(stack_pos); },
    jsbi_GetGlobalObject: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).GetGlobalObject(); },
    jsbi_StackDup: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).StackDup(stack_pos); },

    jsbi_NewAtomStr: function (engine_id, cstr_ptr) { return jsbb_runtime.GetEngine(engine_id).NewAtomStr(cstr_ptr); },
    jsbi_NewAtom: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).NewAtom(stack_pos); },
    jsbi_DupAtom: function (engine_id, atom_id) { return jsbb_runtime.GetEngine(engine_id).DupAtom(atom_id); },
    jsbi_FreeAtom: function (engine_id, atom_id) { return jsbb_runtime.GetEngine(engine_id).FreeAtom(atom_id); },
    
    jsbi_NewCFunction: function (engine_id, cb, data) { return jsbb_runtime.GetEngine(engine_id).NewCFunction(cb, data); },
    jsbi_NewSymbol: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewSymbol(); },
    jsbi_NewMap: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewMap(); },
    jsbi_NewArray: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewArray(); },
    jsbi_NewExternal: function (engine_id, data) { return jsbb_runtime.GetEngine(engine_id).NewExternal(data); },
    jsbi_NewInt32: function (engine_id, value) { return jsbb_runtime.GetEngine(engine_id).NewInt32(value); },
    jsbi_NewUint32: function (engine_id, value) { return jsbb_runtime.GetEngine(engine_id).NewUint32(value); },
    jsbi_NewNumber: function (engine_id, value) { return jsbb_runtime.GetEngine(engine_id).NewNumber(value); },
    jsbi_NewBigInt64: function (engine_id, val_ptr) { return jsbb_runtime.GetEngine(engine_id).NewBigInt64(val_ptr); },
    jsbi_NewClass: function (engine_id) { return jsbb_runtime.GetEngine(engine_id).NewClass(); },
    jsbi_NewString: function (engine_id, cstr_ptr, len) { return jsbb_runtime.GetEngine(engine_id).NewString(cstr_ptr, len); },

    jsbi_SetConstructor: function (engine_id, func, proto) { return jsbb_runtime.GetEngine(engine_id).SetConstructor(func, proto); },
    jsbi_SetPrototype: function (engine_id, proto, parent) { return jsbb_runtime.GetEngine(engine_id).SetPrototype(proto, parent); },
    jsbi_SetProperty: function (engine_id, obj_sp, key_sp, value_sp) { return jsbb_runtime.GetEngine(engine_id).SetProperty(obj_sp, key_sp, value_sp); },
    jsbi_SetPropertyUint32: function (engine_id, obj_sp, index, value_sp) { return jsbb_runtime.GetEngine(engine_id).SetPropertyUint32(obj_sp, index, value_sp); },
    
    jsbi_GetByteLength: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetByteLength(stack_pos); },
    jsbi_ReadArrayBufferData: function (engine_id, stack_pos, size, data_dst) { return jsbb_runtime.GetEngine(engine_id).ReadArrayBufferData(stack_pos, size, data_dst); },
    jsbi_NewArrayBuffer: function (engine_id, data_src, size) { return jsbb_runtime.GetEngine(engine_id).NewArrayBuffer(data_src, size); },
    jsbi_GetExternal: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetExternal(stack_pos); },
    jsbi_GetArrayLength: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetArrayLength(stack_pos); },
    jsbi_GetStringLength: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetStringLength(stack_pos); },
    jsbi_ToCStringLen: function (engine_id, o_size, str_sp) { return jsbb_runtime.GetEngine(engine_id).ToCStringLen(o_size, str_sp); },
    jsbi_ToString: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).ToString(stack_pos); },
    jsbi_NumberValue: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).NumberValue(stack_pos); },
    jsbi_BooleanValue: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).BooleanValue(stack_pos); },
    jsbi_Int32Value: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).Int32Value(stack_pos); },
    jsbi_Uint32Value: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).Uint32Value(stack_pos); },
    jsbi_Int64Value: function (engine_id, stack_pos, o_value_ptr) { return jsbb_runtime.GetEngine(engine_id).Int64Value(stack_pos, o_value_ptr); },

    jsbi_hash: function (engine_id, stack_pos) { return jsbb_runtime.GetEngine(engine_id).GetIdentityHash(stack_pos); },
    jsbi_stack_eq: function (engine_id, stack_pos1, stack_pos2) {
        const v1 = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos1);
        const v2 = jsbb_runtime.GetEngine(engine_id).stack.GetValue(stack_pos2);
        return v1 === v2;
    },

    jsbi_handle_eq: function (engine_id, val1, val2) {
        const v1 = jsbb_runtime.GetEngine(engine_id).globals.GetValue(val1);
        const v2 = jsbb_runtime.GetEngine(engine_id).globals.GetValue(val2);
        return v1 === v2;
    },
    jsbi_handle_is_valid: function (engine_id, handle) {
        return jsbb_runtime.GetEngine(engine_id).globals.IsValid(handle);
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
