// THIS FILE IS ONLY A PLACEHOLDER FOR COMPILING THE PREMADE TYPESCRIPT SOURCES IN THE GODOTJS MODULE IN-PLACE WITHOUT ERRORS.
// godot.xxx.d.ts files will be generated in a target project.

declare module "godot" {
    class Node { }
    class GArray { 
        get_indexed(index: number): any
        size(): number
    }
    class GDictionary { 
        get_keyed(index: any): any
        keys(): GArray
    }
    type StringName = string;

    class EditorSettings { get(path: StringName): any; }
    class EditorInterface { static get_editor_settings(): EditorSettings; }
    class ProjectSettings { static get_setting_with_override(path: StringName): any; }

    class OS {
        static get_name(): string
        static create_process(path: string, arguments_: PackedStringArray | string[], open_console: boolean = false): int64
    }

    // singleton
    namespace Engine { function get_time_scale(): number; }

    class PackedByteArray { }

    class PackedStringArray { append(value: string): boolean }

    namespace FileAccess {
        enum ModeFlags {
            READ = 1,
            WRITE = 2,
            READ_WRITE = 3,
            WRITE_READ = 7,
        }
    }

    class FileAccess {

        static open(path: string, flags: number);
        static file_exists(path: string): boolean;

        store_line(str: string);
        get_position(): number;
        flush(): void;
        close() : void;
    }
    
    enum PropertyHint {
        PROPERTY_HINT_NONE = 0,
        PROPERTY_HINT_RANGE = 1,
        PROPERTY_HINT_ENUM = 2,
        PROPERTY_HINT_ENUM_SUGGESTION = 3,
        PROPERTY_HINT_EXP_EASING = 4,
        PROPERTY_HINT_LINK = 5,
        PROPERTY_HINT_FLAGS = 6,
        PROPERTY_HINT_LAYERS_2D_RENDER = 7,
        PROPERTY_HINT_LAYERS_2D_PHYSICS = 8,
        PROPERTY_HINT_LAYERS_2D_NAVIGATION = 9,
        PROPERTY_HINT_LAYERS_3D_RENDER = 10,
        PROPERTY_HINT_LAYERS_3D_PHYSICS = 11,
        PROPERTY_HINT_LAYERS_3D_NAVIGATION = 12,
        PROPERTY_HINT_LAYERS_AVOIDANCE = 37,
        PROPERTY_HINT_FILE = 13,
        PROPERTY_HINT_DIR = 14,
        PROPERTY_HINT_GLOBAL_FILE = 15,
        PROPERTY_HINT_GLOBAL_DIR = 16,
        PROPERTY_HINT_RESOURCE_TYPE = 17,
        PROPERTY_HINT_MULTILINE_TEXT = 18,
        PROPERTY_HINT_EXPRESSION = 19,
        PROPERTY_HINT_PLACEHOLDER_TEXT = 20,
        PROPERTY_HINT_COLOR_NO_ALPHA = 21,
        PROPERTY_HINT_OBJECT_ID = 22,
        PROPERTY_HINT_TYPE_STRING = 23,
        PROPERTY_HINT_NODE_PATH_TO_EDITED_NODE = 24,
        PROPERTY_HINT_OBJECT_TOO_BIG = 25,
        PROPERTY_HINT_NODE_PATH_VALID_TYPES = 26,
        PROPERTY_HINT_SAVE_FILE = 27,
        PROPERTY_HINT_GLOBAL_SAVE_FILE = 28,
        PROPERTY_HINT_INT_IS_OBJECTID = 29,
        PROPERTY_HINT_INT_IS_POINTER = 30,
        PROPERTY_HINT_ARRAY_TYPE = 31,
        PROPERTY_HINT_LOCALE_ID = 32,
        PROPERTY_HINT_LOCALIZABLE_STRING = 33,
        PROPERTY_HINT_NODE_TYPE = 34,
        PROPERTY_HINT_HIDE_QUATERNION_EDIT = 35,
        PROPERTY_HINT_PASSWORD = 36,
        PROPERTY_HINT_MAX = 38,
    }
    enum MethodFlags {
        /** Flag for a normal method. */
        METHOD_FLAG_NORMAL = 1,
        
        /** Flag for an editor method. */
        METHOD_FLAG_EDITOR = 2,
        
        /** Flag for a constant method. */
        METHOD_FLAG_CONST = 4,
        
        /** Flag for a virtual method. */
        METHOD_FLAG_VIRTUAL = 8,
        
        /** Flag for a method with a variable number of arguments. */
        METHOD_FLAG_VARARG = 16,
        
        /** Flag for a static method. */
        METHOD_FLAG_STATIC = 32,
        
        /** Used internally. Allows to not dump core virtual methods (such as [method Object._notification]) to the JSON API. */
        METHOD_FLAG_OBJECT_CORE = 64,
        
        /** Default method flags (normal). */
        METHOD_FLAGS_DEFAULT = 1,
    }
    enum PropertyUsageFlags {
        /** The property is not stored, and does not display in the editor. This is the default for non-exported properties. */
        PROPERTY_USAGE_NONE = 0,
        
        /** The property is serialized and saved in the scene file (default). */
        PROPERTY_USAGE_STORAGE = 2,
        
        /** The property is shown in the [EditorInspector] (default). */
        PROPERTY_USAGE_EDITOR = 4,
        
        /** The property is excluded from the class reference. */
        PROPERTY_USAGE_INTERNAL = 8,
        
        /** The property can be checked in the [EditorInspector]. */
        PROPERTY_USAGE_CHECKABLE = 16,
        
        /** The property is checked in the [EditorInspector]. */
        PROPERTY_USAGE_CHECKED = 32,
        
