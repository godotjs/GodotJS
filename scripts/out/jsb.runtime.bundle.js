"use strict";
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
define("godot.annotations", ["require", "exports", "godot", "godot-jsb"], function (require, exports, godot_1, jsb) {
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
    exports.export_array = export_array;
    exports.export_dictionary = export_dictionary;
    exports.export_ = export_;
    exports.export_var = export_var;
    exports.export_enum = export_enum;
    exports.export_flags = export_flags;
    exports.rpc = rpc;
    exports.onready = onready;
    exports.tool = tool;
    exports.icon = icon;
    exports.deprecated = deprecated;
    exports.experimental = experimental;
    exports.help = help;
    jsb = __importStar(jsb);
    function guess_type_name(type) {
        if (typeof type === "function") {
            return type.name;
        }
        if (typeof type === "object") {
            if (typeof type.constructor === "function") {
                return type.constructor.name;
            }
            let proto = Object.getPrototypeOf(type);
            if (typeof proto === "object") {
                return guess_type_name(proto);
            }
        }
        return type;
    }
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
    /** String as a path to a file, custom filter provided as hint. */
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
    /**
     * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
     */
    function export_array(clazz) {
        return export_(godot_1.Variant.Type.TYPE_ARRAY, { class_: clazz });
    }
    /**
     * A Shortcut for `export_(Variant.Type.TYPE_DICTIONARY, { class_: [key_class, value_class] })`
     */
    function export_dictionary(key_class, value_class) {
        return export_(godot_1.Variant.Type.TYPE_DICTIONARY, { class_: [key_class, value_class] });
    }
    function get_hint_string_for_enum(enum_type) {
        let enum_vs = [];
        for (let c in enum_type) {
            const v = enum_type[c];
            if (typeof v === "string") {
                enum_vs.push(v + ":" + c);
            }
        }
        return enum_vs.join(",");
    }
    function is_array_of_pair(clazz) {
        return typeof clazz === "object" && typeof clazz.length === "number" && clazz.length == 2;
    }
    function get_hint_string(clazz) {
        let gd = require("godot");
        if (typeof clazz === "symbol") {
            if (clazz === gd.IntegerType) {
                return godot_1.Variant.Type.TYPE_INT + ":";
            }
            if (clazz === gd.FloatType) {
                return godot_1.Variant.Type.TYPE_FLOAT + ":";
            }
        }
        if (typeof clazz === "function" && typeof clazz.prototype !== "undefined") {
            if (clazz.prototype instanceof gd.Resource) {
                return `${godot_1.Variant.Type.TYPE_OBJECT}/${godot_1.PropertyHint.PROPERTY_HINT_RESOURCE_TYPE}:${clazz.name}`;
            }
            else if (clazz.prototype instanceof gd.Node) {
                return `${godot_1.Variant.Type.TYPE_OBJECT}/${godot_1.PropertyHint.PROPERTY_HINT_NODE_TYPE}:${clazz.name}`;
            }
            else {
                // other than Resource and Node, only primitive types and enum types are supported in gdscript
                //TODO but we barely know anything about the enum types and int/float/StringName/... in JS
                if (clazz === Boolean) {
                    return godot_1.Variant.Type.TYPE_BOOL + ":";
                }
                else if (clazz === Number) {
                    // we can only guess the type is float
                    return godot_1.Variant.Type.TYPE_FLOAT + ":";
                }
                else if (clazz === String) {
                    return godot_1.Variant.Type.TYPE_STRING + ":";
                }
                else {
                    if (typeof clazz.__builtin_type__ === "number") {
                        return clazz.__builtin_type__ + ":";
                    }
                    else {
                        throw new Error("the given parameters are not supported or not implemented");
                    }
                }
            }
        }
        if (typeof clazz === "object") {
            // probably an Array (as key-value type descriptor for a Dictionary)
            if (typeof clazz.length === "number" && clazz.length == 2) {
                let key_type;
                let value_type;
                if (is_array_of_pair(clazz[0]) && clazz[0][0] === gd.EnumType) {
                    key_type = `${godot_1.Variant.Type.TYPE_INT}/${godot_1.Variant.Type.TYPE_INT}:${get_hint_string_for_enum(clazz[0][1])}`;
                }
                else {
                    // special case for dictionary, int is preferred for key type of a dictionary
                    key_type = clazz[0] === Number ? godot_1.Variant.Type.TYPE_INT + ":" : get_hint_string(clazz[0]);
                }
                if (is_array_of_pair(clazz[1]) && clazz[1][0] === gd.EnumType) {
                    value_type = `${godot_1.Variant.Type.TYPE_INT}/${godot_1.Variant.Type.TYPE_INT}:${get_hint_string_for_enum(clazz[1][1])}`;
                }
                else {
                    value_type = get_hint_string(clazz[1]);
                }
                if (key_type.length === 0 || value_type.length === 0) {
                    throw new Error("the given parameters are not supported or not implemented");
                }
                return key_type + ';' + value_type;
            }
        }
        return "";
    }
    /**
     * [low level export]
     */
    function export_(type, details) {
        return function (target, key) {
            let ebd = { name: key, type: type, hint: godot_1.PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: godot_1.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            if (typeof details === "object") {
                if (typeof details.hint === "number")
                    ebd.hint = details.hint;
                if (typeof details.usage === "number")
                    ebd.usage = details.usage;
                if (typeof details.hint_string === "string")
                    ebd.hint_string = details.hint_string;
                // overwrite hint if class_ is provided
                try {
                    let hint_string = get_hint_string(details.class_);
                    if (hint_string.length > 0) {
                        ebd.hint = godot_1.PropertyHint.PROPERTY_HINT_TYPE_STRING;
                        ebd.hint_string = hint_string;
                        ebd.usage |= godot_1.PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                    }
                }
                catch (e) {
                    if (ebd.hint === godot_1.PropertyHint.PROPERTY_HINT_NONE) {
                        console.warn("the given parameters are not supported or not implemented (you need to give hint/hint_string/usage manually)", `class:${guess_type_name(Object.getPrototypeOf(target))} prop:${key} type:${type} class_:${guess_type_name(details.class_)}`);
                    }
                }
            }
            jsb.internal.add_script_property(target, ebd);
        };
    }
    /**
     * In Godot, class members can be exported.
     * This means their value gets saved along with the resource (such as the scene) they're attached to.
     * They will also be available for editing in the property editor.
     * Exporting is done by using the `@export_var` (or `@export_`) annotation.
     */
    function export_var(type, details) {
        return export_(type, details);
    }
    /**
     * NOTE only int value enums are allowed
     */
    function export_enum(enum_type) {
        return function (target, key) {
            let hint_string = get_hint_string_for_enum(enum_type);
            let ebd = { name: key, type: godot_1.Variant.Type.TYPE_INT, hint: godot_1.PropertyHint.PROPERTY_HINT_ENUM, hint_string: hint_string, usage: godot_1.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
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
});
define("godot.typeloader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.on_type_loaded = on_type_loaded;
    const type_db = {};
    class TypeProcessor {
        constructor() {
            // avoid cyclic call on the same type
            this.locked = false;
            this.callbacks = [];
        }
        push(callback) {
            if (this.locked) {
                throw new Error('TypeProcessor is locked');
            }
            this.callbacks.push(callback);
            return this;
        }
        exec(type) {
            if (this.locked) {
                throw new Error('TypeProcessor is locked');
            }
            this.locked = true;
            for (let cb of this.callbacks) {
                try {
                    cb(type);
                }
                catch (e) {
                    console.error(e);
                }
            }
            this.locked = false;
        }
    }
    const type_processors = new Map();
    function _on_type_loaded(type_name, callback) {
        if (typeof type_name !== 'string') {
            throw new Error('type_name must be a string');
        }
        if (typeof type_db[type_name] !== 'undefined') {
            callback(type_db[type_name]);
            return;
        }
        if (type_processors.has(type_name)) {
            type_processors.get(type_name).push(callback);
        }
        else {
            type_processors.set(type_name, new TypeProcessor().push(callback));
        }
    }
    // callback on a godot type loaded by jsb_godot_module_loader.
    // each callback will be called only once.
    function on_type_loaded(type_name, callback) {
        if (typeof type_name === 'string') {
            _on_type_loaded(type_name, callback);
        }
        else if (Array.isArray(type_name)) {
            for (let name of type_name) {
                _on_type_loaded(name, callback);
            }
        }
        else {
            throw new Error('type_name must be a string or an array of strings');
        }
    }
    const jsb_builtin_extras = {
        "IntegerType": Symbol("IntegerType"),
        "FloatType": Symbol("FloatType"),
        "EnumType": Symbol("EnumType"),
    };
    // callback on a godot type loaded by jsb_godot_module_loader
    exports._mod_proxy_ = function (type_loader_func) {
        return new Proxy(type_db, {
            // @ts-ignore
            set: function (target, prop_name, value) {
                if (typeof prop_name !== 'string') {
                    throw new Error(`only string key is allowed`);
                }
                if (typeof target[prop_name] !== 'undefined') {
                    console.warn('overwriting existing value', prop_name);
                }
                target[prop_name] = value;
            },
            get: function (target, prop_name) {
                let o = target[prop_name];
                if (typeof o === 'undefined' && typeof prop_name === 'string') {
                    o = target[prop_name] =
                        typeof jsb_builtin_extras[prop_name] !== "undefined"
                            ? jsb_builtin_extras[prop_name]
                            : type_loader_func(prop_name);
                }
                return o;
            }
        });
    };
    exports._post_bind_ = function (type_name, type) {
        const processors = type_processors.get(type_name);
        if (processors !== undefined) {
            processors.exec(type);
            type_processors.delete(type_name);
        }
    };
});
define("jsb.core", ["require", "exports", "godot", "godot-jsb"], function (require, exports, godot_2, jsb) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    jsb = __importStar(jsb);
    // [WARNING] ALL IMPLEMENTATIONS BELOW ARE FOR BACKWARD COMPATIBILITY ONLY.
    // [WARNING] THEY EXIST TO TEMPORARILY SUPPORT OLD CODES THAT USE THESE FUNCTIONS.
    // [WARNING] FOLLOW THE CHANGES IN `https://github.com/godotjs/GodotJS/tree/main/docs/breaking_changes.md` TO UPDATE YOUR CODES.
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use `SignalN<..., R>.as_promise()` instead.
     */
    exports.$wait = function (signal) {
        return new Promise(resolve => {
            let fn = null;
            fn = require("godot").Callable.create(function () {
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
    };
    /**
     * Wait for seconds as a promise.
     * ```typescript
     * function seconds(secs: number) {
     *    return new Promise(function (resolve) {
     *        setTimeout(function () {
     *            resolve(undefined);
     *        }, secs * 1000);
     *    });
     *}
     * ```
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Implement your own version of this function.
     * @param secs time to wait in seconds
     * @returns Promise to await
     */
    exports.seconds = function (secs) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(undefined);
            }, secs * 1000);
        });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.signal = function () {
        return function (target, key) {
            jsb.internal.add_script_signal(target, key);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_multiline = function () {
        return exports.export_(godot_2.Variant.Type.TYPE_STRING, { hint: godot_2.PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
    };
    function __export_range(type, min, max, step = 1, ...extra_hints) {
        let hint_string = `${min},${max},${step}`;
        if (typeof extra_hints !== "undefined") {
            hint_string += "," + extra_hints.join(",");
        }
        return exports.export_(type, { hint: godot_2.PropertyHint.PROPERTY_HINT_RANGE, hint_string: hint_string });
    }
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_range = function (min, max, step = 1, ...extra_hints) {
        return __export_range(godot_2.Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_range_i = function (min, max, step = 1, ...extra_hints) {
        return __export_range(godot_2.Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_file = function (filter) {
        return exports.export_(godot_2.Variant.Type.TYPE_STRING, { hint: godot_2.PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_dir = function (filter) {
        return exports.export_(godot_2.Variant.Type.TYPE_STRING, { hint: godot_2.PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_global_file = function (filter) {
        return exports.export_(godot_2.Variant.Type.TYPE_STRING, { hint: godot_2.PropertyHint.PROPERTY_HINT_GLOBAL_FILE, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_global_dir = function (filter) {
        return exports.export_(godot_2.Variant.Type.TYPE_STRING, { hint: godot_2.PropertyHint.PROPERTY_HINT_GLOBAL_DIR, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_exp_easing = function (hint) {
        return exports.export_(godot_2.Variant.Type.TYPE_FLOAT, { hint: godot_2.PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_ = function (type, details) {
        return function (target, key) {
            let ebd = { name: key, type: type, hint: godot_2.PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: godot_2.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
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
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_enum = function (enum_type) {
        return function (target, key) {
            let enum_vs = [];
            for (let c in enum_type) {
                const v = enum_type[c];
                if (typeof v === "string") {
                    enum_vs.push(v + ":" + c);
                }
            }
            let ebd = { name: key, type: godot_2.Variant.Type.TYPE_INT, hint: godot_2.PropertyHint.PROPERTY_HINT_ENUM, hint_string: enum_vs.join(","), usage: godot_2.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_flags = function (enum_type) {
        return function (target, key) {
            let enum_vs = [];
            for (let c in enum_type) {
                const v = enum_type[c];
                if (typeof v === "string" && enum_type[v] != 0) {
                    enum_vs.push(v + ":" + c);
                }
            }
            let ebd = { name: key, type: godot_2.Variant.Type.TYPE_INT, hint: godot_2.PropertyHint.PROPERTY_HINT_FLAGS, hint_string: enum_vs.join(","), usage: godot_2.PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.rpc = function (config) {
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
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.onready = function (evaluator) {
        return function (target, key) {
            let ebd = { name: key, evaluator: evaluator };
            jsb.internal.add_script_ready(target, ebd);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.tool = function () {
        return function (target) {
            jsb.internal.add_script_tool(target);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.icon = function (path) {
        return function (target) {
            jsb.internal.add_script_icon(target, path);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.deprecated = function (message) {
        return function (target, propertyKey, descriptor) {
            if (typeof propertyKey === "undefined") {
                jsb.internal.set_script_doc(target, undefined, 0, message !== null && message !== void 0 ? message : "");
                return;
            }
            if (typeof propertyKey !== "string" || propertyKey.length == 0)
                throw new Error("only string key is allowed for doc");
            jsb.internal.set_script_doc(target, propertyKey, 0, message !== null && message !== void 0 ? message : "");
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.experimental = function (message) {
        return function (target, propertyKey, descriptor) {
            if (typeof propertyKey === "undefined") {
                jsb.internal.set_script_doc(target, undefined, 1, message !== null && message !== void 0 ? message : "");
                return;
            }
            if (typeof propertyKey !== "string" || propertyKey.length == 0)
                throw new Error("only string key is allowed for doc");
            jsb.internal.set_script_doc(target, propertyKey, 1, message !== null && message !== void 0 ? message : "");
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.help = function (message) {
        return function (target, propertyKey, descriptor) {
            if (typeof propertyKey === "undefined") {
                jsb.internal.set_script_doc(target, undefined, 2, message !== null && message !== void 0 ? message : "");
                return;
            }
            if (typeof propertyKey !== "string" || propertyKey.length == 0)
                throw new Error("only string key is allowed for doc");
            jsb.internal.set_script_doc(target, propertyKey, 2, message !== null && message !== void 0 ? message : "");
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot` instead.
     */
    exports.GLOBAL_GET = function (entry_path) {
        return require("godot").ProjectSettings.get_setting_with_override(entry_path);
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot` instead.
     */
    exports.EDITOR_GET = function (entry_path) {
        return require("godot").EditorInterface.get_editor_settings().get(entry_path);
    };
});
require("godot.typeloader").on_type_loaded("Array", function (type) {
    type.prototype[Symbol.iterator] = function* () {
        let self = this;
        for (let i = 0; i < self.size(); ++i) {
            yield self.get_indexed(i);
        }
    };
});
require("godot.typeloader").on_type_loaded("Dictionary", function (type) {
    type.prototype[Symbol.iterator] = function* () {
        let self = this;
        let keys = self.keys();
        for (let i = 0; i < keys.size(); ++i) {
            const key = keys.get_indexed(i);
            yield { key: key, value: self.get_keyed(key) };
        }
    };
});
require("godot.typeloader").on_type_loaded("Callable", function (type) {
    const orignal_cc = type.create;
    const custom_cc = require("godot-jsb").callable;
    type.create = function () {
        const argc = arguments.length;
        if (argc == 1) {
            if (typeof arguments[0] !== "function") {
                throw new Error("not a function");
            }
            return custom_cc(arguments[0]);
        }
        if (argc == 2) {
            if (typeof arguments[1] !== "function") {
                return orignal_cc(arguments[0], arguments[1]);
            }
            return custom_cc(arguments[0], arguments[1]);
        }
        throw new Error("invalid arguments");
    };
});
require("godot.typeloader").on_type_loaded("Signal", function (type) {
    type.prototype.as_promise = function () {
        let self = this;
        return new Promise(function (resolve, reject) {
            let fn = null;
            let gd = require("godot");
            fn = gd.Callable.create(function () {
                //self.disconnect(fn);
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
                require("godot-jsb").internal.notify_microtasks_run();
            });
            self.connect(fn, gd.Object.ConnectFlags.CONNECT_ONE_SHOT);
            self = undefined;
        });
    };
});
Object.defineProperty(require("godot"), "GLOBAL_GET", {
    value: function (entry_path) {
        return require("godot").ProjectSettings.get_setting_with_override(entry_path);
    }
});
Object.defineProperty(require("godot"), "EDITOR_GET", {
    value: function (entry_path) {
        return require("godot").EditorInterface.get_editor_settings().get(entry_path);
    }
});
console.debug("jsb.inject loaded successfully");
//# sourceMappingURL=jsb.runtime.bundle.js.map