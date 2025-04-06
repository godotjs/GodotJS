import type * as Godot from "godot";
import type * as GodotJsb from "godot-jsb";

const Proxied = Symbol("lib_api_proxied");

const { get_class, get_enum, get_enum_value, get_internal_mapping, get_member } = require("godot-jsb").internal.names;

function pascal_to_upper_snake_case(str: string) {
    return str.replace(/[a-z][A-Z]|[0-9][A-Z][a-z]/g, (m) => `${m[0]}_${m.slice(1)}`).toUpperCase();
}

function bind(target: any, value: any) {
    return typeof value === "function" ? value.bind(target) : value;
}

function is_basic_object(value: object) {
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || !proto;
}

function proxy_value(value: any) {
    if (value == null) {
        return value;
    }

    if (value[Proxied]) {
        return value;
    }

    if (typeof value === "function") {
        const proxied_function = function(this: any, ...args: any[]) {
            return proxy_value(value.apply(this, args.map(proxy_value)));
        };
        proxied_function[Proxied] = true;
        return proxied_function;
    }

    if (typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return array_proxy(value);
    }

    return is_basic_object(value) ? object_proxy(value) : instance_proxy(value);
}

const object_handler = {
    get(target, p, _receiver) {
        if (p === Proxied) {
            return true;
        }

        const value = Reflect.get(target, p);

        if (typeof p !== "string") {
            return value;
        }

        if (p[0]?.toUpperCase() === p[0]
          && value
          && typeof value === "object"
          && !Array.isArray(target)
          && is_basic_object(value)
          && !Object.entries(value).find(([k, v]) => k[0].toUpperCase() !== k[0] || typeof v !== "number")) {
            return enum_proxy(value);
        }

        return proxy_value(bind(target, value));
    },
} satisfies ProxyHandler<any>;


function array_proxy<T>(arr: T): T {
    return new Proxy(arr, object_handler);
}

function object_proxy<T>(obj: T): T {
    return new Proxy(obj, object_handler);
}

const instance_handler = {
    defineProperty() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    get(target, p, _receiver) {
        if (p === Proxied) {
            return true;
        }

        if (typeof p !== "string") {
            return Reflect.get(target, p);
        }

        return proxy_value(bind(target, Reflect.get(target, p !== "toString" ? get_member(p) : p)));
    },
    getOwnPropertyDescriptor(target, p) {
        return Reflect.getOwnPropertyDescriptor(target, typeof p === "string" ? get_member(p) : p);
    },
    has(target, p) {
        return Reflect.has(target, typeof p === "string" ? get_member(p) : p);
    },
    isExtensible() {
        return false;
    },
    ownKeys(target) {
        return Reflect.ownKeys(target).map(key => typeof key === "string" && get_internal_mapping(key) || key);
    },
    preventExtensions() {
        return true;
    },
    set(target, p, new_value, _receiver) {
        return Reflect.set(target, typeof p === "string" ? get_member(p) : p, new_value);
    },
    setPrototypeOf(_target) {
        return false;
    },
} satisfies ProxyHandler<any>;

function instance_proxy<T>(target_instance: T): T {
    return new Proxy(target_instance, instance_handler);
}

function proxied_constructor(this: (...args: any[]) => any, ...args: any[]) {
    return instance_proxy(this.apply(this, args));
}

const class_handler = {
    ...instance_handler,
    construct(target, args, _new_target) {
        return instance_proxy(new target(...args));
    },
    get(target, p, _receiver) {
        if (p === Proxied) {
            return true;
        }

        if (typeof p !== "string") {
            return Reflect.get(target, p);
        }

        if (p === "constructor") {
            return proxied_constructor;
        }

        if (p[0]?.toUpperCase() !== p[0]) {
            return proxy_value(bind(target, Reflect.get(target, get_member(p))));
        }

        if (p.toUpperCase() === p) {
            return proxy_value(bind(target, Reflect.get(target, p)));
        }

        return enum_proxy(Reflect.get(target, get_enum(p)));
    },
} satisfies ProxyHandler<any>;

