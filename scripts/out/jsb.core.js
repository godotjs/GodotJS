"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signal = void 0;
/**
 *
 */
function signal(target, key) {
    jsb.internal.add_script_signal(target, key);
}
exports.signal = signal;
//# sourceMappingURL=jsb.core.js.map