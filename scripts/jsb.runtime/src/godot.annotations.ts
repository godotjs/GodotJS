import type * as Godot from "godot";
import type * as GodotJsb from "godot-jsb";
import type { ClassBinder, ExportOptions, RPCConfig } from "godot.annotations"; // Looks odd, but comes from godot.generated.d.ts i.e. codegen.

import lib_api = require("godot.lib.api");

const {
    jsb,
    proxy,
    FloatType,
    IntegerType,
    Node,
    PropertyHint,
    PropertyUsageFlags,
    ProxyTarget,
    Resource,
    Variant,
} = lib_api;

type VariantConstructor = abstract new(...args: any[]) => NonNullable<Godot.GAny> | Number | String | Boolean;
type GObjectConstructor = abstract new (...args: any[]) => Godot.Object;

type ClassSpecifier = VariantConstructor | Symbol | EnumPlaceholder | TypePairPlaceholder;

function legacy_decorators_check(context: undefined | string | DecoratorContext) {
    if (typeof context === "object") {
        throw new Error(`Legacy decorators must be built with experimentalDecorators enabled. Use createClassBinder() instead.`);
    }
}

function guess_type_name(type: unknown) {
    if (typeof type === "function") {
        return type.name;
    }
    if (type && typeof type === "object") {
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

interface EnumPlaceholder {
    target: Record<string, string | number>;
}

interface TypePairPlaceholder {
    key: VariantConstructor;
    value: VariantConstructor;
}

class EnumPlaceholderImpl implements EnumPlaceholder {
    target: Record<string, string | number>;

    constructor(target: Record<string, string | number>) {
        this.target = target;
    }
}

class TypePairPlaceholderImpl implements TypePairPlaceholder {
    key: VariantConstructor;
    value: VariantConstructor;
    constructor(key: any, value: any) {
        this.key = key;
        this.value = value;
    }
}

export function EnumType(type: Record<string, string | number>): EnumPlaceholder {
    return new EnumPlaceholderImpl(type);
}

export function TypePair(key: VariantConstructor, value: VariantConstructor): TypePairPlaceholder {
    return new TypePairPlaceholderImpl(key, value);
}

/** @deprecated Use createClassBinder() instead. */
export function signal() {
    return function(target: any, name: string) {
        legacy_decorators_check(name);

        if (typeof name !== "string") {
            throw new Error("Signals must have a string name");
        }

        jsb.internal.add_script_signal(target, name);
    };
}

/** @deprecated Use createClassBinder() instead. */
export const ExportSignal = signal;

/** @deprecated Use createClassBinder() instead. */
export function export_multiline() {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
}

/** @deprecated Use createClassBinder() instead. */
export const ExportMultiline = export_multiline;

function __export_range(type: Godot.Variant.Type, min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    let hint_string = `${min},${max},${step}`;
    if (typeof extra_hints !== "undefined") {
        hint_string += "," + extra_hints.join(",");
    }
    return export_(type, { hint: PropertyHint.PROPERTY_HINT_RANGE, hint_string });
}

/** @deprecated Use createClassBinder() instead. */
export function export_range(min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    return __export_range(Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
}

/** @deprecated Use createClassBinder() instead. */
export const ExportRange = export_range;

/** @deprecated Use createClassBinder() instead. */
export function export_range_i(min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    return __export_range(Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
}

/** @deprecated Use createClassBinder() instead. */
export const ExportIntRange = export_range_i;

/** String as a path to a file, custom filter provided as hint. */
/** @deprecated Use createClassBinder() instead. */
export function export_file(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
}

/** @deprecated Use createClassBinder() instead. */
export const ExportFile = export_file;

/** @deprecated Use createClassBinder() instead. */
export function export_dir(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
}

/** @deprecated Use createClassBinder() instead. */
export function export_global_file(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_FILE, hint_string: filter });
}

/** @deprecated Use createClassBinder() instead. */
export const ExportGlobalFile = export_global_file;

/** @deprecated Use createClassBinder() instead. */
export function export_global_dir(filter: string) {
    return export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_GLOBAL_DIR, hint_string: filter });
}

/** @deprecated Use createClassBinder() instead. */
export const ExportGlobalDir = export_global_dir;

