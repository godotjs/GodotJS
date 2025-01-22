
require("jsb.hook").on_godot_type_loaded("GArray", function (type: any) {
    type.prototype[Symbol.iterator] = function* () {
        let self = <any>this;
        for (let i = 0; i < self.size(); ++i) {
            yield self.get_indexed(i);
        }
    }
});

require("jsb.hook").on_godot_type_loaded("GDictionary", function (type: any) {
    type.prototype[Symbol.iterator] = function* () {
        let self = <any>this;
        let keys = self.keys();
        for (let i = 0; i < keys.size(); ++i) {
            const key = keys.get_indexed(i);
            yield { key: key, value: self.get_keyed(key) };
        }
    }
});

require("jsb.hook").on_godot_type_loaded("Callable", function (type: any) {
    const orignal_cc = type.create;
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
                return orignal_cc(arguments[0], arguments[1]);
            }
            return custom_cc(arguments[0], arguments[1]);
        }
        throw new Error("invalid arguments");
    }
});

require("jsb.hook").on_godot_type_loaded("Signal", function (type: any) {
    type.prototype.as_promise = function () {
        let self = this;
        return new Promise(function (resolve, reject) {
            let fn: any = null;
            let gd = require("godot");
            fn = gd.Callable.create(function () {
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
                require("godot-jsb").internal.notify_microtasks_run();
            });
            self.connect(fn, gd.Object.ConnectFlags.CONNECT_ONE_SHOT);
            self = undefined;
        });
    }
});

Object.defineProperty(require("godot"), "GLOBAL_GET", {
    value: function (entry_path: string): any {
        return require("godot").ProjectSettings.get_setting_with_override(entry_path);
    }
})

Object.defineProperty(require("godot"), "EDITOR_GET", {
    value: function (entry_path: string): any {
        return require("godot").EditorInterface.get_editor_settings().get(entry_path);
    }
});

console.debug("jsb.inject loaded successfully");
