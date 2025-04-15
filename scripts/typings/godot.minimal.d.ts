///<reference path="godot.generated.d.ts" />
declare module "godot-jsb" {
    import {
        Callable,
        MethodFlags,
        MultiplayerAPI,
        MultiplayerPeer,
        Object as GDObject,
        PackedByteArray,
        PropertyInfo,
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
    function callable<S extends GDObject, F extends (this: S, ...args: any[]) => any>(self: S, fn: F): Callable<F>;

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
    function set_async_module_loader(fn: (module_id: string, resolve: AsyncModuleSourceLoaderResolveFunc, reject: AsyncModuleSourceLoaderRejectFunc) => void): void;

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
    }

    namespace internal {
        type OnReadyEvaluatorFunc = (self: any) => any;

        interface RPCConfig {
            mode?: MultiplayerAPI.RPCMode,
            sync?: boolean,
            transfer_mode?: MultiplayerPeer.TransferMode,
            transfer_channel?: number,
        }

        function add_script_signal(target: any, name: string): void;
        function add_script_property(target: any, details: ScriptPropertyInfo): void;
        function add_script_ready(target: any, details: { name: string, evaluator: string | OnReadyEvaluatorFunc }): void;
        function add_script_tool(target: any): void;
        function add_script_icon(target: any, path: string): void;
        function add_script_rpc(target: any, propertyKey: string, config: RPCConfig): void;

        // 0: deprecated, 1: experimental, 2: help
        function set_script_doc(target: any, propertyKey: undefined | string, field: 0 | 1 | 2, message: string): void;

        function add_module(id: string, obj: any): void;
        function find_module(id: string): any;
        function notify_microtasks_run(): void;

        /**
         * Get the transformed type name of a Variant.Type
         */
        function get_type_name(type: Variant.Type): StringName;
    }

    namespace editor {
        interface PrimitiveConstantInfo {
            name: string;
            type: Variant.Type;
            value: number; /* only if type is literal */
        }

        interface ConstantInfo {
            name: string;
            value: number; /** int64_t */
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
            id: number;
            name: string;

            hint_flags: MethodFlags;
            is_static: boolean;
            is_const: boolean;
            is_vararg: boolean;
            argument_count: number; /** int32_t */

            args_: Array<PropertyInfo>;
            default_arguments?: Array<DefaultArgumentInfo>;
            return_: PropertyInfo | undefined;
        }

        interface PropertySetGetInfo {
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
            name: string;
            method_: MethodBind;
        }

        interface ArgumentInfo {
            name: string;
            type: Variant.Type;
        }

        interface ConstructorInfo {
            arguments: Array<ArgumentInfo>
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

            constructors: Array<ConstructorInfo>;
            operators: Array<OperatorInfo>;
            properties: Array<PrimitiveGetSetInfo>;
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

        function delete_file(filepath: string): void;

        const VERSION_DOCS_URL: string;
    }
}

