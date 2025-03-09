
import {
    DirAccess,
    FileAccess,
    GDictionary,
    PropertyHint,
    Variant,
    str as gd_to_string,
    type_string,
    MethodFlags, GodotJSEditorHelper as helper,
} from 'godot';
import * as jsb from "godot-jsb";
import { ClassInfo } from 'godot-jsb';

if (!jsb.TOOLS_ENABLED) {
    throw new Error("codegen is only allowed in editor mode")
}

const tab = "    ";
const GodotAnyType: string = "GAny";

interface GenericParameter {
    extends?: string;
    default?: string;
}

type PropertyOverrides = Record<string, string[] | ((line: string) => string)>;

interface TypeMutation {
    generic_parameters?: Record<string, GenericParameter>;
    super?: string;
    super_generic_arguments?: string[];
    intro?: string[];
    property_overrides?: PropertyOverrides;
}

const CallableBind = {
    description: "Create a callable object with a bound object `self`",
    methods: [
        "static create<R = void>(self: Object, fn: () => R): Callable0<R>",
        "static create<T1, R = void>(self: Object, fn: (v1: T1) => R): Callable1<T1, R>",
        "static create<T1, T2, R = void>(self: Object, fn: (v1: T1, v2: T2) => R): Callable2<T1, T2, R>",
        "static create<T1, T2, T3, R = void>(self: Object, fn: (v1: T1, v2: T2, v3: T3) => R): Callable3<T1, T2, T3, R>",
        "static create<T1, T2, T3, T4, R = void>(self: Object, fn: (v1: T1, v2: T2, v3: T3, v4: T4) => R): Callable4<T1, T2, T3, T4, R>",
        "static create<T1, T2, T3, T4, T5, R = void>(self: Object, fn: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => R): Callable5<T1, T2, T3, T4, T5, R>",
    ]
};
const CallableFuncBind = {
    description: "Create godot Callable without a bound object",
    methods: [
        "static create<R = void>(fn: () => R): Callable0<R>",
        "static create<T1, R = void>(fn: (v1: T1) => R): Callable1<T1, R>",
        "static create<T1, T2, R = void>(fn: (v1: T1, v2: T2) => R): Callable2<T1, T2, R>",
        "static create<T1, T2, T3, R = void>(fn: (v1: T1, v2: T2, v3: T3) => R): Callable3<T1, T2, T3, R>",
        "static create<T1, T2, T3, T4, R = void>(fn: (v1: T1, v2: T2, v3: T3, v4: T4) => R): Callable4<T1, T2, T3, T4, R>",
        "static create<T1, T2, T3, T4, T5, R = void>(fn: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => R): Callable5<T1, T2, T3, T4, T5, R>",
    ]
};

