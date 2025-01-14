var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define("jsb.core", ["require", "exports", "godot", "godot-jsb"], function (require, exports, godot_1, jsb) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.signal = signal;
    exports.export_multiline = export_multiline;
    exports.export_range = export_range;
    exports.export_range_i = export_range_i;
    exports.export_file = export_file;
    exports.export_dir = export_dir;
    exports.export_global_file = export_global_file;
    exports.export_global_dir = export_global_dir;
    exports.export_exp_easing = export_exp_easing;
    exports.export_ = export_;
    exports.export_enum = export_enum;
    exports.export_flags = export_flags;
    exports.rpc = rpc;
    exports.onready = onready;
    exports.tool = tool;
    exports.icon = icon;
    exports.deprecated = deprecated;
    exports.experimental = experimental;
    exports.help = help;
    exports.$wait = $wait;
    exports.seconds = seconds;
    exports.GLOBAL_GET = GLOBAL_GET;
    exports.EDITOR_GET = EDITOR_GET;
    jsb = __importStar(jsb);
    /**
     *
     */
    function signal() {
        return function (target, key) {
            jsb.internal.add_script_signal(target, key);
        };
    }
    function export_multiline() {
        return export_(godot_1.Variant.Type.TYPE_STRING, { hint: godot_1.PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
    }
    function __export_range(type, min, max, step = 1, ...extra_hints) {
        let hint_string = `${min},${max},${step}`;
        if (typeof extra_hints !== "undefined") {
            hint_string += "," + extra_hints.join(",");
        }
        return export_(type, { hint: godot_1.PropertyHint.PROPERTY_HINT_RANGE, hint_string: hint_string });
    }
    function export_range(min, max, step = 1, ...extra_hints) {
        return __export_range(godot_1.Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
    }
    function export_range_i(min, max, step = 1, ...extra_hints) {
        return __export_range(godot_1.Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
    }
    function export_file(filter) {
        return export_(godot_1.Variant.Type.TYPE_STRING, { hint: godot_1.PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
    }
    function export_dir(filter) {
        return export_(godot_1.Variant.Type.TYPE_STRING, { hint: godot_1.PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
    }
    function export_global_file(filter) {
        return export_(godot_1.Variant.Type.TYPE_STRING, { hint: godot_1.PropertyHint.PROPERTY_HINT_GLOBAL_FILE, hint_string: filter });
    }
    function export_global_dir(filter) {
        return export_(godot_1.Variant.Type.TYPE_STRING, { hint: godot_1.PropertyHint.PROPERTY_HINT_GLOBAL_DIR, hint_string: filter });
    }
    function export_exp_easing(hint) {
        return export_(godot_1.Variant.Type.TYPE_FLOAT, { hint: godot_1.PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
    }
    function export_(type, details) {
        return function (target, key) {
            let ebd = { name: key, type: type, hint: godot_1.PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: godot_1.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            if (typeof details === "object") {
                if (typeof details.hint === "number")
                    ebd.hint = details.hint;
                if (typeof details.hint_string === "string")
                    ebd.hint_string = details.hint_string;
                if (typeof details.usage === "number")
                    ebd.usage = details.usage;
            }
            jsb.internal.add_script_property(target, ebd);
        };
    }
    /**
     * NOTE only int value enums are allowed
     */
    function export_enum(enum_type) {
        return function (target, key) {
            let enum_vs = [];
            for (let c in enum_type) {
                const v = enum_type[c];
                if (typeof v === "string") {
                    enum_vs.push(v + ":" + c);
                }
            }
            let ebd = { name: key, type: godot_1.Variant.Type.TYPE_INT, hint: godot_1.PropertyHint.PROPERTY_HINT_ENUM, hint_string: enum_vs.join(","), usage: godot_1.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    }
    /**
     * NOTE only int value enums are allowed
     */
    function export_flags(enum_type) {
        return function (target, key) {
            let enum_vs = [];
            for (let c in enum_type) {
                const v = enum_type[c];
                if (typeof v === "string" && enum_type[v] != 0) {
                    enum_vs.push(v + ":" + c);
                }
            }
            let ebd = { name: key, type: godot_1.Variant.Type.TYPE_INT, hint: godot_1.PropertyHint.PROPERTY_HINT_FLAGS, hint_string: enum_vs.join(","), usage: godot_1.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    }
    function rpc(config) {
        return function (target, propertyKey, descriptor) {
            if (typeof propertyKey !== "string") {
                throw new Error("only string is allowed as propertyKey for rpc config");
                return;
            }
            if (typeof config !== "undefined") {
                jsb.internal.add_script_rpc(target, propertyKey, {
                    mode: config.mode,
                    sync: typeof config.sync !== "undefined" ? (config.sync == "call_local") : undefined,
                    transfer_mode: config.transfer_mode,
                    transfer_channel: config.transfer_channel,
                });
            }
            else {
                jsb.internal.add_script_rpc(target, propertyKey, {});
            }
        };
    }
    /**
     * auto initialized on ready (before _ready called)
     * @param evaluator for now, only string is accepted
     */
    function onready(evaluator) {
        return function (target, key) {
            let ebd = { name: key, evaluator: evaluator };
            jsb.internal.add_script_ready(target, ebd);
        };
    }
    function tool() {
        return function (target) {
            jsb.internal.add_script_tool(target);
        };
    }
    function icon(path) {
        return function (target) {
            jsb.internal.add_script_icon(target, path);
        };
    }
    function deprecated(message) {
        return function (target, propertyKey, descriptor) {
            if (typeof propertyKey === "undefined") {
                jsb.internal.set_script_doc(target, undefined, 0, message !== null && message !== void 0 ? message : "");
                return;
            }
            if (typeof propertyKey !== "string" || propertyKey.length == 0)
                throw new Error("only string key is allowed for doc");
            jsb.internal.set_script_doc(target, propertyKey, 0, message !== null && message !== void 0 ? message : "");
        };
    }
    function experimental(message) {
        return function (target, propertyKey, descriptor) {
            if (typeof propertyKey === "undefined") {
                jsb.internal.set_script_doc(target, undefined, 1, message !== null && message !== void 0 ? message : "");
                return;
            }
            if (typeof propertyKey !== "string" || propertyKey.length == 0)
                throw new Error("only string key is allowed for doc");
            jsb.internal.set_script_doc(target, propertyKey, 1, message !== null && message !== void 0 ? message : "");
        };
    }
    function help(message) {
        return function (target, propertyKey, descriptor) {
            if (typeof propertyKey === "undefined") {
                jsb.internal.set_script_doc(target, undefined, 2, message !== null && message !== void 0 ? message : "");
                return;
            }
            if (typeof propertyKey !== "string" || propertyKey.length == 0)
                throw new Error("only string key is allowed for doc");
            jsb.internal.set_script_doc(target, propertyKey, 2, message !== null && message !== void 0 ? message : "");
        };
    }
    function $wait(signal) {
        return new Promise(resolve => {
            let fn = null;
            fn = jsb.callable(function () {
                signal.disconnect(fn);
                if (arguments.length == 0) {
                    resolve(undefined);
                    return;
                }
                if (arguments.length == 1) {
                    resolve(arguments[0]);
                    return;
                }
                // return as javascript array if more than one 
                resolve(Array.from(arguments));
                jsb.internal.notify_microtasks_run();
            });
            signal.connect(fn, 0);
        });
    }
    /**
     * Wait for seconds
     * @param secs time to wait in seconds
     * @returns Promise to await
     */
    function seconds(secs) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(undefined);
            }, secs * 1000);
        });
    }
    /** shorthand for getting project settings */
    function GLOBAL_GET(entry_path) {
        return godot_1.ProjectSettings.get_setting_with_override(entry_path);
    }
    /**
     * shorthand for getting editor settings
     * NOTE: calling before EditorSettings created will cause null reference exception.
     */
    function EDITOR_GET(entry_path) {
        return godot_1.EditorInterface.get_editor_settings().get(entry_path);
    }
});
define("jsb.inject", ["require", "exports", "godot", "godot-jsb"], function (require, exports, godot_2, godot_jsb_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let inject_mark = Symbol();
    (function (items) {
        for (let item of items) {
            item.class.prototype[Symbol.iterator] = item.func;
        }
    })([
        {
            class: godot_2.GDictionary,
            func: function* () {
                let self = this;
                let keys = self.keys();
                for (let i = 0; i < keys.size(); ++i) {
                    const key = keys.get_indexed(i);
                    yield { key: key, value: self.get_keyed(key) };
                }
            }
        },
        {
            class: godot_2.GArray,
            func: function* () {
                let self = this;
                for (let i = 0; i < self.size(); ++i) {
                    yield self.get_indexed(i);
                }
            }
        }
    ]);
    let callable_create = godot_2.Callable.create;
    // @ts-ignore
    godot_2.Callable.create = function () {
        const argc = arguments.length;
        if (argc == 1) {
            if (typeof arguments[0] !== "function") {
                throw new Error("not a function");
            }
            return (0, godot_jsb_1.callable)(arguments[0]);
        }
        if (argc == 2) {
            if (typeof arguments[1] !== "function") {
                return callable_create(arguments[0], arguments[1]);
            }
            return (0, godot_jsb_1.callable)(arguments[0], arguments[1]);
        }
        throw new Error("invalid arguments");
    };
});
//# sourceMappingURL=jsb.runtime.bundle.js.map