import type * as Godot from "godot";
import type * as GodotJsb from "godot-jsb";

const godot_api: typeof Godot = require("godot");
const jsb_api: typeof GodotJsb = require("godot-jsb");

const ProxyTarget: typeof godot_api.ProxyTarget = godot_api.ProxyTarget;
const { get_class, get_enum, get_enum_value, get_internal_mapping, get_member } = jsb_api.internal.names;

function pascal_to_upper_snake_case(str: string) {
	return str.replace(/[a-z][A-Z]|[0-9][A-Z][a-z]/g, (m) => `${m[0]}_${m.slice(1)}`).toUpperCase();
}

function is_basic_object(value: object) {
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || !proto;
}

function proxy_unwrap_value<T>(value: T): T {
	return (value as any)?.[ProxyTarget] ?? value;
}

function proxy_wrap_value<T>(value: T): T;
function proxy_wrap_value(value: any): any {
	if (value == null) {
		return value;
	}

	if ((value as any)[ProxyTarget]) {
		return value;
	}

	if (typeof value === "function") {
		return function_proxy(value);
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
		if (p === ProxyTarget) {
			return target;
		}

		const value = Reflect.get(target, p);
		const descriptor = Object.getOwnPropertyDescriptor(target, p);

		if (typeof p !== "string" || (descriptor && !descriptor.writable && !descriptor.configurable)) {
			return value;
		}

		if (
			p[0]?.toUpperCase() === p[0] &&
			value &&
			typeof value === "object" &&
			is_basic_object(value) &&
			!Object.entries(value).find(([k, v]) => k[0].toUpperCase() !== k[0] || typeof v !== "number")
		) {
			return enum_proxy(value);
		}

		return proxy_wrap_value(value);
	},
	getOwnPropertyDescriptor(target, p) {
		return (
			Reflect.getOwnPropertyDescriptor(target, typeof p === "string" ? get_member(p) : p) ??
			Reflect.getOwnPropertyDescriptor(target, p)
		);
	},
	has(target, p) {
		return Reflect.has(target, typeof p === "string" ? get_member(p) : p) || Reflect.has(target, p);
	},
	ownKeys(target) {
		return Reflect.ownKeys(target).map((key) => (typeof key === "string" && get_internal_mapping(key)) || key);
	},
	set(target, p, new_value, _receiver) {
		return Reflect.set(target, typeof p === "string" ? get_member(p) : p, new_value);
	},
} satisfies ProxyHandler<any>;

const object_properties_handler = {
	...object_handler,
	get(target, p, _receiver) {
		if (p === ProxyTarget) {
			return target;
		}

		const descriptor = Object.getOwnPropertyDescriptor(target, p);

		if (typeof p !== "string" || (descriptor && !descriptor.writable && !descriptor.configurable)) {
			return Reflect.get(target, p);
		}

		const value = Reflect.get(target, p !== "toString" ? get_member(p) : p);

		if (
			p[0]?.toUpperCase() === p[0] &&
			value &&
			typeof value === "object" &&
			is_basic_object(value) &&
			!Object.entries(value).find(([k, v]) => k[0].toUpperCase() !== k[0] || typeof v !== "number")
		) {
			return enum_proxy(value);
		}

		return proxy_wrap_value(value);
	},
} satisfies ProxyHandler<any>;

function array_proxy<T extends any[]>(arr: T): T {
	return new Proxy(arr, object_handler);
}

function object_proxy<T extends object>(obj: T, remap_properties?: boolean): T {
	return new Proxy(obj, remap_properties ? object_properties_handler : object_handler);
}

const key_only_handler = {
	apply: function (target, this_arg, args) {
		return target.apply(this_arg?.[ProxyTarget] ?? this_arg, args);
	},
	get(target, p, _receiver) {
		if (p === ProxyTarget) {
			return target;
		}

		const descriptor = Object.getOwnPropertyDescriptor(target, p);

		if (typeof p !== "string" || (descriptor && !descriptor.writable && !descriptor.configurable)) {
			return Reflect.get(target, p);
		}

		return key_only_proxy(Reflect.get(target, p !== "toString" ? get_member(p) : p));
	},
} satisfies ProxyHandler<any>;

function key_only_proxy<T extends object | ((...args: any[]) => any)>(target: T) {
	return new Proxy(target, key_only_handler);
}