function chain_mutators(...mutators: Array<(line: string) => string>) {
    return function(line: string) {
        return mutators.reduce((line, mutator) => mutator(line), line);
    };
}
function mutate_parameter_type(name: string, type: string) {
    return function(line: string) {
        return line.replace(new RegExp(`[,(] *${name}: .+?([,)])/`, 'g'), `$1${name}: ${type}$2`);
    };
}
function mutate_return_type(type: string) {
    return function(line: string) {
        return line.replace(/: [^:]+$/g, `: ${type}`);
    };
}
function mutate_template(template: string) {
    return function(line: string) {
        return line.replace(/([^(]+)(<[^>]+> *)?\(/, `$1$2<${template}>(`);
    };
}

const TypeMutations: Record<string, TypeMutation> = {
    Signal: {
        super: "AnySignal",
    },
    Callable: {
        super: "AnyCallable",
        intro: [
            ...CallableBind.methods.reduce((lines: string[], method: string) => {
                return [
                    ...lines,
                    `/** ${CallableBind.description} */`,
                    method,
                ];
            }, []),
            ...CallableFuncBind.methods.reduce((lines: string[], method: string) => {
                return [
                    ...lines,
                    `/** ${CallableBind.description} */`,
                    method,
                ];
            }, []),
        ],
    },
    GArray: {
        generic_parameters: {
            T: {
                default: "Any",
            },
        },
        intro: [
            "[Symbol.iterator](): IteratorObject<T>",
            "/** Returns a Proxy that targets this GArray but behaves similar to a JavaScript array. */",
            `proxy(): GArrayProxy<T>`,
            "",
            "set_indexed(index: number, value: T): void",
            "get_indexed(index: number): T",
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
            bsearch_custom: chain_mutators(mutate_parameter_type("value", "T"), mutate_parameter_type("func", "func: Callable2<T, T, boolean>")),
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
            sort_custom: mutate_parameter_type("func", "func: Callable2<T, T, boolean>"),
            all: mutate_parameter_type("method", "Callable1<T, boolean>"),
            any: mutate_parameter_type("method", "Callable1<T, boolean>"),
            filter: mutate_parameter_type("method", "Callable1<T, boolean>"),
            map: chain_mutators(mutate_parameter_type("method", "Callable1<T, U>"), mutate_return_type("GArray<U>"), mutate_template("U")),
        },
    },
    GDictionary: {
        generic_parameters: {
            T: {
                default: "Record<any, any>",
            },
        },
        intro: [
            "[Symbol.iterator](): IteratorObject<{ key: any, value: any }>",
            "/** Returns a Proxy that targets this GDictionary but behaves similar to a regular JavaScript object. Values are exposed as enumerable properties, so Object.keys(), Object.entries() etc. will work. */",
            "proxy(): GDictionaryProxy<T>",
            "",
            "set_keyed<K extends keyof T>(key: K, value: T[K]): void",
            "get_keyed<K extends keyof T>(key: K): T[K]",
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
            get_or_add: chain_mutators(mutate_parameter_type("key", "K"), mutate_parameter_type("default", "T[K]"), mutate_parameter_type("default", "T[K]"), mutate_template("K extends keyof T")),
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
                "get_node<Path extends StaticNodePath<Map>>(path: Path): ResolveNodePath<Map, Path>",
                "get_node(path: NodePath | string): Node",
            ],
            get_node_or_null: [
                "get_node_or_null<Path extends StaticNodePath<Map>>(path: Path): null | ResolveNodePath<Map, Path>",
                "get_node_or_null(path: NodePath | string): null | Node",
            ],
        },
    },
    PackedByteArray: {
        intro: [
            "/** [jsb utility method] Converts a PackedByteArray to a JavaScript ArrayBuffer. */",
            "to_array_buffer(): ArrayBuffer"
        ],
    },
};

const InheritedTypeMutations: Record<string, TypeMutation> = {
    Node: {
        generic_parameters: {
            Map: {
                extends: "Record<string, Node>",
                default: "Record<string, Node>",
            },
        },
        super_generic_arguments: ["Map"],
    },
};

function class_type_mutation(cls: ClassInfo): TypeMutation {
    const intro: string[] = []

    if (typeof cls.element_type !== "undefined") {
        const element_type_name = get_primitive_type_name(cls.element_type);
        intro.push(`set_indexed(index: number, value: ${element_type_name}): void`);
        intro.push(`get_indexed(index: number): ${element_type_name}`);
    }

    if (cls.is_keyed) {
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

    line(text: string): void;

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
      intro: undefined | string[],
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
    helper.show_toast(msg, 0); // 0: info, 1: warning, 2: error
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
        progress.init(`codegen-${this._name}`, `Generating ${this._name}`, this.tasks.length);

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
            toast(`${this._name} generated successfully`);
        } catch (e) {
            toast(`${this._name} failed!`);
            progress.finish();
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
    ["vargargs"]: "vargargs_",
}

const PrimitiveTypeNames: { [type: number]: string } = {
    [Variant.Type.TYPE_NIL]: "any",
    [Variant.Type.TYPE_BOOL]: "boolean",
    [Variant.Type.TYPE_INT]: "int64",
    [Variant.Type.TYPE_FLOAT]: "float64",
    [Variant.Type.TYPE_STRING]: "string",
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
        case Variant.Type.TYPE_PACKED_COLOR_ARRAY: return join_type_name(primitive_name, get_js_array_type_name(get_primitive_type_name(Variant.Type.TYPE_COLOR)));
        case Variant.Type.TYPE_PACKED_VECTOR2_ARRAY: return join_type_name(primitive_name, get_js_array_type_name(get_primitive_type_name(Variant.Type.TYPE_VECTOR2)));
        case Variant.Type.TYPE_PACKED_VECTOR3_ARRAY: return join_type_name(primitive_name, get_js_array_type_name(get_primitive_type_name(Variant.Type.TYPE_VECTOR3)));
        case Variant.Type.TYPE_PACKED_STRING_ARRAY: return join_type_name(primitive_name, get_js_array_type_name("string"));
        case Variant.Type.TYPE_PACKED_FLOAT32_ARRAY: return join_type_name(primitive_name, get_js_array_type_name("float32"));
        case Variant.Type.TYPE_PACKED_FLOAT64_ARRAY: return join_type_name(primitive_name, get_js_array_type_name("float64"));
        case Variant.Type.TYPE_PACKED_INT32_ARRAY: return join_type_name(primitive_name, get_js_array_type_name("int32"));
        case Variant.Type.TYPE_PACKED_INT64_ARRAY: return join_type_name(primitive_name, get_js_array_type_name("int64"));
        case Variant.Type.TYPE_PACKED_BYTE_ARRAY: return join_type_name(primitive_name, get_js_array_type_name("byte"), "ArrayBuffer");
        case Variant.Type.TYPE_NODE_PATH: return join_type_name(primitive_name, "string");
        default: return primitive_name;
    }
}

function replace_var_name(name: string) {
    const rep = KeywordReplacement[name];
    return typeof rep !== "undefined" ? rep : name;
}

abstract class AbstractWriter implements ScopeWriter {
    abstract line(text: string): void;
    abstract get size(): number;
    abstract get lineno(): number;
    abstract finish(): void;
    abstract get types(): TypeDB;
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
      intro: undefined | string[],
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

class IndentWriter extends AbstractWriter {
    protected _base: ScopeWriter;
    protected _lines: string[];
    protected _size: number = 0;

    constructor(base: ScopeWriter) {
        super();
        this._base = base;
        this._lines = [];
    }

    get size() { return this._size; }
    get lineno() { return this._lines.length; }
    get types() { return this._base.types; }

    finish() {
        for (var line of this._lines) {
            this._base.line(tab + line);
        }
    }

    line(text: string): void {
        this._lines.push(text);
        this._size += tab.length + text.length;
    }
}

class ModuleWriter extends IndentWriter {
    protected _name: string;

    constructor(base: ScopeWriter, name: string) {
        super(base);
        this._name = name;
    }

    finish() {
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
    protected _intro?: string[];
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
        intro: undefined | string[],
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
        this._property_overrides = property_overrides;
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

        for (const line of this._intro) {
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
            `${replace_var_name(it.name)}: ${this.types.replace_type_inplace(get_primitive_type_name_as_input(it.type), this.get_scoped_type_replacer())}`
        ).join(", ");
        this.line(`constructor(${args})`);
    }

    constructor_ex_() {
        this.line(`constructor(identifier?: any)`);
    }

    operator_(operator_info: jsb.editor.OperatorInfo) {
        this._separator_line = true;
        const return_type_name = this.types.replace_type_inplace(get_primitive_type_name(operator_info.return_type), this.get_scoped_type_replacer());
        const left_type_name = this.types.replace_type_inplace(get_primitive_type_name_as_input(operator_info.left_type), this.get_scoped_type_replacer());
        if (operator_info.right_type == Variant.Type.TYPE_NIL) {
            this.line(`static ${operator_info.name}(left: ${left_type_name}): ${return_type_name}`);
        } else {
            const right_type_name = this.types.replace_type_inplace(get_primitive_type_name_as_input(operator_info.right_type), this.get_scoped_type_replacer());
            this.line(`static ${operator_info.name}(left: ${left_type_name}, right: ${right_type_name}): ${return_type_name}`);
        }
    }

    virtual_method_(method_info: jsb.editor.MethodBind) {
        this.method_(method_info, "/* gdvirtual */ ");
    }

    ordinary_method_(method_info: jsb.editor.MethodBind) {
        this.method_(method_info, "");
    }

    //TODO gtPlaceholder (Optional) Generic type argument placeholder, return the generic typed version if in a generic type context.
    private get_scoped_type_replacer(gtPlaceholder?: string) {
        const replaceClasses = ["Signal", "Callable", "GArray"];
        if (replaceClasses.includes(this._name)) {
            // specialized type name in the declaration scope of this type itself
            return function (type_name: string): string {
                if (type_name == "Signal") return "AnySignal";
                if (type_name == "Callable") return "AnyCallable";
                return type_name;
            }
        } else {
            // type name in the declaration scope of other types
            return function (type_name: string): string {
                return type_name;
            }
        }
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

        let args = this.types.make_args(method_info, this.get_scoped_type_replacer());
        let rval = this.types.make_return(method_info, this.get_scoped_type_replacer());
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
        this._property_overrides = property_overrides;
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

class GenericWriter extends AbstractWriter {
    private _name: string;
    private _base: ScopeWriter;
    private _lines: string[];
    private _size: number;

    constructor(base: AbstractWriter, name: string) {
        super();
        this._base = base;
        this._name = name;
        this._lines = [];
        this._size = name.length + 2;
    }

    get size() { return this._size; }
    get lineno() { return this._lines.length; }
    get types() { return this._base.types; }

    finish(): void {
        if (this._lines.length < 2) {
            this._base.line(`${this._name}<${this._lines[0] ?? ""}>`);
            return;
        }

        this._base.line(`${this._name}<`);
        const indented = new IndentWriter(this._base);
        for (const line of this._lines) {
            indented.line(line);
        }
        indented.finish();
        this._base.line(">");
    }

    line(text: string): void {
        this._lines.push(text);
        this._size += text.length + 1; // + 1 due to the line break, tabs?
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
        this._property_overrides = property_overrides;
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

class PropertyWriter extends AbstractWriter {
    private _name: string;
    private _base: ScopeWriter;
    private _lines: string[];
    private _size: number = 0;

    constructor(base: AbstractWriter, name: string) {
        super();
        this._base = base;
        this._name = name;
        this._lines = [];
    }

    get size() { return this._size; }
    get lineno() { return this._lines.length; }
    get types() { return this._base.types; }

    finish(): void {
        if (this._lines.length === 0) {
            return;
        }

        this._lines[this._lines.length - 1] += ",";

        for (const line of this._lines) {
            this._base.line(line);
        }
    }

    line(text: string): void {
        if (this._lines.length === 0) {
            const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(this._name)
                ? this._name
                : `"${this._name.replace("\"", "\\\"")}"`;
            text = `${key}: ${text}`;
            this._size = 1; // trailing comma
        }

        this._lines.push(text);
        this._size += text.length;
    }
}

class FileWriter extends AbstractWriter {
    private _file: FileAccess;
    private _size = 0;
    private _lineno = 0;
    private _types: TypeDB;

    constructor(types: TypeDB, file: FileAccess) {
        super();
        this._types = types;
        this._file = file;
    }

    get size() { return this._size; }
    get lineno() { return this._lineno; }
    get types() { return this._types; }

    line(text: string): void {
        this._file.store_line(text);
        this._size += text.length;
        this._lineno += 1;
    }

    finish(): void {
        this._file.flush();
    }
}

class FileSplitter {
    private _file: FileAccess;
    private _toplevel: ModuleWriter;
    private _types: TypeDB;

    constructor(types: TypeDB, filePath: string) {
        this._types = types;
        this._file = FileAccess.open(filePath, FileAccess.ModeFlags.WRITE);
        this._toplevel = new ModuleWriter(new FileWriter(this._types, this._file), "godot");

        this._file.store_line("// AUTO-GENERATED");
        this._file.store_line('/// <reference no-default-lib="true"/>');
    }

    close() {
        this._toplevel.finish();
        this._file.flush();
        this._file.close();
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

    make_typename(info: jsb.editor.PropertyInfo, used_as_input: boolean): string {
        if (info.hint == PropertyHint.PROPERTY_HINT_RESOURCE_TYPE) {
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

    make_arg(info: jsb.editor.PropertyInfo, type_replacer?: (name: string) => string): string {
        return `${replace_var_name(info.name)}: ${this.replace_type_inplace(this.make_typename(info, true), type_replacer)}`
    }

    make_literal_value(value: jsb.editor.DefaultArgumentInfo) {
        // plain types
        const type_name = get_primitive_type_name(value.type);
        switch (value.type) {
            case Variant.Type.TYPE_BOOL: return value.value == null ? "false" : `${value.value}`;
            case Variant.Type.TYPE_FLOAT:
            case Variant.Type.TYPE_INT: return value.value == null ? "0" : `${value.value}`;
            case Variant.Type.TYPE_STRING:
            case Variant.Type.TYPE_STRING_NAME: return value.value == null ? "''" : `'${value.value}'`;
            case Variant.Type.TYPE_NODE_PATH: return value.value == null ? "''" : `'${gd_to_string(value.value)}'`;
            case Variant.Type.TYPE_ARRAY: return value.value == null || value.value.is_empty() ? "[]" : `${gd_to_string(value.value)}`;
            case Variant.Type.TYPE_OBJECT: return value.value == null ? "undefined" : "<any> {}";
            case Variant.Type.TYPE_NIL: return "<any> {}";
            case Variant.Type.TYPE_CALLABLE:
            case Variant.Type.TYPE_RID: return `new ${type_name}()`;
            default: break;
        }
        // make them more readable?
        if (value.type == Variant.Type.TYPE_VECTOR2 || value.type == Variant.Type.TYPE_VECTOR2I) {
            if (value == null) return `new ${type_name}()`;
            if (value.value.x == value.value.y) {
                if (value.value.x == 0) return `${type_name}.ZERO`;
                if (value.value.x == 1) return `${type_name}.ONE`;
            }
            return `new ${type_name}(${value.value.x}, ${value.value.y})`;
        }
        if (value.type == Variant.Type.TYPE_VECTOR3 || value.type == Variant.Type.TYPE_VECTOR3I) {
            if (value == null) return `new ${type_name}()`;
            if (value.value.x == value.value.y == value.value.z) {
                if (value.value.x == 0) return `${type_name}.ZERO`;
                if (value.value.x == 1) return `${type_name}.ONE`;
            }
            return `new ${type_name}(${value.value.x}, ${value.value.y}, ${value.value.z})`;
        }
        if (value.type == Variant.Type.TYPE_COLOR) {
            if (value == null) return `new ${type_name}()`;
            return `new ${type_name}(${value.value.r}, ${value.value.g}, ${value.value.b}, ${value.value.a})`;
        }
        if (value.type == Variant.Type.TYPE_RECT2 || value.type == Variant.Type.TYPE_RECT2I) {
            if (value.value == null) return `new ${type_name}()`;
            return `new ${type_name}(${value.value.position.x}, ${value.value.position.y}, ${value.value.size.x}, ${value.value.size.y})`
        }
        // it's tedious to repeat all types :(
        if ((value.type >= Variant.Type.TYPE_PACKED_BYTE_ARRAY && value.type <= Variant.Type.TYPE_PACKED_COLOR_ARRAY)) {
            if (value.value == null || value.value.is_empty()) {
                return "[]";
            }
        }
        if (value.type == Variant.Type.TYPE_DICTIONARY) {
            if (value.value == null || value.value.is_empty()) return `new ${type_name}()`;
        }
        //NOTE hope all default value for Transform2D/Transform3D is IDENTITY
        if (value.type == Variant.Type.TYPE_TRANSFORM2D || value.type == Variant.Type.TYPE_TRANSFORM3D) {
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
        const varargs = "...vargargs: any[]";
        const is_vararg = !!(method_info.hint_flags & MethodFlags.METHOD_FLAG_VARARG);
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
        const is_vararg = !!(method_info.hint_flags & MethodFlags.METHOD_FLAG_VARARG);
        if (is_vararg || method_info.args_.length > 5) {
            // too difficult to declare as strongly typed, just fallback to raw signal type
            return "Signal";
        }

        const base_name = "Signal" + method_info.args_.length;
        if (method_info.args_.length == 0) {
            return base_name;
        }
        const args = method_info.args_.map((it, index) => this.make_typename(method_info.args_[index], true)).join(", ");
        return `${base_name}<${args}>`;
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
            if (!FileAccess.file_exists(path)) {
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
            for (let i = Variant.Type.TYPE_NIL + 1; i < Variant.Type.TYPE_MAX; ++i) {
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
                let previousValue = -1;
                for (let enumeration_name of enum_info.literals) {
                    const constant = cls.constants!.find(v => v.name == enumeration_name);
                    const value = constant?.value ?? previousValue + 1;
                    enum_cg.element_(enumeration_name, value);
                    if (constant) {
                        ignored_consts.add(enumeration_name);
                    }
                    previousValue = value;
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
                if (!ignored_consts.has(constant.name)) {
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
                    for (let enumeration_name of enum_info.literals) {
                        const value = cls.constants!.find(v => v.name == enumeration_name)!.value;
                        enum_cg.element_(enumeration_name, value)
                        ignored_consts.add(enumeration_name);
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
    console.log("SceneTSDCodeGen constructor");
    this._out_dir = out_dir;
    this._scene_paths = scene_paths;

    this._types = new TypeDB();
  }

  private make_path(scene_path: string, include_filename = true) {
    const relative_path = (
        include_filename
          ? scene_path.replace(/\.t?scn$/i, '.nodes.gen.d.ts')
          : scene_path.replace(/\/[^\/]+$/, '')
    ).replace(/^res:\/\//, '');

    if (typeof this._out_dir !== "string" || this._out_dir.length == 0) {
      return relative_path;
    }

    return this._out_dir.endsWith("/")
      ? this._out_dir + relative_path
      : this._out_dir + "/" + relative_path;
  }

  async emit() {
    await frame_step();

    const tasks = new CodegenTasks("Generating scene node types");

    for (const scene_path of this._scene_paths) {
        tasks.add_task(`Generating scene node types: ${scene_path}`, () => this.emit_scene_node_types(scene_path));
    }

    return tasks.submit();
  }

  private emit_children_node_types(writer: ScopeWriter, children: Record<string, NodeHierarchy>) {
      const child_writer = writer.object_();
      for (const [key, value] of Object.entries(children)) {
        const property = child_writer.property_(key);
        const generic = property.generic_(value.class);
        this.emit_children_node_types(generic, value.children);
        generic.finish();
        property.finish();
      }
      child_writer.finish();
  }

  private emit_scene_node_types(scene_path: string) {
    try {
      const helper = require('godot').GodotJSEditorHelper;
      const result = helper.get_scene_nodes(scene_path)?.proxy();

      if (!result) {
        throw new Error(`root node children unavailable: ${scene_path}`);
      }

      const dir_path = this.make_path(scene_path, false);
      const dir_error = DirAccess.make_dir_recursive_absolute(dir_path);

      if (dir_error !== 0) {
        console.error(`failed to create directory (error: ${dir_error}): ${dir_path}`);
      }

      const file = FileAccess.open(this.make_path(scene_path), FileAccess.ModeFlags.WRITE);

      if (!file) {
        throw new Error(`failed to open file for writing: ${dir_path}`);
      }

      try {
        const file_writer = new FileWriter(this._types, file);
        const module = new ModuleWriter(file_writer, 'godot');
        const scene_nodes_interface = new InterfaceWriter(module, 'SceneNodes');
        const scene_property = scene_nodes_interface.property_(scene_path.replace(/^res:\/\//, ''));
        this.emit_children_node_types(scene_property, result.children);
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
