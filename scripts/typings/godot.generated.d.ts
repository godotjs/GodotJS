// THIS FILE IS ONLY A PLACEHOLDER FOR COMPILING THE PREMADE TYPESCRIPT SOURCES IN THE GODOTJS MODULE IN-PLACE WITHOUT ERRORS.
// godot.xxx.d.ts files will be generated in a target project.

///<reference path="godot.mix.d.ts" />

import GodotJsb from "godot-jsb";

declare module "godot" {
    import { TypeDescriptor } from "jsb.editor.codegen";

    class Node<Map extends Record<string, Node> = any> extends Object {}
    class Resource {}
    class Script extends Resource {}
    interface ResourceTypes {}

    type GArrayCreateSource<T> =
        | ReadonlyArray<T>
        | {
              [Symbol.iterator](): IteratorObject<GDataStructureCreateValue<T>>;
              [K: number]: GDataStructureCreateValue<T>;
          };

    type GDataStructureCreateValue<V> =
        | V
        | (V extends GArray<infer T>
              ? [T] extends [any[]]
                  ? GArrayCreateSource<{ [I in keyof T]: GDataStructureCreateValue<T[I]> }>
                  : GArrayCreateSource<GDataStructureCreateValue<T>>
              : V extends GDictionary<infer T>
                ? { [K in keyof T]: GDataStructureCreateValue<T[K]> }
                : never);

    class GDictionary<T = Record<any, any>> {
        static create<V extends { [key: number | string]: GWrappableValue }>(properties: V): GValueWrap<V>;
        static create<V extends GDictionary<any>>(
            properties: V extends GDictionary<infer T> ? { [K in keyof T]: GDataStructureCreateValue<T[K]> } : never,
        ): V;
        proxy<Write extends boolean = false>(): Write extends true ? GDictionaryProxy<T> : GDictionaryReadProxy<T>;
        get<K extends keyof T>(key: K, default_: any = <any>{}): T[K];
        get_keyed<K extends keyof T>(index: K): T[K];
        set<K extends keyof T>(key: K, value: T[K]): boolean;
        keys(): GArray<keyof T>;
        erase(key: keyof T): boolean;
        has(key: keyof T): boolean;
    }
    class GArray<T extends GAny | GAny[] = GAny | GAny[]> {
        static create<A extends any[]>(elements: A): GValueWrap<A>;
        static create<A extends GArray<any>>(
            elements: A extends GArray<infer T>
                ? [T] extends [any[]]
                    ? { [I in keyof T]: GDataStructureCreateValue<T[I]> }
                    : Array<GDataStructureCreateValue<T>>
                : never,
        ): GValueWrap<A>;
        static create<E extends GAny>(elements: Array<GDataStructureCreateValue<E>>): GArray<E>;
        [Symbol.iterator](): IteratorObject<GArrayElement<T>>;
        proxy<Write extends boolean = false>(): Write extends true
            ? GArrayProxy<GArrayElement<T>>
            : GArrayReadProxy<GArrayElement<T>>;
        get_indexed<I extends int64>(index: I): GArrayElement<T, I>;
        get<I extends int64>(index: I): GArrayElement<T, I>;
        set<I extends int64>(index: I, value: GArrayElement<T, I>): void;
        size(): number;
        push_back(value: GArrayElement<T>): void;
        pop_back(): GArrayElement<T>;
        has(value: GArrayElement<T>): boolean;
        find(what: GArrayElement<T>, from: int64 = 0): int64;
    }
    type byte = number;
    type int32 = number;
    type uint32 = number;
    type int64 = number; /* || bigint */
    type float32 = number;
    type float64 = number;
    type StringName = string;

    type GAny =
        | undefined
        | null
        | boolean
        | int64
        | float64
        | string
        | Callable
        | Object
        | Signal
        | GDictionary
        | GArray
        | PackedByteArray
        | PackedStringArray;

    class EditorSettings {
        get(path: StringName): any;
    }
    class EditorInterface {
        static get_editor_settings(): EditorSettings;
    }
    class ProjectSettings {
        static get_setting_with_override(path: StringName): any;
    }

    class OS {
        static get_name(): string;
        static create_process(path: string, arguments_: PackedStringArray | string[], open_console?: boolean): int64;
    }

    // singleton
    namespace Engine {
        function get_time_scale(): number;
    }

    namespace MultiplayerAPI {
        enum RPCMode {
            /** Used with [method Node.rpc_config] to disable a method or property for all RPC calls, making it unavailable. Default for all methods. */
            RPC_MODE_DISABLED = 0,

            /** Used with [method Node.rpc_config] to set a method to be callable remotely by any peer. Analogous to the `@rpc("any_peer")` annotation. Calls are accepted from all remote peers, no matter if they are node's authority or not. */
            RPC_MODE_ANY_PEER = 1,

            /** Used with [method Node.rpc_config] to set a method to be callable remotely only by the current multiplayer authority (which is the server by default). Analogous to the `@rpc("authority")` annotation. See [method Node.set_multiplayer_authority]. */
            RPC_MODE_AUTHORITY = 2,
        }
    }

    namespace MultiplayerPeer {
        enum ConnectionStatus {
            /** The MultiplayerPeer is disconnected. */
            CONNECTION_DISCONNECTED = 0,

            /** The MultiplayerPeer is currently connecting to a server. */
            CONNECTION_CONNECTING = 1,

            /** This MultiplayerPeer is connected. */
            CONNECTION_CONNECTED = 2,
        }
        enum TransferMode {
            /** Packets are not acknowledged, no resend attempts are made for lost packets. Packets may arrive in any order. Potentially faster than [constant TRANSFER_MODE_UNRELIABLE_ORDERED]. Use for non-critical data, and always consider whether the order matters. */
            TRANSFER_MODE_UNRELIABLE = 0,

            /** Packets are not acknowledged, no resend attempts are made for lost packets. Packets are received in the order they were sent in. Potentially faster than [constant TRANSFER_MODE_RELIABLE]. Use for non-critical data or data that would be outdated if received late due to resend attempt(s) anyway, for example movement and positional data. */
            TRANSFER_MODE_UNRELIABLE_ORDERED = 1,

