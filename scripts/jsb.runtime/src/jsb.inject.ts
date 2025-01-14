import { GArray, GDictionary, Callable } from "godot";
import { callable } from "godot-jsb";

let inject_mark = Symbol();

(function (items: Array<{ class: any, func: Function }>) {
    for (let item of items) {
        item.class.prototype[Symbol.iterator] = item.func;
    }
})(
    [
        {
            class: GDictionary,
            func: function* () {
                let self: GDictionary = <any>this;
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
                let self: GArray = <any>this;
                for (let i = 0; i < self.size(); ++i) {
                    yield self.get_indexed(i);
                }
            }
        }
    ]
);

let callable_create = Callable.create;

// @ts-ignore
Callable.create = function () {
    const argc = arguments.length;
    if (argc == 1) {
        if (typeof arguments[0] !== "function") {
            throw new Error("not a function");
        }
        return callable(arguments[0]);
    }
    if (argc == 2) {
        if (typeof arguments[1] !== "function") {
            return callable_create(arguments[0], arguments[1]);
        }
        return callable(arguments[0], arguments[1]);
    }
    throw new Error("invalid arguments");
}
