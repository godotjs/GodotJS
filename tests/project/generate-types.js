Object.defineProperty(exports, "__esModule", { value: true });
const godot_1 = require("godot");
const mod = require("jsb.editor.codegen");
class GenerateTypes extends godot_1.SceneTree {
    async _initialize() {
        const codeGen = new mod.TSDCodeGen("./typings", true);
        await codeGen.emit(false);
        this.quit();
    }
}
exports.default = GenerateTypes;
