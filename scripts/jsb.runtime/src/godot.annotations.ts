import type * as Godot from "godot";
import type * as GodotJsb from "godot-jsb";

const { jsb, FloatType, IntegerType, Node, PropertyHint, PropertyUsageFlags, Resource, Variant } = require("godot.lib.api");

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

export interface EnumPlaceholder { }
export interface TypePairPlaceholder { }

class EnumPlaceholderImpl implements EnumPlaceholder {
    target: any;
    constructor(target: any) { this.target = target; }
}

class TypePairPlaceholderImpl implements TypePairPlaceholder {
    key: any;
    value: any;
    constructor(key: any, value: any) { this.key = key; this.value = value; }
}

export function EnumType(type: any): EnumPlaceholder {
    return new EnumPlaceholderImpl(type);
}

export function TypePair(key: ClassDescriptor, value: ClassDescriptor): TypePairPlaceholder {
    return new EnumPlaceholderImpl([key, value]);
}

export type ClassDescriptor = Function | Symbol | EnumPlaceholder | TypePairPlaceholder;

/**
 *
 */
export function signal() {
    return function (target: any, key: string) {
        jsb.internal.add_script_signal(target, key);
    }
}

export const ExportSignal = signal;

export function export_multiline() {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
}

export const ExportMultiline = export_multiline;

function __export_range(type: Godot.Variant.Type, min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    let hint_string = `${min},${max},${step}`;
    if (typeof extra_hints !== "undefined") {
        hint_string += "," + extra_hints.join(",");
    }
    return export_(type, { hint: PropertyHint.PROPERTY_HINT_RANGE, hint_string: hint_string });
}

export function export_range(min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    return __export_range(Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
}

export const ExportRange = export_range;

export function export_range_i(min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    return __export_range(Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
}

export const ExportIntRange = export_range_i;

/** String as a path to a file, custom filter provided as hint. */
export function export_file(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
}

export const ExportFile = export_file;

export function export_dir(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
}

export function export_global_file(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_FILE, hint_string: filter });
}

export const ExportGlobalFile = export_global_file;

export function export_global_dir(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_DIR, hint_string: filter });
}

export const ExportGlobalDir = export_global_dir;

export function export_exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only") {
    return export_(Variant.Type.TYPE_FLOAT, { hint: PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
}

// TODO: Godot's property hints make for a poor API. We should provide convenience methods to build them.
export const ExportExpEasing = export_exp_easing;

/**
 * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
 */
export function export_array(clazz: ClassDescriptor) {
    return export_(Variant.Type.TYPE_ARRAY, { class_: clazz });
}

export const ExportArray = export_array;

/**
 * A Shortcut for exporting a dictionary { class_: [key_class, value_class] })`
 */
export function export_dictionary(key_class: ClassDescriptor, value_class: ClassDescriptor) {
    return export_(Variant.Type.TYPE_DICTIONARY, { class_: TypePair(key_class, value_class) });
}

export const ExportDictionary = export_dictionary;

function get_hint_string_for_enum(enum_type: any): string {
    const enum_vs: Array<string> = [];
    for (const key in enum_type) {
		enum_vs.push(`${key}:${enum_type[key]}`);
    }
    return enum_vs.join(",");
}

function get_hint_string(clazz: any): string {
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
        } else if (clazz.prototype instanceof Node) {
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

export function export_object(class_: ClassDescriptor) {
    return export_(Variant.Type.TYPE_OBJECT, { class_: class_ });
}

export const ExportObject = export_object;

/**
 * [low level export]
 */
export function export_(type: Godot.Variant.Type, details?: { class_?: ClassDescriptor, hint?: Godot.PropertyHint, hint_string?: string, usage?: Godot.PropertyUsageFlags }) {
    return function (target: any, key: string) {
        let ebd = { name: key, type: type, hint: PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };

        if (typeof details === "object") {
            if (typeof details.hint === "number") ebd.hint = details.hint;
            if (typeof details.usage === "number") ebd.usage = details.usage;
            if (typeof details.hint_string === "string") ebd.hint_string = details.hint_string;

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
                        } else if (clazz.prototype instanceof Node) {
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

export function Export(type: Godot.Variant.Type, details?: { class?: ClassDescriptor, hint?: Godot.PropertyHint, hintString?: string, usage?: Godot.PropertyUsageFlags }) {
	const { hintString, class: cls, ...consistent } = details ?? {};

	return export_(type, {
		...consistent,
		hint_string: hintString,
		class_: cls,
	});
}

/**
 * In Godot, class members can be exported.
 * This means their value gets saved along with the resource (such as the scene) they're attached to.
 * They will also be available for editing in the property editor.
 * Exporting is done by using the `@export_var` (or `@export_`) annotation.
 */
export function export_var(type: Godot.Variant.Type, details?: { class_?: ClassDescriptor, hint?: Godot.PropertyHint, hint_string?: string, usage?: Godot.PropertyUsageFlags }) {
    return export_(type, details);
}

export const ExportVar = export_var;

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

export const ExportEnum = export_enum;

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

export const ExportFlags = export_flags;

export interface RPCConfig {
    mode?: Godot.MultiplayerAPI.RPCMode,
    sync?: "call_remote" | "call_local",
    transfer_mode?: Godot.MultiplayerPeer.TransferMode,
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

export const Rpc = rpc;

/**
 * auto initialized on ready (before _ready called)
 * @param evaluator for now, only string is accepted
 */
export function onready(evaluator: string | GodotJsb.internal.OnReadyEvaluatorFunc) {
    return function (target: any, key: string) {
        let ebd = { name: key, evaluator: evaluator };
        jsb.internal.add_script_ready(target, ebd);
    }
}

export const OnReady = onready;

export function tool() {
    return function (target: any) {
        jsb.internal.add_script_tool(target);
    }
}

export const Tool = tool;

export function icon(path: string) {
    return function (target: any) {
        jsb.internal.add_script_icon(target, path);
    }
}

export const Icon = icon;

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

export const Deprecated = deprecated;

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

export const Experimental = experimental;

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

export const Help = help;
