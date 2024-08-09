
declare module "godot-jsb" {
    import { Callable as GDCallable, Object as GDObject, PackedByteArray, PropertyUsageFlags, PropertyHint, MethodFlags, Variant, Callable0, Callable1, Callable4 } from "godot";

    const DEV_ENABLED: boolean;
    const TOOLS_ENABLED: boolean;

    const VERSION_MAJOR: number;
    const VERSION_MINOR: number;
    const VERSION_PATCH: number;

    /**
     * Create godot Callable with a bound object `self`
     */
    function callable(self: GDObject, fn: () => void): Callable0;
    function callable<T1>(self: GDObject, fn: (v1: T1) => void): Callable1<T1>;
    function callable<T1, T2>(self: GDObject, fn: (v1: T1, v2: T2) => void): Callable2<T1, T2>;
    function callable<T1, T2, T3>(self: GDObject, fn: (v1: T1, v2: T2, v3: T3) => void): Callable3<T1, T2, T3>;
    function callable<T1, T2, T3, T4>(self: GDObject, fn: (v1: T1, v2: T2, v3: T3, v4: T4) => void): Callable4<T1, T2, T3, T4>;
    function callable<T1, T2, T3, T4, T5>(self: GDObject, fn: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => void): Callable5<T1, T2, T3, T4, T5>;
    // function callable(self: GDObject, fn: Function): GDCallable;

    /**
     * Create godot Callable without a bound object
     */
    function callable(fn: ()=>void): Callable0;
    function callable<T1>(fn: (v1: T1) => void): Callable1<T1>;
    function callable<T1, T2>(fn: (v1: T1, v2: T2) => void): Callable2<T1, T2>;
    function callable<T1, T2, T3>(fn: (v1: T1, v2: T2, v3: T3) => void): Callable3<T1, T2, T3>;
    function callable<T1, T2, T3, T4>(fn: (v1: T1, v2: T2, v3: T3, v4: T4) => void): Callable4<T1, T2, T3, T4>;
    function callable<T1, T2, T3, T4, T5>(fn: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => void): Callable5<T1, T2, T3, T4, T5>;
    // function callable(fn: Function): GDCallable;

    /**
     * Explicitly convert a `PackedByteArray`(aka Vector<uint8_t>) into a javascript `ArrayBuffer`
     */
    function to_array_buffer(packed: PackedByteArray): ArrayBuffer;

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

        function add_script_signal(target: any, name: string): void;
        function add_script_property(target: any, details: ScriptPropertyInfo): void;
        function add_script_ready(target: any, details: { name: string, evaluator: string | OnReadyEvaluatorFunc }): void;
        function add_script_tool(target: any): void;
        function add_script_icon(target: any, path: string): void;

        function add_module(id: string, obj: any): void;
        function find_module(id: string): any;
        function notify_microtasks_run(): void;
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

            literals: Array<string>;
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

        interface PropertyInfo {
            name: string;
            type: Variant.Type;
            class_name: string;
            hint: PropertyHint;
            hint_string: string;
            usage: PropertyUsageFlags;
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

        interface ClassInfo extends BasicClassInfo {
            super: string;

            properties: Array<PropertySetGetInfo>;
            virtual_methods: Array<MethodBind>;
            signals: Array<SignalInfo>;
            constants?: Array<ConstantInfo>;
        }

        interface PrimitiveClassInfo extends BasicClassInfo {
            name: string;
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

