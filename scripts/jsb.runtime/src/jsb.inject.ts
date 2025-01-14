import { Callable, GArray, GDictionary, Signal, Object as GObject, ProjectSettings, EditorInterface } from "godot";

const jsb = require("godot-jsb");

(function (items: Array<{ class: any, func: Function }>) {
    for (let item of items) {
        item.class.prototype[Symbol.iterator] = item.func;
    }
})(
    [
        {
            class: GDictionary,
            func: function* () {
                let self = <any>this;
                let keys = self.keys();
                for (let i = 0; i < keys.size(); ++i) {
                    const key = keys.get_indexed(i);
                    yield { key: key, value: self.get_keyed(key) };
                }
            }
        },
        {
            class: GArray,
            func: function* () {
                let self = <any>this;
                for (let i = 0; i < self.size(); ++i) {
                    yield self.get_indexed(i);
                }
            }
        }
    ]
);

let orignal_cc = Callable.create;

// @ts-ignore
Callable.create = function () {
    const argc = arguments.length;
    if (argc == 1) {
        if (typeof arguments[0] !== "function") {
            throw new Error("not a function");
        }
        return jsb.callable(arguments[0]);
    }
    if (argc == 2) {
        if (typeof arguments[1] !== "function") {
            return orignal_cc(arguments[0], arguments[1]);
        }
        return jsb.callable(arguments[0], arguments[1]);
    }
    throw new Error("invalid arguments");
}

Signal.prototype.as_promise = function (signal: any) {
    return new Promise(resolve => {
        let fn: any = null;
        fn = Callable.create(function () {
            //signal.disconnect(fn);
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
        signal.connect(fn, GObject.ConnectFlags.CONNECT_ONE_SHOT);
    });
}

Object.defineProperty(require("godot"), "GLOBAL_GET", {
    value: function (entry_path: string): any {
        return ProjectSettings.get_setting_with_override(entry_path);
    }
})

Object.defineProperty(require("godot"), "EDITOR_GET", {
    value: function (entry_path: string): any {
        return EditorInterface.get_editor_settings().get(entry_path);
    }
});
