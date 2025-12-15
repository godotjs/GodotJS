
const GodotJSBrowserInterface = {
    // $GodotJSBrowserInterface__deps: ['$GodotRuntime'], 
    // $GodotJSBrowserInterface: {},
    
    jsbi_init: function (gc_callback, unhandled_rejection, call_function, call_accessor, generate_internal_data) {
        console.log("calling jsbi_init");
        return _jsbb_.init({ gc_callback, unhandled_rejection, call_function, call_accessor, generate_internal_data });
    },

    jsbi_NewEngine: function (opaque) { return _jsbb_.NewEngine(opaque); },
    jsbi_FreeEngine: function (engine_id) { _jsbb_.FreeEngine(engine_id); },
    jsbi_log: function (str_ptr) { _jsbb_.log(str_ptr); },
    jsbi_error: function (str_ptr) { _jsbb_.error(str_ptr); },
    jsbi_free: function (ptr) { _jsbb_.free(ptr); },
    jsbi_debugbreak: function () { _jsbb_.debugbreak(); },
    jsbi_GetStatistics: function (engine_id, data_ptr) { _jsbb_.GetEngine(engine_id).GetStatistics(data_ptr); },

    jsbi_CompileFunctionSource: function (engine_id, filename, src) { return _jsbb_.GetEngine(engine_id).CompileFunctionSource(filename, src); }, 
    jsbi_Eval: function (engine_id, filename, src) { return _jsbb_.GetEngine(engine_id).Eval(filename, src); }, 
    jsbi_Call: function (engine_id, this_sp, func_sp, argc, argv) { return _jsbb_.GetEngine(engine_id).Call(this_sp, func_sp, argc, argv); }, 
    jsbi_CallAsConstructor: function (engine_id, func_sp, argc, argv) { return _jsbb_.GetEngine(engine_id).CallAsConstructor(func_sp, argc, argv); }, 
    jsbi_ParseJSON: function (engine_id, data, len) { return _jsbb_.GetEngine(engine_id).ParseJSON(data, len); },
    jsbi_ThrowError: function (engine_id, message_ptr) { return _jsbb_.GetEngine(engine_id).ThrowError(message_ptr); },
    jsbi_HasError: function (engine_id) { return _jsbb_.GetEngine(engine_id).HasError(); },

    jsbi_SetHostPromiseRejectionTracker: function (engine_id, cb, data) { _jsbb_.GetEngine(engine_id).SetHostPromiseRejectionTracker(cb, data); },

    jsbi_StackEnter: function (engine_id) { _jsbb_.GetEngine(engine_id).stack.EnterScope(); },
    jsbi_StackExit: function (engine_id) { _jsbb_.GetEngine(engine_id).stack.ExitScope(); },
    jsbi_GetOpaque: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).GetOpaque(stack_pos); },
    jsbi_GetGlobalObject: function (engine_id) { return _jsbb_.GetEngine(engine_id).GetGlobalObject(); },
    jsbi_StackDup: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).StackDup(stack_pos); },
    jsbi_StackSet: function (engine_id, to_sp, from_sp) { return _jsbb_.GetEngine(engine_id).StackSet(to_sp, from_sp); },
    jsbi_StackSetInt32: function (engine_id, to_sp, value) { return _jsbb_.GetEngine(engine_id).StackSetInt32(to_sp, value); },

    jsbi_NewCFunction: function (engine_id, cb, data, func_name_ptr) { return _jsbb_.GetEngine(engine_id).NewCFunction(cb, data, func_name_ptr); },
    jsbi_NewNoopConstructor: function (engine_id) { return _jsbb_.GetEngine(engine_id).NewNoopConstructor(); },
    jsbi_NewSymbol: function (engine_id) { return _jsbb_.GetEngine(engine_id).NewSymbol(); },
    jsbi_NewMap: function (engine_id) { return _jsbb_.GetEngine(engine_id).NewMap(); },
    jsbi_NewArray: function (engine_id) { return _jsbb_.GetEngine(engine_id).NewArray(); },
    jsbi_NewExternal: function (engine_id, data) { return _jsbb_.GetEngine(engine_id).NewExternal(data); },
    jsbi_NewInt32: function (engine_id, value) { return _jsbb_.GetEngine(engine_id).NewInt32(value); },
    jsbi_NewUint32: function (engine_id, value) { return _jsbb_.GetEngine(engine_id).NewUint32(value); },
    jsbi_NewNumber: function (engine_id, value) { return _jsbb_.GetEngine(engine_id).NewNumber(value); },
    jsbi_NewBigInt64: function (engine_id, val_ptr) { return _jsbb_.GetEngine(engine_id).NewBigInt64(val_ptr); },
    jsbi_NewObject: function (engine_id) { return _jsbb_.GetEngine(engine_id).NewObject(); },
    jsbi_NewClass: function (engine_id, cb_ptr, data_sp, field_count, class_name_ptr) { return _jsbb_.GetEngine(engine_id).NewClass(cb_ptr, data_sp, field_count, class_name_ptr); },
    jsbi_NewInstance: function (engine_id, proto_sp) { return _jsbb_.GetEngine(engine_id).NewInstance(proto_sp); },
    jsbi_NewString: function (engine_id, cstr_ptr, len) { return _jsbb_.GetEngine(engine_id).NewString(cstr_ptr, len); },

    jsbi_SetConstructor: function (engine_id, func_sp, proto_sp) { return _jsbb_.GetEngine(engine_id).SetConstructor(func_sp, proto_sp); },
    jsbi_SetPrototype: function (engine_id, proto_sp, parent_sp) { return _jsbb_.GetEngine(engine_id).SetPrototype(proto_sp, parent_sp); },
    jsbi_DefineProperty: function (engine_id, obj_sp, key_sp, value_sp, get_sp, set_sp, flags) { return _jsbb_.GetEngine(engine_id).DefineProperty(obj_sp, key_sp, value_sp, get_sp, set_sp, flags); },
    jsbi_DefineLazyProperty: function (engine_id, obj_sp, key_sp, cb_ptr) { return _jsbb_.GetEngine(engine_id).DefineLazyProperty(obj_sp, key_sp, cb_ptr); },
    jsbi_SetProperty: function (engine_id, obj_sp, key_sp, value_sp) { return _jsbb_.GetEngine(engine_id).SetProperty(obj_sp, key_sp, value_sp); },
    jsbi_SetPropertyUint32: function (engine_id, obj_sp, index, value_sp) { return _jsbb_.GetEngine(engine_id).SetPropertyUint32(obj_sp, index, value_sp); },
    jsbi_GetPropertyAtomID: function (engine_id, obj_sp, atom_id) { return _jsbb_.GetEngine(engine_id).GetPropertyAtomID(obj_sp, atom_id); }, 
    jsbi_GetProperty: function (engine_id, obj_sp, key_sp) { return _jsbb_.GetEngine(engine_id).GetProperty(obj_sp, key_sp); }, 
    jsbi_GetPropertyUint32: function (engine_id, obj_sp, index) { return _jsbb_.GetEngine(engine_id).GetPropertyUint32(obj_sp, index); }, 
    jsbi_GetOwnPropertyNames: function (engine_id, obj_sp, filter, key_conversion) { return _jsbb_.GetEngine(engine_id).GetOwnPropertyNames(obj_sp, filter, key_conversion); },
    jsbi_GetOwnPropertyDescriptor: function (engine_id, obj_sp, key_sp) { return _jsbb_.GetEngine(engine_id).GetOwnPropertyDescriptor(obj_sp, key_sp); },
    jsbi_GetPrototypeOf: function (engine_id, obj_sp) { return _jsbb_.GetEngine(engine_id).GetPrototypeOf(obj_sp); },
    jsbi_SetPrototypeOf: function (engine_id, obj_sp, proto_sp) { return _jsbb_.GetEngine(engine_id).SetPrototypeOf(obj_sp, proto_sp); },
    jsbi_HasOwnProperty: function (engine_id, obj_sp, key_sp) { return _jsbb_.GetEngine(engine_id).HasOwnProperty(obj_sp, key_sp); },
    
    jsbi_GetByteLength: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).GetByteLength(stack_pos); },
    jsbi_ReadArrayBufferData: function (engine_id, stack_pos, size, data_dst) { return _jsbb_.GetEngine(engine_id).ReadArrayBufferData(stack_pos, size, data_dst); },
    jsbi_NewArrayBuffer: function (engine_id, data_src, size) { return _jsbb_.GetEngine(engine_id).NewArrayBuffer(data_src, size); },
    jsbi_GetExternal: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).GetExternal(stack_pos); },
    jsbi_GetArrayLength: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).GetArrayLength(stack_pos); },
    jsbi_GetStringLength: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).GetStringLength(stack_pos); },
    jsbi_ToCStringLen: function (engine_id, o_size, str_sp) { return _jsbb_.GetEngine(engine_id).ToCStringLen(o_size, str_sp); },
    jsbi_ToString: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).ToString(stack_pos); },
    jsbi_NumberValue: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).NumberValue(stack_pos); },
    jsbi_BooleanValue: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).BooleanValue(stack_pos); },
    jsbi_Int32Value: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).Int32Value(stack_pos); },
    jsbi_Uint32Value: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).Uint32Value(stack_pos); },
    jsbi_Int64Value: function (engine_id, stack_pos, o_value_ptr) { return _jsbb_.GetEngine(engine_id).Int64Value(stack_pos, o_value_ptr); },

    jsbi_hash: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).GetIdentityHash(stack_pos); },
    jsbi_stack_eq: function (engine_id, stack_pos1, stack_pos2) {
        const v1 = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos1);
        const v2 = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos2);
        return v1 === v2;
    },

    jsbi_handle_eq: function (engine_id, val1, val2) {
        const v1 = _jsbb_.GetEngine(engine_id).handles.GetValue(val1);
        const v2 = _jsbb_.GetEngine(engine_id).handles.GetValue(val2);
        return v1 === v2;
    },
    jsbi_handle_IsValid: function (engine_id, handle) { return _jsbb_.GetEngine(engine_id).handles.IsValid(handle); },
    jsbi_handle_ClearWeak: function (engine_id, handle) { return _jsbb_.GetEngine(engine_id).handles.SetStrong(handle); },
    jsbi_handle_SetWeak: function (engine_id, handle) { return _jsbb_.GetEngine(engine_id).handles.SetWeak(handle); },
    jsbi_handle_Reset: function (engine_id, handle) { return _jsbb_.GetEngine(engine_id).handles.Remove(handle); },
    jsbi_handle_New: function (engine_id, val_sp) {
        const engine = _jsbb_.GetEngine(engine_id);
        return engine.handles.AddValue(engine.stack.GetValue(val_sp));
    },
    jsbi_handle_PushStack: function (engine_id, handle) {
        const engine = _jsbb_.GetEngine(engine_id);
        return engine.stack.Push(engine.handles.GetValue(handle));
    },
    
    jsbi_IsNullOrUndefined: function (engine_id, stack_pos) {
        const val = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos);
        return val === null || val === undefined;
    },
    jsbi_IsNull: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) === null; },
    jsbi_IsUndefined: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) === undefined; },
    jsbi_IsExternal: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).IsExternal(stack_pos); },
    jsbi_IsObject: function (engine_id, stack_pos) {
        const val = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos);
        return _jsbb_.is_object(val); 
    },
    jsbi_IsSymbol: function (engine_id, stack_pos) { return typeof _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) === "symbol"; },
    jsbi_IsString: function (engine_id, stack_pos) { return typeof _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) === "string"; },
    jsbi_IsFunction: function (engine_id, stack_pos) { return typeof _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) === "function"; },
    jsbi_IsBoolean: function (engine_id, stack_pos) { return typeof _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) === "boolean"; },
    jsbi_IsNumber: function (engine_id, stack_pos) {
        const val = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos);
        return typeof val === "number";
    },
    jsbi_IsBigInt: function (engine_id, stack_pos) {
        const val = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos);
        return typeof val === "bigint";
    },
    jsbi_IsInt32: function (engine_id, stack_pos) {
        const val = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos);
        return typeof val === "number" && Number.isInteger(val);
    },
    // not really supported
    jsbi_IsUint32: function (engine_id, stack_pos) {
        const val = _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos);
        return typeof val === "number" && Number.isInteger(val);
    },
    
    jsbi_IsPromise: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) instanceof Promise; },
    jsbi_IsArray: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) instanceof Array; },
    jsbi_IsMap: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) instanceof Map; },
    jsbi_IsArrayBuffer: function (engine_id, stack_pos) { return _jsbb_.GetEngine(engine_id).stack.GetValue(stack_pos) instanceof ArrayBuffer; },
    
}

// autoAddDeps(GodotJSBrowserInterface, "$GodotJSBrowserInterface")
mergeInto(LibraryManager.library, GodotJSBrowserInterface);