/** @deprecated Use createClassBinder() instead. */
export function export_exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only") {
    return export_(Variant.Type.TYPE_FLOAT, { hint: PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
}

// TODO: Godot's property hints make for a poor API. We should provide convenience methods to build them.
/** @deprecated Use createClassBinder() instead. */
export const ExportExpEasing = export_exp_easing;

/**
 * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
 */
/** @deprecated Use createClassBinder() instead. */
export function export_array(clazz: ClassSpecifier) {
    return export_(Variant.Type.TYPE_ARRAY, { class_: clazz });
}

/** @deprecated Use createClassBinder() instead. */
export const ExportArray = export_array;

/**
 * A Shortcut for exporting a dictionary { class_: [key_class, value_class] })`
 */
/** @deprecated Use createClassBinder() instead. */
export function export_dictionary(key_class: VariantConstructor, value_class: VariantConstructor) {
    return export_(Variant.Type.TYPE_DICTIONARY, { class_: TypePair(key_class, value_class) });
}

/** @deprecated Use createClassBinder() instead. */
export const ExportDictionary = export_dictionary;

function get_hint_string_for_enum(enum_type: Record<string, string | number>): string {
    const enum_vs: Array<string> = [];
    for (const [key, value] of Object.entries(enum_type)) {
        if (typeof value === 'number' && value >= 0 && Number.isInteger(value)) {
            enum_vs.push(`${key}:${value}`);
        }
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

    if (typeof clazz === "function") {
        const prototype = clazz.prototype;

        if (prototype instanceof Resource) {
            return `${Variant.Type.TYPE_OBJECT}/${PropertyHint.PROPERTY_HINT_RESOURCE_TYPE}:${clazz.name}`;
        } else if (prototype instanceof Node || ((clazz as any)[ProxyTarget] ?? clazz) === ((Node as any)[ProxyTarget] ?? Node)) {
            return `${Variant.Type.TYPE_OBJECT}/${PropertyHint.PROPERTY_HINT_NODE_TYPE}:${clazz.name}`;
        } else if (typeof prototype !== "undefined") {
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

/** @deprecated Use createClassBinder() instead. */
export function export_object(clazz: GObjectConstructor) {
    return export_(Variant.Type.TYPE_OBJECT, { class_: clazz });
}

/** @deprecated Use createClassBinder() instead. */
export const ExportObject = export_object;

/**
 * [low level export]
 * @deprecated Use createClassBinder() instead.
 * */
export function export_(type: Godot.Variant.Type, details?: { class_?: ClassSpecifier, hint?: Godot.PropertyHint, hint_string?: string, usage?: Godot.PropertyUsageFlags }) {
    return function(
      target: any,
      name: string
    ) {
        legacy_decorators_check(name);

        if (typeof name !== "string") {
            throw new Error("Only properties with a string name/key can be exported");
        }

        const ebd = {
            name,
            type: type,
            hint: PropertyHint.PROPERTY_HINT_NONE,
            hint_string: "",
            usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
        } satisfies GodotJsb.ScriptPropertyInfo;

        if (typeof details === "object") {
            if (typeof details.hint === "number") ebd.hint = details.hint;
            if (typeof details.usage === "number") ebd.usage = details.usage;
            if (typeof details.hint_string === "string") ebd.hint_string = details.hint_string;

            // overwrite hint if class_ is provided
            try {
                //TODO more general and unified way to handle all types

                if (type === Variant.Type.TYPE_OBJECT) {
                    const clazz = details.class_;
                    if (typeof clazz === "function") {
                        const prototype = clazz.prototype;

                        if (prototype instanceof Resource) {
                            ebd.hint = PropertyHint.PROPERTY_HINT_RESOURCE_TYPE;
                            ebd.hint_string = clazz.name;
                            ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                        } else if (prototype instanceof Node || ((clazz as any)[ProxyTarget] ?? clazz) === ((Node as any)[ProxyTarget] ?? Node)) {
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
                    ebd.hint = type === Variant.Type.TYPE_ARRAY
                        ? PropertyHint.PROPERTY_HINT_ARRAY_TYPE
                        : PropertyHint.PROPERTY_HINT_TYPE_STRING;
                    ebd.hint_string = hint_string;
                    ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                }
            } catch (e) {
                if (ebd.hint === PropertyHint.PROPERTY_HINT_NONE) {
                    console.warn("the given parameters are not supported or not implemented (you need to give hint/hint_string/usage manually)",
                      `class:${guess_type_name(Object.getPrototypeOf(target))} prop:${name} type:${type} class_:${guess_type_name(details.class_)}`);
                }
            }
        }

        jsb.internal.add_script_property(target, ebd);
    };
}

/** @deprecated Use createClassBinder() instead. */
export function Export(type: Godot.Variant.Type, details?: { class?: ClassSpecifier, hint?: Godot.PropertyHint, hintString?: string, usage?: Godot.PropertyUsageFlags }) {
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
/** @deprecated Use createClassBinder() instead. */
export function export_var(type: Godot.Variant.Type, details?: { class_?: ClassSpecifier, hint?: Godot.PropertyHint, hint_string?: string, usage?: Godot.PropertyUsageFlags }) {
    return export_(type, details);
}

/** @deprecated Use createClassBinder() instead. */
export const ExportVar = export_var;

/**
 * NOTE only int value enums are allowed
 */
/** @deprecated Use createClassBinder() instead. */
export function export_enum(enum_type: Record<string, string | number>) {
    return function (target: any, name: string) {
        legacy_decorators_check(name);

        if (typeof name !== 'string') {
            throw new Error("Only properties with a string name/key can be exported");
        }

        jsb.internal.add_script_property(target, {
            name,
            type: Variant.Type.TYPE_INT,
            hint: PropertyHint.PROPERTY_HINT_ENUM,
            hint_string: get_hint_string_for_enum(enum_type),
            usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
        });
    };
}

/** @deprecated Use createClassBinder() instead. */
export const ExportEnum = export_enum;

/**
 * NOTE only int value enums are allowed
 */
/** @deprecated Use createClassBinder() instead. */
export function export_flags(enum_type: Record<string, string | number>) {
    return function (target: any, name: string) {
        legacy_decorators_check(name);

        if (typeof name !== 'string') {
            throw new Error("Only properties with a string name/key can be exported");
        }

        const enum_vs: Array<string> = [];
        for (let c in enum_type) {
            const v = enum_type[c];
            if (typeof v === "string" && enum_type[v] != 0) {
                enum_vs.push(v + ":" + c);
            }
        }
        const ebd: GodotJsb.ScriptPropertyInfo = {
            name,
            type: Variant.Type.TYPE_INT,
            hint: PropertyHint.PROPERTY_HINT_FLAGS,
            hint_string: enum_vs.join(","),
            usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
        };
        jsb.internal.add_script_property(target, ebd);
    };
}

/** @deprecated Use createClassBinder() instead. */
export const ExportFlags = export_flags;

/** @deprecated Use createClassBinder() instead. */
export function rpc(config?: RPCConfig) {
    return function (target: any, name: string) {
        legacy_decorators_check(name);

        if (typeof name !== 'string') {
            throw new Error("Only methods with a string name can be registered for RPC");
        }

        if (typeof config !== "undefined") {
            jsb.internal.add_script_rpc(target, name, {
                rpc_mode: config.mode,
                call_local: typeof config.sync !== "undefined" ? (config.sync == "call_local") : undefined,
                transfer_mode: config.transfer_mode,
                channel: config.transfer_channel,
            });
        } else {
            jsb.internal.add_script_rpc(target, name, {});
        }
    };
}

/** @deprecated Use createClassBinder() instead. */
export const Rpc = rpc;

/**
 * auto initialized on ready (before _ready called)
 *
 * @deprecated Use createClassBinder() instead.
 */
export function onready(evaluator: string) {
    return function (target: any, name: string) {
        legacy_decorators_check(name);

        if (typeof name !== 'string') {
            throw new Error("Only methods with a string name can be registered as an onready callback");
        }

        const ebd = { name, evaluator: evaluator };
        jsb.internal.add_script_ready(target, ebd);
    };
}

/** @deprecated Use createClassBinder() instead. */
export const OnReady = onready;

/** @deprecated Use createClassBinder() instead. */
export function tool() {
    return function (target: any, name: undefined) {
        legacy_decorators_check(name);

        jsb.internal.add_script_tool(target);
    };
}

/** @deprecated Use createClassBinder() instead. */
export const Tool = tool;

/** @deprecated Use createClassBinder() instead. */
export function icon(path: string) {
    return function (target: any, name: undefined) {
        legacy_decorators_check(name);

        jsb.internal.add_script_icon(target, path);
    };
}

/** @deprecated Use createClassBinder() instead. */
export const Icon = icon;

/** @deprecated Use createClassBinder() instead. */
export function deprecated(message?: string) {
    return function (target: any, name?: string) {
        legacy_decorators_check(name);

        if (typeof name === "undefined") {
            jsb.internal.set_script_doc(target, undefined, 0, message ?? "");
            return;
        }

        if (typeof name !== "string" || !name) {
            throw new Error("Only methods/properties with a string name/key can be marked as deprecated");
        }

        jsb.internal.set_script_doc(target, name, 0, message ?? "");
    };
}

/** @deprecated Use createClassBinder() instead. */
export const Deprecated = deprecated;

/** @deprecated Use createClassBinder() instead. */
export function experimental(message?: string) {
    return function (target: any, name?: string) {
        legacy_decorators_check(name);

        if (typeof name === "undefined") {
            jsb.internal.set_script_doc(target, undefined, 1, message ?? "");
            return;
        }

        if (typeof name !== "string" || !name) {
            throw new Error("Only methods/properties with a string name/key can be marked as experimental");
        }

        jsb.internal.set_script_doc(target, name, 1, message ?? "");
    };
}

/** @deprecated Use createClassBinder() instead. */
export const Experimental = experimental;

/** @deprecated Use createClassBinder() instead. */
export function help(message?: string) {
    return function (target: any, name?: string) {
        legacy_decorators_check(name);

        if (typeof name === "undefined") {
            jsb.internal.set_script_doc(target, undefined, 2, message ?? "");
            return;
        }

        if (typeof name !== "string" || !name) {
            throw new Error("Only methods/properties with a string name/key can be given a help string");
        }

        jsb.internal.set_script_doc(target, name, 2, message ?? "");
    };
}

/** @deprecated Use createClassBinder() instead. */
export const Help = help;

export type ClassMemberDecorator<RestrictedContext extends ClassMemberDecoratorContext = ClassMemberDecoratorContext> =
    <Context extends RestrictedContext>(target: ClassMemberDecoratorTarget<Context>, context: Context) => void | ClassMemberDecoratorReturn<Context>;
export type ClassMemberDecoratorTarget<Context extends ClassMemberDecoratorContext> =
    Context extends ClassMethodDecoratorContext<infer _, infer Value>
        ? (...args: unknown[]) => Value
        : Context extends ClassGetterDecoratorContext<infer _, infer Value>
            ? () => Value
            : Context extends ClassSetterDecoratorContext<infer _, infer Value>
                ? (value: Value) => void
                : Context extends ClassFieldDecoratorContext
                    ? undefined
                    : Context extends ClassAccessorDecoratorContext<infer _, infer Value>
                        ? { get: () => Value; set: (value: Value) => void; }
                        : never;
export type ClassMemberDecoratorReturn<Context extends ClassMemberDecoratorContext> =
    Context extends ClassMethodDecoratorContext<infer This, infer Value>
        ? (this: This, ...args: unknown[]) => Value
        : Context extends ClassGetterDecoratorContext<infer This, infer Value>
            ? (this: This) => Value
            : Context extends ClassSetterDecoratorContext<infer This, infer Value>
                ? (this: This, value: Value) => void
                : Context extends ClassFieldDecoratorContext<infer This, infer Value>
                    ? (this: This, initialValue: Value) => Value
                    : Context extends ClassAccessorDecoratorContext<infer This, infer Value>
                        ? { get?(this: This): Value; set?(this: This, value: Value): void; init?(this: This, initialValue: Value): Value; }
                        : never;

export type ClassDecorator<This extends abstract new (...args: any) => any = abstract new (...args: any) => any> =
    (target: This, context: ClassDecoratorContext<This>) => void;
export type ClassDecoratorClass<Context extends ClassDecoratorContext> = Context extends ClassDecoratorContext<infer Class>
    ? Class
    : never;

export type Decorator<RestrictedContext extends DecoratorContext = DecoratorContext> =
    RestrictedContext extends ClassDecoratorContext
        ? <Context extends RestrictedContext>(target: ClassDecoratorClass<Context>, context: Context) => void
        : RestrictedContext extends ClassMemberDecoratorContext
            ? <Context extends RestrictedContext>(target: ClassMemberDecoratorTarget<Context>, context: Context) => void | ClassMemberDecoratorReturn<Context>
            : never;

export type AnyDecorator = (value: unknown, context: DecoratorContext) => unknown;

export type ClassValueMemberDecoratorContext<This = unknown, Value = unknown> =
    | ClassGetterDecoratorContext<This, Value>
    | ClassSetterDecoratorContext<This, Value>
    | ClassFieldDecoratorContext<This, Value>
    | ClassAccessorDecoratorContext<This, Value>;

type OnReadyAssignment<T = unknown, R = unknown> = (this: T, self: T) => R;

export function createClassBinder(): ClassBinder {
    const signal_names: string[] = [];
    const property_info_map: Record<string, GodotJsb.ScriptPropertyInfo> = {};
    const rpc_map: Record<string, RPCConfig> = {};
    const onready_map: Record<string, string | GodotJsb.internal.OnReadyEvaluatorFunc> = {};
    let is_tool: boolean = false;
    let icon_path: string | undefined = undefined;
    const deprecated_map: Record<string, string> = {};
    const experimental_map: Record<string, string> = {};
    const help_map: Record<string, string> = {};

    let executed = false;

    const hint_string_name = jsb.internal.names.get_member('hint_string');

    // primary class decorator

    function bind_class() {
        if (executed) {
            throw new Error("Re-using the same class binder across multiple classes is not supported");
        }

        executed = true;

        return (
            target: GObjectConstructor,
            context: ClassDecoratorContext,
        ) => {
            if (typeof context !== "object") {
                throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
            }

            if (!context.name) {
                throw new Error("Only named classes can be exported for consumption by Godot");
            }

            const proto = target.prototype;

            for (const signal_name of signal_names) {
                jsb.internal.add_script_signal(proto, signal_name);
            }

            for (const info of Object.values(property_info_map)) {
                jsb.internal.add_script_property(proto, info);
            }

            for (const [name, config] of Object.entries(rpc_map)) {
                jsb.internal.add_script_rpc(proto, name, {
                    rpc_mode: config.mode,
                    call_local: typeof config.sync !== "undefined" ? (config.sync == "call_local") : undefined,
                    transfer_mode: config.transfer_mode,
                    channel: config.transfer_channel,
                });
            }

            for (const [name, evaluator] of Object.entries(onready_map)) {
                jsb.internal.add_script_ready(proto, { name, evaluator });
            }

            if (is_tool) {
                jsb.internal.add_script_tool(target);
            }

            if (icon_path) {
                jsb.internal.add_script_icon(target, icon_path);
            }

            for (const [name, message] of Object.entries(deprecated_map)) {
                jsb.internal.set_script_doc(proto, name, 0, message ?? "");
            }

            for (const [name, message] of Object.entries(experimental_map)) {
                jsb.internal.set_script_doc(proto, name, 1, message ?? "");
            }

            for (const [name, message] of Object.entries(help_map)) {
                jsb.internal.set_script_doc(proto, name, 2, message ?? "");
            }
        };
    }

    function add_property(name: string, type: Godot.Variant.Type, options?: ExportOptions) {
        if (property_info_map[name]) {
            throw new Error(`Property ${name} already exported. You must decorate a getter or a setter, not both.`);
        }

        const ebd = {
            name,
            type: type,
            hint: PropertyHint.PROPERTY_HINT_NONE,
            hint_string: "",
            usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
        } satisfies GodotJsb.ScriptPropertyInfo;

        if (typeof options === "object") {
            if (typeof options.hint === "number") {
                ebd.hint = options.hint;
            }

            if (typeof options.usage === "number") {
                ebd.usage = options.usage;
            }

            if (typeof options.hint_string === "string") {
                ebd.hint_string = options.hint_string;
            }

            // overwrite hint if class_ is provided
            try {
                //TODO more general and unified way to handle all types

                if (type === Variant.Type.TYPE_OBJECT) {
                    const clazz = options.class;
                    if (typeof clazz === "function") {
                        const prototype = clazz.prototype;

                        if (prototype instanceof Resource) {
                            ebd.hint = PropertyHint.PROPERTY_HINT_RESOURCE_TYPE;
                            ebd.hint_string = clazz.name;
                            ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                        } else if (prototype instanceof Node || ((clazz as any)[ProxyTarget] ?? clazz) === ((Node as any)[ProxyTarget] ?? Node)) {
                            ebd.hint = PropertyHint.PROPERTY_HINT_NODE_TYPE;
                            ebd.hint_string = clazz.name;
                            ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                        }
                    }

                    property_info_map[name] = ebd;
                    return;
                }

                let hint_string = get_hint_string(options.class);

                if (hint_string.length > 0) {
                    ebd.hint = type === Variant.Type.TYPE_ARRAY
                            ? PropertyHint.PROPERTY_HINT_ARRAY_TYPE
                            : PropertyHint.PROPERTY_HINT_TYPE_STRING;
                    ebd.hint_string = hint_string;
                    ebd.usage |= PropertyUsageFlags.PROPERTY_USAGE_SCRIPT_VARIABLE;
                }
            } catch (e) {
                if (ebd.hint === PropertyHint.PROPERTY_HINT_NONE) {
                    console.warn("the given parameters are not supported or not implemented (you need to give hint/hint_string/usage manually)",
                        `prop:${name} type:${type} class_:${guess_type_name(options.class)}`);
                }
            }
        }

        property_info_map[name] = ebd;
    }

    function bind_export(type: Godot.Variant.Type, options?: ExportOptions): ClassMemberDecorator {
        return (_target, context) => {
            if (typeof context !== "object") {
                throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
            }

            const name = context.name;

            if (typeof name !== "string") {
                throw new Error("Only properties with a string name/key can be exported");
            }

            switch (context.kind) {
                case "accessor":
                case "field":
                case "getter":
                case "setter":
                    add_property(name, type, options && proxy.object_proxy(options, true));
                    return;

                default: {
                    const _context: ClassMethodDecoratorContext = context; // Exhaustive check
                    throw new Error(`The export decorator can not be used to decorate a ${context.kind}. Decorate an auto-accessor, setter or field.`);
                }
            }
        };
    }

    function bind_range(type: Godot.Variant.Type, min: number, max: number, step: number = 1, ...extra_hints: string[]) {
        return bind_export(type, {
            hint: PropertyHint.PROPERTY_HINT_RANGE,
            [hint_string_name]: [min, max, step, ...extra_hints].join(","),
        });
    }

    return proxy.key_only_proxy(Object.assign(bind_class, {
        // additional class decorators

        tool() {
            return function(target: GObjectConstructor, _context: ClassDecoratorContext) {
                jsb.internal.add_script_tool(target);
            };
        },
        icon(path: string) {
            return function (target: GObjectConstructor, _context: ClassDecoratorContext) {
                jsb.internal.add_script_icon(target, path);
            };
        },

        // member decorators

        export: Object.assign(bind_export, {
            multiline(): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_MULTILINE_TEXT });
            },
            range(min: number, max: number, step: number, ...extra_hints: string[]): ClassMemberDecorator {
                return bind_range(Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
            },
            /** String as a path to a file, custom filter provided as hint. */
            range_int(min: number, max: number, step: number, ...extra_hints: string[]): ClassMemberDecorator {
                return bind_range(Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
            },
            file(filter: string): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_STRING, {
                    hint: PropertyHint.PROPERTY_HINT_FILE,
                    [hint_string_name]: filter,
                });
            },
            dir(filter: string): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_STRING, {
                    hint: PropertyHint.PROPERTY_HINT_DIR,
                    [hint_string_name]: filter,
                });
            },
            global_file(filter: string): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_STRING, {
                    hint: PropertyHint.PROPERTY_HINT_GLOBAL_FILE,
                    [hint_string_name]: filter,
                });
            },
            global_dir(filter: string): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_STRING, {
                    hint: PropertyHint.PROPERTY_HINT_GLOBAL_DIR,
                    [hint_string_name]: filter,
                });
            },
            exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only"): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_FLOAT, {
                    hint: PropertyHint.PROPERTY_HINT_EXP_EASING,
                    [hint_string_name]: hint,
                });
            },
            /**
             * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class: clazz })`
             */
            array(clazz: ClassSpecifier): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_ARRAY, { class: clazz });
            },
            /**
             * A Shortcut for exporting a dictionary { class: [key_class, value_class] })`
             */
            dictionary(key_class: VariantConstructor, value_class: VariantConstructor): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_DICTIONARY, { class: TypePair(key_class, value_class) });
            },
            object<Constructor extends GObjectConstructor>(clazz: Constructor): ClassMemberDecorator<ClassValueMemberDecoratorContext<unknown, null | InstanceType<Constructor>>>{
                return bind_export(Variant.Type.TYPE_OBJECT, { class: clazz });
            },
            enum(enum_type: Record<string, string | number>): ClassMemberDecorator {
                return bind_export(Variant.Type.TYPE_INT, {
                    hint: PropertyHint.PROPERTY_HINT_ENUM,
                    [hint_string_name]: get_hint_string_for_enum(enum_type),
                    usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
                });
            },
            flags(enum_type: Record<string, string | number>): ClassMemberDecorator {
                const hints: Array<string> = [];

                for (const [key, value] of Object.entries(enum_type)) {
                    if (typeof value === 'number' && value > 0 && Number.isInteger(value)) {
                        hints.push(key + ":" + value);
                    }
                }

                return bind_export(Variant.Type.TYPE_INT, {
                    hint: PropertyHint.PROPERTY_HINT_FLAGS,
                    [hint_string_name]: hints.join(","),
                    usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
                });
            },
            cache(): ClassMemberDecorator<ClassAccessorDecoratorContext<Godot.Object> | ClassSetterDecoratorContext<Godot.Object>> {
                return (target, context) => {
                    if (typeof context !== "object") {
                        throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
                    }

                    const name = context.name;

                    if (typeof name !== "string") {
                        throw new Error("Only properties with a string name/key can be cached");
                    }

                    const info = property_info_map[name];

                    if (!info) {
                        if (context.kind === "accessor") {
                            throw new Error(`Cache decorator must appear before the export decorator on accessor "${name}"`);
                        } else {
                            throw new Error(`Cache decorated setter must appear after the export decorated getter for property "${name}".`);
                        }
                    }

                    info.cache = true;

                    const update_cached_value = proxy.proxy_unwrap_value(jsb.internal.create_script_cached_property_updater(name));

                    switch (context.kind) {
                        case "accessor": {
                            const set_value = (target as ClassMemberDecoratorTarget<ClassAccessorDecoratorContext<Godot.Object>>).set;

                            return {
                                set: function (this: Godot.Object, value: unknown) {
                                    set_value.call(this, value);
                                    update_cached_value.call(this, value);
                                },
                            } satisfies ClassMemberDecoratorReturn<ClassAccessorDecoratorContext> as any;
                        }
                        case "setter": {
                            return function (this: any, value: unknown) {
                                (target as ClassMemberDecoratorTarget<ClassSetterDecoratorContext<Godot.Object>>).call(this, value);
                                update_cached_value.call(this);
                            };
                        }

                        default:
                            throw new Error(`The cache decorator can not be used to decorate a ${(context as ClassMemberDecoratorContext).kind}. Decorate an auto-accessor, setter or field.`);
                    }
                };
            }
        }),
        signal() {
            return <
                Context extends ClassAccessorDecoratorContext<Godot.Object, Godot.Signal>
                    | ClassGetterDecoratorContext<Godot.Object, Godot.Signal>
                    | ClassFieldDecoratorContext<Godot.Object, Godot.Signal>
            >(
                _target: unknown,
                context: Context,
            ): ClassMemberDecoratorReturn<Context> => {
                if (typeof context !== "object") {
                    throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
                }

                context = proxy.proxy_unwrap_value(context);

                const name = context.name;

                if (typeof name !== "string") {
                    throw new Error("Only signals with a string name can be exported");
                }

                signal_names.push(name);

                if (context.kind === "accessor") {
                    return {
                        get: proxy.proxy_unwrap_value(jsb.internal.create_script_signal_getter(name)),
                        set: () => {
                            throw new Error(`Signal properties cannot be reassigned. Did you mean to .connect() a callback instead?`);
                        },
                    } satisfies ClassMemberDecoratorReturn<ClassAccessorDecoratorContext<Godot.Object, Godot.Signal>> as any;
                } else if (context.kind === "field") {
                    context.addInitializer(function (this: Godot.Object) {
                        context.access.set(this, proxy.proxy_unwrap_value(jsb.internal.create_script_signal_getter(name)).call(this));
                    });
                    return undefined as any;
                } else if (context.kind === "getter") {
                    return proxy.proxy_unwrap_value(jsb.internal.create_script_signal_getter(name)) satisfies
                        ClassMemberDecoratorReturn<ClassGetterDecoratorContext<Godot.Object, Godot.Signal>> as any;
                } else {
                    throw new Error(`The signal decorator can not be used to decorate a ${(context as ClassMemberDecoratorContext).kind}. A \`readonly\` field is recommended.`);
                }
            };
        },
        rpc(config?: RPCConfig) {
            return (
                _target: Function,
                context: string | ClassMethodDecoratorContext,
            ) => {
                if (typeof context !== "object") {
                    throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
                }

                const name = context.name;

                if (typeof name !== "string") {
                    throw new Error("Only methods with a string name can be remote procedures");
                }

                rpc_map[name] = config ? proxy.object_proxy(config, true) : {};
            };
        },
        /**
         * auto initialized on ready (before _ready called)
         * @param evaluator for now, only string is accepted
         */
        onready(evaluator: string | GodotJsb.internal.OnReadyEvaluatorFunc) {
            return (
                _target: undefined,
                context: string | ClassMethodDecoratorContext,
            ) => {
                if (typeof context !== "object") {
                    throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
                }

                const name = context.name;

                if (typeof name !== "string") {
                    throw new Error("Only methods with a string name can be registered as an onready callback");
                }

                onready_map[name] = evaluator;
            };
        },

        // class or member decorators

        deprecated(message?: string) {
            return function(target, context) {
                if (typeof context !== "object") {
                    throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
                }

                if (context.kind === "class") {
                    jsb.internal.set_script_doc(target as GObjectConstructor, undefined, 0, message ?? "");
                    return;
                }

                const name = typeof context === "object" ? context.name : context;

                if (typeof name !== "string") {
                    throw new Error("Only methods/properties with a string name/key can be marked as deprecated");
                }

                deprecated_map[name] = message ?? "";
            } satisfies AnyDecorator as Decorator<ClassDecoratorContext<GObjectConstructor> | ClassValueMemberDecoratorContext<GObjectConstructor>>;
        },
        experimental(message?: string) {
            return function(target, context) {
                if (typeof context !== "object") {
                    throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
                }

                if (context.kind === "class") {
                    jsb.internal.set_script_doc(target as GObjectConstructor, undefined, 1, message ?? "");
                    return;
                }

                const name = typeof context === "object" ? context.name : context;

                if (typeof name !== "string") {
                    throw new Error("Only methods/properties with a string name/key can be marked as experimental");
                }

                experimental_map[name] = message ?? "";
            } satisfies AnyDecorator as Decorator<ClassDecoratorContext<GObjectConstructor> | ClassValueMemberDecoratorContext<GObjectConstructor>>;
        },
        help(message?: string) {
            return function(target, context) {
                if (typeof context !== "object") {
                    throw new Error("The createClassBinder() requires modern decorator support. Disable legacy decorators (experimentalDecorators) in your tsconfig.json");
                }

                if (context.kind === "class") {
                    jsb.internal.set_script_doc(target as GObjectConstructor, undefined, 2, message ?? "");
                    return;
                }

                const name = typeof context === "object" ? context.name : context;

                if (typeof name !== "string") {
                    throw new Error("Only methods/properties with a string name/key can be marked as help");
                }

                help_map[name] = message ?? "";
            } satisfies AnyDecorator as Decorator<ClassDecoratorContext<GObjectConstructor> | ClassValueMemberDecoratorContext<GObjectConstructor>>;
        },
    }));
}
