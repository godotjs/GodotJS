import { Engine, InteropProtocol, Initialize as GlobalInitialize } from "./engine";

let engine: Engine | null = null;

export let GodotJSApi = {
    init: function (p: InteropProtocol) {
        GlobalInitialize(p);
    },

    create_engine: function (isolate: number) {
        console.assert(engine == null);
        engine = new Engine(isolate);
        return 1;
    },
    drop_engine: function (id: number) {
        console.assert(engine != null);
        engine!.Release();
        engine = null;
    },
    get_engine: function (id: number) {
        return id == 1 ? engine : null;
    },
};

(<any>globalThis)["$GodotJSApi"] = GodotJSApi;
