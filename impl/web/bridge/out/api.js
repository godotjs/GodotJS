"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GodotJSApi = void 0;
const engine_1 = require("./engine");
let engines = [];
exports.GodotJSApi = {
    init: function (p) {
        engine_1.Engine.init(p);
    },
    create_engine: function () {
        const id = engines.length;
        engines.push(new engine_1.Engine());
        return id;
    },
    drop_engine: function (id) {
        engines[id].drop();
        engines[id] = null;
    },
    get_engine: function (id) {
        return engines[id];
    },
};
globalThis["$GodotJSApi"] = exports.GodotJSApi;
