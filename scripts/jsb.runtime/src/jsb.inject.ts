import type * as Godot from "godot";
import type * as GodotJsb from "godot-jsb";

type GArrayProxy<T extends Godot.GAny> = Godot.GArrayProxy<T> & {
	[Godot.ProxyTarget]: Godot.GArray<T>;
};

type GDictionaryProxy<T> = Godot.GDictionaryProxy<T> & {
	[Godot.ProxyTarget]: Godot.GDictionary<T>;
};

interface ProxyHelpers {
	get_member: typeof GodotJsb.internal.names.get_member;
	godot_wrap: (value: any) => any;
	proxy_unwrap: (value: any) => any;
	proxy_wrap: (value: any) => any;
	ProxyTarget: typeof Godot.ProxyTarget;
}

const proxyable_prototypes: any[] = [];

let helpers: null | ProxyHelpers = null;

function get_helpers(): ProxyHelpers {
	if (!helpers) {
		const { GArray, GDictionary, ProxyTarget } = require("godot") as typeof Godot;
		const get_member = (require("godot-jsb") as typeof GodotJsb).internal.names.get_member;

		helpers = {
			get_member,
			proxy_wrap: function (value: any) {
				if (typeof value !== "object" || value === null) {
					return value;
				}

				const proto = Object.getPrototypeOf(value);
				return proto && proxyable_prototypes.includes(proto) ? value.proxy() : value;
			},
			proxy_unwrap: function (value: any) {
				if (typeof value !== "object" || value === null) {
					return value;
				}

				return value[ProxyTarget] ?? value;
			},
			godot_wrap: function (value: any) {
				if (typeof value !== "object" || value === null) {
					return value;
				}

				if (Array.isArray(value)) {
					return GArray.create<any>(value);
				}

				const proto = Object.getPrototypeOf(value);

				if (proto === Object.prototype || proto === null) {
					return GDictionary.create(value);
				}

				return value;
			},
			ProxyTarget: ProxyTarget as ProxyHelpers["ProxyTarget"],
		};
	}

	return helpers;
}

require("godot.typeloader").on_type_loaded("GArray", function (type: any) {
	const helpers = get_helpers();
	const { get_member, godot_wrap, proxy_unwrap, proxy_wrap } = helpers;
	const ProxyTarget: ProxyHelpers["ProxyTarget"] = helpers.ProxyTarget;

	proxyable_prototypes.push(type.prototype);

	type.prototype[Symbol.iterator] = function* (this: Godot.GArray) {
		const get_indexed = Reflect.get(this, get_member("get_indexed"));
		for (let i = 0; i < this.size(); ++i) {
			yield get_indexed.call(this, i);
		}
	};

	// We're not going to try expose the whole Array API, we'll just be super minimalistic. If the user is after
	// something more complex, it'll likely be more performant to spread the GArray into a JS array anyway.
	const pop_back_name = get_member("pop_back");
	const push_back_name = get_member("push_back");
	const array_api = {
		forEach: function (this: GArrayProxy<any>, callback: (value: any, index: number) => void, thisArg?: any) {
			const target = this[ProxyTarget];
			let i = 0;
			for (const value of target) {
				callback.call(thisArg ?? this, proxy_wrap(value), i++);
			}
		},
		includes: function (this: GArrayProxy<any>, value: any) {
			const target = this[ProxyTarget];
			return target.has(proxy_unwrap(value));
		},
		indexOf: function (this: GArrayProxy<any>, value: any, fromIndex?: number) {
			const target = this[ProxyTarget];
			return target.find(proxy_unwrap(value), fromIndex);
		},
		pop: function (this: GArrayProxy<any>) {
			const target = this[ProxyTarget];
			const result = Reflect.get(target, pop_back_name)();
			return result == null ? result : proxy_wrap(result);
		},
		push: function (this: GArrayProxy<any>, ...values: any[]) {
			const target = this[ProxyTarget];
			const push = Reflect.get(target, push_back_name);
			for (const value of values) {
				push.call(target, proxy_unwrap(value));
			}
			return target.size();
		},
		toJSON: function (this: GArrayProxy<any>, key = ""): any {
			return [...this];
		},
		toString: function (this: GArrayProxy<any>, index?: number): any {
			return [...this].map((v) => v?.toString?.() ?? v).join(",");
		},
	} as const;

	const array_iterator = function* (this: any /* GArrayProxy */) {
		for (let i = 0; i < this.length; ++i) {
			yield this[i];
		}
	};

	const handler: ProxyHandler<Godot.GArray> = {
		get(target, p, receiver) {
			if (typeof p !== "string") {
				return p === ProxyTarget ? target : p === Symbol.iterator ? array_iterator : undefined;
			}

			const num = Number.parseInt(p);

			if (!Number.isFinite(num)) {
				if (p === "length") {
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
				return p === "length" || !!array_api[p as keyof typeof array_api];
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

	type.prototype.proxy = function (this: any) {
		return new Proxy(this, handler);
	};

	type.create = function (values: any[]) {
		const arr = new type();
		const proxy = arr.proxy();
		proxy.push.apply(proxy, values.map(godot_wrap));
		return arr;
	};
});

require("godot.typeloader").on_type_loaded("GDictionary", function (type: any) {
	const helpers = get_helpers();
	const { get_member, godot_wrap, proxy_unwrap, proxy_wrap } = helpers;
	const ProxyTarget: ProxyHelpers["ProxyTarget"] = helpers.ProxyTarget;

	proxyable_prototypes.push(type.prototype);

	type.prototype[Symbol.iterator] = function* (this: Godot.GDictionary) {
		const keys = this.keys();
		const arr_get_indexed = keys[get_member("get_indexed")];
		const dict_get_keyed = this[get_member("get_keyed")];
		for (let i = 0; i < keys.size(); ++i) {
			const key = arr_get_indexed.call(keys, i);
			yield { key: key, value: dict_get_keyed.call(this, key) };
		}
	};

	const handler: ProxyHandler<Godot.GDictionary> = {
		defineProperty(target, property, attributes) {
			return false;
		},
		deleteProperty(target, p) {
			target.erase(p);
			return true;
		},
		get(target, p, receiver) {
			if (typeof p !== "string") {
				return p === ProxyTarget ? target : undefined;
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

	type.prototype.proxy = function (this: any) {
		return new Proxy(this, handler);
	};

	type.create = function (entries: Record<string, any>) {
		const dict = new type();
		const proxy = dict.proxy();
		for (const [key, value] of Object.entries(entries)) {
			proxy[key] = godot_wrap(value);
		}
		return dict;
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
	};
});

require("godot.typeloader").on_type_loaded("Signal", function (type: any) {
	let { jsb, Callable, Object } = require("godot.lib.api");
	const get_member = jsb.internal.names.get_member;
	const notify_microtasks_run = jsb.internal.notify_microtasks_run;

	type.prototype[get_member("as_promise")] = function () {
		let self = this;
		return new Promise(function (resolve, reject) {
			let fn = Callable.create(function () {
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
				notify_microtasks_run();
			});
			self.connect(fn, Object.ConnectFlags.CONNECT_ONE_SHOT);
			self = undefined;
		});
	};
});

(function () {
	Object.defineProperty(require("godot"), "GLOBAL_GET", {
		value: function (entry_path: string): any {
			return require("godot.lib.api").ProjectSettings.get_setting_with_override(entry_path);
		},
	});

	Object.defineProperty(require("godot"), "EDITOR_GET", {
		value: function (entry_path: string): any {
			return require("godot.lib.api").EditorInterface.get_editor_settings().get(entry_path);
		},
	});
})();

console.debug("jsb.inject loaded successfully");