            /** Packets must be received and resend attempts should be made until the packets are acknowledged. Packets must be received in the order they were sent in. Most reliable transfer mode, but potentially the slowest due to the overhead. Use for critical data that must be transmitted and arrive in order, for example an ability being triggered or a chat message. Consider carefully if the information really is critical, and use sparingly. */
            TRANSFER_MODE_RELIABLE = 2,
        }
    }

    class PackedByteArray {
        toArrayBuffer(): ArrayBuffer;
        get(index: int64): int64;
        set(index: int64, value: int64): void;
    }

    class PackedStringArray {
        append(value: string): boolean;
    }

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
        store_string(string_: string): boolean;
        get_position(): number;
        flush(): void;
        close(): void;
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
        PROPERTY_HINT_LAYERS_AVOIDANCE = 37,
        PROPERTY_HINT_DICTIONARY_TYPE = 38,
        PROPERTY_HINT_TOOL_BUTTON = 39,
        PROPERTY_HINT_ONESHOT = 40,
        PROPERTY_HINT_NO_NODEPATH = 41,
        PROPERTY_HINT_GROUP_ENABLE = 42,
        PROPERTY_HINT_INPUT_NAME = 43,
        PROPERTY_HINT_FILE_PATH = 44,
        PROPERTY_HINT_MAX = 45,
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

    class Callable<T extends Function = Function> {
        /**
         * Create godot Callable without a bound object.
         */
        static create<F extends Function>(fn: F): Callable<F>;
        /**
         * Create godot Callable with a bound object `self`.
         */
        static create<S extends Object, F extends (this: S, ...args: any[]) => any>(self: S, fn: F): Callable<F>;
        is_null(): boolean;
        is_custom(): boolean;
        is_standard(): boolean;
        is_valid(): boolean;
        get_object();
        get_object_id(): int64;
        get_method(): StringName;
        get_bound_arguments_count(): int64;
        get_bound_arguments();
        hash(): int64;
        bind(...vargargs: any[]): AnyCallable;
        bindv(arguments_: GArray): AnyCallable;
        unbind(argcount: int64): AnyCallable;
        call: T;
        callv(arguments_: GArray);
        call_deferred(...vargargs: any[]): void;
        static create(variant: any, method: StringName): AnyCallable;
    }
    ``;

    /**
     * GArray elements are exposed with a subset of JavaScript's standard Array API. Array indexes are exposed as
     * enumerable properties, thus if you want to perform more complex operations you can convert to a regular
     * JavaScript array with [...g_array.proxy()].
     */
    class GArrayProxy<T> {
        [Symbol.iterator](): IteratorObject<GProxyValueWrap<T>>;
        /**
         * Gets the length of the array. This is a number one higher than the highest index in the array.
         */
        get length(): number;
        /**
         * Performs the specified action for each element in an array.
         * @param callback A function that accepts up to three arguments. forEach calls the callback function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callback function. If thisArg is omitted, undefined is used as the this value.
         */
        forEach<S = GArrayProxy<T>>(
            callback: (this: GArrayProxy<T>, value: GProxyValueWrap<T>, index: number) => void,
            thisArg?: S,
        ): void;
        /**
         * Removes the last element from an array and returns it.
         * If the array is empty, undefined is returned and the array is not modified.
         */
        pop(): T | undefined;
        /**
         * Appends new elements to the end of an array, and returns the new length of the array.
         * @param items New elements to add to the array.
         */
        push(...items: Array<T | GProxyValueWrap<T>>): number;
        /**
         * Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
         * @param searchElement The value to locate in the array.
         * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
         */
        indexOf(searchElement: T, fromIndex?: number): number;
        /**
         * Determines whether an array includes a certain element, returning true or false as appropriate.
         * @param searchElement The element to search for.
         */
        includes(searchElement: T): boolean;
        toJSON(key?: any): any;
        toString(): string;
        [n: number]: T | GProxyValueWrap<T>; // More accurate get type blocked by https://github.com/microsoft/TypeScript/issues/43826
    }

    // Ideally this would be a class, but TS currently doesn't provide a way to type a class with mapped properties.
    /**
     * GObject entries are exposed as enumerable properties, so Object.keys(), Object.entries() etc. will work.
     */
    type GDictionaryProxy<T> = {
        [K in keyof T]: T[K] | GProxyValueWrap<T[K]>; // More accurate get type blocked by https://github.com/microsoft/TypeScript/issues/43826
    };

    type GProxyValueWrap<V> =
        V extends GArray<infer E> ? GArrayProxy<E> : V extends GDictionary<infer T> ? GDictionaryProxy<T> : V;

    /**
     * Semi-workaround for https://github.com/microsoft/TypeScript/issues/43826.
     * @see GReadProxyValueWrap
     */
    type GArrayReadProxy<T> = Omit<GArrayProxy<T>, "forEach"> & {
        [Symbol.iterator](): IteratorObject<GReadProxyValueWrap<T>>;
        forEach<S = GArrayReadProxy<T>>(
            callback: (this: GArrayReadProxy<T>, value: GReadProxyValueWrap<T>, index: number) => void,
            thisArg?: S,
        ): void;
        [n: number]: GReadProxyValueWrap<T>;
    };

    /**
     * Semi-workaround for https://github.com/microsoft/TypeScript/issues/43826.
     * @see GReadProxyValueWrap
     */
    type GDictionaryReadProxy<T> = {
        [K in keyof T]: GReadProxyValueWrap<T[K]>;
    };

    // At runtime we only have the one kind of dictionary proxy and one kind of array proxy. The read interfaces have
    // indexers typed correctly for access i.e. return proxied types. The non-read interfaces have indexers accurate for
    // assignment and will accept both GArray/GDictionary and proxies. The read interfaces exist for convenience only,
    // you can safely cast between the two interfaces types as desired.
    type GReadProxyValueWrap<V> =
        V extends GArray<infer E> ? GArrayReadProxy<E> : V extends GDictionary<infer T> ? GDictionaryReadProxy<T> : V;

