const godot = require("godot");

class ScriptClassTarget extends godot.Node {
    getValue() {
        return 1;
    }
}

Object.defineProperty(module.exports, "default", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: ScriptClassTarget,
});
