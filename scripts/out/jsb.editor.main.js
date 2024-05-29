"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auto_complete = void 0;
// entry point (editor only)
const godot_1 = require("godot");
function auto_complete(pattern) {
    let results = new godot_1.PackedStringArray();
    if (typeof pattern !== "string") {
        return results;
    }
    let scope = null;
    let head = '';
    let index = pattern.lastIndexOf('.');
    let left = '';
    if (index >= 0) {
        left = pattern.substring(0, index + 1);
        try {
            scope = eval(pattern.substring(0, index));
        }
        catch (e) {
            return results;
        }
        pattern = pattern.substring(index + 1);
    }
    else {
        scope = globalThis;
    }
    for (let k in scope) {
        if (k.indexOf(pattern) == 0) {
            results.append(head + left + k);
        }
    }
    return results;
}
exports.auto_complete = auto_complete;
//# sourceMappingURL=jsb.editor.main.js.map