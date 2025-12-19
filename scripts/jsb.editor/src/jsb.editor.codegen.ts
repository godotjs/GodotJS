import type {
    ExtractValueKeys,
    FileAccess,
    GArray,
    GDictionary,
    GReadProxyValueWrap,
    Node,
    PropertyInfo,
    Resource,
    ResourceTypes,
    Script,
    Variant,
} from "godot";

import type * as Godot from "godot";
import type * as GodotJsb from "godot-jsb";

const godot: typeof Godot = require("godot.lib.api");
const jsb: typeof GodotJsb = require("godot.lib.api").jsb;

const gd_to_string = godot.str;
const names = jsb.internal.names;

const js_object_key_types = new Set(["string", "byte", "int32", "int64", "float32", "float64", "uint32"]);

function camel_property_overrides(overrides: undefined | Record<string, string[] | ((line: string) => string)>) {
    const get_member = jsb.internal.names.get_member;
    return overrides && Object.fromEntries(Object.entries(overrides).map(([name, value]) => [get_member(name), value]));
}

if (!jsb.TOOLS_ENABLED) {
    throw new Error("codegen is only allowed in editor mode");
}

const tab = "    ";
const GodotAnyType: string = "GAny";

interface GenericParameter {
    extends?: string;
    default?: string;
}

interface Implements {
    type: string;
    generic_arguments?: string[];
}

type Intro = string[] | ((types: TypeDB) => string[]);
type PropertyOverrides = Record<string, string[] | ((line: string) => string)>;

interface TypeMutation {
    generic_parameters?: Record<string, GenericParameter>;
    super?: string;
    super_generic_arguments?: string[];
    implements?: Implements[];
    intro?: Intro;
    prelude?: string[];
    property_overrides?: PropertyOverrides;
}

