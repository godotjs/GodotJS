const proxyable_prototypes: any[] = [];

const proxy_value = function(value: any) {
    if (typeof value !== 'object' || value === null) {
        return value;
    }

    const proto = Object.getPrototypeOf(value);
    return proto && proxyable_prototypes.includes(proto)
        ? value.proxy()
        : value;
};

require("godot.typeloader").on_type_loaded("Array", function (type: any) {
    proxyable_prototypes.push(type.prototype);

    type.prototype[Symbol.iterator] = function* () {
        let self = <any>this;
        for (let i = 0; i < self.size(); ++i) {
            yield self.get_indexed(i);
        }
    };

    // We're not going to try expose the whole Array API, we'll just be super minimalistic. If the user is after
    // something more complex, it'll likely be more performant to spread the GArray into a JS array anyway.

    const method_mapping: Partial<Record<string, string>> = {
        pop: "pop_back",
        indexOf: "find",
        includes: "has",
    };

    const push = function(this: any /* GArray */, ...values: any[]) {
        for (const value of values) {
            this.push_back(value);
        }
        return this.size();
    };

    const handler: ProxyHandler<any> = {
        get(target, p, receiver) {
            if (typeof p !== 'string') {
                return p === Symbol.iterator
                    ? Reflect.get(target, Symbol.iterator).bind(target)
                    : undefined;
            }

            const num = Number.parseInt(p);

            if (!(num >= 0)) {
                if (p === 'length') {
                    return target.size();
                } else if (p === 'push') {
                    return push.bind(target);
                }

                const mapped = method_mapping[p];
                return mapped && Reflect.get(target, mapped).bind(target);
            }

            if (num >= target.size()) {
                return undefined;
            }

            return proxy_value(target.get(num));
        },
        getOwnPropertyDescriptor(target, p) {
            if (typeof p !== 'string') {
                return undefined;
            }

            const num = Number.parseInt(p);

            if (!(num >= 0) || num >= target.size()) {
                return undefined;
            }

            return {
                configurable: true,
                enumerable: true,
                value: proxy_value(target.get(num)),
                writable: true,
            };
        },
        has(target, p) {
            if (typeof p !== 'string') {
                return false;
            }

            const num = Number.parseInt(p);

            if (!(num >= 0)) {
                return p === 'length' || !!method_mapping[p];
            }

            return num >= 0 && num < target.size();
        },
        isExtensible(target) {
            return true;
        },
        ownKeys(target) {
            const keys: string[] = [];
            for (let i = 0; i < target.size(); i++) {
                keys.push(i.toString());
            }
            return keys;
        },
        preventExtensions(target) {
            return true;
        },
        set(target, p, newValue, receiver): boolean {
            if (typeof p !== 'string') {
                return false;
            }

            const num = Number.parseInt(p);

            if (!(num >= 0) || num >= target.size()) {
                return false;
            }

            target.set(num, newValue);
            return true;
        },
        setPrototypeOf(target, v) {
            return false;
        },
    };

    type.prototype.proxy = function(this: any) {
        return new Proxy(this, handler);
    };
});

require("godot.typeloader").on_type_loaded("Dictionary", function (type: any) {
    proxyable_prototypes.push(type.prototype);

    type.prototype[Symbol.iterator] = function* () {
        let self = <any>this;
        let keys = self.keys();
        for (let i = 0; i < keys.size(); ++i) {
            const key = keys.get_indexed(i);
            yield { key: key, value: self.get_keyed(key) };
        }
    };

    const handler: ProxyHandler<any> = {
        defineProperty(target, property, attributes) {
            return false;
        },
        deleteProperty(target, p) {
            return target.erase(p);
        },
        get(target, p, receiver) {
            if (typeof p !== 'string') {
                return undefined;
            }
            return proxy_value(target.get(p));
        },
        getOwnPropertyDescriptor(target, p) {
            if (typeof p !== 'string') {
                return undefined;
            }

            return {
                configurable: true,
                enumerable: true,
                value: proxy_value(target.get(p)),
                writable: true,
            };
        },
        has(target, p) {
            if (typeof p !== 'string') {
                return false;
            }

            return target.has(p);
        },
        isExtensible(target) {
            return true;
        },
        ownKeys(target) {
            const keys: string[] = [];
            for (const key of target.keys()) {
                if (typeof key === "string") {
                    keys.push(key);
                }
            }
            return keys;
        },
        preventExtensions(target) {
            return false;
        },
        set(target, p, newValue, receiver) {
            if (typeof p !== 'string') {
                return false;
            }
            target.set(p, newValue);
            return true;
        },
        setPrototypeOf(target, v) {
            return false;
        },
    };

    type.prototype.proxy = function(this: any) {
        return new Proxy(this, handler);
    };
});

require("godot.typeloader").on_type_loaded("Callable", function (type: any) {
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

require("godot.typeloader").on_type_loaded("Signal", function (type: any) {
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
