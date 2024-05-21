
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