const instance_handler = {
	defineProperty() {
		return false;
	},
	deleteProperty() {
		return false;
	},
	get(target, p, _receiver) {
		if (p === ProxyTarget) {
			return target;
		}

		if (typeof p !== "string" || p === "constructor") {
			return Reflect.get(target, p);
		}

		return proxy_wrap_value(Reflect.get(target, p !== "toString" ? get_member(p) : p));
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
		return Reflect.ownKeys(target).map((key) => (typeof key === "string" && get_internal_mapping(key)) || key);
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

function instance_proxy<T extends object>(target_instance: T): T {
	return new Proxy(target_instance, instance_handler);
}

const class_handler = {
	...instance_handler,
	construct(target, args, _new_target) {
		return instance_proxy(new target(...args));
	},
	get(target, p, _receiver) {
		if (p === ProxyTarget) {
			return target;
		}

		if (p === Symbol.hasInstance) {
			return Function[Symbol.hasInstance].bind(target);
		}

		if (typeof p !== "string") {
			return Reflect.get(target, p);
		}

		const descriptor = Object.getOwnPropertyDescriptor(target, p);

		if (descriptor && !descriptor.writable && !descriptor.configurable) {
			return Reflect.get(target, p);
		}

		if (p === "prototype") {
			const proto = Reflect.get(target, "prototype");
			return proto && class_proxy(proto);
		}

		if (p[0]?.toUpperCase() !== p[0]) {
			return proxy_wrap_value(Reflect.get(target, get_member(p)));
		}

		if (p.toUpperCase() === p) {
			return proxy_wrap_value(Reflect.get(target, p));
		}

		return enum_proxy(Reflect.get(target, get_enum(p)));
	},
} satisfies ProxyHandler<any>;

function class_proxy<T extends object>(target_class: T): T {
	return new Proxy(target_class, class_handler);
}

const function_handler = {
	...class_handler,
	apply: function (target, this_arg, args) {
		return proxy_wrap_value(target.apply(this_arg?.[ProxyTarget] ?? this_arg, args.map(proxy_wrap_value)));
	},
} satisfies ProxyHandler<any>;

function function_proxy<T extends (...args: any[]) => any>(fn: T): T {
	return new Proxy(fn, function_handler);
}

const enum_handler = {
	defineProperty() {
		return false;
	},
	deleteProperty() {
		return false;
	},
	get(target, p, _receiver) {
		if (p === ProxyTarget) {
			return target;
		}

		if (typeof p !== "string") {
			return Reflect.get(target, p);
		}

		return Reflect.get(target, get_enum_value(p));
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
		return Reflect.ownKeys(target).map((key) => (typeof key === "string" ? pascal_to_upper_snake_case(key) : key));
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

function enum_proxy<T extends object>(target_enum: T): T {
	if (typeof target_enum !== "object") {
		return target_enum;
	}

	return new Proxy(target_enum, enum_handler);
}

const api_handler = (target: any) =>
	({
		defineProperty() {
			return false;
		},
		deleteProperty() {
			return false;
		},
		get(_pseudo_target, p, _receiver) {
			if (p === ProxyTarget) {
				return target;
			}

			if (p in _pseudo_target) {
				return _pseudo_target[p];
			}

			if (typeof p !== "string") {
				return Reflect.get(target, p);
			}

			if (p === "toString") {
				return proxy_wrap_value(Reflect.get(target, p));
			}

			// Special case, see jsb_godot_module_loader.cpp
			if (p === "Variant") {
				return object_proxy(Reflect.get(target, p));
			}

			if (p[0]?.toUpperCase() !== p[0]) {
				return proxy_wrap_value(Reflect.get(target, get_member(p)));
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
				.map((key) => (typeof key === "string" && get_internal_mapping(key)) || key)
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
	}) satisfies ProxyHandler<any>;

const proxy = {
	array_proxy,
	class_proxy,
	enum_proxy,
	function_proxy,
	instance_proxy,
	key_only_proxy,
	object_proxy,
	proxy_unwrap_value,
	proxy_wrap_value,
};

type GodotLibApi = typeof Godot & {
	jsb: typeof GodotJsb;
	proxy: typeof proxy;
};

const jsb = object_proxy(jsb_api) as typeof GodotJsb;
const api = new Proxy(
	{
		jsb,
		proxy,
	},
	api_handler(godot_api),
) as GodotLibApi;

/**
 * This is a starting point for writing GodotJS code that is camel-case binding agnostic at runtime.
 *
 * Library code must consume this API rather than "godot", and be built with camel case bindings disabled. This is to
 * ensure that the library will function at runtime for all projects irrespective of whether they have camel-case
 * bindings enabled.
 */
export = api;