    class Signal<T extends (...args: any[]) => void = (...args: any[]) => void> {
        constructor();
        constructor(from: Signal);
        constructor(object: Object, signal: StringName);
        isNull(): boolean;
        getObject(): Object;
        getObjectId(): int64;
        getName(): StringName;

        /** Connects this signal to the specified [param callable]. Optional [param flags] can be also added to configure the connection's behavior (see [enum Object.ConnectFlags] constants). You can provide additional arguments to the connected [param callable] by using [method Callable.bind].
         *  A signal can only be connected once to the same [Callable]. If the signal is already connected, returns [constant ERR_INVALID_PARAMETER] and pushes an error message, unless the signal is connected with [constant Object.CONNECT_REFERENCE_COUNTED]. To prevent this, use [method is_connected] first to check for existing connections.
         *
         */
        connect(callable: Callable<T>, flags: int64 = 0): int64;

        /** Disconnects this signal from the specified [Callable]. If the connection does not exist, generates an error. Use [method is_connected] to make sure that the connection exists. */
        disconnect(callable: Callable<T>): void;
        isConnected(callable: Callable<T>): boolean;
        getConnections(): GArray;
        hasConnections(): boolean;

        /** Emits this signal. All [Callable]s connected to this signal will be triggered. This method supports a variable number of arguments, so parameters can be passed as a comma separated list. */
        emit: T;
        static EQUAL(left: Signal, right: Signal): boolean;
        static NOT_EQUAL(left: Signal, right: Signal): boolean;
    }

    function type_string(type: int64): string;
    function str(o: any): string;

    class NodePath {}

    class Object {
        /** Notification received when the object is initialized, before its script is attached. Used internally. */
        static readonly NOTIFICATION_POSTINITIALIZE = 0;

        /** Notification received when the object is about to be deleted. Can be used like destructors in object-oriented programming languages. */
        static readonly NOTIFICATION_PREDELETE = 1;

        /** Notification received when the object finishes hot reloading. This notification is only sent for extensions classes and derived. */
        static readonly NOTIFICATION_EXTENSION_RELOADED = 2;
        constructor(identifier?: any);

        /** Deletes the object from memory. Pre-existing references to the object become invalid, and any attempt to access them will result in a run-time error. Checking the references with [method @GlobalScope.is_instance_valid] will return `false`. */
        /* gdvirtual */ free(): void;

        /** Called when the object's script is instantiated, oftentimes after the object is initialized in memory (through `Object.new()` in GDScript, or `new GodotObject` in C#). It can be also defined to take in parameters. This method is similar to a constructor in most programming languages.
         *
         *  **Note:** If [method _init] is defined with  *required*  parameters, the Object with script may only be created directly. If any other means (such as [method PackedScene.instantiate] or [method Node.duplicate]) are used, the script's initialization will fail.
         */
        /* gdvirtual */ _init(): void;

        /** Override this method to customize the return value of [method to_string], and therefore the object's representation as a [String].
         *
         */
        /* gdvirtual */ _to_string(): string;

        /** Called when the object receives a notification, which can be identified in [param what] by comparing it with a constant. See also [method notification].
         *
         *
         *  **Note:** The base [Object] defines a few notifications ([constant NOTIFICATION_POSTINITIALIZE] and [constant NOTIFICATION_PREDELETE]). Inheriting classes such as [Node] define a lot more notifications, which are also received by this method.
         */
        /* gdvirtual */ _notification(what: int64): void;

        /** Override this method to customize the behavior of [method set]. Should set the [param property] to [param value] and return `true`, or `false` if the [param property] should be handled normally. The  *exact*  way to set the [param property] is up to this method's implementation.
         *  Combined with [method _get] and [method _get_property_list], this method allows defining custom properties, which is particularly useful for editor plugins. Note that a property  *must*  be present in [method get_property_list], otherwise this method will not be called.
         *
         */
        /* gdvirtual */ _set(property: StringName, value: any): boolean;

        /** Override this method to customize the behavior of [method get]. Should return the given [param property]'s value, or `null` if the [param property] should be handled normally.
         *  Combined with [method _set] and [method _get_property_list], this method allows defining custom properties, which is particularly useful for editor plugins. Note that a property must be present in [method get_property_list], otherwise this method will not be called.
         *
         */
        /* gdvirtual */ _get(property: StringName): any;

        /** Override this method to provide a custom list of additional properties to handle by the engine.
         *  Should return a property list, as an [Array] of dictionaries. The result is added to the array of [method get_property_list], and should be formatted in the same way. Each [Dictionary] must at least contain the `name` and `type` entries.
         *  You can use [method _property_can_revert] and [method _property_get_revert] to customize the default values of the properties added by this method.
         *  The example below displays a list of numbers shown as words going from `ZERO` to `FIVE`, with `number_count` controlling the size of the list:
         *
         *
         *  **Note:** This method is intended for advanced purposes. For most common use cases, the scripting languages offer easier ways to handle properties. See [annotation @GDScript.@export], [annotation @GDScript.@export_enum], [annotation @GDScript.@export_group], etc. If you want to customize exported properties, use [method _validate_property].
         *
         *  **Note:** If the object's script is not [annotation @GDScript.@tool], this method will not be called in the editor.
         */
        /* gdvirtual */ _get_property_list(): GArray;

        /** Override this method to customize existing properties. Every property info goes through this method, except properties added with [method _get_property_list]. The dictionary contents is the same as in [method _get_property_list].
         *
         */
        /* gdvirtual */ _validate_property(property: GDictionary): void;

        /** Override this method to customize the given [param property]'s revert behavior. Should return `true` if the [param property] has a custom default value and is revertible in the Inspector dock. Use [method _property_get_revert] to specify the [param property]'s default value.
         *
         *  **Note:** This method must return consistently, regardless of the current value of the [param property].
         */
        /* gdvirtual */ _property_can_revert(property: StringName): boolean;

        /** Override this method to customize the given [param property]'s revert behavior. Should return the default value for the [param property]. If the default value differs from the [param property]'s current value, a revert icon is displayed in the Inspector dock.
         *
         *  **Note:** [method _property_can_revert] must also be overridden for this method to be called.
         */
        /* gdvirtual */ _property_get_revert(property: StringName): any;

