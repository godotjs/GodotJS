
import { PropertyHint, PropertyUsageFlags, Variant  } from "godot";
import * as jsb from "godot-jsb";

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

export function export_(type: Variant.Type, details?: { class_?: Function, hint?: PropertyHint, hint_string?: string, usage?: PropertyUsageFlags }) {
    return function (target: any, key: string) {
        let ebd = { name: key, type: type, hint: PropertyHint.PROPERTY_HINT_NONE, hint_string: "", usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
        if (typeof details === "object") {
            if (typeof details.hint === "number") ebd.hint = details.hint;
            if (typeof details.hint_string === "string") ebd.hint_string = details.hint_string;
            if (typeof details.usage === "number") ebd.usage = details.usage;
        }
        jsb.internal.add_script_property(target, ebd);
    }
}

/**
 * NOTE only int value enums are allowed
 */
export function export_enum(enum_type: any) {
    return function (target: any, key: string) {
        let enum_vs: Array<string> = [];
        for (let c in enum_type) {
            const v = enum_type[c];
            if (typeof v === "string") {
                enum_vs.push(v+":"+c);
            }
        }
        let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_ENUM, hint_string: enum_vs.join(","), usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
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
                enum_vs.push(v+":"+c);
            }
        }
        let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_FLAGS, hint_string: enum_vs.join(","), usage: PropertyUsageFlags.PROPERTY_USAGE_DEFAULT };
        jsb.internal.add_script_property(target, ebd);
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

export function $wait(signal: any) {
    return new Promise(resolve => {
        let fn: any = null;
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
    })
}
