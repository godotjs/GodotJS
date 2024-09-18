
const GodotJSApi = {
    $GodotJSApi: function () {
        return globalThis["$GodotJSApi"];
    },

    init: function () {
        return GodotJSApi().init({
            UTF8ToString: UTF8ToString,
            jsb_web_invoke_gc_callback: Module._jsb_web_invoke_gc_callback,
        });
    },
    create_engine: function () { return GodotJSApi().create_engine(); },
    drop_engine: function (engine_id) { return GodotJSApi().drop_engine(engine_id);  },

    // listing all public engine API here
    eval: function (engine_id, pcode) { const engine = GodotJSApi().get_engine(engine_id); return engine.eval(pcode); },
    set_finalizer: function (engine_id, pfunc) { const engine = GodotJSApi().get_engine(engine_id); return engine.set_finalizer(pfunc); },
    new_binding_object: function (engine_id, pobj) { const engine = GodotJSApi().get_engine(engine_id); return engine.new_binding_object(pobj); },
    get_binding_object: function (engine_id, pid) { const engine = GodotJSApi().get_engine(engine_id); return engine.get_binding_object(pid); },
}

// addToLibrary(GodotJSApi);

autoAddDeps(GodotJSApi, "$GodotJSApi")
mergeInto(LibraryManager.library, GodotJSApi);