        /** Initializes the iterator. [param iter] stores the iteration state. Since GDScript does not support passing arguments by reference, a single-element array is used as a wrapper. Returns `true` so long as the iterator has not reached the end.
         *  Example:
         *
         *
         *  **Note:** Alternatively, you can ignore [param iter] and use the object's state instead, see [url=https://docs.godotengine.org/en/latest/tutorials/scripting/gdscript/gdscript_advanced.html#custom-iterators]online docs[/url] for an example. Note that in this case you will not be able to reuse the same iterator instance in nested loops. Also, make sure you reset the iterator state in this method if you want to reuse the same instance multiple times.
         */
        /* gdvirtual */ _iter_init(iter: GArray): boolean;

        /** Moves the iterator to the next iteration. [param iter] stores the iteration state. Since GDScript does not support passing arguments by reference, a single-element array is used as a wrapper. Returns `true` so long as the iterator has not reached the end. */
        /* gdvirtual */ _iter_next(iter: GArray): boolean;

        /** Returns the current iterable value. [param iter] stores the iteration state, but unlike [method _iter_init] and [method _iter_next] the state is supposed to be read-only, so there is no [Array] wrapper. */
        /* gdvirtual */ _iter_get(iter: any): any;

        /** Returns the object's built-in class name, as a [String]. See also [method is_class].
         *
         *  **Note:** This method ignores `class_name` declarations. If this object's script has defined a `class_name`, the base, built-in class name is returned instead.
         */
        get_class(): string;

        /** Returns `true` if the object inherits from the given [param class]. See also [method get_class].
         *
         *
         *  **Note:** This method ignores `class_name` declarations in the object's script.
         */
        is_class(class_: string): boolean;

        /** Assigns [param value] to the given [param property]. If the property does not exist or the given [param value]'s type doesn't match, nothing happens.
         *
         *
         *  **Note:** In C#, [param property] must be in snake_case when referring to built-in Godot properties. Prefer using the names exposed in the `PropertyName` class to avoid allocating a new [StringName] on each call.
         */
        set(property: StringName, value: any): void;

        /** Returns the [Variant] value of the given [param property]. If the [param property] does not exist, this method returns `null`.
         *
         *
         *  **Note:** In C#, [param property] must be in snake_case when referring to built-in Godot properties. Prefer using the names exposed in the `PropertyName` class to avoid allocating a new [StringName] on each call.
         */
        get(property: StringName): any;

        /** Assigns a new [param value] to the property identified by the [param property_path]. The path should be a [NodePath] relative to this object, and can use the colon character (`:`) to access nested properties.
         *
         *
         *  **Note:** In C#, [param property_path] must be in snake_case when referring to built-in Godot properties. Prefer using the names exposed in the `PropertyName` class to avoid allocating a new [StringName] on each call.
         */
        set_indexed(property_path: NodePath | string, value: any): void;

        /** Gets the object's property indexed by the given [param property_path]. The path should be a [NodePath] relative to the current object and can use the colon character (`:`) to access nested properties.
         *  **Examples:** `"position:x"` or `"material:next_pass:blend_mode"`.
         *
         *
         *  **Note:** In C#, [param property_path] must be in snake_case when referring to built-in Godot properties. Prefer using the names exposed in the `PropertyName` class to avoid allocating a new [StringName] on each call.
         *
         *  **Note:** This method does not support actual paths to nodes in the [SceneTree], only sub-property paths. In the context of nodes, use [method Node.get_node_and_resource] instead.
         */
        get_indexed(property_path: NodePath | string): any;

        /** Returns the object's property list as an [Array] of dictionaries. Each [Dictionary] contains the following entries:
         *  - `name` is the property's name, as a [String];
         *  - `class_name` is an empty [StringName], unless the property is [constant TYPE_OBJECT] and it inherits from a class;
         *  - `type` is the property's type, as an [int] (see [enum Variant.Type]);
         *  - `hint` is  *how*  the property is meant to be edited (see [enum PropertyHint]);
         *  - `hint_string` depends on the hint (see [enum PropertyHint]);
         *  - `usage` is a combination of [enum PropertyUsageFlags].
         *
         *  **Note:** In GDScript, all class members are treated as properties. In C# and GDExtension, it may be necessary to explicitly mark class members as Godot properties using decorators or attributes.
         */
        get_property_list(): GArray;

        /** Returns this object's methods and their signatures as an [Array] of dictionaries. Each [Dictionary] contains the following entries:
         *  - `name` is the name of the method, as a [String];
         *  - `args` is an [Array] of dictionaries representing the arguments;
         *  - `default_args` is the default arguments as an [Array] of variants;
         *  - `flags` is a combination of [enum MethodFlags];
         *  - `id` is the method's internal identifier [int];
         *  - `return` is the returned value, as a [Dictionary];
         *
         *  **Note:** The dictionaries of `args` and `return` are formatted identically to the results of [method get_property_list], although not all entries are used.
         */
        get_method_list(): GArray;

        /** Returns `true` if the given [param property] has a custom default value. Use [method property_get_revert] to get the [param property]'s default value.
         *
         *  **Note:** This method is used by the Inspector dock to display a revert icon. The object must implement [method _property_can_revert] to customize the default value. If [method _property_can_revert] is not implemented, this method returns `false`.
         */
        property_can_revert(property: StringName): boolean;

        /** Returns the custom default value of the given [param property]. Use [method property_can_revert] to check if the [param property] has a custom default value.
         *
         *  **Note:** This method is used by the Inspector dock to display a revert icon. The object must implement [method _property_get_revert] to customize the default value. If [method _property_get_revert] is not implemented, this method returns `null`.
         */
        property_get_revert(property: StringName): any;

        /** Sends the given [param what] notification to all classes inherited by the object, triggering calls to [method _notification], starting from the highest ancestor (the [Object] class) and going down to the object's script.
         *  If [param reversed] is `true`, the call order is reversed.
         *
         */
        notification(what: int64, reversed?: boolean): void;