function class_proxy<T>(target_class: T): T {
    return new Proxy(target_class, class_handler);
}

const enum_handler = {
    defineProperty() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    get(target, p, _receiver) {
        if (p === Proxied) {
            return true;
        }

        if (typeof p !== "string") {
            return Reflect.get(target, p);
        }

        return bind(target, Reflect.get(target, get_enum_value(p)));
    },
    getOwnPropertyDescriptor(target, p) {
        return Reflect.getOwnPropertyDescriptor(target, typeof p === "string" ? get_enum_value(p) : p);
    },
    has(target, p) {
        return Reflect.has(target, typeof p === "string" ? get_enum_value(p) : p);
    },
    isExtensible() {
        return false;
    },
    ownKeys(target) {
        return Reflect.ownKeys(target).map(key => typeof key === "string" ? pascal_to_upper_snake_case(key) : key);
    },
    preventExtensions() {
        return true;
    },
    set() {
        return false;
    },
    setPrototypeOf() {
        return false;
    },
} satisfies ProxyHandler<any>;

function enum_proxy<T>(target_enum: T): T {
    if (typeof target_enum !== "object") {
        return target_enum;
    }

    return new Proxy(target_enum, enum_handler);
}

const api_handler = (target: any) => ({
    defineProperty() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    get(_pseudo_target, p, _receiver) {
        if (p === Proxied) {
            return true;
        }

        if (p in _pseudo_target) {
            return _pseudo_target[p];
        }

        if (typeof p !== "string") {
            return Reflect.get(target, p);
        }

        if (p === "toString") {
            return proxy_value(bind(target, Reflect.get(target, p)));
        }

        // Special case, see jsb_godot_module_loader.cpp
        if (p === "Variant") {
            return object_proxy(Reflect.get(target, p))
        }

        if (p[0]?.toUpperCase() !== p[0]) {
            return proxy_value(bind(target, Reflect.get(target, get_member(p))));
        }

        const value = Reflect.get(target, get_class(p));

        if (typeof value === "function") {
            return class_proxy(value);
        }

        if (value == null || typeof value !== "object") {
            return value;
        }

        return is_basic_object(value) ? enum_proxy(value) : instance_proxy(value);
    },
    getOwnPropertyDescriptor(_pseudo_target, p) {
        if (p in _pseudo_target) {
            return Reflect.getOwnPropertyDescriptor(_pseudo_target, p);
        }

        return Reflect.getOwnPropertyDescriptor(target, typeof p === "string" ? get_member(p) : p);
    },
    has(_pseudo_target, p) {
        return Reflect.has(target, typeof p === "string" ? get_class(p) : p) || Reflect.has(_pseudo_target, p);
    },
    isExtensible() {
        return false;
    },
    ownKeys(_pseudo_target) {
        return Reflect.ownKeys(target)
            .map(key => typeof key === "string" && get_internal_mapping(key) || key)
            .concat(Reflect.ownKeys(_pseudo_target));
    },
    preventExtensions() {
        return true;
    },
    set(_pseudo_target, p, new_value, _receiver) {
        return Reflect.set(target, typeof p === "string" ? get_member(p) : p, new_value);
    },
    setPrototypeOf(_pseudo_target) {
        return false;
    },
} satisfies ProxyHandler<any>);

const godot_jsb = object_proxy(require("godot-jsb")) as typeof GodotJsb;
const api = new Proxy({ jsb: godot_jsb }, api_handler(require("godot"))) as typeof Godot & { jsb: typeof GodotJsb };

/**
 * This is a starting point for writing GodotJS code that is camel-case binding agnostic at runtime.
 *
 * Library code must consume this API rather than "godot", and be built with camel case bindings disabled. This is to
 * ensure that the library will function at runtime for all projects irrespective of whether they have camel-case
 * bindings enabled.
 */
export = api;
