
declare namespace jsb {
    import { Callable as GDCallable, Object as GDObject, PropertyUsageFlags, PropertyHint, MethodFlags, Variant } from "godot";

    const DEV_ENABLED: boolean;
    const TOOLS_ENABLED: boolean;

    /**
     * Create godot Callable with a bound object `self`
     */
    function callable(self: GDObject, fn: Function): GDCallable;

    /**
     * Create godot Callable without a bound object
     */
    function callable(fn: Function): GDCallable;

    /**
     * If the given `self` is instance of `godot.Object` and is still alive.
     */
    function is_instance_valid(self: GDObject): boolean;

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
        function add_script_tool(target: any);
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

        interface DefaultArgumentInfo
        {
            type: Variant.Type;
            value: any;
        }

        interface MethodInfo {
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
            setter: string;
            getter: string;
        }

        interface PrimitiveGetSetInfo {
            name: string;
            type: Variant.Type;
        }

        interface SignalInfo {
            id: number;
            name: string;
            name_: string;
            flags: MethodFlags;
            // return_val: FieldInfo;
            // arguments: Array<FieldInfo>;
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

            // fields: Array<FieldInfo>;
            properties: Array<PropertySetGetInfo>;
            // virtual_methods: Array<MethodInfo>;
            signals: Array<SignalInfo>;
            constants?: Array<ConstantInfo>;
        }

        interface PrimitiveClassInfo extends BasicClassInfo {
            name: string;

            constructors: Array<ConstructorInfo>;
            operators: Array<OperatorInfo>;
            // fields: Array<FieldInfo>;
            properties: Array<PrimitiveGetSetInfo>;
            // virtual_methods: Array<MethodInfo>;
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

        /**
         * get a list of all classes registered in ClassDB
         */
        function get_classes(): Array<ClassInfo>;

        function get_primitive_types(): Array<PrimitiveClassInfo>;

        function get_singletons(): Array<SingletonInfo>;

        function get_global_constants(): Array<GlobalConstantInfo>;

        // SO FAR, NOT USED
        function get_utility_functions(): Array<MethodInfo>;

        function delete_file(filepath: string): void;
    }
}