function chain_mutators(...mutators: Array<(line: string) => string>) {
    return function (line: string) {
        return mutators.reduce((line, mutator) => mutator(line), line);
    };
}
function mutate_parameter_type(name: string, type: string) {
    name = names.get_parameter(name);
    return function (line: string) {
        const replaced = line.replace(
            new RegExp(`([,(] *)${name.replace(/\./g, "\\.")}\\??: .+?( ?[,)/])`, "g"),
            `$1${name}: ${type}$2`,
        );
        if (replaced === line) {
            throw new Error(`Failed to mutate "${name}" parameter's type: ${line}`);
        }
        return replaced;
    };
}
function mutate_return_type(type: string) {
    return function (line: string) {
        const replaced = line.replace(/: [^:]+$/g, `: ${type}`);
        if (replaced === line) {
            throw new Error(`Failed to mutate return type: ${line}`);
        }
        return replaced;
    };
}
function mutate_template(template: string) {
    return function (line: string) {
        const replaced = line.replace(/([^(]+)(<[^>]+> *)?\(/, `$1$2<${template}>(`);
        if (replaced === line) {
            throw new Error(`Failed to mutate template: ${line}`);
        }
        return replaced;
    };
}

const TypeMutations: Record<string, TypeMutation> = {
    AnimationLibrary: {
        prelude: [`namespace __PathMappableDummyKeys { const AnimationLibrary: unique symbol }`],
        generic_parameters: {
            AnimationName: {
                extends: "string",
                default: "string",
            },
        },
        implements: [
            {
                type: "PathMappable",
                generic_arguments: [
                    "typeof __PathMappableDummyKeys.AnimationLibrary",
                    "Record<AnimationName, Animation>",
                ],
            },
        ],
        intro: ["[__PathMappableDummyKeys.AnimationLibrary]: Record<AnimationName, Animation>"],
        property_overrides: {
            add_animation: mutate_parameter_type("name", "AnimationName"),
            remove_animation: mutate_parameter_type("name", "AnimationName"),
            rename_animation: chain_mutators(
                mutate_parameter_type("name", "AnimationName"),
                mutate_parameter_type("newname", "AnimationName"),
            ),
            has_animation: chain_mutators(mutate_parameter_type("name", "AnimationName")),
            get_animation: mutate_parameter_type("name", "AnimationName"),
            animation_added: [`readonly ${names.get_member("animation_added")}: Signal<(name: StringName) => void>`],
            animation_removed: [
                `readonly ${names.get_member("animation_removed")}: Signal<(name: StringName) => void>`,
            ],
            animation_renamed: [
                `readonly ${names.get_member("animation_renamed")}: Signal<(name: StringName, ${names.get_parameter("to_name")}) => void>`,
            ],
            animation_changed: [
                `readonly ${names.get_member("animation_changed")}: Signal<(name: StringName) => void>`,
            ],
        },
    },
    AnimationMixer: {
        prelude: [`namespace __PathMappableDummyKeys { const AnimationMixer: unique symbol }`],
        generic_parameters: {
            NodeMap: {
                extends: "NodePathMap",
                default: "any",
            },
            LibraryMap: {
                extends: "AnimationMixerPathMap",
                default: "any",
            },
        },
        super_generic_arguments: ["NodeMap"],
        implements: [
            {
                type: "PathMappable",
                generic_arguments: ["typeof __PathMappableDummyKeys.AnimationMixer", "LibraryMap"],
            },
        ],
        intro: ["[__PathMappableDummyKeys.AnimationMixer]: LibraryMap"],
        property_overrides: {
            add_animation_library: chain_mutators(
                mutate_template("Name extends keyof LibraryMap"),
                mutate_parameter_type("name", "Name"),
                mutate_parameter_type("library", "LibraryMap[Name]"),
            ),
            remove_animation_library: chain_mutators(
                mutate_template("Name extends keyof LibraryMap"),
                mutate_parameter_type("name", "Name"),
            ),
            rename_animation_library: chain_mutators(
                mutate_template(
                    "FromName extends keyof LibraryMap, ToName extends ExtractValueKeys<LibraryMap, LibraryMap[FromName]>",
                ),
                mutate_parameter_type("name", "FromName"),
                mutate_parameter_type("newname", "ToName"),
            ),
            has_animation_library: chain_mutators(
                mutate_template("Name extends keyof LibraryMap"),
                mutate_parameter_type("name", "Name"),
            ),
            get_animation_library: chain_mutators(
                mutate_template("Name extends keyof LibraryMap"),
                mutate_parameter_type("name", "Name"),
                mutate_return_type("LibraryMap[Name]"),
            ),
            get_animation_library_list: mutate_return_type(
                "keyof LibraryMap extends GAny ? GArray<keyof LibraryMap> : GArray",
            ),
            has_animation: chain_mutators(
                mutate_template("Name extends StaticAnimationMixerPath<LibraryMap>"),
                mutate_parameter_type("name", "Name"),
            ),
            get_animation: chain_mutators(
                mutate_template("Name extends StaticAnimationMixerPath<LibraryMap>"),
                mutate_parameter_type("name", "Name"),
                mutate_return_type("ResolveAnimationMixerPath<LibraryMap, Name>"),
            ),
        },
    },
    AnimationPlayer: {
        property_overrides: {
            animation_set_next: chain_mutators(
                mutate_parameter_type("animation_from", "StaticAnimationMixerPath<LibraryMap>"),
                mutate_parameter_type("animation_to", "StaticAnimationMixerPath<LibraryMap>"),
            ),
            animation_get_next: chain_mutators(
                mutate_parameter_type("animation_from", "StaticAnimationMixerPath<LibraryMap>"),
                mutate_return_type("StaticAnimationMixerPath<LibraryMap>"),
            ),
            set_blend_time: chain_mutators(
                mutate_parameter_type("animation_from", "StaticAnimationMixerPath<LibraryMap>"),
                mutate_parameter_type("animation_to", "StaticAnimationMixerPath<LibraryMap>"),
            ),
            get_blend_time: chain_mutators(
                mutate_parameter_type("animation_from", "StaticAnimationMixerPath<LibraryMap>"),
                mutate_parameter_type("animation_to", "StaticAnimationMixerPath<LibraryMap>"),
            ),
            play: mutate_parameter_type("name", "StaticAnimationMixerPath<LibraryMap>"),
            play_section: mutate_parameter_type("name", "StaticAnimationMixerPath<LibraryMap>"),
            play_backwards: mutate_parameter_type("name", "StaticAnimationMixerPath<LibraryMap>"),
            play_section_with_markers_backwards: mutate_parameter_type("name", "StaticAnimationMixerPath<LibraryMap>"),
            play_section_backwards: mutate_parameter_type("name", "StaticAnimationMixerPath<LibraryMap>"),
            play_with_capture: mutate_parameter_type("name", "StaticAnimationMixerPath<LibraryMap>"),
            queue: mutate_parameter_type("name", "StaticAnimationMixerPath<LibraryMap>"),
            current_animation: [
                `get ${names.get_member("current_animation")}(): StaticAnimationMixerPath<LibraryMap>`,
                `set ${names.get_member("current_animation")}(value: StaticAnimationMixerPath<LibraryMap>)`,
            ],
            assigned_animation: [
                `get ${names.get_member("assigned_animation")}(): StaticAnimationMixerPath<LibraryMap>`,
                `set ${names.get_member("assigned_animation")}(value: StaticAnimationMixerPath<LibraryMap>)`,
            ],
            autoplay: [
                `get autoplay(): StaticAnimationMixerPath<LibraryMap>`,
                `set autoplay(value: StaticAnimationMixerPath<LibraryMap>)`,
            ],
            current_animation_changed: [
                `readonly ${names.get_member("current_animation_changed")}: Signal<(name: StaticAnimationMixerPath<LibraryMap>) => void>`,
            ],
            animation_changed: [
                `readonly ${names.get_member("current_animation_changed")}: Signal<(${names.get_parameter("old_name")}: StaticAnimationMixerPath<LibraryMap>, ${names.get_parameter("new_name")}: StaticAnimationMixerPath<LibraryMap>) => void>`,
            ],
        },
    },
    Callable: {
        intro: [
            "/**",
            " * Create godot Callable without a bound object.",
            " */",
            "static create<F extends Function>(fn: F): Callable<F>",
            "/**",
            " * Create godot Callable with a bound object `self`.",
            " */",
            "static create<S extends Object, F extends (this: S, ...args: any[]) => any>(self: S, fn: F): Callable<F>",
        ],
        generic_parameters: {
            T: {
                extends: "Function",
                default: "Function",
            },
        },
        property_overrides: {
            bind: chain_mutators(
                mutate_template("A extends any[]"),
                mutate_parameter_type("...varargs", "A"),
                mutate_return_type("Callable<BindRight<T, A>>"),
            ),
            call: ["call: T"],
        },
    },
    CameraFeed: {
        prelude: [
            "namespace CameraFeed {",
            "    type FeedFormat = GDictionary<{",
            "        width: int64",
            "        height: int64",
            "        format: string",
            "        frame_numerator?: int64",
            "        frame_denominator?: int64",
            "        pixel_format?: uint32",
            "    }>",
            "}",
            "",
        ],
        property_overrides: {
            formats: [
                `get formats(): GArray<CameraFeed.FeedFormat>`,
                `set formats(value: GArray<CameraFeed.FeedFormat>)`,
            ],
        },
    },
    EditorUndoRedoManager: {
        property_overrides: {
            add_do_method: [
                `${names.get_member("add_do_method")}<T extends GObject, M extends GodotNames<T>>(object: T, method: M, ...args: ResolveGodotNameParameters<T, M>): void`,
            ],
            add_undo_method: [
                `${names.get_member("add_undo_method")}<T extends GObject, M extends GodotNames<T>>(object: T, method: M, ...args: ResolveGodotNameParameters<T, M>): void`,
            ],
            add_do_property: [
                `${names.get_member("add_do_property")}<T extends GObject, P extends GodotNames<T>>(object: T, property: P, value: ResolveGodotNameValue<T, P>): void`,
            ],
            add_undo_property: [
                `${names.get_member("add_undo_property")}<T extends GObject, P extends GodotNames<T>>(object: T, property: P, value: ResolveGodotNameValue<T, P>): void`,
            ],
        },
    },
    GArray: {
        generic_parameters: {
            T: {
                default: `${GodotAnyType} | ${GodotAnyType}[]`,
                extends: `${GodotAnyType} | ${GodotAnyType}[]`,
            },
        },
        intro: [
            "/** Builder function that returns a GArray populated with elements from a JS array. */",
            "static create<A extends any[]>(elements: A): GValueWrap<A>",
            "static create<A extends GArray<any>>(",
            "    elements: A extends GArray<infer T>",
            "        ? [T] extends [any[]]",
            "            ? { [I in keyof T]: GDataStructureCreateValue<T[I]> }",
            "            : Array<GDataStructureCreateValue<T>>",
            "        : never",
            "): GValueWrap<A>",
            "static create<E extends GAny>(elements: Array<GDataStructureCreateValue<E>>): GArray<E>",
            "[Symbol.iterator](): IteratorObject<GArrayElement<T>>",
            "/** Returns a Proxy that targets this GArray but behaves similar to a JavaScript array. */",
            "proxy<Write extends boolean = false>(): Write extends true ? GArrayProxy<GArrayElement<T>> : GArrayReadProxy<GArrayElement<T>>",
            "",
            `${names.get_member("set_indexed")}<I extends int64>(index: I, value: GArrayElement<T, I>): void`,
            `${names.get_member("get_indexed")}<I extends int64>(index: I): GArrayElement<T, I>`,
        ],
        property_overrides: {
            set: [`set<I extends int64>(index: I, value: GArrayElement<T, I>): void`],
            push_back: mutate_parameter_type("value", "GArrayElement<T>"),
            push_front: mutate_parameter_type("value", "GArrayElement<T>"),
            append: mutate_parameter_type("value", "GArrayElement<T>"),
            insert: mutate_parameter_type("value", "GArrayElement<T>"),
            fill: mutate_parameter_type("value", "GArrayElement<T>"),
            erase: mutate_parameter_type("value", "GArrayElement<T>"),
            count: mutate_parameter_type("value", "GArrayElement<T>"),
            has: mutate_parameter_type("value", "GArrayElement<T>"),
            bsearch: mutate_parameter_type("value", "GArrayElement<T>"),
            bsearch_custom: chain_mutators(
                mutate_parameter_type("value", "GArrayElement<T>"),
                mutate_parameter_type("func", "Callable<(a: GArrayElement<T>, b: GArrayElement<T>) => boolean>"),
            ),
            find: mutate_parameter_type("what", "GArrayElement<T>"),
            rfind: mutate_parameter_type("what", "GArrayElement<T>"),
            get: [`get<I extends int64>(index: I): GArrayElement<T, I>`],
            front: mutate_return_type("GArrayElement<T>"),
            back: mutate_return_type("GArrayElement<T>"),
            pick_random: mutate_return_type("GArrayElement<T>"),
            pop_back: mutate_return_type("GArrayElement<T>"),
            pop_front: mutate_return_type("GArrayElement<T>"),
            pop_at: mutate_return_type("GArrayElement<T>"),
            min: mutate_return_type("GArrayElement<T>"),
            max: mutate_return_type("GArrayElement<T>"),
            sort_custom: mutate_parameter_type(
                "func",
                "Callable<(a: GArrayElement<T>, b: GArrayElement<T>) => boolean>",
            ),
            all: mutate_parameter_type("method", "Callable<(value: GArrayElement<T>) => boolean>"),
            any: mutate_parameter_type("method", "Callable<(value: GArrayElement<T>) => boolean>"),
            filter: chain_mutators(
                mutate_parameter_type("method", "Callable<(value: GArrayElement<T>) => boolean>"),
                mutate_return_type("GArray<GArrayElement<T>>"),
            ),
            map: chain_mutators(
                mutate_parameter_type("method", "Callable<(value: GArrayElement<T>) => U>"),
                mutate_return_type("GArray<U>"),
                mutate_template("U extends GAny"),
            ),
            append_array: mutate_parameter_type("array", "GArray<GArrayElement<T>>"),
            duplicate: mutate_return_type("this"),
            slice: mutate_return_type("GArray<GArrayElement<T>>"),
        },
    },
    GDictionary: {
        prelude: [
            "type GArrayCreateSource<T> = ReadonlyArray<T> | {",
            "    [Symbol.iterator](): IteratorObject<GDataStructureCreateValue<T>>;",
            "    [K: number]: GDataStructureCreateValue<T>;",
            "}",
            "type GDataStructureCreateValue<V> = V | (",
            "     V extends GArray<infer T>",
            " ? [T] extends [any[]]",
            "     ? GArrayCreateSource<{ [I in keyof T]: GDataStructureCreateValue<T[I]> }>",
            "     : GArrayCreateSource<GDataStructureCreateValue<T>>",
            " : V extends GDictionary<infer T>",
            "     ? { [K in keyof T]: GDataStructureCreateValue<T[K]> }",
            "     : never",
            "     )",
        ],
        generic_parameters: {
            T: {
                default: "Record<any, any>",
            },
        },
        intro: [
            "/** Builder function that returns a GDictionary with properties populated from a source JS object. */",
            "static create<V extends { [key: number | string]: GWrappableValue }>(properties: V): GValueWrap<V>",
            "static create<V extends GDictionary<any>>(properties: V extends GDictionary<infer T> ? { [K in keyof T]: GDataStructureCreateValue<T[K]> } : never): V",
            "[Symbol.iterator](): IteratorObject<{ key: any, value: any }>",
            "/** Returns a Proxy that targets this GDictionary but behaves similar to a regular JavaScript object. Values are exposed as enumerable properties, so Object.keys(), Object.entries() etc. will work. */",
            "proxy<Write extends boolean = false>(): Write extends true ? GDictionaryProxy<T> : GDictionaryReadProxy<T>",
            "",
            `${names.get_member("set_keyed")}<K extends keyof T>(key: K, value: T[K]): void`,
            `${names.get_member("get_keyed")}<K extends keyof T>(key: K): UndefinedToNull<T[K]>`,
        ],
        property_overrides: {
            assign: mutate_parameter_type("dictionary", "T"),
            merge: mutate_parameter_type("dictionary", "T"),
            merged: chain_mutators(
                mutate_parameter_type("dictionary", "GDictionary<U>"),
                mutate_return_type("GDictionary<T & U>"),
                mutate_template("U"),
            ),
            has: mutate_parameter_type("key", "keyof T"),
            has_all: mutate_parameter_type("keys", "keyof T extends GAny ? GArray<keyof T> : GArray"),
            find_key: chain_mutators(mutate_parameter_type("value", "T[keyof T]"), mutate_return_type("keyof T")), // This can be typed more accurately with a mapped type, but it seems excessive.
            erase: mutate_parameter_type("key", "keyof T"),
            keys: mutate_return_type("keyof T extends GAny ? GArray<keyof T> : GArray"),
            values: mutate_return_type(
                "UndefinedToNull<T[keyof T]> extends GAny ? GArray<UndefinedToNull<T[keyof T]>> : GArray",
            ),
            duplicate: mutate_return_type("GDictionary<T>"),
            get: chain_mutators(
                mutate_parameter_type("key", "K"),
                mutate_return_type("UndefinedToNull<T[K]>"),
                mutate_template("K extends keyof T"),
            ),
            get_or_add: chain_mutators(
                mutate_parameter_type("key", "K"),
                mutate_return_type("UndefinedToNull<T[K]>"),
                mutate_parameter_type("default_", "T[K]"),
                mutate_template("K extends keyof T"),
            ),
            set: chain_mutators(
                mutate_parameter_type("key", "K"),
                mutate_parameter_type("value", "T[K]"),
                mutate_template("K extends keyof T"),
            ),
        },
    },
    Input: {
        property_overrides: {
            is_action_pressed: mutate_parameter_type("action", "InputActionName"),
            is_action_just_pressed: mutate_parameter_type("action", "InputActionName"),
            is_action_just_released: mutate_parameter_type("action", "InputActionName"),
            get_action_strength: mutate_parameter_type("action", "InputActionName"),
            get_action_raw_strength: mutate_parameter_type("action", "InputActionName"),
            get_axis: chain_mutators(
                mutate_parameter_type("negative_action", "InputActionName"),
                mutate_parameter_type("positive_action", "InputActionName"),
            ),
            get_vector: chain_mutators(
                mutate_parameter_type("negative_x", "InputActionName"),
                mutate_parameter_type("positive_x", "InputActionName"),
                mutate_parameter_type("negative_y", "InputActionName"),
                mutate_parameter_type("positive_y", "InputActionName"),
            ),
            action_press: mutate_parameter_type("action", "InputActionName"),
            action_release: mutate_parameter_type("action", "InputActionName"),
        },
    },
    InputEvent: {
        property_overrides: {
            is_action: mutate_parameter_type("action", "InputActionName"),
            is_action_pressed: mutate_parameter_type("action", "InputActionName"),
            is_action_released: mutate_parameter_type("action", "InputActionName"),
            get_action_strength: mutate_parameter_type("action", "InputActionName"),
        },
    },
    Node: {
        prelude: [`namespace __PathMappableDummyKeys { const Node: unique symbol }`],
        intro: ["[__PathMappableDummyKeys.Node]: Map"],
        generic_parameters: {
            Map: {
                extends: "NodePathMap",
                default: "any",
            },
        },
        implements: [
            {
                type: "PathMappable",
                generic_arguments: ["typeof __PathMappableDummyKeys.Node", "Map"],
            },
        ],
        property_overrides: {
            add_child: mutate_parameter_type("node", "NodePathMapChild<Map>"),
            get_child: mutate_return_type("NodePathMapChild<Map>"),
            get_children: mutate_return_type("GArray<NodePathMapChild<Map>>"),
            get_node: [
                `${names.get_member("get_node")}<Path extends StaticNodePath<Map>, Default = never>(path: Path): ResolveNodePath<Map, Path, Default>`,
            ],
            get_node_or_null: [
                `${names.get_member("get_node_or_null")}<Path extends StaticNodePath<Map, undefined | Node>, Default = null>(path: Path): null | ResolveNodePath<Map, Path, Default, undefined | Node>`,
                `${names.get_member("get_node_or_null")}(path: NodePath | string): null | Node`,
            ],
            get_tree: mutate_return_type("SceneTree"),
            move_child: mutate_parameter_type(names.get_parameter("child_node"), "NodePathMapChild<Map>"),
            remove_child: mutate_parameter_type("node", "NodePathMapChild<Map>"),
            validate_property: mutate_parameter_type("property", "GDictionary<PropertyInfo>"),
        },
    },
    // GObject:
    [names.get_class("Object")]: {
        property_overrides: {
            call: [
                "call<M extends GodotNames<this>>(method: M, ...args: ResolveGodotNameParameters<this, NoInfer<M>>): ResolveGodotReturnType<this, NoInfer<M>>",
            ],
            call_deferred: [
                `${names.get_member("call_deferred")}<M extends GodotNames<this>>(method: M, ...args: ResolveGodotNameParameters<this, NoInfer<M>>): void`,
            ],
            set_deferred: [
                `${names.get_member("set_deferred")}<P extends GodotNames<this>>(property: P, value: ResolveGodotNameValue<this,  NoInfer<P>>): void`,
            ],
            callv: [
                "callv<M extends GodotNames<this>>(method: M, argArray: GArray<ResolveGodotNameParameters<this, NoInfer<M>>>): ResolveGodotReturnType<this, NoInfer<M>>",
            ],
            get_property_list: mutate_return_type("GArray<GDictionary<PropertyInfo>>"),
            get_script: mutate_return_type("null | Script"),
            set_script: mutate_parameter_type("script", "null | Script"),
        },
    },
    PackedByteArray: {
        intro: [
            "/** [jsb utility method] Converts a PackedByteArray to a JavaScript ArrayBuffer. */",
            `${names.get_member("to_array_buffer")}(): ArrayBuffer`,
        ],
    },
    PackedScene: {
        generic_parameters: {
            T: {
                extends: "Node",
                default: "Node",
            },
        },
        property_overrides: {
            pack: mutate_parameter_type("path", "T"),
            instantiate: mutate_return_type("T"),
        },
    },
    Resource: {
        property_overrides: {
            duplicate: mutate_return_type("this"),
        },
    },
    ResourceLoader: {
        property_overrides: {
            load: [
                `static load<Path extends keyof ResourceTypes>(path: Path, ${names.get_parameter("type_hint")}?: string /* = "" */, ${names.get_parameter("cache_mode")}?: ResourceLoader.CacheMode /* = 1 */): ResourceTypes[Path]`,
                `static load(path: string, ${names.get_parameter("type_hint")}?: string /* = "" */, ${names.get_parameter("cache_mode")}?: ResourceLoader.CacheMode /* = 1 */): Resource`,
            ],
            load_threaded_get: [
                `static ${names.get_member("load_threaded_get")}<Path extends keyof ResourceTypes>(path: Path): ResourceTypes[Path]`,
                `static ${names.get_member("load_threaded_get")}(path: string): Resource`,
            ],
        },
    },
    Signal: {
        intro: [
            `${names.get_member("as_promise")}(): Parameters<T> extends [] ? Promise<void> : Parameters<T> extends [infer R] ? Promise<R> : Promise<Parameters<T>>`,
        ],
        generic_parameters: {
            T: {
                extends: "(...args: any[]) => void",
                default: "(...args: any[]) => void",
            },
        },
        property_overrides: {
            connect: mutate_parameter_type("callable", "Callable<T>"),
            disconnect: mutate_parameter_type("callable", "Callable<T>"),
            is_connected: mutate_parameter_type("callable", "Callable<T>"),
            emit: ["emit: T"],
        },
    },
    UndoRedo: {
        property_overrides: {
            add_do_property: [
                `${names.get_member("add_do_property")}<T extends GObject, P extends GodotNames<T>>(object: T, property: P, value: ResolveGodotNameValue<T, P>): void`,
            ],
            add_undo_property: [
                `${names.get_member("add_undo_property")}<T extends GObject, P extends GodotNames<T>>(object: T, property: P, value: ResolveGodotNameValue<T, P>): void`,
            ],
        },
    },
};

const InheritedTypeMutations: Record<string, TypeMutation> = {
    AnimationMixer: {
        generic_parameters: {
            NodeMap: {
                extends: "NodePathMap",
                default: "any",
            },
            LibraryMap: {
                extends: "AnimationMixerPathMap",
                default: "any",
            },
        },
        super_generic_arguments: ["NodeMap", "LibraryMap"],
    },
    Node: {
        generic_parameters: {
            Map: {
                extends: "NodePathMap",
                default: "any",
            },
        },
        super_generic_arguments: ["Map"],
    },
};

function is_primitive_class_info(cls: GodotJsb.editor.BasicClassInfo): cls is GodotJsb.editor.PrimitiveClassInfo {
    return "type" in cls;
}

function class_type_mutation(cls: GodotJsb.editor.BasicClassInfo): TypeMutation {
    const intro: string[] = [];

    if (is_primitive_class_info(cls) && typeof cls.element_type !== "undefined") {
        const element_type_name = VariantTypeNames.get(cls.element_type);
        intro.push(`set_indexed(index: number, value: ${element_type_name}): void`);
        intro.push(`get_indexed(index: number): ${element_type_name}`);
    }

    if (is_primitive_class_info(cls) && cls.is_keyed) {
        intro.push("set_keyed(index: any, value: any): void");
        intro.push("get_keyed(index: any): any");
    }

    return {
        intro,
    };
}

function merge_type_mutations(base: TypeMutation, overrides: TypeMutation) {
    return {
        ...base,
        ...overrides,
        property_overrides: {
            ...base.property_overrides,
            ...overrides.property_overrides,
        },
    };
}

function get_type_mutation(name: string, classes: { [Name in string]?: GodotJsb.editor.ClassInfo } = {}): TypeMutation {
    const class_info = classes[name];
    const ancestor_names = [];

    for (let ancestor_name = class_info?.super; ancestor_name; ancestor_name = classes[ancestor_name]?.super) {
        ancestor_names.push(ancestor_name);
    }

    let type_mutation = class_info ? class_type_mutation(class_info) : {};

    for (let i = ancestor_names.length - 1; i >= 0; i--) {
        const ancestor_name = ancestor_names[i];
        if (InheritedTypeMutations[ancestor_name]) {
            type_mutation = merge_type_mutations(type_mutation, InheritedTypeMutations[ancestor_name]);
        }
    }

    if (TypeMutations[name]) {
        type_mutation = merge_type_mutations(type_mutation, TypeMutations[name]);
    }

    return type_mutation;
}

interface CodeWriter {
    get types(): TypeDB;
    get size(): number;
    get lineno(): number;

    add_import(name: string, script_resource: string, export_name?: string): void;
    get_imports(): Record<string, Record<string, string>>; // Record<script_resource, Record<export_name, preferred_import>>
    resolve_import(script_resource: string): string;

    line(text: string): void;
    concatenate(text: string): void;
    append(new_line: boolean, text: string): void;

    enum_(name: string): EnumWriter;
    namespace_(name: string, class_doc?: GodotJsb.editor.ClassDoc): NamespaceWriter;
    interface_(
        name: string,
        generic_parameters?: undefined | Record<string, GenericParameter>,
        super_?: undefined | string,
        super_generic_arguments?: undefined | string[],
        intro?: undefined | string[],
        property_overrides?: undefined | PropertyOverrides,
    ): InterfaceWriter;
    class_(
        name: string,
        generic_parameters: undefined | Record<string, GenericParameter>,
        super_: undefined | string,
        super_generic_arguments: undefined | string[],
        interfaces: undefined | Implements[],
        property_overrides: undefined | PropertyOverrides,
        intro: undefined | Intro,
        prelude: undefined | string[],
        singleton_mode: boolean,
        class_doc?: GodotJsb.editor.ClassDoc,
    ): ClassWriter;
    generic_(name: string): GenericWriter;
    property_(name: string, static_property?: boolean): PropertyWriter;
    object_(intro?: undefined | string[], property_overrides?: undefined | PropertyOverrides): ObjectWriter;
    // singleton_(info: GodotJsb.editor.SingletonInfo): SingletonWriter;
    line_comment_(text: string): void;
}

interface ScopeWriter extends CodeWriter {
    get class_doc(): GodotJsb.editor.ClassDoc | undefined;

    finish(): void;
}

function frame_step() {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 0);
    });
}

function toast(msg: string) {
    let helper = godot.GodotJSEditorHelper;
    helper.show_toast(msg, 0); // 0: info, 1: warning, 2: error
}

interface CodegenTaskInfo {
    name: string;
    execute: () => void | Promise<void>;
}

class CodegenTasks {
    private _name: string;
    private tasks: Array<CodegenTaskInfo> = [];

    constructor(name: string) {
        this._name = name;
    }

    add_task(name: string, func: () => void | Promise<void>) {
        this.tasks.push({ name: name, execute: func });
    }

