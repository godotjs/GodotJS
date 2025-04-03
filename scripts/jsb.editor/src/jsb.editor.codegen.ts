import {
    DirAccess,
    FileAccess,
    GArray,
    GDictionary,
    GReadProxyValueWrap,
    MethodFlags,
    Node,
    PropertyHint,
    PropertyInfo,
    Resource,
    Variant,
    str as gd_to_string,
    type_string,
} from 'godot';
import * as jsb from "godot-jsb";

type UpperSnakeToPascalCase<S extends string> =
    S extends `${infer T}_${infer U}`
        ? `${Capitalize<Lowercase<T>>}${UpperSnakeToPascalCase<Capitalize<Lowercase<U>>>}`
        : Capitalize<Lowercase<S>>;

function upper_snake_to_pascal_case<T extends string>(input: T): UpperSnakeToPascalCase<T> {
    return input
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') as UpperSnakeToPascalCase<T>;
}

type SnakeToCamelCase<S extends string> =
    S extends `${infer T}_${infer U}${infer Rest}`
        ? `${T}${Capitalize<U>}${SnakeToCamelCase<Rest>}`
        : S;

function snake_to_camel_case<T extends string>(input: T): SnakeToCamelCase<T> {
    return input
        .toLowerCase()
        .split('_')
        .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('') as SnakeToCamelCase<T>;
}

function camel_property_overrides(overrides: undefined | Record<string, string[] | ((line: string) => string)>) {
    return overrides && Object.fromEntries(
        Object.entries(overrides).map(([name, value]) => {
            const camel_case_name = snake_to_camel_case(name);
            return [
                camel_case_name,
                Array.isArray(value)
                    ? value.map(line => line.replace(new RegExp(`${name}( *[<(:])`), `${camel_case_name}$1`))
                    : value
            ];
        })
    )
}

const member_name = jsb.CAMEL_CASE_BINDINGS_ENABLED
    ? snake_to_camel_case
    : (name: string) => name;

const parameter_name = jsb.CAMEL_CASE_BINDINGS_ENABLED
    ? snake_to_camel_case
    : (name: string) => name;

const enum_value_name = jsb.CAMEL_CASE_BINDINGS_ENABLED
    ? upper_snake_to_pascal_case
    : (name: string) => name;

// Godot's runtime can be toggled between snake case and camel case naming schemes. In this script we use upper camel
// case value names. If the camel-case naming scheme is enabled, then we must convert to pascal case.
function enum_value<E, N extends keyof E & string>(enum_map: E, name: N): E[N] {
    return enum_map[enum_value_name(name) as keyof E] as E[N];
}

// Godot's runtime can be toggled between snake case and camel case naming schemes. In this script we use lower snake
// case method names. If the camel-case naming scheme is enabled, then we must convert to camel case.
function gd_method<O, N extends keyof O & string>(obj: O, name: N): O[N] {
    return (obj[member_name(name) as keyof O] as Function).bind(obj) as O[N];
}

if (!jsb.TOOLS_ENABLED) {
    throw new Error("codegen is only allowed in editor mode")
}

const tab = "    ";
const GodotAnyType: string = "GAny";

interface GenericParameter {
    extends?: string;
    default?: string;
}

type Intro = string[] | ((types: TypeDB) => string[]);
type PropertyOverrides = Record<string, string[] | ((line: string) => string)>;

interface TypeMutation {
    generic_parameters?: Record<string, GenericParameter>;
    super?: string;
    super_generic_arguments?: string[];
    intro?: Intro;
    property_overrides?: PropertyOverrides;
}

