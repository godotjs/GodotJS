
/**
 *
 */
export function signal_() {
    return function (target: any, key: string) {
        jsb.internal.add_script_signal(target, key);
    }
}

export function export_(type: jsb.VariantType, details?: { class_?: Function, hint?: number, hint_string?: string, usage?: number }) {
    return function (target: any, key: string) {
        let ebd = { name: key, type: type, ...details };
        jsb.internal.add_script_property(target, ebd);
    }
}

type EvaluatorFunc = (self: any) => any;

export function onready_(evaluator: string | EvaluatorFunc) {
    return function (target: any, key: string) {
        //TODO
    }
}