        /** Returns a [String] representing the object. Defaults to `"<ClassName#RID>"`. Override [method _to_string] to customize the string representation of the object. */
        to_string(): string;

        /** Returns the object's unique instance ID. This ID can be saved in [EncodedObjectAsID], and can be used to retrieve this object instance with [method @GlobalScope.instance_from_id].
         *
         *  **Note:** This ID is only useful during the current session. It won't correspond to a similar object if the ID is sent over a network, or loaded from a file at a later time.
         */
        get_instance_id(): int64;

        /** Attaches [param script] to the object, and instantiates it. As a result, the script's [method _init] is called. A [Script] is used to extend the object's functionality.
         *  If a script already exists, its instance is detached, and its property values and state are lost. Built-in property values are still kept.
         */
        set_script(script: any): void;

        /** Returns the object's [Script] instance, or `null` if no script is attached. */
        get_script(): any;

        /** Adds or changes the entry [param name] inside the object's metadata. The metadata [param value] can be any [Variant], although some types cannot be serialized correctly.
         *  If [param value] is `null`, the entry is removed. This is the equivalent of using [method remove_meta]. See also [method has_meta] and [method get_meta].
         *
         *  **Note:** A metadata's name must be a valid identifier as per [method StringName.is_valid_identifier] method.
         *
         *  **Note:** Metadata that has a name starting with an underscore (`_`) is considered editor-only. Editor-only metadata is not displayed in the Inspector and should not be edited, although it can still be found by this method.
         */
        set_meta(name: StringName, value: any): void;

        /** Removes the given entry [param name] from the object's metadata. See also [method has_meta], [method get_meta] and [method set_meta].
         *
         *  **Note:** A metadata's name must be a valid identifier as per [method StringName.is_valid_identifier] method.
         *
         *  **Note:** Metadata that has a name starting with an underscore (`_`) is considered editor-only. Editor-only metadata is not displayed in the Inspector and should not be edited, although it can still be found by this method.
         */
        remove_meta(name: StringName): void;

        /** Returns the object's metadata value for the given entry [param name]. If the entry does not exist, returns [param default]. If [param default] is `null`, an error is also generated.
         *
         *  **Note:** A metadata's name must be a valid identifier as per [method StringName.is_valid_identifier] method.
         *
         *  **Note:** Metadata that has a name starting with an underscore (`_`) is considered editor-only. Editor-only metadata is not displayed in the Inspector and should not be edited, although it can still be found by this method.
         */
        get_meta(name: StringName, default_?: any): any;

        /** Returns `true` if a metadata entry is found with the given [param name]. See also [method get_meta], [method set_meta] and [method remove_meta].
         *
         *  **Note:** A metadata's name must be a valid identifier as per [method StringName.is_valid_identifier] method.
         *
         *  **Note:** Metadata that has a name starting with an underscore (`_`) is considered editor-only. Editor-only metadata is not displayed in the Inspector and should not be edited, although it can still be found by this method.
         */
        has_meta(name: StringName): boolean;

        /** Returns the object's metadata entry names as an [Array] of [StringName]s. */
        get_meta_list(): GArray;

        /** Adds a user-defined signal named [param signal]. Optional arguments for the signal can be added as an [Array] of dictionaries, each defining a `name` [String] and a `type` [int] (see [enum Variant.Type]). See also [method has_user_signal] and [method remove_user_signal].
         *
         */
        add_user_signal(signal: string, arguments_?: GArray): void;

        /** Returns `true` if the given user-defined [param signal] name exists. Only signals added with [method add_user_signal] are included. See also [method remove_user_signal]. */
        has_user_signal(signal: StringName): boolean;

        /** Removes the given user signal [param signal] from the object. See also [method add_user_signal] and [method has_user_signal]. */
        remove_user_signal(signal: StringName): void;

        /** Emits the given [param signal] by name. The signal must exist, so it should be a built-in signal of this class or one of its inherited classes, or a user-defined signal (see [method add_user_signal]). This method supports a variable number of arguments, so parameters can be passed as a comma separated list.
         *  Returns [constant ERR_UNAVAILABLE] if [param signal] does not exist or the parameters are invalid.
         *
         *
         *  **Note:** In C#, [param signal] must be in snake_case when referring to built-in Godot signals. Prefer using the names exposed in the `SignalName` class to avoid allocating a new [StringName] on each call.
         */
        emit_signal(signal: StringName, ...vargargs: any[]): Error;

        /** Calls the [param method] on the object and returns the result. This method supports a variable number of arguments, so parameters can be passed as a comma separated list.
         *
         *
         *  **Note:** In C#, [param method] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `MethodName` class to avoid allocating a new [StringName] on each call.
         */
        call(method: StringName, ...vargargs: any[]): any;

        /** Calls the [param method] on the object during idle time. Always returns `null`, **not** the method's result.
         *  Idle time happens mainly at the end of process and physics frames. In it, deferred calls will be run until there are none left, which means you can defer calls from other deferred calls and they'll still be run in the current idle time cycle. This means you should not call a method deferred from itself (or from a method called by it), as this causes infinite recursion the same way as if you had called the method directly.
         *  This method supports a variable number of arguments, so parameters can be passed as a comma separated list.
         *
         *  See also [method Callable.call_deferred].
         *
         *  **Note:** In C#, [param method] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `MethodName` class to avoid allocating a new [StringName] on each call.
         *
         *  **Note:** If you're looking to delay the function call by a frame, refer to the [signal SceneTree.process_frame] and [signal SceneTree.physics_frame] signals.
         *
         */
        call_deferred(method: StringName, ...vargargs: any[]): any;

        /** Assigns [param value] to the given [param property], at the end of the current frame. This is equivalent to calling [method set] through [method call_deferred].
         *
         *
         *  **Note:** In C#, [param property] must be in snake_case when referring to built-in Godot properties. Prefer using the names exposed in the `PropertyName` class to avoid allocating a new [StringName] on each call.
         */
        set_deferred(property: StringName, value: any): void;

