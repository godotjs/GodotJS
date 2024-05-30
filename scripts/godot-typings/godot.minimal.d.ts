
declare namespace jsb {
    import { Callable as GDCallable, Object as GDObject, PropertyHint } from "godot";

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
     * If the given `self` is a godot Object and is still alive.
     */
    function is_instance_valid(self: GDObject): boolean;

    interface ScriptPropertyInfo {
        name: string;
        type: jsb.VariantType;
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

    enum VariantType {
        TYPE_NIL = 0,
        TYPE_BOOL = 1,
        TYPE_INT = 2,
        TYPE_FLOAT = 3,
        TYPE_STRING = 4,
        TYPE_VECTOR2 = 5,
        TYPE_VECTOR2I = 6,
        TYPE_RECT2 = 7,
        TYPE_RECT2I = 8,
        TYPE_VECTOR3 = 9,
        TYPE_VECTOR3I = 10,
        TYPE_TRANSFORM2D = 11,
        TYPE_VECTOR4 = 12,
        TYPE_VECTOR4I = 13,
        TYPE_PLANE = 14,
        TYPE_QUATERNION = 15,
        TYPE_AABB = 16,
        TYPE_BASIS = 17,
        TYPE_TRANSFORM3D = 18,
        TYPE_PROJECTION = 19,
        TYPE_COLOR = 20,
        TYPE_STRING_NAME = 21,
        TYPE_NODE_PATH = 22,
        TYPE_RID = 23,
        TYPE_OBJECT = 24,
        TYPE_CALLABLE = 25,
        TYPE_SIGNAL = 26,
        TYPE_DICTIONARY = 27,
        TYPE_ARRAY = 28,
        TYPE_PACKED_BYTE_ARRAY = 29,
        TYPE_PACKED_INT32_ARRAY = 30,
        TYPE_PACKED_INT64_ARRAY = 31,
        TYPE_PACKED_FLOAT32_ARRAY = 32,
        TYPE_PACKED_FLOAT64_ARRAY = 33,
        TYPE_PACKED_STRING_ARRAY = 34,
        TYPE_PACKED_VECTOR2_ARRAY = 35,
        TYPE_PACKED_VECTOR3_ARRAY = 36,
        TYPE_PACKED_COLOR_ARRAY = 37,
        TYPE_MAX = 38,
    };


    namespace editor {
        interface PrimitiveConstantInfo {
            name: string;
            type: VariantType;
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

        // COPIED FROM GODOT SOURCE CODE
        enum MethodFlags {
            METHOD_FLAG_NORMAL = 1,
            METHOD_FLAG_EDITOR = 2,
            METHOD_FLAG_CONST = 4,
            METHOD_FLAG_VIRTUAL = 8,
            METHOD_FLAG_VARARG = 16,
            METHOD_FLAG_STATIC = 32,
            METHOD_FLAG_OBJECT_CORE = 64,
            METHOD_FLAGS_DEFAULT = METHOD_FLAG_NORMAL,
        }

        // COPIED FROM GODOT SOURCE CODE
        enum PropertyUsageFlags {
            PROPERTY_USAGE_NONE = 0,
            PROPERTY_USAGE_STORAGE = 1 << 1,
            PROPERTY_USAGE_EDITOR = 1 << 2,
            PROPERTY_USAGE_INTERNAL = 1 << 3,
            PROPERTY_USAGE_CHECKABLE = 1 << 4, // Used for editing global variables.
            PROPERTY_USAGE_CHECKED = 1 << 5, // Used for editing global variables.
            PROPERTY_USAGE_GROUP = 1 << 6, // Used for grouping props in the editor.
            PROPERTY_USAGE_CATEGORY = 1 << 7,
            PROPERTY_USAGE_SUBGROUP = 1 << 8,
            PROPERTY_USAGE_CLASS_IS_BITFIELD = 1 << 9,
            PROPERTY_USAGE_NO_INSTANCE_STATE = 1 << 10,
            PROPERTY_USAGE_RESTART_IF_CHANGED = 1 << 11,
            PROPERTY_USAGE_SCRIPT_VARIABLE = 1 << 12,
            PROPERTY_USAGE_STORE_IF_NULL = 1 << 13,
            PROPERTY_USAGE_UPDATE_ALL_IF_MODIFIED = 1 << 14,
            PROPERTY_USAGE_SCRIPT_DEFAULT_VALUE = 1 << 15, // Deprecated.
            PROPERTY_USAGE_CLASS_IS_ENUM = 1 << 16,
            PROPERTY_USAGE_NIL_IS_VARIANT = 1 << 17,
            PROPERTY_USAGE_ARRAY = 1 << 18, // Used in the inspector to group properties as elements of an array.
            PROPERTY_USAGE_ALWAYS_DUPLICATE = 1 << 19, // When duplicating a resource, always duplicate, even with subresource duplication disabled.
            PROPERTY_USAGE_NEVER_DUPLICATE = 1 << 20, // When duplicating a resource, never duplicate, even with subresource duplication enabled.
            PROPERTY_USAGE_HIGH_END_GFX = 1 << 21,
            PROPERTY_USAGE_NODE_PATH_FROM_SCENE_ROOT = 1 << 22,
            PROPERTY_USAGE_RESOURCE_NOT_PERSISTENT = 1 << 23,
            PROPERTY_USAGE_KEYING_INCREMENTS = 1 << 24, // Used in inspector to increment property when keyed in animation player.
            PROPERTY_USAGE_DEFERRED_SET_RESOURCE = 1 << 25, // Deprecated.
            PROPERTY_USAGE_EDITOR_INSTANTIATE_OBJECT = 1 << 26, // For Object properties, instantiate them when creating in editor.
            PROPERTY_USAGE_EDITOR_BASIC_SETTING = 1 << 27, //for project or editor settings, show when basic settings are selected.
            PROPERTY_USAGE_READ_ONLY = 1 << 28, // Mark a property as read-only in the inspector.
            PROPERTY_USAGE_SECRET = 1 << 29, // Export preset credentials that should be stored separately from the rest of the export config.

            PROPERTY_USAGE_DEFAULT = PROPERTY_USAGE_STORAGE | PROPERTY_USAGE_EDITOR,
            PROPERTY_USAGE_NO_EDITOR = PROPERTY_USAGE_STORAGE,
        }

        interface DefaultArgumentInfo
        {
            type: jsb.VariantType;
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
            type: VariantType;
            class_name: string;
            hint: PropertyHint;
            hint_string: string;
            usage: PropertyUsageFlags;
        }

        interface PropertySetGetInfo {
            name: string;
            type: VariantType;
            setter: string;
            getter: string;
        }

        interface PrimitiveGetSetInfo {
            name: string;
            type: VariantType;
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
            type: VariantType;
        }

        interface ConstructorInfo {
            arguments: Array<ArgumentInfo>
        }

        interface OperatorInfo {
            name: string;
            return_type: VariantType;
            left_type: VariantType;
            right_type: VariantType;
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

