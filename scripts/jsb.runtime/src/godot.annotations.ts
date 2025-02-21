
import { PropertyHint, PropertyUsageFlags, Variant, MultiplayerAPI, MultiplayerPeer } from "godot";
import * as jsb from "godot-jsb";

function guess_type_name(type: any) {
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
export function signal() {
    return function (target: any, key: string) {
        jsb.internal.add_script_signal(target, key);
    }
}

export function export_multiline() {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
}

function __export_range(type: Variant.Type, min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    let hint_string = `${min},${max},${step}`;
    if (typeof extra_hints !== "undefined") {
        hint_string += "," + extra_hints.join(",");
    }
    return export_(type, { hint: PropertyHint.PROPERTY_HINT_RANGE, hint_string: hint_string });
}

export function export_range(min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    return __export_range(Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
}

export function export_range_i(min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    return __export_range(Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
}

/** String as a path to a file, custom filter provided as hint. */
export function export_file(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
}

export function export_dir(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
}

export function export_global_file(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_FILE, hint_string: filter });
}

export function export_global_dir(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_DIR, hint_string: filter });
}

export function export_exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only") {
    return export_(Variant.Type.TYPE_FLOAT, { hint: PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
}

/**
 * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
 */
export function export_array(clazz: Function) {
    return export_(Variant.Type.TYPE_ARRAY, { class_: clazz });
}

/**
 * A Shortcut for `export_(Variant.Type.TYPE_DICTIONARY, { class_: [key_class, value_class] })`
 */
export function export_dictionary(key_class: Function, value_class: Function) {
    return export_(Variant.Type.TYPE_DICTIONARY, { class_: [key_class, value_class] });
}

function get_hint_string_for_enum(enum_type: any): string {
    let enum_vs: Array<string> = [];
    for (let c in enum_type) {
        const v = enum_type[c];
        if (typeof v === "string") {
            enum_vs.push(v + ":" + c);
        }
    }
    return enum_vs.join(",");
}

export type ClassDescriptor = Function | Symbol | Array<any>;

function is_array_of_pair(clazz: any): boolean {
    return typeof clazz === "object" && typeof clazz.length === "number" && clazz.length == 2;
}

function get_hint_string(clazz: any): string {
    let gd = require("godot");
    if (typeof clazz === "symbol") {
        if (clazz === gd.IntegerType) {
            return Variant.Type.TYPE_INT + ":";
        }
        if (clazz === gd.FloatType) {
            return Variant.Type.TYPE_FLOAT + ":";
        }
    }

    if (typeof clazz === "function" && typeof clazz.prototype !== "undefined") {
        if (clazz.prototype instanceof gd.Resource) {
            return `${Variant.Type.TYPE_OBJECT}/${PropertyHint.PROPERTY_HINT_RESOURCE_TYPE}:${clazz.name}`;
        } else if (clazz.prototype instanceof gd.Node) {
            return `${Variant.Type.TYPE_OBJECT}/${PropertyHint.PROPERTY_HINT_NODE_TYPE}:${clazz.name}`;
        } else {
            // other than Resource and Node, only primitive types and enum types are supported in gdscript
            //TODO but we barely know anything about the enum types and int/float/StringName/... in JS

            if (clazz === Boolean) {
                return Variant.Type.TYPE_BOOL + ":";
            } else if (clazz === Number) {
                // we can only guess the type is float
                return Variant.Type.TYPE_FLOAT + ":";
            } else if (clazz === String) {
                return Variant.Type.TYPE_STRING + ":";
            } else {
                if (typeof (<any>clazz).__builtin_type__ === "number") {
                    return (<any>clazz).__builtin_type__ + ":";
                } else {
                    throw new Error("the given parameters are not supported or not implemented");
                }
            }
        }
    }
    
    if (typeof clazz === "object") {
        // probably an Array (as key-value type descriptor for a Dictionary)
        if (typeof clazz.length === "number" && clazz.length == 2) {
            let key_type: string;
            let value_type: string;

            if (is_array_of_pair(clazz[0]) && clazz[0][0] === gd.EnumType) {
                key_type = `${Variant.Type.TYPE_INT}/${Variant.Type.TYPE_INT}:${get_hint_string_for_enum(clazz[0][1])}`;
            } else {
                // special case for dictionary, int is preferred for key type of a dictionary
                key_type = clazz[0] === Number ? Variant.Type.TYPE_INT + ":" : get_hint_string(clazz[0]);
            }
            
            if (is_array_of_pair(clazz[1]) && clazz[1][0] === gd.EnumType) {
                value_type = `${Variant.Type.TYPE_INT}/${Variant.Type.TYPE_INT}:${get_hint_string_for_enum(clazz[1][1])}`;
            } else {
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
export function export_(type: Variant.Type, details?: { class_?: ClassDescriptor, hint?: PropertyHint, hint_string?: string, usage?: PropertyUsageFlags }) {
    return function (target: any, key: string) {
        let ebd = { name: key, type: type, hint: PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };

        if (typeof details === "object") {
            if (typeof details.hint === "number") ebd.hint = details.hint;
            if (typeof details.usage === "number") ebd.usage = details.usage;
            if (typeof details.hint_string === "string") ebd.hint_string = details.hint_string;

            // overwrite hint if class_ is provided
            try {
                let hint_string = get_hint_string(details.class_);
                if (hint_string.length > 0) {
                    ebd.hint = PropertyHint.PROPERTY_HINT_TYPE_STRING;
                    ebd.hint_string = hint_string;
                    ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                }
            } catch (e) {
                if (ebd.hint === PropertyHint.PROPERTY_HINT_NONE) {
                    console.warn("the given parameters are not supported or not implemented (you need to give hint/hint_string/usage manually)",
                        `class:${guess_type_name(Object.getPrototypeOf(target))} prop:${key} type:${type} class_:${guess_type_name(details.class_)}`);
                }
            }
        } 
        jsb.internal.add_script_property(target, ebd);
    }
}

/**
 * In Godot, class members can be exported. 
 * This means their value gets saved along with the resource (such as the scene) they're attached to.
 * They will also be available for editing in the property editor. 
 * Exporting is done by using the `@export_var` (or `@export_`) annotation.
 */
export function export_var(type: Variant.Type, details?: { class_?: ClassDescriptor, hint?: PropertyHint, hint_string?: string, usage?: PropertyUsageFlags }) {
    return export_(type, details);
}

/**
 * NOTE only int value enums are allowed
 */
export function export_enum(enum_type: any) {
    return function (target: any, key: string) {
        let hint_string = get_hint_string_for_enum(enum_type);
        let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_ENUM, hint_string: hint_string, usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
        jsb.internal.add_script_property(target, ebd);
    }
}

/**
 * NOTE only int value enums are allowed
 */
export function export_flags(enum_type: any) {
    return function (target: any, key: string) {
        let enum_vs: Array<string> = [];
        for (let c in enum_type) {
            const v = enum_type[c];
            if (typeof v === "string" && enum_type[v] != 0) {
                enum_vs.push(v + ":" + c);
            }
        }
        let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_FLAGS, hint_string: enum_vs.join(","), usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
        jsb.internal.add_script_property(target, ebd);
    }
}

export interface RPCConfig {
    mode?: MultiplayerAPI.RPCMode,
    sync?: "call_remote" | "call_local",
    transfer_mode?: MultiplayerPeer.TransferMode,
    transfer_channel?: number,
}

export function rpc(config?: RPCConfig) {
    return function (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) {
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
        } else {
            jsb.internal.add_script_rpc(target, propertyKey, {});
        }
    }
}

/**
 * auto initialized on ready (before _ready called)
 * @param evaluator for now, only string is accepted
 */
export function onready(evaluator: string | jsb.internal.OnReadyEvaluatorFunc) {
    return function (target: any, key: string) {
        let ebd = { name: key, evaluator: evaluator };
        jsb.internal.add_script_ready(target, ebd);
    }
}

export function tool() {
    return function (target: any) {
        jsb.internal.add_script_tool(target);
    }
}

export function icon(path: string) {
    return function (target: any) {
        jsb.internal.add_script_icon(target, path);
    }
}

export function deprecated(message?: string) {
    return function (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) {
        if (typeof propertyKey === "undefined") {
            jsb.internal.set_script_doc(target, undefined, 0, message ?? "");
            return;
        }
        if (typeof propertyKey !== "string" || propertyKey.length == 0) throw new Error("only string key is allowed for doc");
        jsb.internal.set_script_doc(target, propertyKey, 0, message ?? "");
    }
}

export function experimental(message?: string) {
    return function (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) {
        if (typeof propertyKey === "undefined") {
            jsb.internal.set_script_doc(target, undefined, 1, message ?? "");
            return;
        }
        if (typeof propertyKey !== "string" || propertyKey.length == 0) throw new Error("only string key is allowed for doc");
        jsb.internal.set_script_doc(target, propertyKey, 1, message ?? "");
    }
}

export function help(message?: string) {
    return function (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) {
        if (typeof propertyKey === "undefined") {
            jsb.internal.set_script_doc(target, undefined, 2, message ?? "");
            return;
        }
        if (typeof propertyKey !== "string" || propertyKey.length == 0) throw new Error("only string key is allowed for doc");
        jsb.internal.set_script_doc(target, propertyKey, 2, message ?? "");
    }
}