        /** Calls the [param method] on the object and returns the result. Unlike [method call], this method expects all parameters to be contained inside [param arg_array].
         *
         *
         *  **Note:** In C#, [param method] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `MethodName` class to avoid allocating a new [StringName] on each call.
         */
        callv(method: StringName, arg_array: GArray): any;

        /** Returns `true` if the given [param method] name exists in the object.
         *
         *  **Note:** In C#, [param method] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `MethodName` class to avoid allocating a new [StringName] on each call.
         */
        has_method(method: StringName): boolean;

        /** Returns the number of arguments of the given [param method] by name.
         *
         *  **Note:** In C#, [param method] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `MethodName` class to avoid allocating a new [StringName] on each call.
         */
        get_method_argument_count(method: StringName): int64;

        /** Returns `true` if the given [param signal] name exists in the object.
         *
         *  **Note:** In C#, [param signal] must be in snake_case when referring to built-in Godot signals. Prefer using the names exposed in the `SignalName` class to avoid allocating a new [StringName] on each call.
         */
        has_signal(signal: StringName): boolean;

        /** Returns the list of existing signals as an [Array] of dictionaries.
         *
         *  **Note:** Due of the implementation, each [Dictionary] is formatted very similarly to the returned values of [method get_method_list].
         */
        get_signal_list(): GArray;

        /** Returns an [Array] of connections for the given [param signal] name. Each connection is represented as a [Dictionary] that contains three entries:
         *  - [code skip-lint]signal` is a reference to the [Signal];
         *  - `callable` is a reference to the connected [Callable];
         *  - `flags` is a combination of [enum ConnectFlags].
         */
        get_signal_connection_list(signal: StringName): GArray;

        /** Returns an [Array] of signal connections received by this object. Each connection is represented as a [Dictionary] that contains three entries:
         *  - `signal` is a reference to the [Signal];
         *  - `callable` is a reference to the [Callable];
         *  - `flags` is a combination of [enum ConnectFlags].
         */
        get_incoming_connections(): GArray;

        /** Connects a [param signal] by name to a [param callable]. Optional [param flags] can be also added to configure the connection's behavior (see [enum ConnectFlags] constants).
         *  A signal can only be connected once to the same [Callable]. If the signal is already connected, this method returns [constant ERR_INVALID_PARAMETER] and pushes an error message, unless the signal is connected with [constant CONNECT_REFERENCE_COUNTED]. To prevent this, use [method is_connected] first to check for existing connections.
         *  If the [param callable]'s object is freed, the connection will be lost.
         *  **Examples with recommended syntax:**
         *  Connecting signals is one of the most common operations in Godot and the API gives many options to do so, which are described further down. The code block below shows the recommended approach.
         *
         *  **[code skip-lint]Object.connect()` or [code skip-lint]Signal.connect()`?**
         *  As seen above, the recommended method to connect signals is not [method Object.connect]. The code block below shows the four options for connecting signals, using either this legacy method or the recommended [method Signal.connect], and using either an implicit [Callable] or a manually defined one.
         *
         *  While all options have the same outcome (`button`'s [signal BaseButton.button_down] signal will be connected to `_on_button_down`), **option 3** offers the best validation: it will print a compile-time error if either the `button_down` [Signal] or the `_on_button_down` [Callable] are not defined. On the other hand, **option 2** only relies on string names and will only be able to validate either names at runtime: it will print a runtime error if `"button_down"` doesn't correspond to a signal, or if `"_on_button_down"` is not a registered method in the object `self`. The main reason for using options 1, 2, or 4 would be if you actually need to use strings (e.g. to connect signals programmatically based on strings read from a configuration file). Otherwise, option 3 is the recommended (and fastest) method.
         *  **Binding and passing parameters:**
         *  The syntax to bind parameters is through [method Callable.bind], which returns a copy of the [Callable] with its parameters bound.
         *  When calling [method emit_signal] or [method Signal.emit], the signal parameters can be also passed. The examples below show the relationship between these signal parameters and bound parameters.
         *
         */
        connect(signal: StringName, callable: Callable, flags?: int64): Error;

        /** Disconnects a [param signal] by name from a given [param callable]. If the connection does not exist, generates an error. Use [method is_connected] to make sure that the connection exists. */
        disconnect(signal: StringName, callable: Callable): void;

        /** Returns `true` if a connection exists between the given [param signal] name and [param callable].
         *
         *  **Note:** In C#, [param signal] must be in snake_case when referring to built-in Godot signals. Prefer using the names exposed in the `SignalName` class to avoid allocating a new [StringName] on each call.
         */
        is_connected(signal: StringName, callable: Callable): boolean;

        /** Returns `true` if any connection exists on the given [param signal] name.
         *
         *  **Note:** In C#, [param signal] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `SignalName` class to avoid allocating a new [StringName] on each call.
         */
        has_connections(signal: StringName): boolean;

        /** If set to `true`, the object becomes unable to emit signals. As such, [method emit_signal] and signal connections will not work, until it is set to `false`. */
        set_block_signals(enable: boolean): void;

        /** Returns `true` if the object is blocking its signals from being emitted. See [method set_block_signals]. */
        is_blocking_signals(): boolean;

        /** Emits the [signal property_list_changed] signal. This is mainly used to refresh the editor, so that the Inspector and editor plugins are properly updated. */
        notify_property_list_changed(): void;

        /** If set to `true`, allows the object to translate messages with [method tr] and [method tr_n]. Enabled by default. See also [method can_translate_messages]. */
        set_message_translation(enable: boolean): void;

        /** Returns `true` if the object is allowed to translate messages with [method tr] and [method tr_n]. See also [method set_message_translation]. */
        can_translate_messages(): boolean;

        /** Translates a [param message], using the translation catalogs configured in the Project Settings. Further [param context] can be specified to help with the translation. Note that most [Control] nodes automatically translate their strings, so this method is mostly useful for formatted strings or custom drawn text.
         *  If [method can_translate_messages] is `false`, or no translation is available, this method returns the [param message] without changes. See [method set_message_translation].
         *  For detailed examples, see [url=https://docs.godotengine.org/en/latest/tutorials/i18n/internationalizing_games.html]Internationalizing games[/url].
         *
         *  **Note:** This method can't be used without an [Object] instance, as it requires the [method can_translate_messages] method. To translate strings in a static context, use [method TranslationServer.translate].
         */
        tr(message: StringName, context?: StringName): string;

