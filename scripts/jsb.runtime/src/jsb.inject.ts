const ProxyTarget = Symbol("proxy_target");

const proxy_unwrap = function(value: any) {
    if (typeof value !== "object" || value === null) {
        return value;
    }

    return value[ProxyTarget] ?? value;
}

const proxyable_prototypes: any[] = [];

const proxy_wrap = function(value: any) {
    if (typeof value !== "object" || value === null) {
        return value;
    }

    const proto = Object.getPrototypeOf(value);
    return proto && proxyable_prototypes.includes(proto)
        ? value.proxy()
        : value;
};

require("godot.typeloader").on_type_loaded("GArray", function (type: any) {
    const camel_case_bindings = require("godot-jsb").CAMEL_CASE_BINDINGS_ENABLED;

    proxyable_prototypes.push(type.prototype);

    type.prototype[Symbol.iterator] = camel_case_bindings
        ? function* (this: any /* GArray */) {
            for (let i = 0; i < this.size(); ++i) {
                yield this.getIndexed(i);
            }
        }
        : function* (this: any /* GArray */) {
            for (let i = 0; i < this.size(); ++i) {
                yield this.get_indexed(i);
            }
        };

    // We're not going to try expose the whole Array API, we'll just be super minimalistic. If the user is after
    // something more complex, it'll likely be more performant to spread the GArray into a JS array anyway.
    const array_api = {
        forEach: function (this: any /* GArrayProxy */, callback: (value: any, index: number) => void, thisArg?: any) {
            const target = this[ProxyTarget];
            let i = 0;
            for (const value of target) {
                callback.call(thisArg ?? this, proxy_wrap(value), i++);
            }
        },
        includes: function (this: any /* GArrayProxy */, value: any) {
            const target = this[ProxyTarget];
            return target.has(proxy_unwrap(value));
        },
        indexOf: function (this: any /* GArrayProxy */, value: any, fromIndex?: number) {
            const target = this[ProxyTarget];
            return target.find(proxy_unwrap(value), fromIndex);
        },
        pop: function (this: any /* GArrayProxy */) {
            const target = this[ProxyTarget];
            const pop = camel_case_bindings ? target.popBack : target.pop_back;
            const result = pop.call(target);
            return result == null ? result : proxy_wrap(result);
        },
        push: function (this: any /* GArrayProxy */, ...values: any[]) {
            const target = this[ProxyTarget];
            const push = camel_case_bindings ? target.pushBack : target.push_back;
            for (const value of values) {
                push.call(target, proxy_unwrap(value));
            }
            return target.size();
        },
        toJSON: function (this: any /* GArrayProxy */, key = ""): any {
            return [...this];
        },
        toString: function (this: any /* GArrayProxy */, index?: number): any {
            return [...this].map(v => v?.toString?.() ?? v).join(",");
        },
    } as const;

    const array_iterator = function* (this: any /* GArrayProxy */) {
        for (let i = 0; i < this.length; ++i) {
            yield this[i];
        }
    };

    const handler: ProxyHandler<any> = {
        get(target, p, receiver) {
            if (typeof p !== "string") {
                return p === ProxyTarget
                  ? target
                  : p === Symbol.iterator
                    ? array_iterator
                    : undefined;
            }

            const num = Number.parseInt(p);

            if (!Number.isFinite(num)) {
                if (p === 'length') {
                    return target.size();
                }

                return array_api[p as keyof typeof array_api];
            }

            if (num < 0 || num >= target.size()) {
                return undefined;
            }

            return proxy_wrap(target.get(num));
        },
        getOwnPropertyDescriptor(target, p) {
            if (typeof p !== "string") {
                return undefined;
            }

            const num = Number.parseInt(p);

            if (!(num >= 0) || num >= target.size()) {
                return undefined;
            }

            return {
                configurable: true,
                enumerable: true,
                value: proxy_wrap(target.get(num)),
                writable: true,
            };
        },
        has(target, p) {
            if (typeof p !== "string") {
                return p === Symbol.iterator;
            }

            const num = Number.parseInt(p);

            if (!(num >= 0)) {
                return p === 'length' || !!array_api[p as keyof typeof array_api];
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
            if (typeof p !== "string") {
                return false;
            }

            const num = Number.parseInt(p);

            if (!(num >= 0) || num >= target.size()) {
                return false;
            }

            target.set(num, proxy_unwrap(newValue));
            return true;
        },
        setPrototypeOf(target, v) {
            return false;
        },
    };

    type.prototype.proxy = function(this: any) {
        return new Proxy(this, handler);
    };

    type.create = function(values: any[]) {
        const arr = new type();
		const proxy = arr.proxy();
		proxy.push.apply(proxy, values);
        return arr;
    };
});

require("godot.typeloader").on_type_loaded("GDictionary", function (type: any) {
    const camel_case_bindings = require("godot-jsb").CAMEL_CASE_BINDINGS_ENABLED;

    proxyable_prototypes.push(type.prototype);

    type.prototype[Symbol.iterator] = camel_case_bindings
        ? function* (this: any) {
            let keys = this.keys();
            for (let i = 0; i < keys.size(); ++i) {
                const key = keys.getIndexed(i);
                yield { key: key, value: this.getKeyed(key) };
            }
        }
        : function* (this: any) {
            let keys = this.keys();
            for (let i = 0; i < keys.size(); ++i) {
                const key = keys.get_indexed(i);
                yield { key: key, value: this.get_keyed(key) };
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
            if (typeof p !== "string") {
                return p === ProxyTarget
                    ? target
                    : undefined;
            }

            const value = target.get(p);
            return value !== null
                ? proxy_wrap(value)
                : target.has(p)
                    ? value
                    : p === "toString"
                        ? Object.prototype.toString
                        : undefined;
        },
        getOwnPropertyDescriptor(target, p) {
            if (typeof p !== "string") {
                return undefined;
            }

            return {
                configurable: true,
                enumerable: true,
                value: proxy_wrap(target.get(p)),
                writable: true,
            };
        },
        has(target, p) {
            if (typeof p !== "string") {
                return false;
            }

            return target.has(p) || p === "toString";
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
            if (typeof p !== "string") {
                return false;
            }
            target.set(p, proxy_unwrap(newValue));
            return true;
        },
        setPrototypeOf(target, v) {
            return false;
        },
    };

    type.prototype.proxy = function(this: any) {
        return new Proxy(this, handler);
    };

    type.create = function(entries: any /*Record<string, any>*/) {
        const arr = new type();
        const proxy = arr.proxy();
        for (const [key, value] of Object.entries(entries)) {
            proxy[key] = value;
        }
        return arr;
    };
});

require("godot.typeloader").on_type_loaded("Callable", function (type: any) {
    const original_cc = type.create;
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
                return original_cc(arguments[0], arguments[1]);
            }
            return custom_cc(arguments[0], arguments[1]);
        }
        throw new Error("invalid arguments");
    }
});

require("godot.typeloader").on_type_loaded("Signal", function (type: any) {
    const camel_case_bindings = require("godot-jsb").CAMEL_CASE_BINDINGS_ENABLED;

    type.prototype[camel_case_bindings ? 'asPromise' : 'as_promise'] = function () {
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

(function() {
    const camel_case_bindings = require("godot-jsb").CAMEL_CASE_BINDINGS_ENABLED;
    const get_setting_with_override = camel_case_bindings ? 'getSettingWithOverride' : 'get_setting_with_override';
    const get_editor_settings = camel_case_bindings ? 'getEditorSettings' : 'get_editor_settings';

    Object.defineProperty(require("godot"), "GLOBAL_GET", {
        value: function (entry_path: string): any {
            return require("godot").ProjectSettings[get_setting_with_override](entry_path);
        }
    })

    Object.defineProperty(require("godot"), "EDITOR_GET", {
        value: function (entry_path: string): any {
            return require("godot").EditorInterface[get_editor_settings]().get(entry_path);
        }
    });
}());

console.debug("jsb.inject loaded successfully");
