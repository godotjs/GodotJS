///<reference path="godot.generated.d.ts" />

declare module "godot-jsb" {
	import {
		Callable,
		MethodFlags,
		MultiplayerAPI,
		MultiplayerPeer,
		Object as GObject,
		PackedByteArray,
		PropertyInfo,
		Signal,
		StringName,
		Variant,
	} from "godot";

	const CAMEL_CASE_BINDINGS_ENABLED: boolean;

	const DEV_ENABLED: boolean;
	const TOOLS_ENABLED: boolean;

	/** version of GodotJS */
	const version: string;

	/** impl currently used */
	const impl: string;

	/**
	 * Create godot Callable without a bound object.
	 * @deprecated [WARNING] avoid using this function directly, use `Callable.create` instead.
	 */
	function callable<F extends Function>(fn: F): Callable<F>;

	/**
	 * Create godot Callable with a bound object `self`.
	 * @deprecated [WARNING] avoid using this function directly, use `Callable.create` instead.
	 */
	function callable<S extends GObject, F extends (this: S, ...args: any[]) => any>(self: S, fn: F): Callable<F>;

	/**
	 * Explicitly convert a `PackedByteArray`(aka `Vector<uint8_t>`) into a javascript `ArrayBuffer`
	 * @deprecated [WARNING] This free function '_to_array_buffer' is deprecated and will be removed in a future version, use 'PackedByteArray.to_array_buffer()' instead.
	 */
	function to_array_buffer(packed: PackedByteArray): ArrayBuffer;

	type AsyncModuleSourceLoaderResolveFunc = (source: string) => void;
	type AsyncModuleSourceLoaderRejectFunc = (error: string) => void;

	/**
	 * Set a callback function to handle the load of source code of asynchronous modules.
	 * Only use this function if it's not set in C++.
	 */
	function set_async_module_loader(
		fn: (
			module_id: string,
			resolve: AsyncModuleSourceLoaderResolveFunc,
			reject: AsyncModuleSourceLoaderRejectFunc,
		) => void,
	): void;

	interface MinimalCommonJSModule {
		exports: any;
		loaded: boolean;
		id: string;
	}

	/**
	 * Import a CommonJS module asynchronously.
	 *
	 * NOTE: Only the source code is loaded asynchronously, the module is still evaluated on the script thread.
	 * NOTE: Calling the $import() function without a async module loader set in advance will return undefined.
	 * @param module_id the module id to import
	 * @example
	 * ```js
	 *   // [init.js]
	 *   import * as jsb from "godot-jsb";
	 *   jsb.set_async_module_loader((id, resolve, reject) => {
	 *       console.log("[test] async module loader start", id);
	 *       // here should be the actual async loading of the module, HTTP request, etc.
	 *       // we just simulate it with a timeout
	 *       setTimeout(() => {
	 *           console.log("[test] async module loader resolve", id);
	 *           resolve("exports.foo = function () { console.log('hello, module imported'); }");
	 *       }, 3000);
	 *   });
	 *   // [somescript.js]
	 *   jsb.$import("http://localhost/async_loaded.js").then(mod => {
	 *       console.log("[test] async module loader", mod);
	 *       mod.exports.foo();
	 *   });
	 * ```
	 */
	function $import(module_id: string): Promise<MinimalCommonJSModule>;

	interface ScriptPropertyInfo {
		name: string;
		type: Variant.Type;
		class_?: Function;
		hint?: number;
		hint_string?: string;
		usage?: number;
		cache?: boolean;
	}

	export namespace internal {
		type OnReadyEvaluatorFunc = (self: any) => any;
		type GObjectConstructor = abstract new (...args: any[]) => GObject;

		function add_script_signal(prototype: GObject, name: string): void;
		function add_script_property(prototype: GObject, details: ScriptPropertyInfo): void;
		function add_script_ready(
			prototype: GObject,
			details: {
				name: string;
				evaluator: string | OnReadyEvaluatorFunc;
			},
		): void;
		function add_script_tool(constructor: GObjectConstructor): void;
		function add_script_icon(constructor: GObjectConstructor, path: string): void;
		function add_script_rpc(
			prototype: GObject,
			property_key: string,
			config: {
				rpc_mode?: MultiplayerAPI.RPCMode;
				call_local?: boolean;
				transfer_mode?: MultiplayerPeer.TransferMode;
				channel?: number;
			},
		): void;

		function create_script_signal_getter(name: string): (this: GObject) => Signal;
		function create_script_cached_property_updater(name: string): (this: GObject, value?: unknown) => void;

		// 0: deprecated, 1: experimental, 2: help
		function set_script_doc(
			target: GObjectConstructor,
			property_key: undefined,
			field: 0 | 1 | 2,
			message: string,
		): void;
		function set_script_doc(target: GObject, property_key: string, field: 0 | 1 | 2, message: string): void;

		function add_module(id: string, obj: any): void;
		function find_module(id: string): any;
		function notify_microtasks_run(): void;

