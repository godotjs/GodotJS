import type * as Godot from "godot";
import type * as GodotJsb from "godot-jsb";

const { jsb } = require("godot.lib.api");

// [WARNING] ALL IMPLEMENTATIONS BELOW ARE FOR BACKWARD COMPATIBILITY ONLY.
// [WARNING] THEY EXIST TO TEMPORARILY SUPPORT OLD CODES THAT USE THESE FUNCTIONS.
// [WARNING] FOLLOW THE CHANGES IN `https://github.com/godotjs/GodotJS/tree/main/docs/breaking_changes.md` TO UPDATE YOUR CODES.

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use `SignalN<..., R>.as_promise()` instead.
 */
exports.$wait = function (signal: any) {
    return new Promise((resolve) => {
        let fn: any = null;
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
exports.seconds = function (secs: number) {
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
    return function (target: any, key: string) {
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

function __export_range(
    type: Godot.Variant.Type,
    min: number,
    max: number,
    step: number = 1,
    ...extra_hints: string[]
) {
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
exports.export_range = function (min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    const { Variant } = require("godot.lib.api");
    return __export_range(Variant.Type.TYPE_FLOAT, min, max, step, ...extra_hints);
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_range_i = function (min: number, max: number, step: number = 1, ...extra_hints: string[]) {
    const { Variant } = require("godot.lib.api");
    return __export_range(Variant.Type.TYPE_INT, min, max, step, ...extra_hints);
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_file = function (filter: string) {
    const { PropertyHint, Variant } = require("godot.lib.api");
    return exports.export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_FILE, hint_string: filter });
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_dir = function (filter: string) {
    const { PropertyHint, Variant } = require("godot.lib.api");
    return exports.export_(Variant.Type.TYPE_STRING, { hint: PropertyHint.PROPERTY_HINT_DIR, hint_string: filter });
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_global_file = function (filter: string) {
    const { PropertyHint, Variant } = require("godot.lib.api");
    return exports.export_(Variant.Type.TYPE_STRING, {
        hint: PropertyHint.PROPERTY_HINT_GLOBAL_FILE,
        hint_string: filter,
    });
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_global_dir = function (filter: string) {
    const { PropertyHint, Variant } = require("godot.lib.api");
    return exports.export_(Variant.Type.TYPE_STRING, {
        hint: PropertyHint.PROPERTY_HINT_GLOBAL_DIR,
        hint_string: filter,
    });
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_exp_easing = function (hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only") {
    const { PropertyHint, Variant } = require("godot.lib.api");
    return exports.export_(Variant.Type.TYPE_FLOAT, { hint: PropertyHint.PROPERTY_HINT_EXP_EASING, hint_string: hint });
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_ = function (
    type: Godot.Variant.Type,
    details?: { class_?: Function; hint?: Godot.PropertyHint; hint_string?: string; usage?: Godot.PropertyUsageFlags },
) {
    const { PropertyHint, PropertyUsageFlags } = require("godot.lib.api");
    return function (target: any, key: string) {
        let ebd = {
            name: key,
            type: type,
            hint: PropertyHint.PROPERTY_HINT_NONE,
            hint_string: "",
            usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
        };
        if (typeof details === "object") {
            if (typeof details.hint === "number") ebd.hint = details.hint;
            if (typeof details.hint_string === "string") ebd.hint_string = details.hint_string;
            if (typeof details.usage === "number") ebd.usage = details.usage;
        }
        jsb.internal.add_script_property(target, ebd);
    };
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_enum = function (enum_type: any) {
    const { PropertyHint, PropertyUsageFlags, Variant } = require("godot.lib.api");
    return function (target: any, key: string) {
        let enum_vs: Array<string> = [];
        for (let c in enum_type) {
            const v = enum_type[c];
            if (typeof v === "string") {
                enum_vs.push(v + ":" + c);
            }
        }
        let ebd = {
            name: key,
            type: Variant.Type.TYPE_INT,
            hint: PropertyHint.PROPERTY_HINT_ENUM,
            hint_string: enum_vs.join(","),
            usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
        };
        jsb.internal.add_script_property(target, ebd);
    };
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.export_flags = function (enum_type: any) {
    const { PropertyHint, PropertyUsageFlags, Variant } = require("godot.lib.api");
    return function (target: any, key: string) {
        let enum_vs: Array<string> = [];
        for (let c in enum_type) {
            const v = enum_type[c];
            if (typeof v === "string" && enum_type[v] != 0) {
                enum_vs.push(v + ":" + c);
            }
        }
        let ebd = {
            name: key,
            type: Variant.Type.TYPE_INT,
            hint: PropertyHint.PROPERTY_HINT_FLAGS,
            hint_string: enum_vs.join(","),
            usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT,
        };
        jsb.internal.add_script_property(target, ebd);
    };
};

interface RPCConfig {
    mode?: Godot.MultiplayerAPI.RPCMode;
    sync?: "call_remote" | "call_local";
    transfer_mode?: Godot.MultiplayerPeer.TransferMode;
    transfer_channel?: number;
}

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.rpc = function (config?: RPCConfig) {
    return function (target: any, propertyKey?: PropertyKey) {
        if (typeof propertyKey !== "string") {
            throw new Error("only string is allowed as propertyKey for rpc config");
            return;
        }

        if (typeof config !== "undefined") {
            jsb.internal.add_script_rpc(target, propertyKey, {
                mode: config.mode,
                sync: typeof config.sync !== "undefined" ? config.sync == "call_local" : undefined,
                transfer_mode: config.transfer_mode,
                transfer_channel: config.transfer_channel,
            });
        } else {
            jsb.internal.add_script_rpc(target, propertyKey, {});
        }
    };
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.onready = function (evaluator: string | GodotJsb.internal.OnReadyEvaluatorFunc) {
    return function (target: any, key: string) {
        let ebd = { name: key, evaluator: evaluator };
        jsb.internal.add_script_ready(target, ebd);
    };
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.tool = function () {
    return function (target: any) {
        jsb.internal.add_script_tool(target);
    };
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot.annotations` instead.
 */
exports.icon = function (path: string) {
    return function (target: any) {
        jsb.internal.add_script_icon(target, path);
    };
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot` instead.
 */
exports.GLOBAL_GET = function (entry_path: any): any {
    const { ProjectSettings } = require("godot.lib.api");
    return ProjectSettings.get_setting_with_override(entry_path);
};

/**
 * FOR BACKWARD COMPATIBILITY ONLY
 * @deprecated [WARNING] This function is deprecated. Use the same function from `godot` instead.
 */
exports.EDITOR_GET = function (entry_path: any): any {
    const { EditorInterface } = require("godot.lib.api");
    return EditorInterface.get_editor_settings().get(entry_path);
};