    async submit(withToast: boolean = true) {
        const EditorProgress = godot.GodotJSEditorProgress;
        const progress = new EditorProgress();
        let force_wait = 24;
        progress.init(`codegen-${this._name}`, this._name, this.tasks.length);

        try {
            for (let i = 0; i < this.tasks.length; ++i) {
                const task = this.tasks[i];
                const result = task.execute();

                if (typeof result === "object" && result instanceof Promise) {
                    progress.set_state_name(task.name);
                    progress.set_current(i);
                    await result;
                } else {
                    if (!(i % force_wait)) {
                        progress.set_state_name(task.name);
                        progress.set_current(i);
                        await frame_step();
                    }
                }
            }

            progress.finish();
            if (withToast) {
                toast(`${this._name} generated successfully`);
            }
        } catch (e) {
            console.error(`CodegenTask ${this._name} error:`, e);
            toast(`${this._name} failed!`);
            progress.finish();
        }
    }
}

const PredefinedLines = [
    "type byte = number",
    "type int32 = number",
    "type int64 = number /* || bigint */",
    "type float32 = number",
    "type float64 = number",
    "type uint32 = number",
    "type StringName = string",
    "type unresolved = any",
];

const KeywordReplacement: { [name: string]: string } = {
    ["default"]: "default_",
    ["let"]: "let_",
    ["var"]: "var_",
    ["const"]: "const_",
    ["of"]: "of_",
    ["for"]: "for_",
    ["in"]: "in_",
    ["out"]: "out_",
    ["with"]: "with_",
    ["break"]: "break_",
    ["else"]: "else_",
    ["enum"]: "enum_",
    ["class"]: "class_",
    ["string"]: "string_",
    ["Symbol"]: "Symbol_",
    ["typeof"]: "typeof_",
    ["arguments"]: "arguments_",
    ["function"]: "function_",

    // a special item which used as the name of variadic arguments placement
    ["varargs"]: "varargs_",
};

const RemappedPrimitiveTypeNames: Partial<Record<Godot.Variant.Type, string>> = {
    [godot.Variant.Type.TYPE_NIL]: "any",
    [godot.Variant.Type.TYPE_BOOL]: "boolean",
    [godot.Variant.Type.TYPE_INT]: "int64",
    [godot.Variant.Type.TYPE_FLOAT]: "float64",
    [godot.Variant.Type.TYPE_STRING]: "string",
};

const VariantTypeNames = (function (): Map<Godot.Variant.Type, string> {
    const variant_name_map = new Map<Godot.Variant.Type, string>();
    for (const variant_type of Object.values(godot.Variant.Type)) {
        if (typeof variant_type !== "number" || variant_type === godot.Variant.Type.TYPE_MAX) {
            continue;
        }
        const name = RemappedPrimitiveTypeNames[variant_type] ?? jsb.internal.names.get_variant_type(variant_type);
        variant_name_map.set(variant_type, name);
    }
    return variant_name_map;
})();

const GlobalUtilityFuncs = [
    {
        description: "shorthand for getting project settings",
        method: "function GLOBAL_GET(entry_path: StringName): any",
    },

    {
        description: [
            "shorthand for getting editor settings",
            "NOTE: calling before EditorSettings created will cause null reference exception.",
        ],
        method: "function EDITOR_GET(entry_path: StringName): any",
    },
];

const VariantNames = (function (): Partial<Record<string, Godot.Variant.Type>> {
    const name_map: Partial<Record<string, Godot.Variant.Type>> = {};
    for (const variant_type of Object.values(godot.Variant.Type)) {
        if (typeof variant_type !== "number" || variant_type === godot.Variant.Type.TYPE_MAX) {
            continue;
        }
        name_map[godot.type_string(variant_type)] = variant_type; // Godot internal
        name_map[VariantTypeNames.get(variant_type)!] = variant_type; // GodotJS name
    }
    return name_map;
})();

function get_js_array_type_name(element_type_name: string | undefined) {
    if (typeof element_type_name === "undefined" || element_type_name.length == 0) return "";

    // avoid using Array due to the naming conflicts between Godot and JavaScript builtin types
    // return `Array<${element_type_name}>`;
    return `${element_type_name}[]`;
}

function join_type_name(...args: (string | undefined)[]) {
    return args.filter((value) => typeof value === "string" && value.length != 0).join(" | ");
}

function get_primitive_type_name_as_input(type: Variant.Type): string | undefined {
    const primitive_name = VariantTypeNames.get(type);
    switch (type) {
        case godot.Variant.Type.TYPE_PACKED_COLOR_ARRAY:
            return join_type_name(
                primitive_name,
                get_js_array_type_name(VariantTypeNames.get(godot.Variant.Type.TYPE_COLOR)),
            );
        case godot.Variant.Type.TYPE_PACKED_VECTOR2_ARRAY:
            return join_type_name(
                primitive_name,
                get_js_array_type_name(VariantTypeNames.get(godot.Variant.Type.TYPE_VECTOR2)),
            );
        case godot.Variant.Type.TYPE_PACKED_VECTOR3_ARRAY:
            return join_type_name(
                primitive_name,
                get_js_array_type_name(VariantTypeNames.get(godot.Variant.Type.TYPE_VECTOR3)),
            );
        case godot.Variant.Type.TYPE_PACKED_STRING_ARRAY:
            return join_type_name(primitive_name, get_js_array_type_name("string"));
        case godot.Variant.Type.TYPE_PACKED_FLOAT32_ARRAY:
            return join_type_name(primitive_name, get_js_array_type_name("float32"));
        case godot.Variant.Type.TYPE_PACKED_FLOAT64_ARRAY:
            return join_type_name(primitive_name, get_js_array_type_name("float64"));
        case godot.Variant.Type.TYPE_PACKED_INT32_ARRAY:
            return join_type_name(primitive_name, get_js_array_type_name("int32"));
        case godot.Variant.Type.TYPE_PACKED_INT64_ARRAY:
            return join_type_name(primitive_name, get_js_array_type_name("int64"));
        case godot.Variant.Type.TYPE_PACKED_BYTE_ARRAY:
            return join_type_name(primitive_name, get_js_array_type_name("byte"), "ArrayBuffer");
        case godot.Variant.Type.TYPE_NODE_PATH:
            return join_type_name(primitive_name, "string");
        default:
            return primitive_name;
    }
}

function replace_var_name(name: string) {
    const rep = KeywordReplacement[name];
    return typeof rep !== "undefined" ? rep : name;
}

const needs_quotes_regex = /^(?![$_A-Za-z])|[^\w$]/;
const quoted_escape_map: Record<string, string> = {
    '"': '\\"',
    "\\": "\\\\",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
};

function name_string(name: string) {
    if (!KeywordReplacement[name] && !name.match(needs_quotes_regex) && name.length > 0) {
        return name;
    }

    return `"${name.replace(/["\\\n\r\t]/g, (match) => quoted_escape_map[match])}"`;
}

abstract class AbstractWriter implements ScopeWriter {
    abstract line(text: string): void;
    abstract concatenate(text: string): void;
    abstract get size(): number;
    abstract get lineno(): number;
    abstract finish(): void;
    abstract get types(): TypeDB;
    abstract add_import(preferred_name: string, script_resource: string, export_name?: string): void;
    abstract get_imports(): Record<string, Record<string, string>>;
    abstract resolve_import(script_resource: string): string;

    get class_doc(): GodotJsb.editor.ClassDoc | undefined {
        return undefined;
    }

    constructor() {}

    enum_(name: string): EnumWriter {
        if (name.indexOf(".") >= 0) {
            let layers = name.split(".");
            name = layers.splice(layers.length - 1)[0];
            return new EnumWriter(this.namespace_(layers.join("."), this.class_doc), name).auto();
        }
        return new EnumWriter(this, name);
    }
    namespace_(name: string, class_doc?: GodotJsb.editor.ClassDoc): NamespaceWriter {
        return new NamespaceWriter(this, name, class_doc);
    }
    interface_(
        name: string,
        generic_parameters?: undefined | Record<string, GenericParameter>,
        super_?: undefined | string,
        super_generic_arguments?: undefined | string[],
        intro?: undefined | string[],
        property_overrides?: undefined | PropertyOverrides,
    ): InterfaceWriter {
        return new InterfaceWriter(
            this,
            name,
            generic_parameters,
            super_,
            super_generic_arguments,
            intro,
            property_overrides,
        );
    }
    class_(
        name: string,
        generic_parameters: undefined | Record<string, GenericParameter>,
        super_: string,
        super_generic_arguments: undefined | string[],
        interfaces: undefined | Implements[],
        property_overrides: undefined | PropertyOverrides,
        intro: undefined | Intro,
        prelude: undefined | string[],
        singleton_mode: boolean,
        class_doc?: GodotJsb.editor.ClassDoc,
    ): ClassWriter {
        return new ClassWriter(
            this,
            name,
            generic_parameters,
            super_,
            super_generic_arguments,
            interfaces,
            intro,
            prelude,
            property_overrides,
            singleton_mode,
            class_doc,
        );
    }
    generic_(name: string): GenericWriter {
        return new GenericWriter(this, name);
    }
    property_(name: string, static_property = false): PropertyWriter {
        return new PropertyWriter(this, name, static_property);
    }
    object_(intro?: undefined | string[], property_overrides?: undefined | PropertyOverrides): ObjectWriter {
        return new ObjectWriter(this, intro, property_overrides);
    }
    // singleton_(info: GodotJsb.editor.SingletonInfo): SingletonWriter {
    //     return new SingletonWriter(this, info);
    // }
    line_comment_(text: string) {
        this.line(`// ${text}`);
    }
    append(new_line: boolean, text: string) {
        if (new_line) {
            this.line(text);
        } else {
            this.concatenate(text);
        }
    }
}

class Description {
    private result: string;

    get text() {
        return this.result;
    }

    get length() {
        return this.result.length;
    }

    private constructor(result: string) {
        this.result = result;
    }

    static forAny(description: string | undefined) {
        return new Description(description || "");
    }

    /** a link to godot official docs website is added in comment for class description */
    static forClass(types: TypeDB, class_name: string) {
        let class_doc = types.find_doc(class_name);
        let description = class_doc?.brief_description;
        let link =
            jsb.editor.VERSION_DOCS_URL.length != 0 && !!class_doc && class_name.length != 0
                ? `\n@link ${jsb.editor.VERSION_DOCS_URL}/classes/class_${class_name.toLowerCase()}.html`
                : "";
        return new Description((description || "") + link);
    }
}

class DocCommentHelper {
    static get_leading_tab(text: string) {
        let tab = "";
        for (let i = 0; i < text.length; ++i) {
            if (text.charAt(i) != "\t") {
                break;
            }
            tab += "\t";
        }
        return tab;
    }

    static trim_leading_tab(text: string, leading_tab: string) {
        if (leading_tab.length != 0 && text.startsWith(leading_tab)) return text.substring(leading_tab.length);
        return text;
    }

    static is_empty_or_whitespace(text: string) {
        for (let i = 0; i < text.length; ++i) {
            let c = text.charCodeAt(i);
            if (c != 32 && c != 9) {
                return false;
            }
        }
        return true;
    }

    // get rid of all `codeblocks` since the `codeblocks` elements are too long to read
    static get_simplified_description(text: string): string {
        text = this.remove_markup_content(text, 0, "[codeblocks]", "[/codeblocks]");
        text = this.remove_markup_content(text, 0, "[codeblock]", "[/codeblock]");
        text = this.replace_markup_content(text, 0, "[code]", "`");
        text = this.replace_markup_content(text, 0, "[/code]", "`");
        text = this.replace_markup_content(text, 0, "[b]Note:[/b]", "  \n**Note:**");
        text = this.replace_markup_content(text, 0, "[b]", "**");
        text = this.replace_markup_content(text, 0, "[/b]", "**");
        text = this.replace_markup_content(text, 0, "[i]", " *");
        text = this.replace_markup_content(text, 0, "[/i]", "* ");
        if (jsb.editor.VERSION_DOCS_URL.length != 0) {
            text = this.replace_markup_content(text, 0, "$DOCS_URL", jsb.editor.VERSION_DOCS_URL);
        }
        return text;
    }

    static replace_markup_content(text: string, from_pos: number, markup: string, rep: string): string {
        let index = text.indexOf(markup, from_pos);
        if (index >= 0) {
            return this.replace_markup_content(
                text.substring(0, index) + rep + text.substring(index + markup.length),
                index + rep.length,
                markup,
                rep,
            );
        }
        return text;
    }

    static remove_markup_content(text: string, from_pos: number, markup_begin: string, markup_end: string): string {
        let start = text.indexOf(markup_begin, from_pos);
        if (start >= 0) {
            let end = text.indexOf(markup_end, from_pos);
            if (end >= 0) {
                return this.remove_markup_content(
                    text.substring(0, start) + text.substring(end + markup_end.length),
                    start,
                    markup_begin,
                    markup_end,
                );
            }
        }
        return text;
    }

    static write(
        writer: CodeWriter,
        description: Description | string | string[] | undefined,
        newline: boolean,
    ): boolean {
        if (typeof description === "undefined" || description.length == 0) return false;
        let lines = Array.isArray(description)
            ? description
            : this.get_simplified_description(
                  typeof description === "string" ? Description.forAny(description).text : description.text,
              )
                  .replace("\r\n", "\n")
                  .split("\n");
        if (lines.length > 0 && this.is_empty_or_whitespace(lines[0])) lines.splice(0, 1);
        if (lines.length > 0 && this.is_empty_or_whitespace(lines[lines.length - 1])) lines.splice(lines.length - 1, 1);
        if (lines.length == 0) return false;
        let leading_tab = this.get_leading_tab(lines[0]);
        lines = lines.map((value) => this.trim_leading_tab(value, leading_tab));
        if (newline) writer.line("");
        if (lines.length == 1) {
            writer.line(`/** ${lines[0]} */`);
            return true;
        }
        for (let i = 0; i < lines.length; ++i) {
            // additional tailing whitespaces for better text format rendered
            if (i == 0) {
                writer.line(`/** ${lines[i]}  `);
            } else {
                writer.line(` *  ${lines[i]}  `);
            }
        }
        writer.line(` */`);
        return true;
    }
}

abstract class BufferingWriter extends AbstractWriter {
    protected _base: ScopeWriter;
    protected _lines: string[];
    protected _size: number = 0;

    constructor(base: ScopeWriter) {
        super();
        this._base = base;
        this._lines = [];
    }

    get size() {
        return this._size;
    }
    get lineno() {
        return this._lines.length;
    }
    get types() {
        return this._base.types;
    }

    add_import(preferred_name: string, script_resource: string, export_name: string = "default") {
        this._base.add_import(preferred_name, script_resource, export_name);
    }

    get_imports(): Record<string, Record<string, string>> {
        return this._base.get_imports();
    }

    resolve_import(script_resource: string): string {
        return this._base.resolve_import(script_resource);
    }

    abstract buffered_size(text: string, new_line: boolean): number;

    line(text: string): void {
        this._lines.push(text);
        this._size += this.buffered_size(text, this._lines.length > 1);
    }

    concatenate(text: string): void {
        if (this._lines.length > 0) {
            this._lines[this._lines.length - 1] += text;
            this._size += this.buffered_size(text, false);
        } else {
            this.line(text);
        }
    }
}

class IndentWriter extends BufferingWriter {
    protected _never_collapse: boolean;
    protected _indent_first_line: boolean;

    constructor(base: ScopeWriter, always_multiline = false, indent_first_line = true) {
        super(base);
        this._never_collapse = always_multiline;
        this._indent_first_line = indent_first_line;
    }

    finish() {
        const lines = this._lines;

        if (lines.length === 0) {
            return;
        }

        if (lines.length === 1 && !this._never_collapse) {
            this._base.concatenate(lines[0]);
            return;
        }

        if (this._indent_first_line) {
            this._base.line(tab + lines[0]);
        } else {
            this._base.line(lines[0]);
        }

        for (let i = 1, l = lines.length; i < l; i++) {
            this._base.line(tab + lines[i]);
        }
    }