        /** Used to group properties together in the editor. See [EditorInspector]. */
        PROPERTY_USAGE_GROUP = 64,
        
        /** Used to categorize properties together in the editor. */
        PROPERTY_USAGE_CATEGORY = 128,
        
        /** Used to group properties together in the editor in a subgroup (under a group). See [EditorInspector]. */
        PROPERTY_USAGE_SUBGROUP = 256,
        
        /** The property is a bitfield, i.e. it contains multiple flags represented as bits. */
        PROPERTY_USAGE_CLASS_IS_BITFIELD = 512,
        
        /** The property does not save its state in [PackedScene]. */
        PROPERTY_USAGE_NO_INSTANCE_STATE = 1024,
        
        /** Editing the property prompts the user for restarting the editor. */
        PROPERTY_USAGE_RESTART_IF_CHANGED = 2048,
        
        /** The property is a script variable which should be serialized and saved in the scene file. */
        PROPERTY_USAGE_SCRIPT_VARIABLE = 4096,
        
        /** The property value of type [Object] will be stored even if its value is `null`. */
        PROPERTY_USAGE_STORE_IF_NULL = 8192,
        
        /** If this property is modified, all inspector fields will be refreshed. */
        PROPERTY_USAGE_UPDATE_ALL_IF_MODIFIED = 16384,
        
        /** Signifies a default value from a placeholder script instance.  
         *   *Deprecated.*  This hint is not used anywhere and will be removed in the future.  
         */
        PROPERTY_USAGE_SCRIPT_DEFAULT_VALUE = 32768,
        
        /** The property is an enum, i.e. it only takes named integer constants from its associated enumeration. */
        PROPERTY_USAGE_CLASS_IS_ENUM = 65536,
        
        /** If property has `nil` as default value, its type will be [Variant]. */
        PROPERTY_USAGE_NIL_IS_VARIANT = 131072,
        
        /** The property is an array. */
        PROPERTY_USAGE_ARRAY = 262144,
        
        /** When duplicating a resource with [method Resource.duplicate], and this flag is set on a property of that resource, the property should always be duplicated, regardless of the `subresources` bool parameter. */
        PROPERTY_USAGE_ALWAYS_DUPLICATE = 524288,
        
        /** When duplicating a resource with [method Resource.duplicate], and this flag is set on a property of that resource, the property should never be duplicated, regardless of the `subresources` bool parameter. */
        PROPERTY_USAGE_NEVER_DUPLICATE = 1048576,
        
        /** The property is only shown in the editor if modern renderers are supported (the Compatibility rendering method is excluded). */
        PROPERTY_USAGE_HIGH_END_GFX = 2097152,
        
        /** The [NodePath] property will always be relative to the scene's root. Mostly useful for local resources. */
        PROPERTY_USAGE_NODE_PATH_FROM_SCENE_ROOT = 4194304,
        
        /** Use when a resource is created on the fly, i.e. the getter will always return a different instance. [ResourceSaver] needs this information to properly save such resources. */
        PROPERTY_USAGE_RESOURCE_NOT_PERSISTENT = 8388608,
        
        /** Inserting an animation key frame of this property will automatically increment the value, allowing to easily keyframe multiple values in a row. */
        PROPERTY_USAGE_KEYING_INCREMENTS = 16777216,
        
        /** When loading, the resource for this property can be set at the end of loading.  
         *   *Deprecated.*  This hint is not used anywhere and will be removed in the future.  
         */
        PROPERTY_USAGE_DEFERRED_SET_RESOURCE = 33554432,
        
        /** When this property is a [Resource] and base object is a [Node], a resource instance will be automatically created whenever the node is created in the editor. */
        PROPERTY_USAGE_EDITOR_INSTANTIATE_OBJECT = 67108864,
        
        /** The property is considered a basic setting and will appear even when advanced mode is disabled. Used for project settings. */
        PROPERTY_USAGE_EDITOR_BASIC_SETTING = 134217728,
        
        /** The property is read-only in the [EditorInspector]. */
        PROPERTY_USAGE_READ_ONLY = 268435456,
        
        /** An export preset property with this flag contains confidential information and is stored separately from the rest of the export preset configuration. */
        PROPERTY_USAGE_SECRET = 536870912,
        
        /** Default usage (storage and editor). */
        PROPERTY_USAGE_DEFAULT = 6,
        
        /** Default usage but without showing the property in the editor (storage). */
        PROPERTY_USAGE_NO_EDITOR = 2,
    }
    namespace Variant {
        enum Type {
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
        }
    }
    namespace Variant {
        enum Operator {
            OP_EQUAL = 0,
            OP_NOT_EQUAL = 1,
            OP_LESS = 2,
            OP_LESS_EQUAL = 3,
            OP_GREATER = 4,
            OP_GREATER_EQUAL = 5,
            OP_ADD = 6,
            OP_SUBTRACT = 7,
            OP_MULTIPLY = 8,
            OP_DIVIDE = 9,
            OP_NEGATE = 10,
            OP_POSITIVE = 11,
            OP_MODULE = 12,
            OP_POWER = 13,
            OP_SHIFT_LEFT = 14,
            OP_SHIFT_RIGHT = 15,
            OP_BIT_AND = 16,
            OP_BIT_OR = 17,
            OP_BIT_XOR = 18,
            OP_BIT_NEGATE = 19,
            OP_AND = 20,
            OP_OR = 21,
            OP_XOR = 22,
            OP_NOT = 23,
            OP_IN = 24,
            OP_MAX = 25,
        }
    }

    static function type_string(type: int64): string;
    static function str(o: any): string;
}
