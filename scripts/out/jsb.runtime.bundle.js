"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
define("godot.annotations", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Help = exports.Experimental = exports.Deprecated = exports.Icon = exports.Tool = exports.OnReady = exports.Rpc = exports.ExportFlags = exports.ExportEnum = exports.ExportVar = exports.ExportObject = exports.ExportDictionary = exports.ExportArray = exports.ExportExpEasing = exports.ExportGlobalDir = exports.ExportGlobalFile = exports.ExportFile = exports.ExportIntRange = exports.ExportRange = exports.ExportMultiline = exports.ExportSignal = void 0;
    exports.EnumType = EnumType;
    exports.TypePair = TypePair;
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
    exports.export_object = export_object;
    exports.export_ = export_;
    exports.Export = Export;
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
    const { jsb, FloatType, IntegerType, Node, PropertyHint, PropertyUsageFlags, Resource, Variant } = require("godot.lib.api");
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
    class EnumPlaceholderImpl {
        constructor(target) { this.target = target; }
    }
    class TypePairPlaceholderImpl {
        constructor(key, value) { this.key = key; this.value = value; }
    }
    function EnumType(type) {
        return new EnumPlaceholderImpl(type);
    }
    function TypePair(key, value) {
        return new EnumPlaceholderImpl([key, value]);
    }
    /**
     *
     */
    function signal() {
        return function (target, key) {
            jsb.internal.add_script_signal(target, key);
        };
    }
    exports.ExportSignal = signal;
    function export_multiline() {
        return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
    }
    exports.ExportMultiline = export_multiline;
    function __export_range(type, min, max, step = 1, ...extra_hints) {
        let hint_string = `${min},${max},${step}`;
        if (typeof extra_hints !== "undefined") {
            hint_string += "," + extra_hints.join(",");
        }
        return export_(type, { hint: PropertyHint.PROPERTY_HINT_RANGE, hint_string: hint_string });
    }
    function export_range(min, max, step = 1, ...extra_hints) {
        return __export_range(Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
    }
    exports.ExportRange = export_range;
    function export_range_i(min, max, step = 1, ...extra_hints) {
        return __export_range(Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
    }
    exports.ExportIntRange = export_range_i;
    /** String as a path to a file, custom filter provided as hint. */
    function export_file(filter) {
        return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
    }
    exports.ExportFile = export_file;
    function export_dir(filter) {
        return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
    }
    function export_global_file(filter) {
        return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_FILE, hint_string: filter });
    }
    exports.ExportGlobalFile = export_global_file;
    function export_global_dir(filter) {
        return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_DIR, hint_string: filter });
    }
    exports.ExportGlobalDir = export_global_dir;
    function export_exp_easing(hint) {
        return export_(Variant.Type.TYPE_FLOAT, { hint: PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
    }
    // TODO: Godot's property hints make for a poor API. We should provide convenience methods to build them.
    exports.ExportExpEasing = export_exp_easing;
    /**
     * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
     */
    function export_array(clazz) {
        return export_(Variant.Type.TYPE_ARRAY, { class_: clazz });
    }
    exports.ExportArray = export_array;
    /**
     * A Shortcut for exporting a dictionary { class_: [key_class, value_class] })`
     */
    function export_dictionary(key_class, value_class) {
        return export_(Variant.Type.TYPE_DICTIONARY, { class_: TypePair(key_class, value_class) });
    }
    exports.ExportDictionary = export_dictionary;
    function get_hint_string_for_enum(enum_type) {
        const enum_vs = [];
        for (const key in enum_type) {
            enum_vs.push(`${key}:${enum_type[key]}`);
        }
        return enum_vs.join(",");
    }
    function get_hint_string(clazz) {
        if (typeof clazz === "symbol") {
            if (clazz === IntegerType) {
                return Variant.Type.TYPE_INT + ":";
            }
            if (clazz === FloatType) {
                return Variant.Type.TYPE_FLOAT + ":";
            }
        }
        if (typeof clazz === "function" && typeof clazz.prototype !== "undefined") {
            if (clazz.prototype instanceof Resource) {
                return `${Variant.Type.TYPE_OBJECT}/${PropertyHint.PROPERTY_HINT_RESOURCE_TYPE}:${clazz.name}`;
            }
            else if (clazz.prototype instanceof Node) {
                return `${Variant.Type.TYPE_OBJECT}/${PropertyHint.PROPERTY_HINT_NODE_TYPE}:${clazz.name}`;
            }
            else {
                // other than Resource and Node, only primitive types and enum types are supported in gdscript
                //TODO but we barely know anything about the enum types and int/float/StringName/... in JS
                if (clazz === Boolean) {
                    return Variant.Type.TYPE_BOOL + ":";
                }
                else if (clazz === Number) {
                    // we can only guess the type is float
                    return Variant.Type.TYPE_FLOAT + ":";
                }
                else if (clazz === String) {
                    return Variant.Type.TYPE_STRING + ":";
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
            if (clazz instanceof EnumPlaceholderImpl) {
                return `${Variant.Type.TYPE_INT}/${Variant.Type.TYPE_INT}:${get_hint_string_for_enum(clazz.target)}`;
            }
            // probably an Array (as key-value type descriptor for a Dictionary)
            if (clazz instanceof TypePairPlaceholderImpl) {
                // special case for dictionary, int is preferred for key type of a dictionary
                const key_type = clazz.key === Number ? Variant.Type.TYPE_INT + ":" : get_hint_string(clazz.key);
                const value_type = get_hint_string(clazz.value);
                if (key_type.length === 0 || value_type.length === 0) {
                    throw new Error("the given parameters are not supported or not implemented");
                }
                return key_type + ';' + value_type;
            }
        }
        return "";
    }
    function export_object(class_) {
        return export_(Variant.Type.TYPE_OBJECT, { class_: class_ });
    }
    exports.ExportObject = export_object;
    /**
     * [low level export]
     */
    function export_(type, details) {
        return function (target, key) {
            let ebd = { name: key, type: type, hint: PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            if (typeof details === "object") {
                if (typeof details.hint === "number")
                    ebd.hint = details.hint;
                if (typeof details.usage === "number")
                    ebd.usage = details.usage;
                if (typeof details.hint_string === "string")
                    ebd.hint_string = details.hint_string;
                // overwrite hint if class_ is provided
                try {
                    //TODO more general and unified way to handle all types
                    if (type === Variant.Type.TYPE_OBJECT) {
                        const clazz = details.class_;
                        if (typeof clazz === "function" && typeof clazz.prototype !== "undefined") {
                            if (clazz.prototype instanceof Resource) {
                                ebd.hint = PropertyHint.PROPERTY_HINT_RESOURCE_TYPE;
                                ebd.hint_string = clazz.name;
                                ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                            }
                            else if (clazz.prototype instanceof Node) {
                                ebd.hint = PropertyHint.PROPERTY_HINT_NODE_TYPE;
                                ebd.hint_string = clazz.name;
                                ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                            }
                        }
                        jsb.internal.add_script_property(target, ebd);
                        return;
                    }
                    let hint_string = get_hint_string(details.class_);
                    if (hint_string.length > 0) {
                        ebd.hint = PropertyHint.PROPERTY_HINT_TYPE_STRING;
                        ebd.hint_string = hint_string;
                        ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                    }
                }
                catch (e) {
                    if (ebd.hint === PropertyHint.PROPERTY_HINT_NONE) {
                        console.warn("the given parameters are not supported or not implemented (you need to give hint/hint_string/usage manually)", `class:${guess_type_name(Object.getPrototypeOf(target))} prop:${key} type:${type} class_:${guess_type_name(details.class_)}`);
                    }
                }
            }
            jsb.internal.add_script_property(target, ebd);
        };
    }
    function Export(type, details) {
        const _a = details !== null && details !== void 0 ? details : {}, { hintString, class: cls } = _a, consistent = __rest(_a, ["hintString", "class"]);
        return export_(type, Object.assign(Object.assign({}, consistent), { hint_string: hintString, class_: cls }));
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
    exports.ExportVar = export_var;
    /**
     * NOTE only int value enums are allowed
     */
    function export_enum(enum_type) {
        return function (target, key) {
            let hint_string = get_hint_string_for_enum(enum_type);
            let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_ENUM, hint_string: hint_string, usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    }
    exports.ExportEnum = export_enum;
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
            let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_FLAGS, hint_string: enum_vs.join(","), usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    }
    exports.ExportFlags = export_flags;
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
    exports.Rpc = rpc;
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
    exports.OnReady = onready;
    function tool() {
        return function (target) {
            jsb.internal.add_script_tool(target);
        };
    }
    exports.Tool = tool;
    function icon(path) {
        return function (target) {
            jsb.internal.add_script_icon(target, path);
        };
    }
    exports.Icon = icon;
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
    exports.Deprecated = deprecated;
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
    exports.Experimental = experimental;
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
    exports.Help = help;
});
define("godot.lib.api", ["require", "exports"], function (require, exports) {
    "use strict";
    const godot_api = require("godot");
    const jsb_api = require("godot-jsb");
    const ProxyTarget = godot_api.ProxyTarget;
    const { get_class, get_enum, get_enum_value, get_internal_mapping, get_member } = jsb_api.internal.names;
    function pascal_to_upper_snake_case(str) {
        return str.replace(/[a-z][A-Z]|[0-9][A-Z][a-z]/g, (m) => `${m[0]}_${m.slice(1)}`).toUpperCase();
    }
    function bind(target, value) {
        return typeof value === "function" ? value.bind(target) : value;
    }
    function is_basic_object(value) {
        const proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || !proto;
    }
    function proxy_value(value) {
        if (value == null) {
            return value;
        }
        if (value[ProxyTarget]) {
            return value;
        }
        if (typeof value === "function") {
            const proxied_function = function (...args) {
                return proxy_value(value.apply(this, args.map(proxy_value)));
            };
            // @ts-ignore
            proxied_function[ProxyTarget] = value;
            return proxied_function;
        }
        if (typeof value !== "object") {
            return value;
        }
        if (Array.isArray(value)) {
            return array_proxy(value);
        }
        return is_basic_object(value) ? object_proxy(value) : instance_proxy(value);
    }
    const object_handler = {
        get(target, p, _receiver) {
            var _a;
            if (p === ProxyTarget) {
                return target;
            }
            const value = Reflect.get(target, p);
            if (typeof p !== "string") {
                return value;
            }
            if (((_a = p[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === p[0]
                && value
                && typeof value === "object"
                && !Array.isArray(target)
                && is_basic_object(value)
                && !Object.entries(value).find(([k, v]) => k[0].toUpperCase() !== k[0] || typeof v !== "number")) {
                return enum_proxy(value);
            }
            return proxy_value(bind(target, value));
        },
    };
    function array_proxy(arr) {
        return new Proxy(arr, object_handler);
    }
    function object_proxy(obj) {
        return new Proxy(obj, object_handler);
    }
    const instance_handler = {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, _receiver) {
            if (p === ProxyTarget) {
                return target;
            }
            if (typeof p !== "string") {
                return Reflect.get(target, p);
            }
            return proxy_value(bind(target, Reflect.get(target, p !== "toString" ? get_member(p) : p)));
        },
        getOwnPropertyDescriptor(target, p) {
            return Reflect.getOwnPropertyDescriptor(target, typeof p === "string" ? get_member(p) : p);
        },
        has(target, p) {
            return Reflect.has(target, typeof p === "string" ? get_member(p) : p);
        },
        isExtensible() {
            return false;
        },
        ownKeys(target) {
            return Reflect.ownKeys(target).map(key => typeof key === "string" && get_internal_mapping(key) || key);
        },
        preventExtensions() {
            return true;
        },
        set(target, p, new_value, _receiver) {
            return Reflect.set(target, typeof p === "string" ? get_member(p) : p, new_value);
        },
        setPrototypeOf(_target) {
            return false;
        },
    };
    function instance_proxy(target_instance) {
        return new Proxy(target_instance, instance_handler);
    }
    function proxied_constructor(...args) {
        return instance_proxy(this.apply(this, args));
    }
    const class_handler = Object.assign(Object.assign({}, instance_handler), { construct(target, args, _new_target) {
            return instance_proxy(new target(...args));
        },
        get(target, p, _receiver) {
            var _a;
            if (p === ProxyTarget) {
                return target;
            }
            if (typeof p !== "string") {
                return Reflect.get(target, p);
            }
            if (p === "constructor") {
                return proxied_constructor;
            }
            if (((_a = p[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== p[0]) {
                return proxy_value(bind(target, Reflect.get(target, get_member(p))));
            }
            if (p.toUpperCase() === p) {
                return proxy_value(bind(target, Reflect.get(target, p)));
            }
            return enum_proxy(Reflect.get(target, get_enum(p)));
        } });
    function class_proxy(target_class) {
        return new Proxy(target_class, class_handler);
    }
    const enum_handler = {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(target, p, _receiver) {
            if (p === ProxyTarget) {
                return target;
            }
            if (typeof p !== "string") {
                return Reflect.get(target, p);
            }
            return bind(target, Reflect.get(target, get_enum_value(p)));
        },
        getOwnPropertyDescriptor(target, p) {
            return Reflect.getOwnPropertyDescriptor(target, typeof p === "string" ? get_enum_value(p) : p);
        },
        has(target, p) {
            return Reflect.has(target, typeof p === "string" ? get_enum_value(p) : p);
        },
        isExtensible() {
            return false;
        },
        ownKeys(target) {
            return Reflect.ownKeys(target).map(key => typeof key === "string" ? pascal_to_upper_snake_case(key) : key);
        },
        preventExtensions() {
            return true;
        },
        set() {
            return false;
        },
        setPrototypeOf() {
            return false;
        },
    };
    function enum_proxy(target_enum) {
        if (typeof target_enum !== "object") {
            return target_enum;
        }
        return new Proxy(target_enum, enum_handler);
    }
    const api_handler = (target) => ({
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get(_pseudo_target, p, _receiver) {
            var _a;
            if (p === ProxyTarget) {
                return target;
            }
            if (p in _pseudo_target) {
                return _pseudo_target[p];
            }
            if (typeof p !== "string") {
                return Reflect.get(target, p);
            }
            if (p === "toString") {
                return proxy_value(bind(target, Reflect.get(target, p)));
            }
            // Special case, see jsb_godot_module_loader.cpp
            if (p === "Variant") {
                return object_proxy(Reflect.get(target, p));
            }
            if (((_a = p[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== p[0]) {
                return proxy_value(bind(target, Reflect.get(target, get_member(p))));
            }
            const value = Reflect.get(target, get_class(p));
            if (typeof value === "function") {
                return class_proxy(value);
            }
            if (value == null || typeof value !== "object") {
                return value;
            }
            return is_basic_object(value) ? enum_proxy(value) : instance_proxy(value);
        },
        getOwnPropertyDescriptor(_pseudo_target, p) {
            if (p in _pseudo_target) {
                return Reflect.getOwnPropertyDescriptor(_pseudo_target, p);
            }
            return Reflect.getOwnPropertyDescriptor(target, typeof p === "string" ? get_member(p) : p);
        },
        has(_pseudo_target, p) {
            return Reflect.has(target, typeof p === "string" ? get_class(p) : p) || Reflect.has(_pseudo_target, p);
        },
        isExtensible() {
            return false;
        },
        ownKeys(_pseudo_target) {
            return Reflect.ownKeys(target)
                .map(key => typeof key === "string" && get_internal_mapping(key) || key)
                .concat(Reflect.ownKeys(_pseudo_target));
        },
        preventExtensions() {
            return true;
        },
        set(_pseudo_target, p, new_value, _receiver) {
            return Reflect.set(target, typeof p === "string" ? get_member(p) : p, new_value);
        },
        setPrototypeOf(_pseudo_target) {
            return false;
        },
    });
    const godot_jsb = object_proxy(jsb_api);
    const api = new Proxy({ jsb: godot_jsb }, api_handler(godot_api));
    return api;
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
    // callback on a godot type loaded by jsb_godot_module_loader
    exports._mod_proxy_ = function (builtin_symbols, type_loader_func) {
        return new Proxy(type_db, {
            set: function (target, prop_name, value) {
                if (typeof prop_name !== 'string') {
                    throw new Error(`only string key is allowed`);
                }
                if (typeof target[prop_name] !== 'undefined') {
                    console.warn('overwriting existing value', prop_name);
                }
                target[prop_name] = value;
                return true;
            },
            get: function (target, prop_name) {
                let o = target[prop_name];
                if (typeof o === 'undefined' && typeof prop_name === 'string') {
                    o = target[prop_name] =
                        typeof builtin_symbols[prop_name] !== "undefined"
                            ? builtin_symbols[prop_name]
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
define("jsb.core", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const { jsb } = require("godot.lib.api");
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
            fn = require("godot.lib.api").create(function () {
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
        const { PropertyHint, Variant } = require("godot.lib.api");
        return exports.export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
    };
    function __export_range(type, min, max, step = 1, ...extra_hints) {
        const { PropertyHint } = require("godot.lib.api");
        let hint_string = `${min},${max},${step}`;
        if (typeof extra_hints !== "undefined") {
            hint_string += "," + extra_hints.join(",");
        }
        return exports.export_(type, { hint: PropertyHint.PROPERTY_HINT_RANGE, hint_string: hint_string });
    }
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_range = function (min, max, step = 1, ...extra_hints) {
        const { Variant } = require("godot.lib.api");
        return __export_range(Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_range_i = function (min, max, step = 1, ...extra_hints) {
        const { Variant } = require("godot.lib.api");
        return __export_range(Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_file = function (filter) {
        const { PropertyHint, Variant } = require("godot.lib.api");
        return exports.export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_dir = function (filter) {
        const { PropertyHint, Variant } = require("godot.lib.api");
        return exports.export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_global_file = function (filter) {
        const { PropertyHint, Variant } = require("godot.lib.api");
        return exports.export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_FILE, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_global_dir = function (filter) {
        const { PropertyHint, Variant } = require("godot.lib.api");
        return exports.export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_DIR, hint_string: filter });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_exp_easing = function (hint) {
        const { PropertyHint, Variant } = require("godot.lib.api");
        return exports.export_(Variant.Type.TYPE_FLOAT, { hint: PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_ = function (type, details) {
        const { PropertyHint, PropertyUsageFlags } = require("godot.lib.api");
        return function (target, key) {
            let ebd = { name: key, type: type, hint: PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
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
        const { PropertyHint, PropertyUsageFlags, Variant } = require("godot.lib.api");
        return function (target, key) {
            let enum_vs = [];
            for (let c in enum_type) {
                const v = enum_type[c];
                if (typeof v === "string") {
                    enum_vs.push(v + ":" + c);
                }
            }
            let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_ENUM, hint_string: enum_vs.join(","), usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.export_flags = function (enum_type) {
        const { PropertyHint, PropertyUsageFlags, Variant } = require("godot.lib.api");
        return function (target, key) {
            let enum_vs = [];
            for (let c in enum_type) {
                const v = enum_type[c];
                if (typeof v === "string" && enum_type[v] != 0) {
                    enum_vs.push(v + ":" + c);
                }
            }
            let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_FLAGS, hint_string: enum_vs.join(","), usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
            jsb.internal.add_script_property(target, ebd);
        };
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
     */
    exports.rpc = function (config) {
        return function (target, propertyKey) {
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
        return function (target, propertyKey) {
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
        return function (target, propertyKey) {
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
        return function (target, propertyKey) {
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
        const { ProjectSettings } = require("godot.lib.api");
        return ProjectSettings.get_setting_with_override(entry_path);
    };
    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] This function is deprecated. Use the same function from `godot` instead.
     */
    exports.EDITOR_GET = function (entry_path) {
        const { EditorInterface } = require("godot.lib.api");
        return EditorInterface.get_editor_settings().get(entry_path);
    };
});
define("jsb.inject", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const proxyable_prototypes = [];
    const proxy_wrap = function (value) {
        if (typeof value !== "object" || value === null) {
            return value;
        }
        const proto = Object.getPrototypeOf(value);
        return proto && proxyable_prototypes.includes(proto)
            ? value.proxy()
            : value;
    };
    require("godot.typeloader").on_type_loaded("GArray", function (type) {
        const ProxyTarget = require("godot").ProxyTarget;
        const proxy_unwrap = function (value) {
            var _a;
            if (typeof value !== "object" || value === null) {
                return value;
            }
            return (_a = value[ProxyTarget]) !== null && _a !== void 0 ? _a : value;
        };
        const get_member = require("godot-jsb").internal.names.get_member;
        proxyable_prototypes.push(type.prototype);
        type.prototype[Symbol.iterator] = function* () {
            const get_indexed = Reflect.get(this, get_member('get_indexed'));
            for (let i = 0; i < this.size(); ++i) {
                yield get_indexed.call(this, i);
            }
        };
        // We're not going to try expose the whole Array API, we'll just be super minimalistic. If the user is after
        // something more complex, it'll likely be more performant to spread the GArray into a JS array anyway.
        const pop_back_name = get_member('pop_back');
        const push_back_name = get_member('push_back');
        const array_api = {
            forEach: function (callback, thisArg) {
                const target = this[ProxyTarget];
                let i = 0;
                for (const value of target) {
                    callback.call(thisArg !== null && thisArg !== void 0 ? thisArg : this, proxy_wrap(value), i++);
                }
            },
            includes: function (value) {
                const target = this[ProxyTarget];
                return target.has(proxy_unwrap(value));
            },
            indexOf: function (value, fromIndex) {
                const target = this[ProxyTarget];
                return target.find(proxy_unwrap(value), fromIndex);
            },
            pop: function () {
                const target = this[ProxyTarget];
                const result = Reflect.get(target, pop_back_name)();
                return result == null ? result : proxy_wrap(result);
            },
            push: function (...values) {
                const target = this[ProxyTarget];
                const push = Reflect.get(target, push_back_name);
                for (const value of values) {
                    push.call(target, proxy_unwrap(value));
                }
                return target.size();
            },
            toJSON: function (key = "") {
                return [...this];
            },
            toString: function (index) {
                return [...this].map(v => { var _a, _b; return (_b = (_a = v === null || v === void 0 ? void 0 : v.toString) === null || _a === void 0 ? void 0 : _a.call(v)) !== null && _b !== void 0 ? _b : v; }).join(",");
            },
        };
        const array_iterator = function* () {
            for (let i = 0; i < this.length; ++i) {
                yield this[i];
            }
        };
        const handler = {
            get(target, p, receiver) {
                if (typeof p !== "string") {
                    return p === ProxyTarget
                        ? target
                        : p === Symbol.iterator
                            ? array_iterator
                            : undefined;
                }
                const num = Number.parseInt(p);
                if (!Number.isFinite(num)) {
                    if (p === 'length') {
                        return target.size();
                    }
                    return array_api[p];
                }
                if (num < 0 || num >= target.size()) {
                    return undefined;
                }
                return proxy_wrap(target.get(num));
            },
            getOwnPropertyDescriptor(target, p) {
                if (typeof p !== "string") {
                    return undefined;
                }
                const num = Number.parseInt(p);
                if (!(num >= 0) || num >= target.size()) {
                    return undefined;
                }
                return {
                    configurable: true,
                    enumerable: true,
                    value: proxy_wrap(target.get(num)),
                    writable: true,
                };
            },
            has(target, p) {
                if (typeof p !== "string") {
                    return p === Symbol.iterator;
                }
                const num = Number.parseInt(p);
                if (!(num >= 0)) {
                    return p === 'length' || !!array_api[p];
                }
                return num >= 0 && num < target.size();
            },
            isExtensible(target) {
                return true;
            },
            ownKeys(target) {
                const keys = [];
                for (let i = 0; i < target.size(); i++) {
                    keys.push(i.toString());
                }
                return keys;
            },
            preventExtensions(target) {
                return true;
            },
            set(target, p, newValue, receiver) {
                if (typeof p !== "string") {
                    return false;
                }
                const num = Number.parseInt(p);
                if (!(num >= 0) || num >= target.size()) {
                    return false;
                }
                target.set(num, proxy_unwrap(newValue));
                return true;
            },
            setPrototypeOf(target, v) {
                return false;
            },
        };
        type.prototype.proxy = function () {
            return new Proxy(this, handler);
        };
        type.create = function (values) {
            const arr = new type();
            const proxy = arr.proxy();
            proxy.push.apply(proxy, values);
            return arr;
        };
    });
    require("godot.typeloader").on_type_loaded("GDictionary", function (type) {
        const ProxyTarget = require("godot").ProxyTarget;
        const proxy_unwrap = function (value) {
            var _a;
            if (typeof value !== "object" || value === null) {
                return value;
            }
            return (_a = value[ProxyTarget]) !== null && _a !== void 0 ? _a : value;
        };
        const get_member = require("godot-jsb").internal.names.get_member;
        proxyable_prototypes.push(type.prototype);
        type.prototype[Symbol.iterator] = function* () {
            const keys = this.keys();
            const arr_get_indexed = keys[get_member('get_indexed')];
            const dict_get_keyed = this[get_member('get_keyed')];
            for (let i = 0; i < keys.size(); ++i) {
                const key = arr_get_indexed.call(keys, i);
                yield { key: key, value: dict_get_keyed.call(this, key) };
            }
        };
        const handler = {
            defineProperty(target, property, attributes) {
                return false;
            },
            deleteProperty(target, p) {
                target.erase(p);
                return true;
            },
            get(target, p, receiver) {
                if (typeof p !== "string") {
                    return p === ProxyTarget
                        ? target
                        : undefined;
                }
                const value = target.get(p);
                return value !== null
                    ? proxy_wrap(value)
                    : target.has(p)
                        ? value
                        : p === "toString"
                            ? Object.prototype.toString
                            : undefined;
            },
            getOwnPropertyDescriptor(target, p) {
                if (typeof p !== "string") {
                    return undefined;
                }
                return {
                    configurable: true,
                    enumerable: true,
                    value: proxy_wrap(target.get(p)),
                    writable: true,
                };
            },
            has(target, p) {
                if (typeof p !== "string") {
                    return false;
                }
                return target.has(p) || p === "toString";
            },
            isExtensible(target) {
                return true;
            },
            ownKeys(target) {
                const keys = [];
                for (const key of target.keys()) {
                    if (typeof key === "string") {
                        keys.push(key);
                    }
                }
                return keys;
            },
            preventExtensions(target) {
                return false;
            },
            set(target, p, newValue, receiver) {
                if (typeof p !== "string") {
                    return false;
                }
                target.set(p, proxy_unwrap(newValue));
                return true;
            },
            setPrototypeOf(target, v) {
                return false;
            },
        };
        type.prototype.proxy = function () {
            return new Proxy(this, handler);
        };
        type.create = function (entries) {
            const arr = new type();
            const proxy = arr.proxy();
            for (const [key, value] of Object.entries(entries)) {
                proxy[key] = value;
            }
            return arr;
        };
    });
    require("godot.typeloader").on_type_loaded("Callable", function (type) {
        const original_cc = type.create;
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
                    return original_cc(arguments[0], arguments[1]);
                }
                return custom_cc(arguments[0], arguments[1]);
            }
            throw new Error("invalid arguments");
        };
    });
    require("godot.typeloader").on_type_loaded("Signal", function (type) {
        let { jsb, Callable, Object } = require("godot.lib.api");
        const get_member = jsb.internal.names.get_member;
        const notify_microtasks_run = jsb.internal.notify_microtasks_run;
        type.prototype[get_member('as_promise')] = function () {
            let self = this;
            return new Promise(function (resolve, reject) {
                let fn = Callable.create(function () {
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
                    notify_microtasks_run();
                });
                self.connect(fn, Object.ConnectFlags.CONNECT_ONE_SHOT);
                self = undefined;
            });
        };
    });
    (function () {
        Object.defineProperty(require("godot"), "GLOBAL_GET", {
            value: function (entry_path) {
                return require("godot.lib.api").ProjectSettings.get_setting_with_override(entry_path);
            }
        });
        Object.defineProperty(require("godot"), "EDITOR_GET", {
            value: function (entry_path) {
                return require("godot.lib.api").EditorInterface.get_editor_settings().get(entry_path);
            }
        });
    }());
    console.debug("jsb.inject loaded successfully");
});
require("jsb.inject");
//# sourceMappingURL=jsb.runtime.bundle.js.map