		namespace names {
			/**
			 * Get the transformed name of a Godot class
			 */
			function get_class<T extends string>(godot_class: T): T;
			/**
			 * Get the transformed name of a Godot enum
			 */
			function get_enum<T extends string>(godot_enum: T): T;
			/**
			 * Get the transformed name of a Godot enum
			 */
			function get_enum_value<T extends string>(godot_enum_value: T): T;
			/**
			 * Get the transformed name of a Godot class member
			 */
			function get_member<T extends string>(godot_member: T): T;
			/**
			 * Get the internal Godot name/identifier from a transformed name i.e. the inverse of the other accessors.
			 */
			function get_internal_mapping(name: string): string;
			/**
			 * Get the transformed name of a Godot function parameter
			 */
			function get_parameter<T extends string>(parameter: T): T;
			/**
			 * Get the transformed type name of a Variant.Type
			 */
			function get_variant_type<T extends string>(type: Variant.Type): StringName;
		}
	}

	namespace editor {
		interface PrimitiveConstantInfo {
			name: string;
			type: Variant.Type;
			value: number /* only if type is literal */;
		}

		interface ConstantInfo {
			name: string;
			value: number /** int64_t */;
		}

		interface EnumInfo {
			name: string;
			literals: Record<string, number>;
			is_bitfield: boolean;
		}

		interface DefaultArgumentInfo {
			type: Variant.Type;
			value: any;
		}

		// we treat godot MethodInfo/MethodBind as the same thing here for simplicity
		//NOTE some fields will not be set if it's actually a MethodInfo struct
		interface MethodBind {
			internal_name: string;
			id: number;
			name: string;

			hint_flags: MethodFlags;
			is_static: boolean;
			is_const: boolean;
			is_vararg: boolean;
			argument_count: number /** int32_t */;

			args_: Array<PropertyInfo>;
			default_arguments?: Array<DefaultArgumentInfo>;
			return_: PropertyInfo | undefined;
		}

		interface PropertySetGetInfo {
			internal_name: string;
			name: string;

			type: Variant.Type;
			index: number;
			setter: string;
			getter: string;

			info: PropertyInfo;
		}

		interface PrimitiveGetSetInfo {
			name: string;
			type: Variant.Type;
		}

		interface SignalInfo {
			internal_name: string;
			name: string;
			method_: MethodBind;
		}

		interface ArgumentInfo {
			name: string;
			type: Variant.Type;
		}

		interface ConstructorInfo {
			arguments: Array<ArgumentInfo>;
		}

		interface OperatorInfo {
			name: string;
			return_type: Variant.Type;
			left_type: Variant.Type;
			right_type: Variant.Type;
		}

		interface BasicClassInfo {
			name: string;
			methods: Array<MethodBind>;
			enums?: Array<EnumInfo>;
		}

		// godot class
		interface ClassInfo extends BasicClassInfo {
			internal_name: string;
			super: string;

			properties: Array<PropertySetGetInfo>;
			virtual_methods: Array<MethodBind>;
			signals: Array<SignalInfo>;
			constants?: Array<ConstantInfo>;
		}

		// variant class
		interface PrimitiveClassInfo extends BasicClassInfo {
			// self type
			type: Variant.Type;

			// valid only if has_indexing
			element_type?: Variant.Type;

			// true only if is_keyed
			is_keyed: boolean;

			constructors?: Array<ConstructorInfo>;
			operators?: Array<OperatorInfo>;
			properties?: Array<PrimitiveGetSetInfo>;
			constants?: Array<PrimitiveConstantInfo>;
		}

		interface SingletonInfo {
			name: string;
			class_name: string;
			user_created: boolean;
			editor_only: boolean;
		}

		interface GlobalConstantInfo {
			name: string;
			values: { [name: string]: number /** int64_t */ };
		}

		interface ClassDoc {
			brief_description: string;

			constants: { [name: string]: { description: string } };
			methods: { [name: string]: { description: string } };
			properties: { [name: string]: { description: string } };
			signals: { [name: string]: { description: string } };
		}

		function get_class_doc(class_name: string): ClassDoc | undefined;

		/**
		 * get a list of all classes registered in ClassDB
		 */
		function get_classes(): Array<ClassInfo>;

		function get_primitive_types(): Array<PrimitiveClassInfo>;

		function get_singletons(): Array<SingletonInfo>;

		function get_global_constants(): Array<GlobalConstantInfo>;

		function get_utility_functions(): Array<MethodBind>;

		function get_input_actions(): Array<string>;

		function delete_file(filepath: string): void;

		const VERSION_DOCS_URL: string;
	}
}

// Globals

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console) */
interface Console {
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/assert_static) */
	assert(condition?: boolean, ...data: any[]): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/debug_static) */
	debug(...data: any[]): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/error_static) */
	error(...data: any[]): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/info_static) */
	info(...data: any[]): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/log_static) */
	log(...data: any[]): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/time_static) */
	time(label?: string): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeEnd_static) */
	timeEnd(label?: string): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/trace_static) */
	trace(...data: any[]): void;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/warn_static) */
	warn(...data: any[]): void;
}
declare const console: Console;

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/clearInterval) */
declare function clearInterval(id: number | undefined): void;
/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/clearTimeout) */
declare function clearTimeout(id: number | undefined): void;
/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/setInterval) */
declare function setInterval(handler: () => void, timeout?: number, ...arguments: any[]): number;
/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/setTimeout) */
declare function setTimeout(handler: () => void, timeout?: number, ...arguments: any[]): number;