        /** Translates a [param message] or [param plural_message], using the translation catalogs configured in the Project Settings. Further [param context] can be specified to help with the translation.
         *  If [method can_translate_messages] is `false`, or no translation is available, this method returns [param message] or [param plural_message], without changes. See [method set_message_translation].
         *  The [param n] is the number, or amount, of the message's subject. It is used by the translation system to fetch the correct plural form for the current language.
         *  For detailed examples, see [url=https://docs.godotengine.org/en/latest/tutorials/i18n/localization_using_gettext.html]Localization using gettext[/url].
         *
         *  **Note:** Negative and [float] numbers may not properly apply to some countable subjects. It's recommended to handle these cases with [method tr].
         *
         *  **Note:** This method can't be used without an [Object] instance, as it requires the [method can_translate_messages] method. To translate strings in a static context, use [method TranslationServer.translate_plural].
         */
        tr_n(message: StringName, plural_message: StringName, n: int64, context?: StringName): string;

        /** Returns the name of the translation domain used by [method tr] and [method tr_n]. See also [TranslationServer]. */
        get_translation_domain(): StringName;

        /** Sets the name of the translation domain used by [method tr] and [method tr_n]. See also [TranslationServer]. */
        set_translation_domain(domain: StringName): void;

        /** Returns `true` if the [method Node.queue_free] method was called for the object. */
        is_queued_for_deletion(): boolean;

        /** If this method is called during [constant NOTIFICATION_PREDELETE], this object will reject being freed and will remain allocated. This is mostly an internal function used for error handling to avoid the user from freeing objects when they are not intended to. */
        cancel_free(): void;

        /** Emitted when the object's script is changed.
         *
         *  **Note:** When this signal is emitted, the new script is not initialized yet. If you need to access the new script, defer connections to this signal with [constant CONNECT_DEFERRED].
         */
        readonly script_changed: Signal<() => void>;

        /** Emitted when [method notify_property_list_changed] is called. */
        readonly property_list_changed: Signal<() => void>;
    }

    enum Error {
        /** Methods that return [enum Error] return [constant OK] when no error occurred.
         *  Since [constant OK] has value `0`, and all other error constants are positive integers, it can also be used in boolean checks.
         *
         *
         *  **Note:** Many functions do not return an error code, but will print error messages to standard output.
         */
        OK = 0,

        /** Generic error. */
        FAILED = 1,

        /** Unavailable error. */
        ERR_UNAVAILABLE = 2,

        /** Unconfigured error. */
        ERR_UNCONFIGURED = 3,

        /** Unauthorized error. */
        ERR_UNAUTHORIZED = 4,

        /** Parameter range error. */
        ERR_PARAMETER_RANGE_ERROR = 5,

        /** Out of memory (OOM) error. */
        ERR_OUT_OF_MEMORY = 6,

        /** File: Not found error. */
        ERR_FILE_NOT_FOUND = 7,

        /** File: Bad drive error. */
        ERR_FILE_BAD_DRIVE = 8,

        /** File: Bad path error. */
        ERR_FILE_BAD_PATH = 9,

        /** File: No permission error. */
        ERR_FILE_NO_PERMISSION = 10,

        /** File: Already in use error. */
        ERR_FILE_ALREADY_IN_USE = 11,

        /** File: Can't open error. */
        ERR_FILE_CANT_OPEN = 12,

        /** File: Can't write error. */
        ERR_FILE_CANT_WRITE = 13,

        /** File: Can't read error. */
        ERR_FILE_CANT_READ = 14,

        /** File: Unrecognized error. */
        ERR_FILE_UNRECOGNIZED = 15,

        /** File: Corrupt error. */
        ERR_FILE_CORRUPT = 16,

        /** File: Missing dependencies error. */
        ERR_FILE_MISSING_DEPENDENCIES = 17,

        /** File: End of file (EOF) error. */
        ERR_FILE_EOF = 18,

        /** Can't open error. */
        ERR_CANT_OPEN = 19,

        /** Can't create error. */
        ERR_CANT_CREATE = 20,

        /** Query failed error. */
        ERR_QUERY_FAILED = 21,

        /** Already in use error. */
        ERR_ALREADY_IN_USE = 22,

        /** Locked error. */
        ERR_LOCKED = 23,

        /** Timeout error. */
        ERR_TIMEOUT = 24,

        /** Can't connect error. */
        ERR_CANT_CONNECT = 25,

        /** Can't resolve error. */
        ERR_CANT_RESOLVE = 26,

        /** Connection error. */
        ERR_CONNECTION_ERROR = 27,

        /** Can't acquire resource error. */
        ERR_CANT_ACQUIRE_RESOURCE = 28,

        /** Can't fork process error. */
        ERR_CANT_FORK = 29,

        /** Invalid data error. */
        ERR_INVALID_DATA = 30,

        /** Invalid parameter error. */
        ERR_INVALID_PARAMETER = 31,

        /** Already exists error. */
        ERR_ALREADY_EXISTS = 32,

        /** Does not exist error. */
        ERR_DOES_NOT_EXIST = 33,

        /** Database: Read error. */
        ERR_DATABASE_CANT_READ = 34,

        /** Database: Write error. */
        ERR_DATABASE_CANT_WRITE = 35,

        /** Compilation failed error. */
        ERR_COMPILATION_FAILED = 36,

        /** Method not found error. */
        ERR_METHOD_NOT_FOUND = 37,

        /** Linking failed error. */
        ERR_LINK_FAILED = 38,

        /** Script failed error. */
        ERR_SCRIPT_FAILED = 39,

        /** Cycling link (import cycle) error. */
        ERR_CYCLIC_LINK = 40,

        /** Invalid declaration error. */
        ERR_INVALID_DECLARATION = 41,

        /** Duplicate symbol error. */
        ERR_DUPLICATE_SYMBOL = 42,

