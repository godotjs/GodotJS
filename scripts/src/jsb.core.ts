
import { PropertyHint, Variant  } from "godot";

/**
 *
 */
export function signal_() {
    return function (target: any, key: string) {
        jsb.internal.add_script_signal(target, key);
    }
}

export function export_(type: Variant.Type, details?: { class_?: Function, hint?: number, hint_string?: string, usage?: number }) {
    return function (target: any, key: string) {
        let ebd = { name: key, type: type, hint: PropertyHint.PROPERTY_HINT_NONE, hint_string: "" };
        if (typeof details === "object") {
            if (typeof details.hint === "number") ebd.hint = details.hint;
            if (typeof details.hint_string === "string") ebd.hint_string = details.hint_string;
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
        let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_ENUM, hint_string: enum_vs.join(",") };
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
        let ebd = { name: key, type: Variant.Type.TYPE_INT, hint: PropertyHint.PROPERTY_HINT_FLAGS, hint_string: enum_vs.join(",") };
        jsb.internal.add_script_property(target, ebd);
    }
}

/**
 * auto initialized on ready (before _ready called)
 * @param evaluator for now, only string is accepted
 */
export function onready_(evaluator: string | jsb.internal.OnReadyEvaluatorFunc) {
    return function (target: any, key: string) {
        let ebd = { name: key, evaluator: evaluator };
        jsb.internal.add_script_ready(target, ebd);
    }
}

export function tool_() {
    return function (target: any) {
        jsb.internal.add_script_tool(target);
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
        });
        signal.connect(fn, 0);
    })
}