    buffered_size(text: string, new_line: boolean): number {
        return text.length + (this._lines.length > 1 || this._indent_first_line ? tab.length : 0) + (new_line ? 1 : 0);
    }
}

export enum DescriptorType {
    Godot,
    User,
    FunctionLiteral,
    ObjectLiteral,
    StringLiteral,
    NumericLiteral,
    BooleanLiteral,
    Union,
    Intersection,
    Conditional,
    Tuple,
    Infer,
    Mapped,
    Indexed,
}

/**
 * Reference to a built-in type, either declared in the 'godot' namespace, or available as part of the standard library.
 */
export type GodotTypeDescriptor = GDictionary<{
    type: DescriptorType.Godot;
    name: string;
    /**
     * Generic arguments.
     */
    arguments?: GArray<TypeDescriptor>;
}>;

/**
 * Reference to a user defined type. A path must be specified so that the generated code is able to import the file
 * where the type is declared/exported.
 */
export type UserTypeDescriptor = GDictionary<{
    type: DescriptorType.User;
    /**
     * res:// style path to the TypeScript module where this type is exported.
     */
    resource: ExtractValueKeys<ResourceTypes, Script>;
    /**
     * Preferred type name to use when importing.
     */
    name: string;
    /**
     * Named module export that is being imported. When omitted, the default export is imported.
     */
    export?: string;
    /**
     * Generic arguments.
     */
    arguments?: GArray<TypeDescriptor>;
}>;

export type GenericParameterDescriptor = GDictionary<{
    name: string;
    extends?: TypeDescriptor;
    default?: TypeDescriptor;
}>;

export type ParameterDescriptor = GDictionary<{
    name: string;
    type: TypeDescriptor;
    optional?: boolean;
}>;

export type FunctionLiteralTypeDescriptor = GDictionary<{
    type: DescriptorType.FunctionLiteral;
    generics?: GArray<GenericParameterDescriptor>;
    parameters?: GArray<ParameterDescriptor>;
    returns?: TypeDescriptor;
}>;

export type OptionalTypeDescriptor<Descriptor extends GDictionary> =
    Descriptor extends GDictionary<infer T> ? GDictionary<T & { optional?: boolean }> : never;

export type ObjectLiteralTypeDescriptor = GDictionary<{
    type: DescriptorType.ObjectLiteral;
    properties?: GDictionary<Partial<Record<string, OptionalTypeDescriptor<TypeDescriptor>>>>;
    index?: GDictionary<{
        key: TypeDescriptor;
        value: TypeDescriptor;
    }>;
}>;

export type StringLiteralTypeDescriptor = GDictionary<{
    type: DescriptorType.StringLiteral;
    value: string;
    template?: boolean; // Indicates whether the literal represents a template literal denoted by backticks.
}>;

export type NumberLiteralTypeDescriptor = GDictionary<{
    type: DescriptorType.NumericLiteral;
    value: number;
}>;

export type BooleanLiteralTypeDescriptor = GDictionary<{
    type: DescriptorType.BooleanLiteral;
    value: boolean;
}>;

export type TupleElementDescriptor = GDictionary<{
    name?: string; // Optional name for the tuple element.
    type: TypeDescriptor;
}>;

export type TupleTypeDescriptor = GDictionary<{
    type: DescriptorType.Tuple;
    elements: GArray<TupleElementDescriptor>; // Represents the types and optional names of each element in the tuple.
}>;

export type UnionTypeDescriptor = GDictionary<{
    type: DescriptorType.Union;
    types: GArray<TypeDescriptor>;
}>;

export type IntersectionTypeDescriptor = GDictionary<{
    type: DescriptorType.Intersection;
    types: GArray<TypeDescriptor>;
}>;

export type InferTypeDescriptor = GDictionary<{
    type: DescriptorType.Infer;
    name: string; // The name of the inferred type (e.g., `U` in `infer U`).
}>;

export type ConditionalTypeDescriptor = GDictionary<{
    type: DescriptorType.Conditional;
    check: TypeDescriptor;
    extends: TypeDescriptor;
    true: TypeDescriptor;
    false: TypeDescriptor;
}>;

export type MappedTypeDescriptor = GDictionary<{
    type: DescriptorType.Mapped;
    key: string;
    in: TypeDescriptor;
    as?: TypeDescriptor;
    value: TypeDescriptor;
}>;

export type IndexedTypeDescriptor = GDictionary<{
    type: DescriptorType.Indexed;
    base: TypeDescriptor;
    index: TypeDescriptor;
}>;

export type TypeDescriptor =
    | GodotTypeDescriptor
    | UserTypeDescriptor
    | FunctionLiteralTypeDescriptor
    | ObjectLiteralTypeDescriptor
    | StringLiteralTypeDescriptor
    | NumberLiteralTypeDescriptor
    | BooleanLiteralTypeDescriptor
    | TupleTypeDescriptor
    | UnionTypeDescriptor
    | IntersectionTypeDescriptor
    | InferTypeDescriptor
    | ConditionalTypeDescriptor
    | MappedTypeDescriptor
    | IndexedTypeDescriptor;

/**
 * Codegen analogue of NodePathMap.
 */
export type NodeTypeDescriptorPathMap = GDictionary<Partial<Record<string, TypeDescriptor>>>;

export enum CodeGenType {
    ScriptNodeTypeDescriptor,
    ScriptResourceTypeDescriptor,
}

/**
 * Handle a NodeTypeDescriptorCodeGenRequest to overwrite the generated type for nodes using this script.
 */
export type ScriptNodeTypeDescriptorCodeGenRequest = GDictionary<{
    type: CodeGenType.ScriptNodeTypeDescriptor;
    node: Node;
    children: NodeTypeDescriptorPathMap;
}>;

/**
 * Handle a ScriptResourceTypeDescriptorCodeGenRequest to overwrite the generated type for resources using this script.
 */
export type ScriptResourceTypeDescriptorCodeGenRequest = GDictionary<{
    type: CodeGenType.ScriptResourceTypeDescriptor;
    resource: Resource;
}>;

