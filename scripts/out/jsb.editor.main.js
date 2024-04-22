"use strict";
// entry point (editor only)
Object.defineProperty(exports, "__esModule", { value: true });
exports.auto_complete = void 0;
function auto_complete(pattern) {
    let result = [];
    if (typeof pattern !== "string") {
        return result;
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
            return result;
        }
        pattern = pattern.substring(index + 1);
    }
    else {
        scope = globalThis;
    }
    for (let k in scope) {
        if (k.indexOf(pattern) == 0) {
            result.push(head + left + k);
        }
    }
    return result;
}
exports.auto_complete = auto_complete;
//# sourceMappingURL=jsb.editor.main.js.map