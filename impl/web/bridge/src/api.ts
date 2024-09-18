import { Engine, InteropApi } from "./engine";

let engine: Engine | null = null;

export let GodotJSApi = {
    init: function (p: InteropApi) {
        Engine.init(p);
    },

    create_engine: function () {
        console.assert(engine == null);
        engine = new Engine();
        return 1;
    },
    drop_engine: function (id: number) {
        console.assert(engine != null);
        engine!.drop();
        engine = null;
    },
    get_engine: function (id: number) {
        return id == 1 ? engine : null;
    },
};

(<any>globalThis)["$GodotJSApi"] = GodotJSApi;