function chain_mutators(...mutators: Array<(line: string) => string>) {
    return function(line: string) {
        return mutators.reduce((line, mutator) => mutator(line), line);
    };
}
function mutate_parameter_type(name: string, type: string) {
    return function(line: string) {
        const replaced = line.replace(new RegExp(`([,(] *)${name.replace(/\./g, "\\.")}: .+?( ?[,)=])`, 'g'), `$1${name}: ${type}$2`);
        if (replaced === line) {
            throw new Error(`Failed to mutate "${name}" parameter's type: ${line}`);
        }
        return replaced;
    };
}
function mutate_return_type(type: string) {
    return function(line: string) {
        const replaced = line.replace(/: [^:]+$/g, `: ${type}`);
        if (replaced === line) {
            throw new Error(`Failed to mutate return type: ${line}`);
        }
        return replaced;
    };
}
function mutate_template(template: string) {
    return function(line: string) {
        const replaced = line.replace(/([^(]+)(<[^>]+> *)?\(/, `$1$2<${template}>(`);
        if (replaced === line) {
            throw new Error(`Failed to mutate template: ${line}`);
        }
        return replaced;
    };
}

const TypeMutations: Record<string, TypeMutation> = {
    Signal: {
        intro: [
            `${member_name("as_promise")}(): Parameters<T> extends [] ? Promise<void> : Parameters<T> extends [infer R] ? Promise<R> : Promise<Parameters<T>>`,
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
        }
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
            "static create<S extends GDObject, F extends (this: S, ...args: any[]) => any>(self: S, fn: F): Callable<F>",
        ],
        generic_parameters: {
            T: {
                extends: "Function",
                default: "Function",
            },
        },
        property_overrides: {
            bind: chain_mutators(mutate_template("A extends any[]"), mutate_parameter_type("...varargs", "A"), mutate_return_type("Callable<BindRight<T, A>>")),
            call: ["call: T"],
        },
    },
    GArray: {
        generic_parameters: {
            T: {
                default: "Any",
            },
        },
        intro: [
            "/** Builder function that returns a GArray populated with elements from a JS array. */",
            "static create<T>(elements: [T] extends [GArray<infer E>] ? Array<E | GProxyValueWrap<E>> : Array<T | GProxyValueWrap<T>>): [T] extends [GArray<infer E>] ? GArray<E> : GArray<T>",
            "[Symbol.iterator](): IteratorObject<T>",
            "/** Returns a Proxy that targets this GArray but behaves similar to a JavaScript array. */",
            "proxy<Write extends boolean = false>(): Write extends true ? GArrayProxy<T> : GArrayReadProxy<T>",
            "",
            `${member_name("set_indexed")}(index: number, value: T): void`,
            `${member_name("get_indexed")}(index: number): T`,
        ],
        property_overrides: {
            set: mutate_parameter_type("value", "T"),
            push_back: mutate_parameter_type("value", "T"),
            push_front: mutate_parameter_type("value", "T"),
            append: mutate_parameter_type("value", "T"),
            insert: mutate_parameter_type("value", "T"),
            fill: mutate_parameter_type("value", "T"),
            erase: mutate_parameter_type("value", "T"),
            count: mutate_parameter_type("value", "T"),
            has: mutate_parameter_type("value", "T"),
            bsearch: mutate_parameter_type("value", "T"),
            bsearch_custom: chain_mutators(mutate_parameter_type("value", "T"), mutate_parameter_type("func", "Callable2<T, T, boolean>")),
            find: mutate_parameter_type('what', 'T'),
            rfind: mutate_parameter_type("what", "T"),
            get: mutate_return_type("T"),
            front: mutate_return_type("T"),
            back: mutate_return_type("T"),
            pick_random: mutate_return_type("T"),
            pop_back: mutate_return_type("T"),
            pop_front: mutate_return_type("T"),
            pop_at: mutate_return_type("T"),
            min: mutate_return_type("T"),
            max: mutate_return_type("T"),
            sort_custom: mutate_parameter_type("func", "Callable2<T, T, boolean>"),
            all: mutate_parameter_type("method", "Callable1<T, boolean>"),
            any: mutate_parameter_type("method", "Callable1<T, boolean>"),
            filter: chain_mutators(mutate_parameter_type("method", "Callable1<T, boolean>"), mutate_return_type("GArray<T>")),
            map: chain_mutators(mutate_parameter_type("method", "Callable1<T, U>"), mutate_return_type("GArray<U>"), mutate_template("U")),
            append_array: mutate_parameter_type("array", "GArray<T>"),
            duplicate: mutate_return_type("GArray<T>"),
            slice: mutate_return_type("GArray<T>"),
        },
    },
    GDictionary: {
        generic_parameters: {
            T: {
                default: "Record<any, any>",
            },
        },
        intro: [
            "/** Builder function that returns a GDictionary with properties populated from a source JS object. */",
            "static create<T>(properties: T extends GDictionary<infer S> ? GDictionaryProxy<S> : GDictionaryProxy<T>): T extends GDictionary<infer S> ? GDictionary<S> : GDictionary<T>",
            "[Symbol.iterator](): IteratorObject<{ key: any, value: any }>",
            "/** Returns a Proxy that targets this GDictionary but behaves similar to a regular JavaScript object. Values are exposed as enumerable properties, so Object.keys(), Object.entries() etc. will work. */",
            "proxy<Write extends boolean = false>(): Write extends true ? GDictionaryProxy<T> : GDictionaryReadProxy<T>",
            "",
            `${member_name("set_keyed")}<K extends keyof T>(key: K, value: T[K]): void`,
            `${member_name("get_keyed")}<K extends keyof T>(key: K): T[K]`,
        ],
        property_overrides: {
            assign: mutate_parameter_type("dictionary", "T"),
            merge: mutate_parameter_type("dictionary", "T"),
            merged: chain_mutators(mutate_parameter_type("dictionary", "GDictionary<U>"), mutate_return_type("GDictionary<T & U>"), mutate_template("U")),
            has: mutate_parameter_type("key", "keyof T"),
            has_all: mutate_parameter_type("keys", "GArray<keyof T>"),
            find_key: chain_mutators(mutate_parameter_type("value", "T[keyof T]"), mutate_return_type("keyof T")), // This can be typed more accurately with a mapped type, but it seems excessive.
            erase: mutate_parameter_type("key", "keyof T"),
            keys: mutate_return_type("Array<keyof T>"),
            values: mutate_return_type("GArray<T[keyof T]>"),
            duplicate: mutate_return_type("GDictionary<T>"),
            get: chain_mutators(mutate_parameter_type("key", "K"), mutate_return_type("T[K]"), mutate_template("K extends keyof T")),
            get_or_add: chain_mutators(mutate_parameter_type("key", "K"), mutate_parameter_type("default_", "T[K]"), mutate_template("K extends keyof T")),
            set: chain_mutators(mutate_parameter_type("key", "K"), mutate_parameter_type("value", "T[K]"), mutate_template("K extends keyof T")),
        }
    },
    Node: {
        generic_parameters: {
            Map: {
                extends: "Record<string, Node>",
                default: "{}",
            },
        },
        intro: [
            "// TypeScript's inference won't directly match against a generic parameter. The generic parameter has to",
            "// appear somewhere in the type definition. Consequently, we insert a dummy direct usage of the parameter.",
            // To observe this in practice, visit the following and comment out line 20:
            // https://www.typescriptlang.org/play/?ts=5.8.2#code/C4TwDgpgBAcg9gEwgBQIbABYFlVigXigG8oBtAaSgEsA7KAZ2ACdaBzAXQH4AuWRCAMwARKAF8AsACgpoSFADKwdFQDG8JGkwAeHHggAPYBBoJ6fDemy4AfASgAKANYQQcAGZRdUAGQNmbAEooAB9iKSgySlooZ1cPL19GFhoOXl0KdigDIxMzdUEhLVo3CCYoAGEMKgAbBF1rcIioTigAAwASInJRADpOxWU1fk0MLUqauptRVsaI3hoIADdSqVFSWPdPXB8-ZI4AbikZcGgAJQh6OGrl-JGdbezjU3MUS10AGigRrMMnsyS2J8hBA3KgAK7VYB2BbLJi2QjfR65GIuTa6RotdIjdiNXiI37IjpEYqlKDkFw-HLPDbxbaJfwpXqdElleRggBGI2ms2aWzAFBcmSRz3ywiKNBKZXGtXqPIiLXOl2uEFuljGVRluE+bM5liBIPBkIakiaTV4wNBEOAPPNBqth2kkiQKmqqCY0BUcBojCgAH1fQg4BcaHAjPoqIxffldLwwTQqABHMHQeggAC27Ku+ygR0kLtQ9Dy-DFWEpfxeIy8hFVmHqYRNUGdrvdUDALEW6GgpH9geDoYMEeAUf4unYaQdEkd+cLCkgKioblUosKpeFRYste21eGbxsZeRy50tiIk+OciwIAAKu7oIQiI03HA4Lx5HOF0vi4V7w2IuzUKgXzfRchiQMVv1NCJMDYXhlwdU1RGsOCxEQ1YHSkT1vShMBLBfJRgA-DdRgva8IAgeEoAAckfOAKIdDCfWwzAACZcMGGsiKvG9yKop8ej-VBaPQr0GMsARWPwkDXm0YiuLsHi4D4-8eiglJBMkAB6TSoAAAWAegAFoDDnYBDKYJg4CYITMOoGgO2qKgEBGABGcSCKkjiSLIuSQ0wUoIDUzT1J0vTDP0YzTPMyy82EqFaDshyRhYhQ8Lcu4ZNI7jqJ6HyMD8gKtN0gyjIgFQTNKSKrJ9OLUHsxzRNcyS0s4jK5Ky-jstDXL3TUyqoWo3hFSuG4d2k5qIE+eSKPIk8oALWaaBAOiYqgaiACF-wGi4hpVEaPJvCa2v-Ka7BmubUAWh1AuCoqwpKsqzIs3qVqfeBgAACT8gBJegYCWUpNqVYbCJ0MaDt4nK8um0RZrMc7Fqetb-0vKoUgB7b2JBzywYU9qVNYY672hs6LqkK7CtC8Lyse6LrMR1BXo+91vt+2E0eVDH0vGyjDtQDrfO6qGYfm+HHSAA
            "private __doesnotexist_NodeMap: Map"
        ],
        property_overrides: {
            get_node: [
                "get_node<Path extends StaticNodePath<Map>, Default = never>(path: Path): ResolveNodePath<Map, Path, Default>",
                "get_node(path: NodePath | string): Node",
            ],
            get_node_or_null: [
                "get_node_or_null<Path extends StaticNodePath<Map>, Default = never>(path: Path): null | ResolveNodePath<Map, Path, Default>",
                "get_node_or_null(path: NodePath | string): null | Node",
            ],
            validate_property: mutate_parameter_type("property", "GDictionary<PropertyInfo>"),
        },
    },
    PackedByteArray: {
        intro: [
            "/** [jsb utility method] Converts a PackedByteArray to a JavaScript ArrayBuffer. */",
            `${member_name("to_array_buffer")}(): ArrayBuffer`,
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
    ResourceLoader: {
        property_overrides: {
            load: [
                `static load<Path extends keyof ResourceTypes>(path: Path, ${parameter_name("type_hint")}: string = '', ${parameter_name("cache_mode")}: ResourceLoader.CacheMode = 1): ResourceTypes[Path]`,
                "static load(path: string): Resource",
            ],
            load_threaded_get: [
                `static load_threaded_get<Path extends keyof ResourceTypes>(path: Path): ResourceTypes[Path]`,
                "static load_threaded_get(path: string): Resource",
            ],
        },
    },
};

const InheritedTypeMutations: Record<string, TypeMutation> = {
    Node: {
        generic_parameters: {
            Map: {
                extends: "Record<string, Node>",
                default: "{}",
            },
        },
        super_generic_arguments: ["Map"],
    },
};

function is_primitive_class_info(cls: jsb.editor.BasicClassInfo): cls is jsb.editor.PrimitiveClassInfo {
    return 'type' in cls;
}

function class_type_mutation(cls: jsb.editor.BasicClassInfo): TypeMutation {
    const intro: string[] = []

    if (is_primitive_class_info(cls) && typeof cls.element_type !== "undefined") {
        const element_type_name = get_primitive_type_name(cls.element_type);
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

function get_type_mutation(name: string, classes: { [Name in string]?: jsb.editor.ClassInfo } = {}): TypeMutation {
    const class_info = classes[name];
    let type_mutation = class_info ? class_type_mutation(class_info) : {};
    let super_name = class_info?.super;

    while (super_name) {
        if (InheritedTypeMutations[super_name]) {
            type_mutation = merge_type_mutations(type_mutation, InheritedTypeMutations[super_name]);
        }
        super_name = classes[super_name]?.super;
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
    append(newLine: boolean, text: string): void;

    enum_(name: string): EnumWriter;
    namespace_(name: string, class_doc?: jsb.editor.ClassDoc): NamespaceWriter;
    interface_(
        name: string,
        generic_parameters?: undefined | Record<string, GenericParameter>,
        super_?: undefined | string,
        super_generic_arguments?: undefined | string[],
        intro?: undefined | string[],
        property_overrides?: undefined | PropertyOverrides
    ): InterfaceWriter;
    class_(
        name: string,
        generic_parameters: undefined | Record<string, GenericParameter>,
        super_: undefined | string,
        super_generic_arguments: undefined | string[],
        property_overrides: undefined | PropertyOverrides,
        intro: undefined | Intro,
        singleton_mode: boolean,
        class_doc?: jsb.editor.ClassDoc
    ): ClassWriter;
    generic_(name: string): GenericWriter;
    property_(name: string): PropertyWriter;
    object_(intro?: undefined | string[], property_overrides?: undefined | PropertyOverrides): ObjectWriter;
    // singleton_(info: jsb.editor.SingletonInfo): SingletonWriter;
    line_comment_(text: string): void;
}

interface ScopeWriter extends CodeWriter {
    get class_doc(): jsb.editor.ClassDoc | undefined;

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
    let helper = require("godot").GodotJSEditorHelper;
    gd_method(helper, 'show_toast')(msg, 0); // 0: info, 1: warning, 2: error
}

interface CodegenTaskInfo {
    name: string;
    execute: () => (void | Promise<void>);
}

class CodegenTasks {
    private _name: string;
    private tasks: Array<CodegenTaskInfo> = [];

    constructor(name: string) {
      this._name = name;
    }

    add_task(name: string, func: () => (void | Promise<void>) ){
        this.tasks.push({ name: name, execute: func });
    }

    async submit() {
        const EditorProgress = require("godot").GodotJSEditorProgress;
        const progress = new EditorProgress();
        let force_wait = 24;
        gd_method(progress, 'init')(`codegen-${this._name}`, `Generating ${this._name}`, this.tasks.length);

        try {
            for (let i = 0; i < this.tasks.length; ++i) {
                const task = this.tasks[i];
                const result = task.execute();

                if (typeof result === "object" && result instanceof Promise) {
                    gd_method(progress, 'set_state_name')(task.name);
                    gd_method(progress, 'set_current')(i);
                    await result;
                } else {
                    if (!(i % force_wait)) {
                        gd_method(progress, 'set_state_name')(task.name);
                        gd_method(progress, 'set_current')(i);
                        await frame_step();
                    }
                }
            }

            gd_method(progress, 'finish')();
            toast(`${this._name} generated successfully`);
        } catch (e) {
            console.error("CodegenTasks error:", e);
            toast(`${this._name} failed!`);
            console.error(`${this._name} failed!`, e);
            gd_method(progress, 'finish')();
        }
    }
}

const MockLines = [
    "type byte = number",
    "type int32 = number",
    "type int64 = number /* || bigint */",
    "type float32 = number",
    "type float64 = number",
    "type StringName = string",
    "type unresolved = any",
]

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
}

const PrimitiveTypeNames: { [type: number]: string } = {
    [enum_value(Variant.Type, "TYPE_NIL")]: "any",
    [enum_value(Variant.Type, "TYPE_BOOL")]: "boolean",
    [enum_value(Variant.Type, "TYPE_INT")]: "int64",
    [enum_value(Variant.Type, "TYPE_FLOAT")]: "float64",
    [enum_value(Variant.Type, "TYPE_STRING")]: "string",
}

const RemapTypes: { [name: string]: string } = {
    ["bool"]: "boolean",
    ["Error"]: "GError",
}
const IgnoredTypes = new Set([
    "IPUnix",
    "ScriptEditorDebugger",
    "Thread",
    "Semaphore",

    //
    // "GodotNavigationServer2D",
    // "GodotPhysicsServer2D",
    // "GodotPhysicsServer3D",
    // "PhysicsServer2DExtension",
    // "PhysicsServer3DExtension",

    // GodotJS related clases
    "GodotJSEditorPlugin",
    "GodotJSExportPlugin",
    "GodotJSREPL",
    "GodotJSScript",
    "GodotJSEditorHelper",
    "GodotJSEditorProgress",

    // GDScript related classes
    "GDScript",
    "GDScriptEditorTranslationParserPlugin",
    "GDScriptNativeClass",
    "GDScriptSyntaxHighlighter",
])
const GlobalUtilityFuncs = [
    {
        description: "shorthand for getting project settings",
        method: "function GLOBAL_GET(entry_path: StringName): any"
    },

    {
        description: [
            "shorthand for getting editor settings",
            "NOTE: calling before EditorSettings created will cause null reference exception."
        ],
        method: "function EDITOR_GET(entry_path: StringName): any"
    }
]

const PrimitiveTypesSet = (function (): Set<string> {
    let set = new Set<string>();
    for (let name in Variant.Type) {
        // avoid babbling error messages in `type_string` call
        if (<any>Variant.Type[name] === Variant.Type.TYPE_MAX) continue;

        // use the original type name of Variant.Type,
        // because this set is used with type name from the original godot class info (PropertyInfo)
        let str = type_string(<any>Variant.Type[name]);
        if (str.length != 0) {
            set.add(str);
        }
    }
    return set;
})();

function get_primitive_type_name(type: Variant.Type): string | undefined {
    const primitive_name = PrimitiveTypeNames[type];
    if (typeof primitive_name !== "undefined") {
        return primitive_name;
    }

    return jsb.internal.get_type_name(type);
    // return type_string(type);
}

function get_js_array_type_name(element_type_name: string | undefined) {
    if (typeof element_type_name === "undefined" || element_type_name.length == 0) return "";

    // avoid using Array due to the naming conflicts between Godot and JavaScript builtin types
    // return `Array<${element_type_name}>`;
    return `${element_type_name}[]`;
}

function join_type_name(...args: (string | undefined)[]) {
    return args.filter(value => typeof value === "string" && value.length != 0).join(" | ");
}

function get_primitive_type_name_as_input(type: Variant.Type): string | undefined {
    const primitive_name = get_primitive_type_name(type);

    switch (type) {
        case enum_value(Variant.Type, "TYPE_PACKED_COLOR_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name(get_primitive_type_name(enum_value(Variant.Type, "TYPE_COLOR"))));
        case enum_value(Variant.Type, "TYPE_PACKED_VECTOR2_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name(get_primitive_type_name(enum_value(Variant.Type, "TYPE_VECTOR2"))));
        case enum_value(Variant.Type, "TYPE_PACKED_VECTOR3_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name(get_primitive_type_name(enum_value(Variant.Type, "TYPE_VECTOR3"))));
        case enum_value(Variant.Type, "TYPE_PACKED_STRING_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name("string"));
        case enum_value(Variant.Type, "TYPE_PACKED_FLOAT32_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name("float32"));
        case enum_value(Variant.Type, "TYPE_PACKED_FLOAT64_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name("float64"));
        case enum_value(Variant.Type, "TYPE_PACKED_INT32_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name("int32"));
        case enum_value(Variant.Type, "TYPE_PACKED_INT64_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name("int64"));
        case enum_value(Variant.Type, "TYPE_PACKED_BYTE_ARRAY"): return join_type_name(primitive_name, get_js_array_type_name("byte"), "ArrayBuffer");
        case enum_value(Variant.Type, "TYPE_NODE_PATH"): return join_type_name(primitive_name, "string");
        default: return primitive_name;
    }
}

function replace_var_name(name: string) {
    const rep = KeywordReplacement[name];
    return typeof rep !== "undefined" ? rep : name;
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

    get class_doc(): jsb.editor.ClassDoc | undefined { return undefined; }

    constructor() { }

    enum_(name: string): EnumWriter {
        if (name.indexOf('.') >= 0) {
            let layers = name.split('.');
            name = layers.splice(layers.length - 1)[0];
            return new EnumWriter(this.namespace_(layers.join("."), this.class_doc), name).auto();
        }
        return new EnumWriter(this, name);
    }
    namespace_(name: string, class_doc?: jsb.editor.ClassDoc): NamespaceWriter {
        return new NamespaceWriter(this, name, class_doc)
    }
    interface_(
      name: string,
      generic_parameters?: undefined | Record<string, GenericParameter>,
      super_?: undefined | string,
      super_generic_arguments?: undefined | string[],
      intro?: undefined | string[],
      property_overrides?: undefined | PropertyOverrides,
    ): InterfaceWriter {
        return new InterfaceWriter(this, name, generic_parameters, super_, super_generic_arguments, intro, property_overrides);
    }
    class_(
      name: string,
      generic_parameters: undefined | Record<string, GenericParameter>,
      super_: string,
      super_generic_arguments: undefined | string[],
      property_overrides: undefined | PropertyOverrides,
      intro: undefined | Intro,
      singleton_mode: boolean,
      class_doc?: jsb.editor.ClassDoc
    ): ClassWriter {
        return new ClassWriter(this, name, generic_parameters, super_, super_generic_arguments, intro, property_overrides, singleton_mode, class_doc);
    }
    generic_(name: string): GenericWriter {
      return new GenericWriter(this, name);
    }
    property_(name: string): PropertyWriter {
        return new PropertyWriter(this, name);
    }
    object_(intro?: undefined | string[], property_overrides?: undefined | PropertyOverrides): ObjectWriter {
        return new ObjectWriter(this, intro, property_overrides);
    }
    // singleton_(info: jsb.editor.SingletonInfo): SingletonWriter {
    //     return new SingletonWriter(this, info);
    // }
    line_comment_(text: string) {
        this.line(`// ${text}`);
    }
    append(newLine: boolean, text: string) {
        if (newLine) {
            this.line(text);
        } else {
            this.concatenate(text);
        }
    }
}

class Description {
    private result: string;

    get text() { return this.result; }

    get length() { return this.result.length; }

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
        let link = jsb.editor.VERSION_DOCS_URL.length != 0 && !!class_doc && class_name.length != 0 ? `\n@link ${jsb.editor.VERSION_DOCS_URL}/classes/class_${class_name.toLowerCase()}.html` : "";
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
            return this.replace_markup_content(text.substring(0, index) + rep + text.substring(index + markup.length), index + rep.length, markup, rep);
        }
        return text;
    }

    static remove_markup_content(text: string, from_pos: number, markup_begin: string, markup_end: string): string {
        let start = text.indexOf(markup_begin, from_pos);
        if (start >= 0) {
            let end = text.indexOf(markup_end, from_pos);
            if (end >= 0) {
                return this.remove_markup_content(text.substring(0, start) + text.substring(end + markup_end.length), start, markup_begin, markup_end);
            }
        }
        return text;
    }

    static write(writer: CodeWriter, description: Description | string | string[] | undefined, newline: boolean): boolean {
        if (typeof description === "undefined" || description.length == 0) return false;
        let lines =
            description instanceof Array
                ? description
                : this.get_simplified_description(typeof description === "string" ? Description.forAny(description).text : description.text).replace("\r\n", "\n").split("\n");
        if (lines.length > 0 && this.is_empty_or_whitespace(lines[0])) lines.splice(0, 1);
        if (lines.length > 0 && this.is_empty_or_whitespace(lines[lines.length - 1])) lines.splice(lines.length - 1, 1);
        if (lines.length == 0) return false;
        let leading_tab = this.get_leading_tab(lines[0]);
        lines = lines.map(value => this.trim_leading_tab(value, leading_tab));
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
    protected _concatenate_first_line = false;

    constructor(base: ScopeWriter, concatenate_first_line = false) {
        super();
        this._base = base;
        this._lines = [];
        this._concatenate_first_line = concatenate_first_line;
    }

    get size() { return this._size; }
    get lineno() { return this._lines.length; }
    get types() { return this._base.types; }

    add_import(preferred_name: string, script_resource: string, export_name: string = "default") {
        this._base.add_import(preferred_name, script_resource, export_name);
    }

    get_imports(): Record<string, Record<string, string>> {
        return this._base.get_imports();
    }

    resolve_import(script_resource: string): string {
        return this._base.resolve_import(script_resource);
    }

    abstract bufferedSize(text: string, newLine: boolean): number;

    line(text: string): void {
        this._lines.push(text);
        this._size += this.bufferedSize(text, this._lines.length > 1 || !this._concatenate_first_line);
    }

    concatenate(text: string): void {
        if (this._lines.length > 0) {
            this._lines[this._lines.length - 1] += text;
            this._size += this.bufferedSize(text, false);
        } else {
            this.line(text);
        }
    }
}

class IndentWriter extends BufferingWriter {
    finish() {
        const lines = this._lines;
        for (let i = 0, l = lines.length; i < l; i++) {
            if (i === 0 && this._concatenate_first_line) {
                this._base.concatenate(lines[i]);
            } else {
                this._base.line(tab + lines[i]);
            }
        }
    }

    bufferedSize(text: string, newLine: boolean): number {
        return text.length + (newLine ? tab.length + 1 : 0);
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
    resource: string;
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
    default?: TypeDescriptor;
}>;

export type FunctionLiteralTypeDescriptor = GDictionary<{
    type: DescriptorType.FunctionLiteral;
    generics?: GArray<GenericParameterDescriptor>;
    parameters?: GArray<ParameterDescriptor>;
    returns?: TypeDescriptor;
}>;

export type ObjectLiteralTypeDescriptor = GDictionary<{
    type: DescriptorType.ObjectLiteral;
    properties: GDictionary<Partial<Record<string, TypeDescriptor>>>;
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

export type CodeGenRequest = ScriptNodeTypeDescriptorCodeGenRequest | ScriptResourceTypeDescriptorCodeGenRequest;

/**
 * You can manipulate GodotJS' codegen by exporting a function from your script/module called `codegen`.
 */
export type CodeGenHandler = (request: CodeGenRequest) => undefined | TypeDescriptor;

class TypeDescriptorWriter extends BufferingWriter {
    bufferedSize(text: string, newLine: boolean): number {
        return text.length + (newLine ? 1 : 0);
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
                if (descriptor.arguments) {
                    this.line(`${descriptor.name}<`);
                    const indent = descriptor.arguments.length > 1 ? new IndentWriter(this) : null;
                    const args = new TypeDescriptorWriter(indent ?? this, descriptor.arguments.length === 1);
                    descriptor.arguments.forEach((arg, index) => {
                        if (index > 0) {
                            args.concatenate(", ");
                        }

                        args.serialize_type_descriptor(arg);
                    });
                    args.finish();
                    indent?.finish();
                    this.append(descriptor.arguments.length !== 1, `>`);
                } else {
                    this.line(descriptor.name);
                }
                break;
            }
            case DescriptorType.User: {
                if (descriptor.arguments) {
                    this.line(`${descriptor.name}<`);
                    const indent = descriptor.arguments.length > 1 ? new IndentWriter(this) : null;
                    const args = new TypeDescriptorWriter(indent ?? this, descriptor.arguments.length === 1);
                    descriptor.arguments.forEach((arg, index) => {
                        if (index > 0) {
                            args.concatenate(", ");
                        }

                        args.serialize_type_descriptor(arg);
                    });
                    args.finish();
                    indent?.finish();
                    this.append(descriptor.arguments.length !== 1, `>`);
                } else {
                    this.line(descriptor.name);
                }

                this.add_import(descriptor.name, descriptor.resource, descriptor.export);
                break;
            }

            case DescriptorType.FunctionLiteral: {
                const generic_count = descriptor.generics ? Object.entries(descriptor.generics).length : 0;

                if (generic_count > 0) {
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
                }

                this.append(generic_count == 0, `(`);

                const multiline = (descriptor.parameters?.length ?? 0) > 1;

                if (descriptor.parameters) {
                    descriptor.parameters.forEach((param, index) => {
                        if (index > 0) {
                            this.concatenate(", ");
                        }

                        this.line(`${param.name}: `);

                        const param_writer = new TypeDescriptorWriter(this, !multiline);
                        param_writer.serialize_type_descriptor(param.type);
                        param_writer.finish();

                        if (param.default) {
                            this.concatenate(` = `);
                            const default_writer = new TypeDescriptorWriter(this, true);
                            default_writer.serialize_type_descriptor(param.default);
                            default_writer.finish();
                        }
                    });
                }

                this.append(multiline, ") => ");

                if (descriptor.returns) {
                    const return_writer = new TypeDescriptorWriter(this, true);
                    return_writer.serialize_type_descriptor(descriptor.returns);
                    return_writer.finish();
                } else {
                    this.concatenate("void");
                }

                break;
            }

            case DescriptorType.ObjectLiteral: {
                const properties = Object.entries(descriptor.properties);

                if (properties.length === 0 && !descriptor.index) {
                    this.line("{}");
                    break;
                }

                this.line("{");
                const indent = new IndentWriter(this);
                properties.forEach(([key, value]) => {
                    if (!value) {
                        return;
                    }

                    indent.line(`${key}: `);
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
                this.line(descriptor.template
                    ? `\`${descriptor.value.replace(/`/g, "\\`")}\``
                    : `"${descriptor.value.replace(/"/g, '\\"')}"`);
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

            case DescriptorType.Union: {
                descriptor.types.forEach((type, index) => {
                    if (index > 0) {
                        this.line(" | ");
                    }

                    const union_writer = new TypeDescriptorWriter(this, index > 0);
                    union_writer.serialize_type_descriptor(type);
                    union_writer.finish();
                });
                break;
            }

            case DescriptorType.Intersection: {
                descriptor.types.forEach((type, index) => {
                    if (index > 0) {
                        this.line(" & ");
                    }

                    const intersection_writer = new TypeDescriptorWriter(this, index > 0);
                    intersection_writer.serialize_type_descriptor(type);
                    intersection_writer.finish();
                });
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
        super(base);
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
        this._base.line('}');
    }

    // godot utility functions must be in global scope
    utility_(method_info: jsb.editor.MethodBind) {
        const args = this.types.make_args(method_info);
        const rval = this.types.make_return(method_info);

        // some godot methods declared with special characters which can not be declared literally
        if (!this.types.is_valid_method_name(method_info.name)) {
            this.line(`// [INVALID_NAME]: static function ${method_info.name}(${args}): ${rval}`);
            return;
        }
        this.line(`static function ${method_info.name}(${args}): ${rval}`);
    }
}

class NamespaceWriter extends IndentWriter {
    protected _name: string;
    protected _doc?: jsb.editor.ClassDoc;

    get class_doc() { return this._doc; }

    constructor(base: ScopeWriter, name: string, class_doc?: jsb.editor.ClassDoc) {
        super(base);
        this._name = name;
        this._doc = class_doc;
    }

    finish() {
        if (this._lines.length == 0) {
            return;
        }
        this._base.line(`namespace ${this._name} {`);
        super.finish();
        this._base.line('}');
    }
}

class ClassWriter extends IndentWriter {
    protected _name: string;
    protected _generic_parameters?: Record<string, GenericParameter>;
    protected _super?: string;
    protected _super_generic_arguments?: string[];
    protected _intro?: Intro;
    protected _property_overrides?: Record<string, string[] | ((line: string) => string)>;
    protected _singleton_mode: boolean;
    protected _doc?: jsb.editor.ClassDoc;
    protected _separator_line = false;

    get class_doc(): jsb.editor.ClassDoc | undefined { return this._doc; }

    constructor(
        base: ScopeWriter,
        name: string,
        generic_parameters: undefined | Record<string, GenericParameter>,
        super_: undefined | string,
        super_generic_arguments: undefined | string[],
        intro: undefined | Intro,
        property_overrides: undefined | PropertyOverrides,
        singleton_mode: boolean,
        class_doc?: jsb.editor.ClassDoc
    ) {
        super(base);
        this._name = name;
        this._generic_parameters = generic_parameters;
        this._super = super_;
        this._super_generic_arguments = super_generic_arguments;
        this._intro = intro;
        this._property_overrides = jsb.CAMEL_CASE_BINDINGS_ENABLED ? camel_property_overrides(property_overrides) : property_overrides;
        this._singleton_mode = singleton_mode;
        this._doc = class_doc;
    }

    protected head() {
        const params = this._generic_parameters
            ? `<${Object.entries(this._generic_parameters).map(([name, p]) =>
                `${name}${p.extends ? ` extends ${p.extends}` : ""}${p.default ? ` = ${p.default}` : ""}`
            ).join(", ")}>`
            : "";
        if (typeof this._super !== "string" || this._super.length == 0) {
            return `class ${this._name}${params}`;
        }
        const args = this._super_generic_arguments && this._super_generic_arguments.length > 0
            ? `<${this._super_generic_arguments.join(", ")}>`
            : "";
        return `class ${this._name}${params} extends ${this._super}${args}`;
    }

    protected make_method_prefix(method_info: jsb.editor.MethodBind): string {
        return this._singleton_mode || method_info.is_static ? "static " : "";
    }

    intro() {
        if (!this._intro) {
            return
        }

        const lines = Array.isArray(this._intro)
            ? this._intro
            : this._intro(this.types);

        for (const line of lines) {
            this._base.line(tab + line);
        }
    }

    finish() {
        DocCommentHelper.write(this._base, Description.forClass(this.types, this._name), false);
        this._base.line(`${this.head()} {`)
        this.intro()
        super.finish()
        this._base.line('}')
    }

    primitive_constant_(constant: jsb.editor.PrimitiveConstantInfo) {
        DocCommentHelper.write(this, this._doc?.constants[constant.name]?.description, this._separator_line);
        this._separator_line = true;
        if (typeof constant.value !== "undefined") {
            this.line(`static readonly ${constant.name} = ${constant.value}`);
        } else {
            const type_name = get_primitive_type_name(constant.type);
            this.line(`static readonly ${constant.name}: ${type_name}`);
        }
    }

    constant_(constant: jsb.editor.ConstantInfo) {
        DocCommentHelper.write(this, this._doc?.constants[constant.name]?.description, this._separator_line);
        this._separator_line = true;
        this.line(`static readonly ${constant.name} = ${constant.value}`);
    }

    property_(name: string): PropertyWriter;
    property_(getset_info: jsb.editor.PropertySetGetInfo): void;
    property_(name_or_getset_info: string | jsb.editor.PropertySetGetInfo): void | PropertyWriter {
        if (typeof name_or_getset_info === "string") {
            return super.property_(name_or_getset_info);
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

        // Handle properties with forward slashes e.g. `AnimatedTexture.frame_0/texture`
        const name = getset_info.name.indexOf("/") >= 0
            ? `"${getset_info.name}"`
            : getset_info.name;

        // declare as get/set to avoid the pitfalls of modifying a value type return value
        // `node.position.x = 0;` (Although, it works in GDScript)
        //
        // It's not an error in javascript which is more dangerous :( the actually modifed value is just a copy of `node.position`.

        line(`get ${name}(): ${this.types.make_typename(getset_info.info, false)}`);
        if (getset_info.setter.length != 0) {
            line(`set ${name}(value: ${this.types.make_typename(getset_info.info, true)})`);
        }
    }

    primitive_property_(property_info: jsb.editor.PrimitiveGetSetInfo) {
        this._separator_line = true;

        this.line(`get ${property_info.name}(): ${get_primitive_type_name(property_info.type)}`);
        this.line(`set ${property_info.name}(value: ${get_primitive_type_name_as_input(property_info.type)})`);
    }

    constructor_(constructor_info: jsb.editor.ConstructorInfo) {
        this._separator_line = true;
        const args = constructor_info.arguments.map(it =>
            `${replace_var_name(it.name)}: ${this.types.replace_type_inplace(get_primitive_type_name_as_input(it.type))}`
        ).join(", ");
        this.line(`constructor(${args})`);
    }

    constructor_ex_() {
        this.line(`constructor(identifier?: any)`);
    }

    operator_(operator_info: jsb.editor.OperatorInfo) {
        this._separator_line = true;
        const return_type_name = this.types.replace_type_inplace(get_primitive_type_name(operator_info.return_type));
        const left_type_name = this.types.replace_type_inplace(get_primitive_type_name_as_input(operator_info.left_type));
        if (operator_info.right_type == enum_value(Variant.Type, "TYPE_NIL")) {
            this.line(`static ${operator_info.name}(left: ${left_type_name}): ${return_type_name}`);
        } else {
            const right_type_name = this.types.replace_type_inplace(get_primitive_type_name_as_input(operator_info.right_type));
            this.line(`static ${operator_info.name}(left: ${left_type_name}, right: ${right_type_name}): ${return_type_name}`);
        }
    }

    virtual_method_(method_info: jsb.editor.MethodBind) {
        this.method_(method_info, "/* gdvirtual */ ");
    }

    ordinary_method_(method_info: jsb.editor.MethodBind) {
        this.method_(method_info, "");
    }

    method_(method_info: jsb.editor.MethodBind, category: string) {
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

        line(`${category}${prefix}${method_info.name}${template}(${args}): ${rval}`);
    }

    signal_(signal_info: jsb.editor.SignalInfo) {
        DocCommentHelper.write(this, this._doc?.signals[signal_info.name]?.description, this._separator_line);
        this._separator_line = true;
        const sig = this.types.make_signal_type(signal_info.method_);

        if (this._singleton_mode) {
            this.line(`static readonly ${signal_info.name}: ${sig}`);
        } else {
            this.line(`readonly ${signal_info.name}: ${sig}`);
        }
    }
}

class EnumWriter extends IndentWriter {
    protected _name: string;
    protected _auto = false;
    protected _separator_line = false;

    constructor(base: ScopeWriter, name: string) {
        super(base);
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
            this._base.line('}');
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
        super(base);
        this._name = name;
        this._generic_parameters = generic_parameters;
        this._super = super_;
        this._super_generic_arguments = super_generic_arguments;
        this._intro = intro;
        this._property_overrides = jsb.CAMEL_CASE_BINDINGS_ENABLED ? camel_property_overrides(property_overrides) : property_overrides;
    }

    protected head() {
        const params = this._generic_parameters
            ? `<${Object.entries(this._generic_parameters).map(([name, p]) => {

                return `${name}${p.extends ? ` extends ${p.extends}` : ""}${p.default ? ` = ${p.default}` : ""}`;
            }).join(", ")}>`
            : "";
        if (typeof this._super !== "string" || this._super.length == 0) {
            return `interface ${this._name}${params}`;
        }
        const args = this._super_generic_arguments && this._super_generic_arguments.length > 0
            ? `<${this._super_generic_arguments.join(", ")}>`
            : "";
        return `interface ${this._name}${params} extends ${this._super}${args}`;
    }

    intro() {
        if (!this._intro) {
            return
        }

        for (const line of this._intro) {
            this._base.line(tab + line);
        }
    }

    finish() {
        this._base.line(`${this.head()} {`)
        this.intro()
        super.finish()
        this._base.line('}')
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

        line(`${key}: ${type};`);
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

    constructor(
        base: ScopeWriter,
        intro?: undefined | string[],
        property_overrides?: undefined | PropertyOverrides,
    ) {
        super(base);
        this._intro = intro;
        this._property_overrides = jsb.CAMEL_CASE_BINDINGS_ENABLED ? camel_property_overrides(property_overrides) : property_overrides;
    }

    intro() {
        if (!this._intro) {
            return
        }

        for (const line of this._intro) {
            this._base.line(tab + line);
        }
    }

    finish() {
        if (this._lines.length === 0 && !this._intro) {
            this._base.line('{}')
            return;
        }

        this._base.line(`{`)
        this.intro()
        super.finish()
        this._base.line('}')
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

        line(`${key}: ${type};`);
    }
}

class PropertyWriter extends BufferingWriter {
    private _key: string;

    constructor(base: ScopeWriter, name: string, concatenate_first_line = false) {
        super(base, concatenate_first_line);
        this._key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)
            ? name
            : `"${name.replace("\"", "\\\"")}"`;
        this._size += this._key.length + 3;
    }

    finish() {
        if (this._lines.length === 0) {
            return;
        }

        this._base.append(!this._concatenate_first_line, `${this._key}: `);

        const lines = this._lines;
        for (let i = 0, l = lines.length; i < l; i++) {
            this._base.append(i > 0, lines[i]);
        }

        this._base.concatenate(";");
    }

    bufferedSize(text: string, newLine: boolean): number {
        return text.length + (newLine ? 1 : 0);
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

    add_import(preferred_name: string, script_resource: string, export_name = 'default'): void {
        const resource_imports = this._import_map[script_resource] ??= {};
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
            if (source[i] === '/') {
                last_slash_index = i;
            }
        }

        let up = '';
        for (let i = last_slash_index + 1; i < source_length; i++) {
            if (source[i] === '/') {
                up += '../';
            }
        }

        return (up || './') + destination.slice(last_slash_index + 1).replace(/\.[jt]sx?$/, "");
    }

    get size() { return this._size; }
    get lineno() { return this._lineno; }
    get types() { return this._types; }

    line(text: string): void {
        gd_method(this._file, 'store_line')(text);
        this._size += text.length + 1;
        this._lineno += 1;
    }

    concatenate(text: string): void {
        gd_method(this._file, 'store_string')(text);
        this._size += text.length;
    }

    finish(): void {
        gd_method(this._file, 'flush')();
    }
}

class FileSplitter {
    private _file: FileAccess;
    private _toplevel: ModuleWriter;
    private _types: TypeDB;

    constructor(types: TypeDB, path: string) {
        this._types = types;
        this._file = gd_method(FileAccess, 'open')(path, enum_value(FileAccess.ModeFlags, "WRITE"));
        this._toplevel = new ModuleWriter(new FileWriter(path, this._types, this._file), "godot");

        gd_method(this._file, 'store_line')("// AUTO-GENERATED");
        gd_method(this._file, 'store_line')('/// <reference no-default-lib="true"/>');
    }

    close() {
        this._toplevel.finish();
        gd_method(this._file, 'flush')();
        gd_method(this._file, 'close')();
    }

    get_writer() {
        return this._toplevel;
    }

    get_size() { return this._toplevel.size; }
    get_lineno() { return this._toplevel.lineno; }
}

export class TypeDB {
    singletons: { [name: string]: jsb.editor.SingletonInfo } = {};
    classes: { [name: string]: jsb.editor.ClassInfo } = {};
    primitive_types: { [name: string]: jsb.editor.PrimitiveClassInfo } = {};
    primitive_type_names: { [type: number /* Variant.Type */]: string } = {};
    globals: { [name: string]: jsb.editor.GlobalConstantInfo } = {};
    utilities: { [name: string]: jsb.editor.MethodBind } = {};
    internal_class_name_map: { [name: string]: string } = {};

    // `class_doc` is loaded lazily once used, and be cached in `class_docs`
    class_docs: { [name: string]: jsb.editor.ClassDoc | false } = {};

    constructor() {
        const classes = jsb.editor.get_classes();
        const primitive_types = jsb.editor.get_primitive_types();
        const singletons = jsb.editor.get_singletons();
        const globals = jsb.editor.get_global_constants();
        const utilities = jsb.editor.get_utility_functions();
        for (let cls of classes) {
            this.classes[cls.name] = cls;
            this.internal_class_name_map[cls.internal_name] = cls.name;
        }
        for (let cls of primitive_types) {
            this.primitive_types[cls.name] = cls;
            this.primitive_type_names[cls.type] = cls.name;
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

    find_doc(class_name: string): jsb.editor.ClassDoc | undefined {
        let class_doc = this.class_docs[class_name];
        if (typeof class_doc === "object") {
            return <jsb.editor.ClassDoc>class_doc;
        }
        if (typeof class_doc === "boolean") {
            return undefined;
        }
        let loaded_doc = jsb.editor.get_class_doc(class_name);
        this.class_docs[class_name] = loaded_doc || false
        return loaded_doc;
    }

    is_primitive_type(name: string): boolean {
        return typeof this.primitive_types[name] !== "undefined";
    }

    is_valid_method_name(name: string): boolean {
        if (typeof KeywordReplacement[name] !== "undefined") {
            return false;
        }
        if (name.indexOf('/') >= 0 || name.indexOf('.') >= 0) {
            return false;
        }
        return true;
    }

    make_classname(class_name: string, used_as_input: boolean): string {
        const types = this;
        const remap_name: string | undefined = RemapTypes[class_name];
        if (typeof remap_name !== "undefined") {
            return remap_name;
        }
        if (class_name in types.classes) {
            return class_name;
        } else {
            if (class_name.indexOf(".") >= 0) {
                const layers = class_name.split(".");
                if (layers.length == 2) {
                    // nested enums in primitive types do not exist in class_info, they are manually binded.
                    if (PrimitiveTypesSet.has(layers[0])) {
                        return class_name;
                    }
                    const cls = types.classes[layers[0]];
                    if (typeof cls !== "undefined" && cls.enums!.findIndex(v => v.name == layers[1]) >= 0) {
                        return class_name;
                    }
                }
            }
            if (class_name in types.globals) {
                return class_name;
            }
            if (class_name in types.singletons) {
                return class_name;
            }
            // if (ReservedTypes.has(class_name)) {
            //     return class_name;
            // }
            console.warn("undefined class", class_name);
            return `any /*${class_name}*/`;
        }
    }

    make_typename(info: PropertyInfo, used_as_input: boolean): string {
        if (info.hint == enum_value(PropertyHint, "PROPERTY_HINT_RESOURCE_TYPE")) {
            console.assert(info.hint_string.length != 0, "at least one valid class_name expected");
            return info.hint_string.split(",").map(class_name => this.make_classname(class_name, used_as_input)).join(" | ")
        }

        //NOTE there are infos with `.class_name == bool` instead of `.type` only, they will be remapped in `make_classname`
        if (info.class_name.length == 0) {
            const primitive_name = used_as_input ? get_primitive_type_name_as_input(info.type) : get_primitive_type_name(info.type);
            if (typeof primitive_name !== "undefined") {
                return primitive_name;
            }
            return `any /*unhandled: ${info.type}*/`;
        }

        return this.make_classname(info.class_name, used_as_input);
    }

    make_arg(info: PropertyInfo, type_replacer?: (name: string) => string): string {
        return `${replace_var_name(info.name)}: ${this.replace_type_inplace(this.make_typename(info, true), type_replacer)}`
    }

    make_literal_value(value: jsb.editor.DefaultArgumentInfo) {
        // plain types
        const type_name = get_primitive_type_name(value.type);
        switch (value.type) {
            case enum_value(Variant.Type, "TYPE_BOOL"): return value.value == null ? "false" : `${value.value}`;
            case enum_value(Variant.Type, "TYPE_FLOAT"):
            case enum_value(Variant.Type, "TYPE_INT"): return value.value == null ? "0" : `${value.value}`;
            case enum_value(Variant.Type, "TYPE_STRING"):
            case enum_value(Variant.Type, "TYPE_STRING_NAME"): return value.value == null ? "''" : `'${value.value}'`;
            case enum_value(Variant.Type, "TYPE_NODE_PATH"): return value.value == null ? "''" : `'${gd_to_string(value.value)}'`;
            case enum_value(Variant.Type, "TYPE_ARRAY"): return value.value == null || gd_method(value.value, 'is_empty')() ? "[]" : `${gd_to_string(value.value)}`;
            case enum_value(Variant.Type, "TYPE_OBJECT"): return value.value == null ? "undefined" : "<any> {}";
            case enum_value(Variant.Type, "TYPE_NIL"): return "<any> {}";
            case enum_value(Variant.Type, "TYPE_CALLABLE"):
            case enum_value(Variant.Type, "TYPE_RID"): return `new ${type_name}()`;
            default: break;
        }
        // make them more readable?
        if (value.type == enum_value(Variant.Type, "TYPE_VECTOR2") || value.type == enum_value(Variant.Type, "TYPE_VECTOR2I")) {
            if (value == null) return `new ${type_name}()`;
            if (value.value.x == value.value.y) {
                if (value.value.x == 0) return `${type_name}.ZERO`;
                if (value.value.x == 1) return `${type_name}.ONE`;
            }
            return `new ${type_name}(${value.value.x}, ${value.value.y})`;
        }
        if (value.type == enum_value(Variant.Type, "TYPE_VECTOR3") || value.type == enum_value(Variant.Type, "TYPE_VECTOR3I")) {
            if (value == null) return `new ${type_name}()`;
            if (value.value.x == value.value.y == value.value.z) {
                if (value.value.x == 0) return `${type_name}.ZERO`;
                if (value.value.x == 1) return `${type_name}.ONE`;
            }
            return `new ${type_name}(${value.value.x}, ${value.value.y}, ${value.value.z})`;
        }
        if (value.type == enum_value(Variant.Type, "TYPE_COLOR")) {
            if (value == null) return `new ${type_name}()`;
            return `new ${type_name}(${value.value.r}, ${value.value.g}, ${value.value.b}, ${value.value.a})`;
        }
        if (value.type == enum_value(Variant.Type, "TYPE_RECT2") || value.type == enum_value(Variant.Type, "TYPE_RECT2I")) {
            if (value.value == null) return `new ${type_name}()`;
            return `new ${type_name}(${value.value.position.x}, ${value.value.position.y}, ${value.value.size.x}, ${value.value.size.y})`
        }
        // it's tedious to repeat all types :(
        if ((value.type >= enum_value(Variant.Type, "TYPE_PACKED_BYTE_ARRAY") && value.type <= enum_value(Variant.Type, "TYPE_PACKED_COLOR_ARRAY"))) {
            if (value.value == null || gd_method(value.value, 'is_empty')()) {
                return "[]";
            }
        }
        if (value.type == enum_value(Variant.Type, "TYPE_DICTIONARY")) {
            if (value.value == null || gd_method(value.value, 'is_empty')()) return `new ${type_name}()`;
        }
        //NOTE hope all default value for Transform2D/Transform3D is IDENTITY
        if (value.type == enum_value(Variant.Type, "TYPE_TRANSFORM2D") || value.type == enum_value(Variant.Type, "TYPE_TRANSFORM3D")) {
            return `new ${type_name}()`;
        }

        //TODO value sig for compound types
        return `<any> {} /*compound.type from ${Variant.Type[value.type]} (${value.value})*/`;
    }

    replace_type_inplace(name: string | undefined, type_replacer?: (name: string) => string): string {
        return typeof type_replacer === "function" ? type_replacer(name!) : name!;
    }

    make_arg_default_value(method_info: jsb.editor.MethodBind, index: number, type_replacer?: (name: string) => string): string {
        const default_arguments = method_info.default_arguments || [];
        const def_index = index - (method_info.args_.length - default_arguments.length);
        if (def_index < 0 || def_index >= default_arguments.length) return this.make_arg(method_info.args_[index], type_replacer);
        return this.make_arg(method_info.args_[index], type_replacer) + " = " + this.make_literal_value(default_arguments[def_index]);
    }

    make_args(method_info: jsb.editor.MethodBind, type_replacer?: (name: string) => string): string {
        //TODO consider default arguments
        const varargs = "...varargs: any[]";
        const is_vararg = !!(method_info.hint_flags & enum_value(MethodFlags, "METHOD_FLAG_VARARG"));
        if (method_info.args_.length == 0) {
            return is_vararg ? varargs : "";
        }
        const args = method_info.args_.map((it, index) => this.make_arg_default_value(method_info, index, type_replacer)).join(", ");
        if (is_vararg) {
            return `${args}, ${varargs}`;
        }
        return args;
    }

    make_return(method_info: jsb.editor.MethodBind, type_replacer?: (name: string) => string): string {
        //TODO
        if (typeof method_info.return_ != "undefined") {
            return this.replace_type_inplace(this.make_typename(method_info.return_, false), type_replacer);
        }
        return "void"
    }

    make_signal_type(method_info: jsb.editor.MethodBind): string {
        const args = method_info.args_.map((arg => `${arg.name}: ${this.make_typename(arg, true)}`));
        if (method_info.hint_flags & enum_value(MethodFlags, "METHOD_FLAG_VARARG")) {
            args.push("...varargs: any[]");
        }
        return `Signal<(${args.join(", ")}) => void>`;
    }
}

// d.ts generator
export class TSDCodeGen {
    private _split_index: number;
    private _outDir: string;
    private _splitter: FileSplitter | undefined;
    private _types: TypeDB;

    constructor(outDir: string) {
        this._split_index = 0;
        this._outDir = outDir;

        this._types = new TypeDB();
    }

    private make_path(index: number) {
        const filename = `godot${index}.gen.d.ts`;
        if (typeof this._outDir !== "string" || this._outDir.length == 0) {
            return filename;
        }
        if (this._outDir.endsWith("/")) {
            return this._outDir + filename;
        }
        return this._outDir + "/" + filename;
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
            if (!gd_method(FileAccess, 'file_exists')(path)) {
                break;
            }
            console.log("delete file", path);
            jsb.editor.delete_file(path);
        }
    }

    has_class(name?: string): boolean {
        return typeof name === "string" && typeof this._types.classes[name] !== "undefined"
    }

    async emit() {
        await frame_step();

        const tasks = new CodegenTasks("godot.d.ts");

        // predefined lines
        tasks.add_task("Predefined Lines", () => this.emit_mock());

        // all singletons
        for (let singleton_name in this._types.singletons) {
            tasks.add_task("Singletons", () => this.emit_singleton(this._types.singletons[singleton_name]));
        }

        // godot classes
        for (let class_name in this._types.classes) {
            const cls = this._types.classes[class_name];
            if (IgnoredTypes.has(class_name)) {
                continue;
            }
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

        tasks.add_task("Cleanup", () => {
            this._splitter?.close();
            this.cleanup();
        });

        return tasks.submit();
    }

    private emit_utility(utility_func: jsb.editor.MethodBind) {
        const global_doc = this._types.find_doc("@GlobalScope");
        const cg = this.split();
        DocCommentHelper.write(cg, global_doc?.methods[utility_func.name]?.description, true);
        cg.utility_(utility_func);
    }

    private emit_global(global_obj: jsb.editor.GlobalConstantInfo) {
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

    private emit_mock() {
        const cg = this.split();
        for (let line of MockLines) {
            cg.line(line);
        }

        if (GodotAnyType != "any") {
            let gd_variant_alias = `type ${GodotAnyType} = `;
            for (let i = enum_value(Variant.Type, "TYPE_NIL") + 1; i < enum_value(Variant.Type, "TYPE_MAX"); ++i) {
                const type_name = get_primitive_type_name(i);
                if (type_name == GodotAnyType || type_name == "any") continue;
                gd_variant_alias += type_name + " | ";
            }
            gd_variant_alias += "undefined";
            cg.line(gd_variant_alias);
        }

    }

    private emit_singleton(singleton: jsb.editor.SingletonInfo) {
        const cg = this.split();
        const cls = this._types.classes[singleton.class_name];
        if (typeof cls !== "undefined") {
            cg.line_comment_(`_singleton_class_: ${singleton.class_name}`);
            this.emit_godot_class(cg, cls, true);
        } else {
            cg.line_comment_(`ERROR: singleton ${singleton.name} without class info ${singleton.class_name}`)
        }
    }

    private emit_godot_primitive(cg: CodeWriter, cls: jsb.editor.PrimitiveClassInfo) {
        const class_doc = this._types.find_doc(cls.name);
        const ignored_consts: Set<string> = new Set();
        const class_ns_cg = cg.namespace_(cls.name, class_doc);
        if (cls.enums) {
            for (let enum_info of cls.enums) {
                const enum_cg = class_ns_cg.enum_(enum_info.name);
                for (let [name, value] of Object.entries(enum_info.literals)) {
                    const constant = cls.constants!.find(v => v.name == name);
                    enum_cg.element_(name, value);
                    if (constant) {
                        ignored_consts.add(name);
                    }
                }
                enum_cg.finish();
            }
        }
        class_ns_cg.finish();

        const type_name = jsb.internal.get_type_name(cls.type);
        const type_mutation = get_type_mutation(type_name);
        const super_ = type_mutation.super ?? undefined;
        const class_cg = cg.class_(type_name, type_mutation.generic_parameters, super_, type_mutation.super_generic_arguments, type_mutation.property_overrides, type_mutation.intro, false, class_doc);
        if (cls.constants) {
            for (let constant of cls.constants) {
                if (!ignored_consts.has(constant.name) && !ignored_consts.has(upper_snake_to_pascal_case(constant.name))) {
                    class_cg.primitive_constant_(constant);
                }
            }
        }
        for (let constructor_info of cls.constructors) {
            class_cg.constructor_(constructor_info);
        }

        for (let method_info of cls.methods) {
            class_cg.ordinary_method_(method_info);
        }
        for (let operator_info of cls.operators) {
            class_cg.operator_(operator_info);
        }
        for (let property_info of cls.properties) {
            class_cg.primitive_property_(property_info);
        }
        class_cg.finish();
    }

    private emit_godot_class(cg: CodeWriter, cls: jsb.editor.ClassInfo, singleton_mode: boolean) {
        try {
            const class_doc = this._types.find_doc(cls.name);
            const ignored_consts: Set<string> = new Set();
            const class_ns_cg = cg.namespace_(cls.name, class_doc);
            if (cls.enums) {
                for (let enum_info of cls.enums) {
                    const enum_cg = class_ns_cg.enum_(enum_info.name);
                    for (let [name, value] of Object.entries(enum_info.literals)) {
                        enum_cg.element_(name, value)
                        ignored_consts.add(name);
                    }
                    enum_cg.finish();
                }
            }
            class_ns_cg.finish();

            const type_mutation = get_type_mutation(cls.name, this._types.classes);
            const super_ = type_mutation.super ?? (this.has_class(cls.super) ? cls.super : undefined);
            const class_cg = cg.class_(cls.name, type_mutation.generic_parameters, super_, type_mutation.super_generic_arguments, type_mutation.property_overrides, type_mutation.intro, singleton_mode, class_doc);
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
            for (let method_info of cls.virtual_methods) {
                class_cg.virtual_method_(method_info);
            }
            for (let method_info of cls.methods) {
                class_cg.ordinary_method_(method_info);
            }
            for (let property_info of cls.properties) {
                class_cg.property_(property_info);
            }
            if (cls.signals) {
                for (let signal_info of cls.signals) {
                    class_cg.signal_(signal_info);
                }
            }
            class_cg.finish();
        } catch (error) {
            console.error(`failed to generate '${cls.name}'`);
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
        console.log('SceneTSDCodeGen constructor');
        this._out_dir = out_dir;
        this._scene_paths = scene_paths;

        this._types = new TypeDB();
    }

    private make_scene_path(scene_path: string, include_filename = true) {
        const relative_path = (
            include_filename
                ? scene_path.replace(/\.t?scn$/i, '.nodes.gen.d.ts')
                : scene_path.replace(/\/[^\/]+$/, '')
        ).replace(/^res:\/\/?/, '');

        if (typeof this._out_dir !== 'string' || this._out_dir.length == 0) {
            return relative_path;
        }

        return this._out_dir.endsWith('/')
            ? this._out_dir + relative_path
            : this._out_dir + '/' + relative_path;
    }

    async emit() {
        await frame_step();

        const tasks = new CodegenTasks('Generating scene node types');

        for (const scene_path of this._scene_paths) {
            tasks.add_task(`Generating scene node types: ${scene_path}`, () => this.emit_scene_node_types(scene_path));
        }

        return tasks.submit();
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
            const helper = require('godot').GodotJSEditorHelper;
            const children = (gd_method(helper, 'get_scene_nodes')(scene_path) as undefined | NodeTypeDescriptorPathMap)?.proxy();

            if (typeof children !== 'object') {
                throw new Error(`root node children unavailable: ${scene_path}`);
            }

            const dir_path = this.make_scene_path(scene_path, false);
            const dir_error = gd_method(DirAccess, 'make_dir_recursive_absolute')(dir_path);

            if (dir_error !== 0) {
                console.error(`failed to create directory (error: ${dir_error}): ${dir_path}`);
            }

            const file_path = this.make_scene_path(scene_path);
            const file = gd_method(FileAccess, 'open')(file_path, enum_value(FileAccess.ModeFlags, 'WRITE'));

            if (!file) {
                throw new Error(`failed to open file for writing: ${dir_path}`);
            }

            try {
                const file_writer = new FileWriter(file_path, this._types, file);
                const module = new ModuleWriter(file_writer, 'godot');
                const scene_nodes_interface = new InterfaceWriter(module, 'SceneNodes');
                const scene_property = scene_nodes_interface.property_(scene_path.replace(/^res:\/\//, ''));
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
        console.log('ResourceTSDCodeGen constructor');
        this._out_dir = out_dir;
        this._resource_paths = resource_paths;

        this._types = new TypeDB();
    }

    private make_resource_path(resource_path: string, include_filename = true) {
        const relative_path = (
          include_filename
            ? resource_path + '.gen.d.ts'
            : resource_path.replace(/\/[^\/]+$/, '')
        ).replace(/^res:\/\/?/, '');

        if (typeof this._out_dir !== 'string' || this._out_dir.length == 0) {
            return relative_path;
        }

        return this._out_dir.endsWith('/')
          ? this._out_dir + relative_path
          : this._out_dir + '/' + relative_path;
    }

    async emit() {
        await frame_step();

        const tasks = new CodegenTasks('Generating resource types');

        for (const resource_path of this._resource_paths) {
            tasks.add_task(`Generating resource type: ${resource_path}`, () => this.emit_resource_type(resource_path));
        }

        return tasks.submit();
    }

    private emit_resource_type(resource_path: string) {
        try {
            const helper = require('godot').GodotJSEditorHelper;
            const descriptor = (gd_method(helper, 'get_resource_type_descriptor')(resource_path) as undefined | TypeDescriptor)?.proxy();

            if (typeof descriptor !== 'object') {
                throw new Error(`resource type unavailable: ${resource_path}`);
            }

            const dir_path = this.make_resource_path(resource_path, false);
            const dir_error = gd_method(DirAccess, 'make_dir_recursive_absolute')(dir_path);

            if (dir_error !== 0) {
                console.error(`failed to create directory (error: ${dir_error}): ${dir_path}`);
            }

            const file_path = this.make_resource_path(resource_path);
            const file = gd_method(FileAccess, 'open')(file_path, enum_value(FileAccess.ModeFlags, 'WRITE'));

            if (!file) {
                throw new Error(`failed to open file for writing: ${dir_path}`);
            }

            try {
                const file_writer = new FileWriter(file_path, this._types, file);
                const module = new ModuleWriter(file_writer, 'godot');
                const resource_types_interface = new InterfaceWriter(module, 'ResourceTypes');
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