// These types are dynamically generated so that these runtime types support camel-case bindings. Unfortunately, this
// doesn't scale very well. If we find ourselves adding/editing these often, then we should consider shipping two sets
// of runtime types instead of generating them on the fly. However, we'd need to use something like ts-morph to convert
// the snake_case .d.ts to camelCase. With TS7/tsgo on the horizon, there are additional concerns with that approach.
const annotation_types = {
    ClassBinder: godot.GDictionary.create<IntersectionTypeDescriptor>({
        type: DescriptorType.Intersection,
        types: [
            {
                type: DescriptorType.FunctionLiteral,
                parameters: [],
                returns: {
                    type: DescriptorType.FunctionLiteral,
                    parameters: [
                        { name: "target", type: { type: DescriptorType.Godot, name: "GObjectConstructor" } },
                        {
                            name: "context",
                            type: { type: DescriptorType.Godot, name: "ClassDecoratorContext" },
                        },
                    ],
                },
            },
            {
                type: DescriptorType.ObjectLiteral,
                properties: {
                    tool: {
                        type: DescriptorType.FunctionLiteral,
                        parameters: [],
                        returns: {
                            type: DescriptorType.FunctionLiteral,
                            parameters: [
                                { name: "target", type: { type: DescriptorType.Godot, name: "GObjectConstructor" } },
                                {
                                    name: "_context",
                                    type: { type: DescriptorType.Godot, name: "ClassDecoratorContext" },
                                },
                            ],
                        },
                    },
                    icon: {
                        type: DescriptorType.FunctionLiteral,
                        parameters: [{ name: "path", type: { type: DescriptorType.Godot, name: "string" } }],
                        returns: {
                            type: DescriptorType.FunctionLiteral,
                            parameters: [
                                { name: "target", type: { type: DescriptorType.Godot, name: "GObjectConstructor" } },
                                {
                                    name: "_context",
                                    type: { type: DescriptorType.Godot, name: "ClassDecoratorContext" },
                                },
                            ],
                        },
                    },
                    export: {
                        type: DescriptorType.Intersection,
                        types: [
                            {
                                type: DescriptorType.FunctionLiteral,
                                parameters: [
                                    { name: "type", type: { type: DescriptorType.Godot, name: "Godot.Variant.Type" } },
                                    {
                                        name: "options",
                                        type: { type: DescriptorType.Godot, name: "ExportOptions" },
                                        optional: true,
                                    },
                                ],
                                returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                            },
                            {
                                type: DescriptorType.ObjectLiteral,
                                properties: {
                                    multiline: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    range: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            { name: "min", type: { type: DescriptorType.Godot, name: "number" } },
                                            { name: "max", type: { type: DescriptorType.Godot, name: "number" } },
                                            { name: "step", type: { type: DescriptorType.Godot, name: "number" } },
                                            {
                                                name: "...extra_hints",
                                                type: { type: DescriptorType.Godot, name: "string[]" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    [names.get_member("range_int")]: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            { name: "min", type: { type: DescriptorType.Godot, name: "number" } },
                                            { name: "max", type: { type: DescriptorType.Godot, name: "number" } },
                                            { name: "step", type: { type: DescriptorType.Godot, name: "number" } },
                                            {
                                                name: "...extra_hints",
                                                type: { type: DescriptorType.Godot, name: "string[]" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    file: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "filter",
                                                type: { type: DescriptorType.Godot, name: "string" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    dir: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "filter",
                                                type: { type: DescriptorType.Godot, name: "string" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    [names.get_member("global_file")]: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "filter",
                                                type: { type: DescriptorType.Godot, name: "string" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    [names.get_member("global_dir")]: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "filter",
                                                type: { type: DescriptorType.Godot, name: "string" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    [names.get_member("exp_easing")]: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "hint",
                                                optional: true,
                                                type: {
                                                    type: DescriptorType.Union,
                                                    types: [
                                                        { type: DescriptorType.StringLiteral, value: "" },
                                                        { type: DescriptorType.StringLiteral, value: "attenuation" },
                                                        { type: DescriptorType.StringLiteral, value: "positive_only" },
                                                        {
                                                            type: DescriptorType.StringLiteral,
                                                            value: "attenuation,positive_only",
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    array: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "clazz",
                                                type: { type: DescriptorType.Godot, name: "ClassSpecifier" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    dictionary: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "key_class",
                                                type: { type: DescriptorType.Godot, name: "VariantConstructor" },
                                            },
                                            {
                                                name: "value_class",
                                                type: { type: DescriptorType.Godot, name: "VariantConstructor" },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    object: {
                                        type: DescriptorType.FunctionLiteral,
                                        generics: [
                                            {
                                                name: "Constructor",
                                                extends: { type: DescriptorType.Godot, name: "GObjectConstructor" },
                                            },
                                        ],
                                        parameters: [
                                            {
                                                name: "clazz",
                                                type: { type: DescriptorType.Godot, name: "Constructor" },
                                            },
                                        ],
                                        returns: {
                                            type: DescriptorType.Godot,
                                            name: "ClassMemberDecorator",
                                            arguments: [
                                                {
                                                    type: DescriptorType.Godot,
                                                    name: "ClassValueMemberDecoratorContext",
                                                    arguments: [
                                                        { type: DescriptorType.Godot, name: "unknown" },
                                                        {
                                                            type: DescriptorType.Union,
                                                            types: [
                                                                { type: DescriptorType.Godot, name: "null" },
                                                                {
                                                                    type: DescriptorType.Godot,
                                                                    name: "InstanceType",
                                                                    arguments: [
                                                                        {
                                                                            type: DescriptorType.Godot,
                                                                            name: "Constructor",
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    enum: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "enum_type",
                                                type: {
                                                    type: DescriptorType.Godot,
                                                    name: "Record",
                                                    arguments: [
                                                        { type: DescriptorType.Godot, name: "string" },
                                                        {
                                                            type: DescriptorType.Union,
                                                            types: [
                                                                { type: DescriptorType.Godot, name: "string" },
                                                                { type: DescriptorType.Godot, name: "number" },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    flags: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [
                                            {
                                                name: "enum_type",
                                                type: {
                                                    type: DescriptorType.Godot,
                                                    name: "Record",
                                                    arguments: [
                                                        { type: DescriptorType.Godot, name: "string" },
                                                        {
                                                            type: DescriptorType.Union,
                                                            types: [
                                                                { type: DescriptorType.Godot, name: "string" },
                                                                { type: DescriptorType.Godot, name: "number" },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                        returns: { type: DescriptorType.Godot, name: "ClassMemberDecorator" },
                                    },
                                    cache: {
                                        type: DescriptorType.FunctionLiteral,
                                        parameters: [],
                                        returns: {
                                            type: DescriptorType.Godot,
                                            name: "ClassMemberDecorator",
                                            arguments: [
                                                {
                                                    type: DescriptorType.Union,
                                                    types: [
                                                        {
                                                            type: DescriptorType.Godot,
                                                            name: "ClassAccessorDecoratorContext",
                                                            arguments: [
                                                                {
                                                                    type: DescriptorType.Godot,
                                                                    name: `Godot.${names.get_class("Object")}`,
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            type: DescriptorType.Godot,
                                                            name: "ClassSetterDecoratorContext",
                                                            arguments: [
                                                                {
                                                                    type: DescriptorType.Godot,
                                                                    name: `Godot.${names.get_class("Object")}`,
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    signal: {
                        type: DescriptorType.FunctionLiteral,
                        parameters: [],
                        returns: {
                            type: DescriptorType.FunctionLiteral,
                            generics: [
                                {
                                    name: "Context",
                                    extends: {
                                        type: DescriptorType.Union,
                                        types: [
                                            {
                                                type: DescriptorType.Godot,
                                                name: "ClassAccessorDecoratorContext",
                                                arguments: [
                                                    {
                                                        type: DescriptorType.Godot,
                                                        name: `Godot.${names.get_class("Object")}`,
                                                    },
                                                    { type: DescriptorType.Godot, name: "Godot.Signal" },
                                                ],
                                            },
                                            {
                                                type: DescriptorType.Godot,
                                                name: "ClassGetterDecoratorContext",
                                                arguments: [
                                                    {
                                                        type: DescriptorType.Godot,
                                                        name: `Godot.${names.get_class("Object")}`,
                                                    },
                                                    { type: DescriptorType.Godot, name: "Godot.Signal" },
                                                ],
                                            },
                                            {
                                                type: DescriptorType.Godot,
                                                name: "ClassFieldDecoratorContext",
                                                arguments: [
                                                    {
                                                        type: DescriptorType.Godot,
                                                        name: `Godot.${names.get_class("Object")}`,
                                                    },
                                                    { type: DescriptorType.Godot, name: "Godot.Signal" },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            ],
                            parameters: [
                                { name: "_target", type: { type: DescriptorType.Godot, name: "unknown" } },
                                { name: "context", type: { type: DescriptorType.Godot, name: "Context" } },
                            ],
                            returns: {
                                type: DescriptorType.Godot,
                                name: "ClassMemberDecoratorReturn",
                                arguments: [{ type: DescriptorType.Godot, name: "Context" }],
                            },
                        },
                    },
                    rpc: {
                        type: DescriptorType.FunctionLiteral,
                        parameters: [
                            {
                                name: "config",
                                type: { type: DescriptorType.Godot, name: names.get_class("RPCConfig") },
                                optional: true,
                            },
                        ],
                        returns: {
                            type: DescriptorType.FunctionLiteral,
                            parameters: [
                                { name: "_target", type: { type: DescriptorType.Godot, name: "Function" } },
                                {
                                    name: "context",
                                    type: {
                                        type: DescriptorType.Union,
                                        types: [
                                            {
                                                type: DescriptorType.Godot,
                                                name: "string",
                                            },
                                            { type: DescriptorType.Godot, name: "ClassMethodDecoratorContext" },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    onready: {
                        type: DescriptorType.FunctionLiteral,
                        parameters: [
                            {
                                name: "evaluator",
                                type: {
                                    type: DescriptorType.Union,
                                    types: [
                                        { type: DescriptorType.Godot, name: "string" },
                                        { type: DescriptorType.Godot, name: "GodotJsb.internal.OnReadyEvaluatorFunc" },
                                    ],
                                },
                            },
                        ],
                        returns: {
                            type: DescriptorType.FunctionLiteral,
                            parameters: [
                                { name: "_target", type: { type: DescriptorType.Godot, name: "undefined" } },
                                {
                                    name: "context",
                                    type: {
                                        type: DescriptorType.Union,
                                        types: [
                                            {
                                                type: DescriptorType.Godot,
                                                name: "string",
                                            },
                                            { type: DescriptorType.Godot, name: "ClassMethodDecoratorContext" },
                                        ],
                                    },
                                },
                            ],
                        },
                    }
                },
            },
        ],
    }),
    ExportOptions: godot.GDictionary.create<ObjectLiteralTypeDescriptor>({
        type: DescriptorType.ObjectLiteral,
        properties: {
            class: {
                type: DescriptorType.Godot,
                name: "any",
                optional: true,
            },
            hint: {
                type: DescriptorType.Godot,
                name: "Godot.PropertyHint",
                optional: true,
            },
            [names.get_member("hint_string")]: {
                type: DescriptorType.Godot,
                name: "string",
                optional: true,
            },
            usage: {
                type: DescriptorType.Godot,
                name: "Godot.PropertyUsageFlags",
                optional: true,
            },
        },
    }),
    RPCConfig: godot.GDictionary.create<ObjectLiteralTypeDescriptor>({
        type: DescriptorType.ObjectLiteral,
        properties: {
            mode: {
                type: DescriptorType.Godot,
                name: `Godot.${names.get_class("MultiplayerAPI")}.${names.get_enum("RPCMode")}`,
                optional: true,
            },
            sync: {
                type: DescriptorType.Union,
                types: [
                    {
                        type: DescriptorType.StringLiteral,
                        value: "call_remote",
                    },
                    {
                        type: DescriptorType.StringLiteral,
                        value: "call_local",
                    },
                ],
                optional: true,
            },
            [names.get_member("transfer_mode")]: {
                type: DescriptorType.Godot,
                name: "Godot.MultiplayerPeer.TransferMode",
                optional: true,
            },
            [names.get_member("transfer_channel")]: {
                type: DescriptorType.Godot,
                name: "number",
                optional: true,
            },
        },
    }),
};

export type CodeGenRequest = ScriptNodeTypeDescriptorCodeGenRequest | ScriptResourceTypeDescriptorCodeGenRequest;

/**
 * You can manipulate GodotJS' codegen by exporting a function from your script/module called `codegen`.
 */
export type CodeGenHandler = (request: CodeGenRequest) => undefined | TypeDescriptor;

class TypeDescriptorWriter extends BufferingWriter {
    protected _concatenate_first_line = false;

    constructor(base: ScopeWriter, concatenate_first_line = false) {
        super(base);
        this._concatenate_first_line = concatenate_first_line;
    }

    buffered_size(text: string, new_line: boolean): number {
        return text.length + (new_line ? 1 : 0);
    }

    finish() {
        const lines = this._lines;
        for (let i = 0, l = lines.length; i < l; i++) {
            if (i === 0 && this._concatenate_first_line) {
                this._base.concatenate(lines[i]);
            } else {
                this._base.line(lines[i]);
            }
        }
    }

    serialize_type_descriptor(descriptor: GReadProxyValueWrap<TypeDescriptor>): void {
        switch (descriptor.type) {
            case DescriptorType.Godot: {
                if (!descriptor.name) {
                    throw new Error("Invalid User type descriptor: missing name");
                }

                if (descriptor.arguments?.length) {
                    this.line(`${descriptor.name}<`);
                    const indent = new IndentWriter(this);
                    const args = new TypeDescriptorWriter(indent);
                    descriptor.arguments.forEach((arg, index) => {
                        if (index > 0) {
                            args.concatenate(",");
                        }

                        args.serialize_type_descriptor(arg);
                    });
                    args.finish();
                    indent.finish();
                    this.append(indent.lineno > 1, `>`);
                } else {
                    this.line(descriptor.name);
                }
                break;
            }
            case DescriptorType.User: {
                if (!descriptor.name) {
                    throw new Error("Invalid User type descriptor: missing name");
                }

                if (descriptor.arguments) {
                    this.line(`${descriptor.name}<`);
                    const indent = new IndentWriter(this);
                    const args = new TypeDescriptorWriter(indent, false);
                    descriptor.arguments.forEach((arg, index) => {
                        if (index > 0) {
                            args.concatenate(",");
                        }

                        args.serialize_type_descriptor(arg);
                    });
                    args.finish();
                    indent.finish();
                    this.append(indent.lineno > 1, `>`);
                } else {
                    this.line(descriptor.name);
                }

                this.add_import(descriptor.name, descriptor.resource, descriptor.export);
                break;
            }

            case DescriptorType.FunctionLiteral: {
                const generic_count = descriptor.generics ? Object.entries(descriptor.generics).length : 0;

                if (generic_count > 0) {
                    this.concatenate("<");
                    descriptor.generics!.forEach((generic, index) => {
                        if (index > 0) {
                            this.concatenate(", ");
                            this.line(generic.name);
                        } else {
                            this.append(generic_count === 1, generic.name);
                        }

                        if (generic.extends) {
                            this.concatenate(" extends ");
                            const extends_writer = new TypeDescriptorWriter(this, true);
                            extends_writer.serialize_type_descriptor(generic.extends);
                            extends_writer.finish();
                        }

                        if (generic.default) {
                            this.concatenate(" = ");
                            const default_writer = new TypeDescriptorWriter(this, true);
                            default_writer.serialize_type_descriptor(generic.default);
                            default_writer.finish();
                        }
                    });
                    this.concatenate(">");
                }

                this.append(generic_count == 0, `(`);

                if (descriptor.parameters) {
                    const indent = new IndentWriter(this);

                    descriptor.parameters.forEach((param, index) => {
                        if (index > 0) {
                            indent.concatenate(", ");
                        }

                        indent.line(`${param.name}${param.optional ? "?" : ""}: `);

                        const param_writer = new TypeDescriptorWriter(indent, true);
                        param_writer.serialize_type_descriptor(param.type);
                        param_writer.finish();
                    });

                    indent.finish();
                }

                this.append(this.lineno > 1, ") => ");

                if (descriptor.returns) {
                    const indent = new IndentWriter(this, false);
                    const return_type = descriptor.returns.type;
                    const parenthesis_required =
                        return_type === DescriptorType.Union ||
                        return_type === DescriptorType.Intersection ||
                        return_type === DescriptorType.FunctionLiteral ||
                        return_type === DescriptorType.Conditional;

                    if (parenthesis_required) {
                        indent.line("(");
                    }

                    const return_writer = new TypeDescriptorWriter(indent, parenthesis_required);
                    return_writer.serialize_type_descriptor(descriptor.returns);
                    return_writer.finish();

                    if (parenthesis_required) {
                        indent.concatenate(")");
                    }

                    indent.finish();
                } else {
                    this.concatenate("void");
                }

                break;
            }

            case DescriptorType.ObjectLiteral: {
                const properties = descriptor.properties ? Object.entries(descriptor.properties) : [];

                if (properties.length === 0 && !descriptor.index) {
                    this.line("{}");
                    break;
                }

                this.line("{");
                const indent = new IndentWriter(this, true);
                properties.forEach(([key, value]) => {
                    if (!value) {
                        return;
                    }

                    indent.line(`${name_string(key)}${value.optional ? "?" : ""}: `);
                    const prop_writer = new TypeDescriptorWriter(indent, true);
                    prop_writer.serialize_type_descriptor(value);
                    prop_writer.finish();
                    indent.concatenate(";");
                });

                if (descriptor.index) {
                    indent.line("[key: ");
                    const key_writer = new TypeDescriptorWriter(indent, true);
                    key_writer.serialize_type_descriptor(descriptor.index.key);
                    key_writer.finish();
                    indent.concatenate("]: ");
                    const value_writer = new TypeDescriptorWriter(indent, true);
                    value_writer.serialize_type_descriptor(descriptor.index.value);
                    value_writer.finish();
                    indent.concatenate(";");
                }

                indent.finish();
                this.line("}");
                break;
            }

            case DescriptorType.StringLiteral: {
                this.line(
                    descriptor.template
                        ? `\`${descriptor.value.replace(/`/g, "\\`")}\``
                        : `"${descriptor.value.replace(/"/g, '\\"')}"`,
                );
                break;
            }

            case DescriptorType.NumericLiteral: {
                this.line(`${descriptor.value}`);
                break;
            }

            case DescriptorType.BooleanLiteral: {
                this.line(`${descriptor.value}`);
                break;
            }

            case DescriptorType.Tuple: {
                this.line(`[`);
                const multiline = descriptor.elements.length > 1;
                descriptor.elements.forEach((element, index) => {
                    if (index > 0) {
                        this.line(", ");
                    }

                    if (element.name) {
                        this.append(multiline, `${element.name}: `);
                    }

                    const tuple_writer = new TypeDescriptorWriter(this, !multiline || !!element.name);
                    tuple_writer.serialize_type_descriptor(element.type);
                    tuple_writer.finish();
                });
                this.append(multiline, "]");
                break;
            }

            case DescriptorType.Union:
            case DescriptorType.Intersection: {
                const multiline = descriptor.types.length > 1;
                const separator =
                    descriptor.type === DescriptorType.Union
                        ? `${multiline ? "" : " "}| `
                        : `${multiline ? "" : " "}& `;
                const members = new IndentWriter(this, true, false);

                descriptor.types.forEach((type, index) => {
                    if (index > 0) {
                        members.line(separator);
                    }

                    const member_type = type.type;
                    const parenthesis_required =
                        member_type === DescriptorType.Union ||
                        member_type === DescriptorType.Intersection ||
                        member_type === DescriptorType.FunctionLiteral ||
                        member_type === DescriptorType.Conditional;

                    if (parenthesis_required) {
                        members.append(index === 0, "(");
                    }

                    const member = new TypeDescriptorWriter(members, parenthesis_required || index > 0);
                    member.serialize_type_descriptor(type);
                    member.finish();

                    if (parenthesis_required) {
                        members.concatenate(")");
                    }
                });

                members.finish();
                break;
            }

            case DescriptorType.Infer: {
                this.line(`infer ${descriptor.name}`);
                break;
            }

            case DescriptorType.Conditional: {
                const check_writer = new TypeDescriptorWriter(this);
                check_writer.serialize_type_descriptor(descriptor.check);
                check_writer.finish();

                this.line("extends ");
                const extends_writer = new TypeDescriptorWriter(this, true);
                extends_writer.serialize_type_descriptor(descriptor.extends);
                extends_writer.finish();

                this.line("? ");
                const true_writer = new TypeDescriptorWriter(this, true);
                true_writer.serialize_type_descriptor(descriptor.true);
                true_writer.finish();

                this.line(": ");
                const false_writer = new TypeDescriptorWriter(this, true);
                false_writer.serialize_type_descriptor(descriptor.false);
                false_writer.finish();

                break;
            }

            case DescriptorType.Mapped: {
                this.line(`{ [${descriptor.key} in `);
                const in_writer = new TypeDescriptorWriter(this, true);
                in_writer.serialize_type_descriptor(descriptor.in);
                in_writer.finish();

                if (descriptor.as) {
                    const as_writer = new TypeDescriptorWriter(this, true);
                    as_writer.serialize_type_descriptor(descriptor.as);
                    as_writer.finish();
                }

                this.concatenate(`]: `);

                const value_start_line = this.lineno;
                const value_writer = new TypeDescriptorWriter(this, true);
                value_writer.serialize_type_descriptor(descriptor.value);
                value_writer.finish();
                this.append(this.lineno === value_start_line, "}");

                break;
            }

            case DescriptorType.Indexed: {
                const base_writer = new TypeDescriptorWriter(this);
                base_writer.serialize_type_descriptor(descriptor.base);
                base_writer.finish();

                this.concatenate(`[`);
                const index_writer = new TypeDescriptorWriter(this, true);
                index_writer.serialize_type_descriptor(descriptor.index);
                index_writer.finish();
                this.concatenate("]");
                break;
            }
        }
    }
}

class ModuleWriter extends IndentWriter {
    protected _name: string;

    constructor(base: ScopeWriter, name: string) {
        super(base, true);
        this._name = name;
    }

    finish() {
        for (const [script_resource, script_import_map] of Object.entries(this.get_imports())) {
            const script_imports = Object.entries(script_import_map);
            const default_import = script_import_map["default"];
            const resolved_path = this.resolve_import(script_resource).replace(/"/g, '"');
            const explicit_imports = script_imports.length > (default_import ? 1 : 0);

            if (default_import) {
                if (explicit_imports) {
                    this._base.line(`import ${default_import}, {`);
                } else {
                    this._base.line(`import ${default_import} from "${resolved_path}";`);
                }
            } else {
                this._base.line(`import ${default_import}, {`);
            }

            if (explicit_imports) {
                for (const [name, as] of script_imports) {
                    if (name === as) {
                        this._base.line(`${tab}${name},`);
                    } else {
                        this._base.line(`${tab}${name} as ${as},`);
                    }
                }

                this._base.line(`} from "${resolved_path}";`);
            }
        }

        this._base.line(`declare module "${this._name}" {`);
        super.finish();
        this._base.line("}");
    }

    // godot utility functions must be in global scope
    utility_(method_info: GodotJsb.editor.MethodBind) {
        const args = this.types.make_args(method_info);
        const rval = this.types.make_return(method_info);

        let exposed_name = method_info.name;

        if (typeof KeywordReplacement[exposed_name] !== "undefined") {
            exposed_name = names.get_member("godot_" + exposed_name);
        }

        // some godot methods declared with special characters which can not be declared literally
        if (!this.types.is_valid_method_name(exposed_name)) {
            this.line(`// [INVALID_NAME]: function ${exposed_name}(${args}): ${rval}`);
            return;
        }

        this.line(`function ${exposed_name}(${args}): ${rval}`);
    }
}

class NamespaceWriter extends IndentWriter {
    protected _name: string;
    protected _doc?: GodotJsb.editor.ClassDoc;

    get class_doc() {
        return this._doc;
    }

    constructor(base: ScopeWriter, name: string, class_doc?: GodotJsb.editor.ClassDoc) {
        super(base, true);
        this._name = name;
        this._doc = class_doc;
    }

    finish() {
        if (this._lines.length == 0) {
            return;
        }
        this._base.line(`namespace ${this._name} {`);
        super.finish();
        this._base.line("}");
    }
}

class ClassWriter extends IndentWriter {
    protected _name: string;
    protected _generic_parameters?: Record<string, GenericParameter>;
    protected _super?: string;
    protected _super_generic_arguments?: string[];
    protected _implements?: Implements[];
    protected _intro?: Intro;
    protected _prelude?: string[];
    protected _property_overrides?: Record<string, string[] | ((line: string) => string)>;
    protected _singleton_mode: boolean;
    protected _doc?: GodotJsb.editor.ClassDoc;
    protected _separator_line = false;

    get class_doc(): GodotJsb.editor.ClassDoc | undefined {
        return this._doc;
    }

    constructor(
        base: ScopeWriter,
        name: string,
        generic_parameters: undefined | Record<string, GenericParameter>,
        super_: undefined | string,
        super_generic_arguments: undefined | string[],
        interfaces: undefined | Implements[],
        intro: undefined | Intro,
        prelude: undefined | string[],
        property_overrides: undefined | PropertyOverrides,
        singleton_mode: boolean,
        class_doc?: GodotJsb.editor.ClassDoc,
    ) {
        super(base, true);
        this._name = name;
        this._generic_parameters = generic_parameters;
        this._super = super_;
        this._super_generic_arguments = super_generic_arguments;
        this._implements = interfaces;
        this._intro = intro;
        this._prelude = prelude;
        this._property_overrides = jsb.CAMEL_CASE_BINDINGS_ENABLED
            ? camel_property_overrides(property_overrides)
            : property_overrides;
        this._singleton_mode = singleton_mode;
        this._doc = class_doc;
    }

    protected head() {
        const params = this._generic_parameters
            ? `<${Object.entries(this._generic_parameters)
                  .map(
                      ([name, p]) =>
                          `${name}${p.extends ? ` extends ${p.extends}` : ""}${p.default ? ` = ${p.default}` : ""}`,
                  )
                  .join(", ")}>`
            : "";

        let class_extends = "";

        if (typeof this._super === "string" && this._super.length > 0) {
            const args =
                this._super_generic_arguments && this._super_generic_arguments.length > 0
                    ? `<${this._super_generic_arguments.join(", ")}>`
                    : "";
            class_extends = ` extends ${this._super}${args}`;
        }

        const class_implements =
            this._implements && this._implements.length > 0
                ? ` implements ${this._implements
                      .map(({ type, generic_arguments }) => {
                          const args =
                              generic_arguments && generic_arguments.length > 0
                                  ? `<${generic_arguments.join(", ")}>`
                                  : "";
                          return `${type}${args}`;
                      })
                      .join(", ")}`
                : "";

        return `class ${this._name}${params}${class_extends}${class_implements}`;
    }

    protected make_method_prefix(method_info: GodotJsb.editor.MethodBind): string {
        return this._singleton_mode || method_info.is_static ? "static " : "";
    }

    intro() {
        if (!this._intro) {
            return;
        }

        const lines = Array.isArray(this._intro) ? this._intro : this._intro(this.types);

        for (const line of lines) {
            this._base.line(tab + line);
        }
    }

    finish() {
        this._prelude?.forEach((line) => this._base.line(line));
        DocCommentHelper.write(this._base, Description.forClass(this.types, this._name), false);
        this._base.line(`${this.head()} {`);
        this.intro();
        super.finish();
        this._base.line("}");
    }

    primitive_constant_(constant: GodotJsb.editor.PrimitiveConstantInfo) {
        DocCommentHelper.write(this, this._doc?.constants[constant.name]?.description, this._separator_line);
        this._separator_line = true;
        if (typeof constant.value !== "undefined") {
            this.line(`static readonly ${name_string(constant.name)} = ${constant.value}`);
        } else {
            const type_name = VariantTypeNames.get(constant.type);
            this.line(`static readonly ${name_string(constant.name)}: Readonly<${type_name}>`);
        }
    }

    constant_(constant: GodotJsb.editor.ConstantInfo) {
        DocCommentHelper.write(this, this._doc?.constants[constant.name]?.description, this._separator_line);
        this._separator_line = true;
        this.line(`static readonly ${name_string(constant.name)} = ${constant.value}`);
    }

    property_(name: string, static_property?: boolean): PropertyWriter;
    property_(getset_info: GodotJsb.editor.PropertySetGetInfo, static_property?: boolean): void;
    property_(
        name_or_getset_info: string | GodotJsb.editor.PropertySetGetInfo,
        static_property = false,
    ): void | PropertyWriter {
        if (typeof name_or_getset_info === "string") {
            return super.property_(name_or_getset_info, static_property);
        }

        const getset_info = name_or_getset_info;
        console.assert(getset_info.getter.length != 0);
        DocCommentHelper.write(this, this._doc?.properties[getset_info.name]?.description, this._separator_line);
        this._separator_line = true;

        const property_override = this._property_overrides?.[getset_info.name];
        if (Array.isArray(property_override)) {
            for (const line of property_override) {
                this.line(line);
            }
            return;
        }
        const line = (line: string) => this.line(property_override?.(line) ?? line);
        const name = name_string(getset_info.name);

        // declare as get/set to avoid the pitfalls of modifying a value type return value
        // `node.position.x = 0;` (Although, it works in GDScript)
        //
        // It's not an error in javascript which is more dangerous :( the actually modifed value is just a copy of `node.position`.

        line(
            `${static_property ? "static " : ""}get ${name}(): ${this.types.make_typename(getset_info.info, false, false)}`,
        );
        if (getset_info.setter.length != 0) {
            line(
                `${static_property ? "static " : ""}set ${name}(value: ${this.types.make_typename(getset_info.info, true, false)})`,
            );
        }
    }

    primitive_property_(property_info: GodotJsb.editor.PrimitiveGetSetInfo) {
        this._separator_line = true;

        const name = name_string(property_info.name);
        this.line(`get ${name}(): ${VariantTypeNames.get(property_info.type)}`);
        this.line(`set ${name}(value: ${get_primitive_type_name_as_input(property_info.type)})`);
    }

    constructor_(constructor_info: GodotJsb.editor.ConstructorInfo) {
        this._separator_line = true;
        const args = constructor_info.arguments
            .map((it) => `${replace_var_name(it.name)}: ${get_primitive_type_name_as_input(it.type)}`)
            .join(", ");
        this.line(`constructor(${args})`);
    }

    constructor_ex_() {
        this.line(`constructor(identifier?: any)`);
    }

    operator_(operator_info: GodotJsb.editor.OperatorInfo) {
        this._separator_line = true;
        const return_type_name = VariantTypeNames.get(operator_info.return_type);
        const left_type_name = get_primitive_type_name_as_input(operator_info.left_type);
        if (operator_info.right_type == godot.Variant.Type.TYPE_NIL) {
            this.line(`static ${operator_info.name}(left: ${left_type_name}): ${return_type_name}`);
        } else {
            const right_type_name = get_primitive_type_name_as_input(operator_info.right_type);
            this.line(
                `static ${operator_info.name}(left: ${left_type_name}, right: ${right_type_name}): ${return_type_name}`,
            );
        }
    }

    virtual_method_(method_info: GodotJsb.editor.MethodBind) {
        this.method_(method_info, "/* gdvirtual */ ");
    }

    ordinary_method_(method_info: GodotJsb.editor.MethodBind) {
        this.method_(method_info, "");
    }

    method_(method_info: GodotJsb.editor.MethodBind, category: string) {
        DocCommentHelper.write(this, this._doc?.methods[method_info.name]?.description, this._separator_line);
        this._separator_line = true;

        const property_override = this._property_overrides?.[method_info.name];
        if (Array.isArray(property_override)) {
            for (const line of property_override) {
                this.line(line);
            }
            return;
        }
        const line = (line: string) => this.line(property_override?.(line) ?? line);

        let args = this.types.make_args(method_info);
        let rval = this.types.make_return(method_info);
        const prefix = this.make_method_prefix(method_info);
        let template = "";

        // some godot methods declared with special characters which can not be declared literally
        if (!this.types.is_valid_method_name(method_info.name)) {
            this.line(`${category}${prefix}["${method_info.name}"]: (${args}) => ${rval}`);
            return;
        }

        line(`${category}${prefix}${name_string(method_info.name)}${template}(${args}): ${rval}`);
    }

    signal_(signal_info: GodotJsb.editor.SignalInfo) {
        DocCommentHelper.write(this, this._doc?.signals[signal_info.name]?.description, this._separator_line);
        this._separator_line = true;
        const sig = this.types.make_signal_type(signal_info.method_);

        if (this._singleton_mode) {
            this.line(`static readonly ${name_string(signal_info.name)}: ${sig}`);
        } else {
            this.line(`readonly ${name_string(signal_info.name)}: ${sig}`);
        }
    }
}

class EnumWriter extends IndentWriter {
    protected _name: string;
    protected _auto = false;
    protected _separator_line = false;

    constructor(base: ScopeWriter, name: string) {
        super(base, true);
        this._name = name;
    }

    /**
     * the base writer will also be marked as `finished` automatically by the current writer when it's `finished`.
     * NOTE usually used when `base` writer is fully managed by the current writer.
     */
    auto() {
        this._auto = true;
        return this;
    }

    finish() {
        if (this._lines.length != 0) {
            this._base.line(`enum ${this._name} {`);
            super.finish();
            this._base.line("}");
        }
        if (this._auto) {
            this._base.finish();
        }
    }

    element_(name: string, value: number) {
        DocCommentHelper.write(this, this._base.class_doc?.constants[name]?.description, this._separator_line);
        this._separator_line = true;
        this.line(`${name} = ${value},`);
    }
}

class InterfaceWriter extends IndentWriter {
    protected _name: string;
    protected _generic_parameters?: Record<string, GenericParameter>;
    protected _super?: string;
    protected _super_generic_arguments?: string[];
    protected _intro?: string[];
    protected _property_overrides?: PropertyOverrides;

    constructor(
        base: ScopeWriter,
        name: string,
        generic_parameters?: undefined | Record<string, GenericParameter>,
        super_?: undefined | string,
        super_generic_arguments?: undefined | string[],
        intro?: undefined | string[],
        property_overrides?: undefined | PropertyOverrides,
    ) {
        super(base, true);
        this._name = name;
        this._generic_parameters = generic_parameters;
        this._super = super_;
        this._super_generic_arguments = super_generic_arguments;
        this._intro = intro;
        this._property_overrides = jsb.CAMEL_CASE_BINDINGS_ENABLED
            ? camel_property_overrides(property_overrides)
            : property_overrides;
    }

    protected head() {
        const params = this._generic_parameters
            ? `<${Object.entries(this._generic_parameters)
                  .map(([name, p]) => {
                      return `${name}${p.extends ? ` extends ${p.extends}` : ""}${p.default ? ` = ${p.default}` : ""}`;
                  })
                  .join(", ")}>`
            : "";
        if (typeof this._super !== "string" || this._super.length == 0) {
            return `interface ${this._name}${params}`;
        }
        const args =
            this._super_generic_arguments && this._super_generic_arguments.length > 0
                ? `<${this._super_generic_arguments.join(", ")}>`
                : "";
        return `interface ${this._name}${params} extends ${this._super}${args}`;
    }

    intro() {
        if (!this._intro) {
            return;
        }

        for (const line of this._intro) {
            this._base.line(tab + line);
        }
    }

    finish() {
        this._base.line(`${this.head()} {`);
        this.intro();
        super.finish();
        this._base.line("}");
    }

    property_(key: string): PropertyWriter;
    property_(key: string, type: string): void;
    property_(key: string, type?: string): void | PropertyWriter {
        if (type === undefined) {
            return super.property_(key);
        }

        const property_override = this._property_overrides?.[key];
        if (Array.isArray(property_override)) {
            for (const line of property_override) {
                this.line(line);
            }
            return;
        }
        const line = (line: string) => this.line(property_override?.(line) ?? line);

        line(`${name_string(key)}: ${type};`);
    }
}

class GenericWriter extends IndentWriter {
    private _name: string;

    constructor(base: AbstractWriter, name: string) {
        super(base);
        this._name = name;
        this._size += name.length + 2;
    }

    finish(): void {
        if (this._lines.length < 2) {
            this._base.line(`${this._name}<${this._lines[0] ?? ""}>`);
            return;
        }

        this._base.line(`${this._name}<`);
        super.finish();
        this._base.line(">");
    }
}

class ObjectWriter extends IndentWriter {
    protected _intro?: string[];
    protected _property_overrides?: PropertyOverrides;

    constructor(base: ScopeWriter, intro?: undefined | string[], property_overrides?: undefined | PropertyOverrides) {
        super(base);
        this._intro = intro;
        this._property_overrides = jsb.CAMEL_CASE_BINDINGS_ENABLED
            ? camel_property_overrides(property_overrides)
            : property_overrides;
    }

    intro() {
        if (!this._intro) {
            return;
        }

        for (const line of this._intro) {
            this._base.line(tab + line);
        }
    }

    finish() {
        if (this._lines.length === 0 && !this._intro) {
            this._base.line("{}");
            return;
        }

        const line_count = (this._intro?.length ?? 0) + this._lines.length;
        const single_line = line_count === 0 || (line_count === 1 && !this._never_collapse);
        const padding = line_count === 1 && single_line ? " " : "";

        this._base.line(`{${padding}`);
        this.intro();
        super.finish();
        this._base.append(!single_line, `${padding}}`);
    }

    property_(key: string): PropertyWriter;
    property_(key: string, type: string): void;
    property_(key: string, type?: string): void | PropertyWriter {
        if (type === undefined) {
            return super.property_(key);
        }

        const property_override = this._property_overrides?.[key];
        if (Array.isArray(property_override)) {
            for (const line of property_override) {
                this.line(line);
            }
            return;
        }
        const line = (line: string) => this.line(property_override?.(line) ?? line);

        line(`${name_string(key)}: ${type};`);
    }
}

class PropertyWriter extends BufferingWriter {
    protected _concatenate_first_line = false;

    private _key: string;
    private _static_property: boolean;

    constructor(base: ScopeWriter, name: string, static_property = false, concatenate_first_line = false) {
        super(base);
        this._concatenate_first_line = concatenate_first_line;
        this._key = name;
        this._static_property = static_property;
        this._size += this._key.length + 3;
    }

    finish() {
        if (this._lines.length === 0) {
            return;
        }

        this._base.append(
            !this._concatenate_first_line,
            `${this._static_property ? "static " : ""}${name_string(this._key)}: `,
        );

        const lines = this._lines;
        for (let i = 0, l = lines.length; i < l; i++) {
            this._base.append(i > 0, lines[i]);
        }

        this._base.concatenate(";");
    }

    buffered_size(text: string, new_line: boolean): number {
        return text.length + (new_line ? 1 : 0);
    }
}

class FileWriter extends AbstractWriter {
    private _file: FileAccess;
    private _size = 0;
    private _lineno = 0;
    private _types: TypeDB;
    private _path: string;
    private _import_map: Record<string, Record<string, string>> = {};
    private _import_names = new Set<string>();

    private get_import_name(preferred_name: string): string {
        if (!preferred_name) {
            return this.get_import_name("MyType");
        }

        if (this._import_names.has(preferred_name)) {
            return this.get_import_name(preferred_name + "_");
        }

        this._import_names.add(preferred_name);
        return preferred_name;
    }

    constructor(path: string, types: TypeDB, file: FileAccess) {
        super();
        this._path = path;
        this._types = types;
        this._file = file;
    }

    add_import(preferred_name: string, script_resource: string, export_name = "default"): void {
        const resource_imports = (this._import_map[script_resource] ??= {});
        resource_imports[export_name] ??= this.get_import_name(preferred_name);
    }

    get_imports(): Record<string, Record<string, string>> {
        return this._import_map;
    }

    resolve_import(destination: string): string {
        const source = this._path.replace(/^\.?\/?/, "res://");
        const source_length = source.length;
        const destination_length = destination.length;

        let last_slash_index = -1;

        for (let i = 0; i < source_length && i < destination_length && source[i] === destination[i]; i++) {
            if (source[i] === "/") {
                last_slash_index = i;
            }
        }

        let up = "";
        for (let i = last_slash_index + 1; i < source_length; i++) {
            if (source[i] === "/") {
                up += "../";
            }
        }

        return (up || "./") + destination.slice(last_slash_index + 1).replace(/\.[jt]sx?$/, "");
    }

    get size() {
        return this._size;
    }
    get lineno() {
        return this._lineno;
    }
    get types() {
        return this._types;
    }

    line(text: string): void {
        this._file.store_line(text);
        this._size += text.length + 1;
        this._lineno += 1;
    }

    concatenate(text: string): void {
        this._file.store_string(text);
        this._size += text.length;
    }

    finish(): void {
        this._file.flush();
    }
}

class FileSplitter {
    private _file: FileAccess;
    private _toplevel: ModuleWriter;
    private _types: TypeDB;

    constructor(types: TypeDB, path: string) {
        this._types = types;
        this._file = godot.FileAccess.open(path, godot.FileAccess.ModeFlags.WRITE);
        this._toplevel = new ModuleWriter(new FileWriter(path, this._types, this._file), "godot");

        this._file.store_line("// AUTO-GENERATED");
    }

    close() {
        this._toplevel.finish();
        this._file.flush();
        this._file.close();
    }

    get_writer() {
        return this._toplevel;
    }

    get_size() {
        return this._toplevel.size;
    }
    get_lineno() {
        return this._toplevel.lineno;
    }
}

export class TypeDB {
    singletons: { [name: string]: GodotJsb.editor.SingletonInfo } = {};
    classes: { [name: string]: GodotJsb.editor.ClassInfo } = {};
    primitive_types: { [name: string]: GodotJsb.editor.PrimitiveClassInfo } = {};
    globals: { [name: string]: GodotJsb.editor.GlobalConstantInfo } = {};
    utilities: { [name: string]: GodotJsb.editor.MethodBind } = {};

    // `class_doc` is loaded lazily once used, and be cached in `class_docs`
    class_docs: { [name: string]: GodotJsb.editor.ClassDoc | false } = {};

    constructor() {
        const classes = jsb.editor.get_classes();
        const primitive_types = jsb.editor.get_primitive_types();
        const singletons = jsb.editor.get_singletons();
        const globals = jsb.editor.get_global_constants();
        const utilities = jsb.editor.get_utility_functions();
        for (let cls of classes) {
            this.classes[cls.name] = cls;
        }
        for (let cls of primitive_types) {
            this.primitive_types[cls.name] = cls;
        }
        for (let singleton of singletons) {
            this.singletons[singleton.name] = singleton;
        }
        for (let global_ of globals) {
            this.globals[global_.name] = global_;
        }
        for (let utility of utilities) {
            this.utilities[utility.name] = utility;
        }
    }

    find_doc(class_name: string): GodotJsb.editor.ClassDoc | undefined {
        let class_doc = this.class_docs[class_name];
        if (typeof class_doc === "object") {
            return <GodotJsb.editor.ClassDoc>class_doc;
        }
        if (typeof class_doc === "boolean") {
            return undefined;
        }
        let loaded_doc = jsb.editor.get_class_doc(class_name);
        this.class_docs[class_name] = loaded_doc || false;
        return loaded_doc;
    }

    is_primitive_type(name: string): boolean {
        return typeof this.primitive_types[name] !== "undefined";
    }

    is_valid_method_name(name: string): boolean {
        if (typeof KeywordReplacement[name] !== "undefined") {
            return false;
        }
        if (name.indexOf("/") >= 0 || name.indexOf(".") >= 0) {
            return false;
        }
        return true;
    }

    make_classname(class_name: string, internal?: boolean): string {
        const types = this;

        if (class_name.indexOf(".") > 0) {
            const layers = class_name.split(".");

            if (layers.length === 2) {
                const enum_name = names.get_enum(layers[1]);

                // nested enums in primitive types do not exist in class_info, they are manually bound.
                if (layers[0] in VariantNames) {
                    return `${VariantTypeNames.get(VariantNames[layers[0]]!)!}.${enum_name}`;
                }

                const class_name = names.get_class(layers[0]);

                if (class_name in VariantNames) {
                    return `${VariantTypeNames.get(VariantNames[class_name]!)!}.${enum_name}`;
                }

                const cls = types.classes[class_name];
                const enum_index = cls?.enums?.findIndex((v) => v.name === enum_name) ?? -1;

                if (enum_index >= 0) {
                    return `${class_name}.${enum_name}`;
                }
            }
        } else {
            if (internal) {
                if (class_name in VariantNames) {
                    return VariantTypeNames.get(VariantNames[class_name]!)!;
                }
                class_name = names.get_class(class_name);
            }

            if (class_name in VariantNames) {
                return VariantTypeNames.get(VariantNames[class_name]!)!;
            }

            if (class_name in types.classes) {
                return class_name;
            } else if (class_name in types.singletons) {
                return class_name;
            }
        }
        if (class_name in types.globals) {
            return class_name;
        }
        console.warn("undefined class", class_name);
        return `any /*${class_name}*/`;
    }

    make_typename(info: PropertyInfo, used_as_input: boolean, non_nullable: boolean): string {
        const null_prefix =
            !non_nullable &&
            (info.type === godot.Variant.Type.TYPE_OBJECT ||
                (info.usage & godot.PropertyUsageFlags.PROPERTY_USAGE_STORE_IF_NULL) !== 0)
                ? "null | "
                : "";

        if (info.hint == godot.PropertyHint.PROPERTY_HINT_RESOURCE_TYPE) {
            console.assert(info.hint_string.length != 0, "at least one valid class_name expected");
            return (
                null_prefix +
                info.hint_string
                    .split(",")
                    .map((name) => this.make_classname(name, true))
                    .join(" | ")
            );
        }

        //NOTE there are infos with `.class_name == bool` instead of `.type` only, they will be remapped in `make_classname`
        if (info.class_name.length === 0 || info.class_name.includes(",")) {
            const variant_type_name = used_as_input
                ? get_primitive_type_name_as_input(info.type)
                : VariantTypeNames.get(info.type);

            if (typeof variant_type_name !== "undefined") {
                if (
                    info.type === godot.Variant.Type.TYPE_ARRAY &&
                    info.hint == godot.PropertyHint.PROPERTY_HINT_ARRAY_TYPE &&
                    info.hint_string
                ) {
                    // Handle MAKE_RESOURCE_TYPE_HINT
                    const class_name_components = info.hint_string.split(":");
                    const class_name = class_name_components[class_name_components.length - 1];
                    return `${null_prefix}${variant_type_name}<${this.make_classname(class_name, true)}>`;
                }

                // PROPERTY_HINT_DICTIONARY_TYPE won't be present prior to 4.4
                if (
                    info.type === godot.Variant.Type.TYPE_DICTIONARY &&
                    "PROPERTY_HINT_DICTIONARY_TYPE" in godot.PropertyHint &&
                    info.hint === godot.PropertyHint.PROPERTY_HINT_DICTIONARY_TYPE &&
                    info.hint_string
                ) {
                    const class_names = info.hint_string.split(";");

                    if (class_names.length === 2) {
                        // TODO: Record can only handle string, number and symbol keys, but GDictionary can support any.
                        //       We should support Record taking a Map<> in addition to a Record<>.
                        const key_type = this.make_classname(class_names[0], true);
                        return js_object_key_types.has(key_type)
                            ? `${null_prefix}${variant_type_name}<Record<${key_type}, ${this.make_classname(class_names[0], true)}>>`
                            : `${null_prefix}${variant_type_name}`;
                    }
                }

                return null_prefix + variant_type_name;
            }

            return `any /*unhandled: ${info.type}*/`;
        }

        return null_prefix + this.make_classname(info.class_name);
    }

    make_arg(info: PropertyInfo, optional?: boolean): string {
        return `${replace_var_name(info.name)}${optional ? "?" : ""}: ${this.make_typename(info, true, true)}`;
    }

    make_literal_value(value: GodotJsb.editor.DefaultArgumentInfo) {
        // plain types
        const type_name = VariantTypeNames.get(value.type);
        switch (value.type) {
            case godot.Variant.Type.TYPE_BOOL:
                return value.value == null ? "false" : `${value.value}`;
            case godot.Variant.Type.TYPE_FLOAT:
            case godot.Variant.Type.TYPE_INT:
                return value.value == null ? "0" : `${value.value}`;
            case godot.Variant.Type.TYPE_STRING:
            case godot.Variant.Type.TYPE_STRING_NAME:
                return value.value == null ? "''" : `'${value.value}'`;
            case godot.Variant.Type.TYPE_NODE_PATH:
                return value.value == null ? "''" : `'${gd_to_string(value.value)}'`;
            case godot.Variant.Type.TYPE_ARRAY:
                return value.value == null || value.value.is_empty() ? "[]" : `${gd_to_string(value.value)}`;
            case godot.Variant.Type.TYPE_OBJECT:
                return value.value == null ? "undefined" : "<any> {}";
            case godot.Variant.Type.TYPE_NIL:
                return "<any> {}";
            case godot.Variant.Type.TYPE_CALLABLE:
            case godot.Variant.Type.TYPE_RID:
                return `new ${type_name}()`;
            default:
                break;
        }
        // make them more readable?
        if (value.type == godot.Variant.Type.TYPE_VECTOR2 || value.type == godot.Variant.Type.TYPE_VECTOR2I) {
            if (value == null) return `new ${type_name}()`;
            if (value.value.x == value.value.y) {
                if (value.value.x == 0) return `${type_name}.ZERO`;
                if (value.value.x == 1) return `${type_name}.ONE`;
            }
            return `new ${type_name}(${value.value.x}, ${value.value.y})`;
        }
        if (value.type == godot.Variant.Type.TYPE_VECTOR3 || value.type == godot.Variant.Type.TYPE_VECTOR3I) {
            if (value == null) return `new ${type_name}()`;
            if ((value.value.x == value.value.y) == value.value.z) {
                if (value.value.x == 0) return `${type_name}.ZERO`;
                if (value.value.x == 1) return `${type_name}.ONE`;
            }
            return `new ${type_name}(${value.value.x}, ${value.value.y}, ${value.value.z})`;
        }
        if (value.type == godot.Variant.Type.TYPE_COLOR) {
            if (value == null) return `new ${type_name}()`;
            return `new ${type_name}(${value.value.r}, ${value.value.g}, ${value.value.b}, ${value.value.a})`;
        }
        if (value.type == godot.Variant.Type.TYPE_RECT2 || value.type == godot.Variant.Type.TYPE_RECT2I) {
            if (value.value == null) return `new ${type_name}()`;
            return `new ${type_name}(${value.value.position.x}, ${value.value.position.y}, ${value.value.size.x}, ${value.value.size.y})`;
        }
        // it's tedious to repeat all types :(
        if (
            value.type >= godot.Variant.Type.TYPE_PACKED_BYTE_ARRAY &&
            value.type <= godot.Variant.Type.TYPE_PACKED_COLOR_ARRAY
        ) {
            if (value.value == null || value.value.is_empty()) {
                return "[]";
            }
        }
        if (value.type == godot.Variant.Type.TYPE_DICTIONARY) {
            if (value.value == null || value.value.is_empty()) return `new ${type_name}()`;
        }
        //NOTE hope all default value for Transform2D/Transform3D is IDENTITY
        if (value.type == godot.Variant.Type.TYPE_TRANSFORM2D || value.type == godot.Variant.Type.TYPE_TRANSFORM3D) {
            return `new ${type_name}()`;
        }

        //TODO value sig for compound types
        return `<any> {} /*compound.type from ${godot.Variant.Type[value.type]} (${value.value})*/`;
    }

    make_arg_default_value(method_info: GodotJsb.editor.MethodBind, index: number): string {
        const default_arguments = method_info.default_arguments || [];
        const def_index = index - (method_info.args_.length - default_arguments.length);
        if (def_index < 0 || def_index >= default_arguments.length) return this.make_arg(method_info.args_[index]);
        return `${this.make_arg(method_info.args_[index], true)} /* = ${this.make_literal_value(default_arguments[def_index])} */`;
    }

    make_args(method_info: GodotJsb.editor.MethodBind): string {
        //TODO consider default arguments
        const varargs = "...varargs: any[]";
        const is_vararg = !!(method_info.hint_flags & godot.MethodFlags.METHOD_FLAG_VARARG);
        if (method_info.args_.length == 0) {
            return is_vararg ? varargs : "";
        }
        const args = method_info.args_.map((_it, index) => this.make_arg_default_value(method_info, index)).join(", ");
        if (is_vararg) {
            return `${args}, ${varargs}`;
        }
        return args;
    }

    make_return(method_info: GodotJsb.editor.MethodBind): string {
        //TODO
        if (typeof method_info.return_ != "undefined") {
            return this.make_typename(method_info.return_, false, method_info.name.startsWith("create"));
        }
        return "void";
    }

    make_signal_type(method_info: GodotJsb.editor.MethodBind): string {
        const args = method_info.args_.map((arg) => `${arg.name}: ${this.make_typename(arg, false, true)}`);
        if (method_info.hint_flags & godot.MethodFlags.METHOD_FLAG_VARARG) {
            args.push("...varargs: any[]");
        }
        return `Signal<(${args.join(", ")}) => void>`;
    }
}

// d.ts generator
export class TSDCodeGen {
    private _split_index: number;
    private _out_dir: string;
    private _splitter: FileSplitter | undefined;
    private _types: TypeDB;
    private _use_project_settings: boolean;

    constructor(outDir: string, use_project_settings: boolean) {
        this._split_index = 0;
        this._out_dir = outDir;
        this._use_project_settings = use_project_settings;
        this._types = new TypeDB();
    }

    private make_path(index: number) {
        const filename = `godot${index}.gen.d.ts`;
        if (typeof this._out_dir !== "string" || this._out_dir.length == 0) {
            return filename;
        }
        if (this._out_dir.endsWith("/")) {
            return this._out_dir + filename;
        }
        return this._out_dir + "/" + filename;
    }

    private new_splitter() {
        if (this._splitter !== undefined) {
            this._splitter.close();
        }
        const filename = this.make_path(this._split_index++);
        console.log("new writer", filename);
        this._splitter = new FileSplitter(this._types, filename);
        return this._splitter;
    }

    // the returned writer will be `finished` automatically
    private split() {
        if (this._splitter == undefined) {
            return this.new_splitter().get_writer();
        }
        const len = this._splitter.get_size();
        const lineno = this._splitter.get_lineno();

        // limit size and length of the generated file for better readability and being more friendly to the VSCode TS server and diff tools
        if (len > 1024 * 900 || lineno > 9200) {
            return this.new_splitter().get_writer();
        }
        return this._splitter.get_writer();
    }

    private cleanup() {
        while (true) {
            const path = this.make_path(this._split_index++);
            if (!godot.FileAccess.file_exists(path)) {
                break;
            }
            console.log("delete file", path);
            jsb.editor.delete_file(path);
        }
    }

    has_class(name?: string): boolean {
        return typeof name === "string" && typeof this._types.classes[name] !== "undefined";
    }

    async emit() {
        await frame_step();

        const tasks = new CodegenTasks("Generating godot.d.ts");

        // aliases
        tasks.add_task("Aliases", () => this.emit_aliases());

        // all singletons
        for (let singleton_name in this._types.singletons) {
            tasks.add_task("Singletons", () => this.emit_singleton(this._types.singletons[singleton_name]));
        }

        // godot classes
        for (let class_name in this._types.classes) {
            const cls = this._types.classes[class_name];
            if (typeof this._types.singletons[class_name] !== "undefined") {
                // ignore the class if it's already defined as Singleton
                continue;
            }
            tasks.add_task("Classes", () => this.emit_godot_class(this.split(), cls, false));
        }

        // godot primitive types
        for (let class_name in this._types.primitive_types) {
            const cls = this._types.primitive_types[class_name];
            tasks.add_task("Primitives", () => this.emit_godot_primitive(this.split(), cls));
        }

        // godot global scope
        for (let global_name in this._types.globals) {
            tasks.add_task("Globals", () => this.emit_global(this._types.globals[global_name]));
        }

        // global utility functions
        for (let utility_name in this._types.utilities) {
            tasks.add_task("Utility Functions", () => this.emit_utility(this._types.utilities[utility_name]));
        }

        // jsb utility functions
        for (let mi of GlobalUtilityFuncs) {
            tasks.add_task("jsb.utility_functions", () => {
                const cg = this.split();
                DocCommentHelper.write(cg, mi.description, true);
                cg.line(mi.method);
            });
        }

        tasks.add_task("jsb.runtime", () => {
            const path = "/jsb.runtime.gen.d.ts";
            const dir_path = this._out_dir + path;
            const file = godot.FileAccess.open(dir_path, godot.FileAccess.ModeFlags.WRITE);

            if (!file) {
                throw new Error(`failed to open file for writing: ${dir_path}`);
            }

            const runtime_gen = new FileWriter(dir_path, this._types, file);

            try {
                const module = new ModuleWriter(runtime_gen, "godot.annotations");

                module.line('import * as Godot from "godot";');
                module.line('import * as GodotJsb from "godot-jsb";');

                for (const [name, descriptor] of Object.entries(annotation_types)) {
                    module.line(`type ${names.get_class(name)} = `);
                    const type_descriptor = new TypeDescriptorWriter(module, true);
                    type_descriptor.serialize_type_descriptor(descriptor.proxy());
                    type_descriptor.finish();
                }

                module.finish();
                runtime_gen.finish();
            } finally {
                file.close();
            }
        });

        tasks.add_task("Cleanup", () => {
            this._splitter?.close();
            this.cleanup();
        });

        return tasks.submit();
    }

    private emit_utility(utility_func: GodotJsb.editor.MethodBind) {
        const global_doc = this._types.find_doc("@GlobalScope");
        const cg = this.split();
        DocCommentHelper.write(cg, global_doc?.methods[utility_func.name]?.description, true);
        cg.utility_(utility_func);
    }

    private emit_global(global_obj: GodotJsb.editor.GlobalConstantInfo) {
        const cg = this.split();
        const doc = this._types.find_doc("@GlobalScope");
        const ns = cg.enum_(global_obj.name);
        let separator_line = false;
        for (let name in global_obj.values) {
            DocCommentHelper.write(ns, doc?.constants[name]?.description, separator_line);
            separator_line = true;
            ns.element_(name, global_obj.values[name]);
        }
        ns.finish();
    }

    private emit_aliases() {
        const cg = this.split();
        for (let line of PredefinedLines) {
            cg.line(line);
        }

        if (GodotAnyType != "any") {
            let gd_variant_alias = `type ${GodotAnyType} = undefined | null`;
            for (let i = godot.Variant.Type.TYPE_NIL + 1; i < godot.Variant.Type.TYPE_MAX; ++i) {
                const type_name = VariantTypeNames.get(i);
                if (type_name == GodotAnyType || type_name == "any") continue;
                gd_variant_alias += " | " + type_name;
            }
            cg.line(gd_variant_alias);
        }

        if (this._use_project_settings) {
            cg.line("type InputActionName = ");
            const indent = new IndentWriter(cg);
            for (const action of jsb.editor.get_input_actions()) {
                indent.line(`| "${action}"`);
            }
            indent.finish();
        } else {
            cg.line("type InputActionName = string");
        }
    }

    private emit_singleton(singleton: GodotJsb.editor.SingletonInfo) {
        const cg = this.split();
        const cls = this._types.classes[singleton.class_name];
        if (typeof cls !== "undefined") {
            cg.line_comment_(`_singleton_class_: ${singleton.class_name}`);
            this.emit_godot_class(cg, cls, true);
        } else {
            cg.line_comment_(`ERROR: singleton ${singleton.name} without class info ${singleton.class_name}`);
        }
    }

    private emit_godot_primitive(cg: CodeWriter, cls: GodotJsb.editor.PrimitiveClassInfo) {
        const class_doc = this._types.find_doc(cls.name);
        const ignored_consts: Set<string> = new Set();
        const class_ns_cg = cg.namespace_(cls.name, class_doc);
        if (cls.enums) {
            for (let enum_info of cls.enums) {
                const enum_cg = class_ns_cg.enum_(enum_info.name);
                for (let [name, value] of Object.entries(enum_info.literals)) {
                    const constant = cls.constants!.find((v) => v.name == name);
                    enum_cg.element_(name, value);
                    if (constant) {
                        ignored_consts.add(name);
                    }
                }
                enum_cg.finish();
            }
        }
        class_ns_cg.finish();

        const type_name = jsb.internal.names.get_variant_type(cls.type);
        const type_mutation = get_type_mutation(type_name);
        const super_ = type_mutation.super ?? undefined;
        const class_cg = cg.class_(
            type_name,
            type_mutation.generic_parameters,
            super_,
            type_mutation.super_generic_arguments,
            type_mutation.implements,
            type_mutation.property_overrides,
            type_mutation.intro,
            type_mutation.prelude,
            false,
            class_doc,
        );
        if (cls.constants) {
            for (let constant of cls.constants) {
                if (!ignored_consts.has(constant.name) && !ignored_consts.has(names.get_enum_value(constant.name))) {
                    class_cg.primitive_constant_(constant);
                }
            }
        }
        if (cls.constructors) {
            for (let constructor_info of cls.constructors) {
                class_cg.constructor_(constructor_info);
            }
        }
        for (let method_info of cls.methods) {
            class_cg.ordinary_method_(method_info);
        }
        if (cls.operators) {
            for (let operator_info of cls.operators) {
                class_cg.operator_(operator_info);
            }
        }
        if (cls.properties) {
            for (let property_info of cls.properties) {
                class_cg.primitive_property_(property_info);
            }
        }
        class_cg.finish();
    }

    private emit_godot_class(cg: CodeWriter, cls: GodotJsb.editor.ClassInfo, singleton_mode: boolean) {
        try {
            const class_doc = this._types.find_doc(cls.name);
            const ignored_consts: Set<string> = new Set();
            const class_ns_cg = cg.namespace_(cls.name, class_doc);
            if (cls.enums) {
                for (let enum_info of cls.enums) {
                    const enum_cg = class_ns_cg.enum_(enum_info.name);
                    for (let [name, value] of Object.entries(enum_info.literals)) {
                        enum_cg.element_(name, value);
                        ignored_consts.add(name);
                    }
                    enum_cg.finish();
                }
            }
            class_ns_cg.finish();

            const type_mutation = get_type_mutation(cls.name, this._types.classes);
            const super_ = type_mutation.super ?? (this.has_class(cls.super) ? cls.super : undefined);
            const class_cg = cg.class_(
                cls.name,
                type_mutation.generic_parameters,
                super_,
                type_mutation.super_generic_arguments,
                type_mutation.implements,
                type_mutation.property_overrides,
                type_mutation.intro,
                type_mutation.prelude,
                singleton_mode,
                class_doc,
            );
            if (cls.constants) {
                for (let constant of cls.constants) {
                    if (!ignored_consts.has(constant.name)) {
                        class_cg.constant_(constant);
                    }
                }
            }
            if (!singleton_mode) {
                class_cg.constructor_ex_();
            }

            const godot_name_overrides: Record<string, string> = {};

            for (let method_info of cls.virtual_methods) {
                class_cg.virtual_method_(method_info);
                if (method_info.internal_name !== method_info.name) {
                    godot_name_overrides[method_info.internal_name] = method_info.name;
                }
            }
            for (let method_info of cls.methods) {
                class_cg.ordinary_method_(method_info);
                if (method_info.internal_name !== method_info.name) {
                    godot_name_overrides[method_info.internal_name] = method_info.name;
                }
            }

            for (let property_info of cls.properties) {
                class_cg.property_(property_info, singleton_mode);
                if (property_info.internal_name !== property_info.name) {
                    godot_name_overrides[property_info.internal_name] = property_info.name;
                }
            }

            if (cls.signals) {
                for (let signal_info of cls.signals) {
                    class_cg.signal_(signal_info);
                    if (signal_info.internal_name !== signal_info.name) {
                        godot_name_overrides[signal_info.internal_name] = signal_info.name;
                    }
                }
            }

            const overrides_interface_name = `__NameMap${cls.name}`;
            const overrides_interface_writer = cg.interface_(
                overrides_interface_name,
                undefined,
                cls.super && `__NameMap${cls.super}`,
            );
            for (const [key, value] of Object.entries(godot_name_overrides)) {
                overrides_interface_writer.property_(key, `"${value}"`);
            }
            // Not really deprecated, but we don't want people using this.
            cg.line("/** @deprecated Internal use. Does not exist at runtime. */");
            overrides_interface_writer.finish();

            const godot_name_map_writer = class_cg.property_("__godotNameMap");
            godot_name_map_writer.line(overrides_interface_name);

            class_cg.line("/** @deprecated Internal use. Does not exist at runtime. */");
            godot_name_map_writer.finish();

            class_cg.finish();
        } catch (error) {
            console.error(`failed to generate '${cls.name}'`, (error as Error).stack);
            throw error;
        }
    }
}

interface NodeHierarchy {
    class: string;
    children: Record<string, NodeHierarchy>;
}

export class SceneTSDCodeGen {
    private _out_dir: string;
    private _scene_paths: string[];
    private _types: TypeDB;

    constructor(out_dir: string, scene_paths: string[]) {
        this._out_dir = out_dir;
        this._scene_paths = scene_paths;

        this._types = new TypeDB();
    }

    private make_scene_path(scene_path: string, include_filename = true) {
        const relative_path = (
            include_filename ? scene_path.replace(/\.t?scn$/i, ".nodes.gen.ts") : scene_path.replace(/\/[^\/]+$/, "")
        ).replace(/^res:\/\/?/, "");

        if (typeof this._out_dir !== "string" || this._out_dir.length == 0) {
            return relative_path;
        }

        return this._out_dir.endsWith("/") ? this._out_dir + relative_path : this._out_dir + "/" + relative_path;
    }

    async emit() {
        await frame_step();

        let taskName = "Generating scene node types";
        if (this._scene_paths.length === 1) {
            /* Before running the project every scene is saved seperately.
             * We ensure that the task don't have the same name */
            taskName += ` ${this._scene_paths.at(0)}`;
        }
        const tasks = new CodegenTasks(taskName);

        for (const scene_path of this._scene_paths) {
            tasks.add_task(`Generating scene node types: ${scene_path}`, () => this.emit_scene_node_types(scene_path));
        }

        return tasks.submit(false);
    }

    private emit_children_node_types(writer: ScopeWriter, children: GReadProxyValueWrap<NodeTypeDescriptorPathMap>) {
        const child_writer = writer.object_();
        for (const [key, value] of Object.entries(children)) {
            if (!value) {
                continue;
            }

            const property = child_writer.property_(key);
            const descriptor = new TypeDescriptorWriter(property, true);
            descriptor.serialize_type_descriptor(value);
            descriptor.finish();
            property.finish();
        }
        child_writer.finish();
    }

    private emit_scene_node_types(scene_path: string) {
        try {
            const helper = godot.GodotJSEditorHelper;
            const children = (helper.get_scene_nodes(scene_path) as undefined | NodeTypeDescriptorPathMap)?.proxy();

            if (typeof children !== "object") {
                throw new Error(`root node children unavailable: ${scene_path}`);
            }

            const dir_path = this.make_scene_path(scene_path, false);
            const dir_error = godot.DirAccess.make_dir_recursive_absolute(dir_path);

            if (dir_error !== 0) {
                console.error(`failed to create directory (error: ${dir_error}): ${dir_path}`);
            }

            const file_path = this.make_scene_path(scene_path);
            const file = godot.FileAccess.open(file_path, godot.FileAccess.ModeFlags.WRITE);

            if (!file) {
                throw new Error(`failed to open file for writing: ${dir_path}`);
            }

            try {
                const file_writer = new FileWriter(file_path, this._types, file);
                const module = new ModuleWriter(file_writer, "godot");
                const scene_nodes_interface = new InterfaceWriter(module, "SceneNodes");
                const scene_property = scene_nodes_interface.property_(scene_path.replace(/^res:\/\//, ""));
                this.emit_children_node_types(scene_property, children);
                scene_property.finish();
                scene_nodes_interface.finish();
                module.finish();
                file_writer.finish();
            } finally {
                file.close();
            }
        } catch (error) {
            console.error(`failed to generate scene node types: ${scene_path}`);
            throw error;
        }
    }
}

export class ResourceTSDCodeGen {
    private _out_dir: string;
    private _resource_paths: string[];
    private _types: TypeDB;

    constructor(out_dir: string, resource_paths: string[]) {
        this._out_dir = out_dir;
        this._resource_paths = resource_paths;

        this._types = new TypeDB();
    }

    private make_resource_path(resource_path: string, include_filename = true) {
        const relative_path = (
            include_filename ? resource_path + ".gen.ts" : resource_path.replace(/\/[^\/]+$/, "")
        ).replace(/^res:\/\/?/, "");

        if (typeof this._out_dir !== "string" || this._out_dir.length == 0) {
            return relative_path;
        }

        return this._out_dir.endsWith("/") ? this._out_dir + relative_path : this._out_dir + "/" + relative_path;
    }

    async emit() {
        await frame_step();

        const tasks = new CodegenTasks("Generating resource types");

        for (const resource_path of this._resource_paths) {
            tasks.add_task(`Generating resource type: ${resource_path}`, () => this.emit_resource_type(resource_path));
        }

        return tasks.submit(false);
    }

    private emit_resource_type(resource_path: string) {
        try {
            const helper = godot.GodotJSEditorHelper;
            const descriptor = (
                helper.get_resource_type_descriptor(resource_path) as undefined | TypeDescriptor
            )?.proxy();

            if (typeof descriptor !== "object") {
                throw new Error(`resource type unavailable: ${resource_path}`);
            }

            const dir_path = this.make_resource_path(resource_path, false);
            const dir_error = godot.DirAccess.make_dir_recursive_absolute(dir_path);

            if (dir_error !== 0) {
                console.error(`failed to create directory (error: ${dir_error}): ${dir_path}`);
            }

            const file_path = this.make_resource_path(resource_path);
            const file = godot.FileAccess.open(file_path, godot.FileAccess.ModeFlags.WRITE);

            if (!file) {
                throw new Error(`failed to open file for writing: ${dir_path}`);
            }

            try {
                const file_writer = new FileWriter(file_path, this._types, file);
                const module = new ModuleWriter(file_writer, "godot");
                const resource_types_interface = new InterfaceWriter(module, "ResourceTypes");
                const resource_property = resource_types_interface.property_(resource_path);
                const type_descriptor = new TypeDescriptorWriter(resource_property, true);
                type_descriptor.serialize_type_descriptor(descriptor);
                type_descriptor.finish();
                resource_property.finish();
                resource_types_interface.finish();
                module.finish();
                file_writer.finish();
            } finally {
                file.close();
            }
        } catch (error) {
            console.error(`failed to generate resource type: ${resource_path}`);
            throw error;
        }
    }
}