        /** Parse error. */
        ERR_PARSE_ERROR = 43,

        /** Busy error. */
        ERR_BUSY = 44,

        /** Skip error. */
        ERR_SKIP = 45,

        /** Help error. Used internally when passing `--version` or `--help` as executable options. */
        ERR_HELP = 46,

        /** Bug error, caused by an implementation issue in the method.
         *
         *  **Note:** If a built-in method returns this code, please open an issue on [url=https://github.com/godotengine/godot/issues]the GitHub Issue Tracker[/url].
         */
        ERR_BUG = 47,

        /** Printer on fire error (This is an easter egg, no built-in methods return this error code). */
        ERR_PRINTER_ON_FIRE = 48,
    }

    class DirAccess {
        static make_dir_recursive_absolute(path: string): Error;
    }

    /**
     * Editor only (internal)
     */
    namespace GodotJSEditorHelper {
        function show_toast(text: string, severity: 0 | 1 | 2): void;
        function get_resource_type_descriptor(resource_path: string): TypeDescriptor;
        function get_scene_nodes(scene_path: string): GDictionary<Record<string, TypeDescriptor>>;
    }

    /**
     * Editor only (internal)
     */
    class GodotJSEditorProgress extends Object {
        init(name: string, description: string, total_steps: number): void;
        set_state_name(name: string): void;
        set_current(value: number): void;
        step(): void;
        finish(): void;
    }
}

declare module "godot.lib.api" {
    import type * as Godot from "godot";
    import type * as GodotJsb from "godot-jsb";
    const api: typeof Godot & {
        jsb: typeof GodotJsb;
        proxy: {
            array_proxy: <T extends any[]>(arr: T) => T;
            class_proxy: <T extends object>(target_class: T) => T;
            enum_proxy: <T extends object>(target_enum: T) => T;
            function_proxy: <T extends (...args: any[]) => any>(target_func: T) => T;
            instance_proxy: <T extends object>(target_instance: T) => T;
            key_only_proxy: <T extends object | ((...args: any[]) => any)>(obj: T) => T;
            object_proxy: <T extends object>(obj: T, remap_properties?: boolean) => T;
            proxy_wrap_value: <T>(value: T) => T;
            proxy_unwrap_value: <T>(value: T) => T;
        };
    };
    /**
     * This is a starting point for writing GodotJS code that is camel-case binding agnostic at runtime.
     *
     * Library code must consume this API rather than "godot", and be built with camel case bindings disabled. This is to
     * ensure that the library will function at runtime for all projects irrespective of whether they have camel-case
     * bindings enabled.
     */
    export = api;
}

declare module "jsb.editor.codegen" {
    import { GDictionary } from "godot";
    type TypeDescriptor = GDictionary<unknown>;
}

declare module "godot.annotations" {
    type ClassBinder = (() => (target: GObjectConstructor, context: ClassDecoratorContext) => void) & {
        tool: () => (target: GObjectConstructor, _context: ClassDecoratorContext) => void;
        icon: (path: string) => (target: GObjectConstructor, _context: ClassDecoratorContext) => void;
        export: ((type: Godot.Variant.Type, options?: ExportOptions) => ClassMemberDecorator) & {
            multiline: () => ClassMemberDecorator;
            range: (min: number, max: number, step: number, ...extra_hints: string[]) => ClassMemberDecorator;
            range_int: (min: number, max: number, step: number, ...extra_hints: string[]) => ClassMemberDecorator;
            file: (filter: string) => ClassMemberDecorator;
            dir: (filter: string) => ClassMemberDecorator;
            global_file: (filter: string) => ClassMemberDecorator;
            global_dir: (filter: string) => ClassMemberDecorator;
            exp_easing: (
                hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only",
            ) => ClassMemberDecorator;
            array: (clazz: ClassSpecifier) => ClassMemberDecorator;
            dictionary: (key_class: VariantConstructor, value_class: VariantConstructor) => ClassMemberDecorator;
            object: <Constructor extends GObjectConstructor>(
                clazz: Constructor,
            ) => ClassMemberDecorator<ClassValueMemberDecoratorContext<unknown, null | InstanceType<Constructor>>>;
            enum: (enum_type: Record<string, string | number>) => ClassMemberDecorator;
            flags: (enum_type: Record<string, string | number>) => ClassMemberDecorator;
            cache: () => ClassMemberDecorator<
                ClassAccessorDecoratorContext<Godot.Object> | ClassSetterDecoratorContext<Godot.Object>
            >;
        };
        signal: () => <
            Context extends
                | ClassAccessorDecoratorContext<Godot.Object, Godot.Signal>
                | ClassGetterDecoratorContext<Godot.Object, Godot.Signal>
                | ClassFieldDecoratorContext<Godot.Object, Godot.Signal>,
        >(
            _target: unknown,
            context: Context,
        ) => ClassMemberDecoratorReturn<Context>;
        rpc: (config?: RPCConfig) => (_target: Function, context: string | ClassMethodDecoratorContext) => void;
        onready: (
            evaluator: string | GodotJsb.internal.OnReadyEvaluatorFunc,
        ) => (_target: undefined, context: string | ClassFieldDecoratorContext) => void;
        deprecated: (
            message?: string,
        ) => (target: GObjectConstructor, context: ClassDecoratorContext | ClassValueMemberDecoratorContext) => void;
        experimental: (
            message?: string,
        ) => (target: GObjectConstructor, context: ClassDecoratorContext | ClassValueMemberDecoratorContext) => void;
        help: (
            message?: string,
        ) => (target: GObjectConstructor, context: ClassDecoratorContext | ClassValueMemberDecoratorContext) => void;
    };

    type ExportOptions = {
        class?: ClassDescriptor;
        hint?: Godot.PropertyHint;
        hint_string?: string;
        usage?: Godot.PropertyUsageFlags;
    };

    interface RPCConfig {
        mode?: Godot.MultiplayerApi.RpcMode;
        sync?: "call_remote" | "call_local";
        transfer_mode?: Godot.MultiplayerPeer.TransferMode;
        transfer_channel?: number;
    }
}
