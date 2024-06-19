
import { FileAccess, PropertyHint, Variant } from "godot";
import * as jsb from "godot-jsb";

if (!jsb.TOOLS_ENABLED) {
    throw new Error("codegen is only allowed in editor mode")
}

//TODO use godot.MethodFlags.METHOD_FLAG_VARARG
const METHOD_FLAG_VARARG = 16;

interface CodeWriter {
    get types(): TypeDB;
    get size(): number;
    get lineno(): number;

    line(text: string): void;

    enum_(name: string): EnumWriter;
    namespace_(name: string): NamespaceWriter;
    class_(name: string, super_: string, singleton_mode: boolean): ClassWriter;
    // singleton_(info: jsb.editor.SingletonInfo): SingletonWriter;
    line_comment_(text: string): void;
}

interface ScopeWriter extends CodeWriter {
    finish(): void;
}

//TODO remove all these lines after all primitive types implemented
const MockLines = [
    "class GodotError {}",
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

    // a special item which used as the name of variadic arguments placement
    ["vargargs"]: "vargargs_",
}

const PrimitiveTypeNames : { [type: number]: string } = {
    [Variant.Type.TYPE_NIL]: "any",
    [Variant.Type.TYPE_BOOL]: "boolean",
    [Variant.Type.TYPE_INT]: "number /*i64*/",
    [Variant.Type.TYPE_FLOAT]: "number /*f64*/",
    [Variant.Type.TYPE_STRING]: "string",

    //TODO the following mappings could be replaced with Variant::get_type_name()
    // math types
    [Variant.Type.TYPE_VECTOR2]: "Vector2",
    [Variant.Type.TYPE_VECTOR2I]: "Vector2i",
    [Variant.Type.TYPE_RECT2]: "Rect2",
    [Variant.Type.TYPE_RECT2I]: "Rect2i",
    [Variant.Type.TYPE_VECTOR3]: "Vector3",
    [Variant.Type.TYPE_VECTOR3I]: "Vector3i",
    [Variant.Type.TYPE_TRANSFORM2D]: "Transform2D",
    [Variant.Type.TYPE_VECTOR4]: "Vector4",
    [Variant.Type.TYPE_VECTOR4I]: "Vector4i",
    [Variant.Type.TYPE_PLANE]: "Plane",
    [Variant.Type.TYPE_QUATERNION]: "Quaternion",
    [Variant.Type.TYPE_AABB]: "AABB",
    [Variant.Type.TYPE_BASIS]: "Basis",
    [Variant.Type.TYPE_TRANSFORM3D]: "Transform3D",
    [Variant.Type.TYPE_PROJECTION]: "Projection",

    // misc types
    [Variant.Type.TYPE_COLOR]: "Color",
    [Variant.Type.TYPE_STRING_NAME]: "StringName",
    [Variant.Type.TYPE_NODE_PATH]: "NodePath",
    [Variant.Type.TYPE_RID]: "RID",
    [Variant.Type.TYPE_OBJECT]: "Object",
    [Variant.Type.TYPE_CALLABLE]: "Callable",
    [Variant.Type.TYPE_SIGNAL]: "Signal",
    [Variant.Type.TYPE_DICTIONARY]: "Dictionary",
    [Variant.Type.TYPE_ARRAY]: "Array",

    // typed arrays
    [Variant.Type.TYPE_PACKED_BYTE_ARRAY]: "PackedByteArray",
    [Variant.Type.TYPE_PACKED_INT32_ARRAY]: "PackedInt32Array",
    [Variant.Type.TYPE_PACKED_INT64_ARRAY]: "PackedInt64Array",
    [Variant.Type.TYPE_PACKED_FLOAT32_ARRAY]: "PackedFloat32Array",
    [Variant.Type.TYPE_PACKED_FLOAT64_ARRAY]: "PackedFloat64Array",
    [Variant.Type.TYPE_PACKED_STRING_ARRAY]: "PackedStringArray",
    [Variant.Type.TYPE_PACKED_VECTOR2_ARRAY]: "PackedVector2Array",
    [Variant.Type.TYPE_PACKED_VECTOR3_ARRAY]: "PackedVector3Array",
    [Variant.Type.TYPE_PACKED_COLOR_ARRAY]: "PackedColorArray",
}
const RemapTypes: { [name: string]: string } = {
    ["Error"]: "GodotError",
}
const IgnoredTypes = new Set([
    "IPUnix",
    "GodotNavigationServer2D",
    "GodotPhysicsServer2D",
    "GodotPhysicsServer3D",
    "PhysicsServer2DExtension",
    "PhysicsServer3DExtension",

    // gdscript related classes
    "GDScript",
    "GDScriptEditorTranslationParserPlugin",
    "GDScriptNativeClass",
    "GDScriptSyntaxHighlighter",
])
const PrimitiveTypesSet = new Set([
    "Vector2",
    "Vector2i",
    "Rect2",
    "Rect2i",
    "Vector3",
    "Vector3i",
    "Transform2D",
    "Vector4",
    "Vector4i",
    "Plane",
    "Quaternion",
    "AABB",
    "Basis",
    "Transform3D",
    "Projection",
    "Color",
    "StringName",
    "NodePath",
    "RID",
    "Object",
    "Callable",
    "Signal",
    "Dictionary",
    "Array",
    "PackedByteArray",
    "PackedInt32Array",
    "PackedInt64Array",
    "PackedFloat32Array",
    "PackedFloat64Array",
    "PackedStringArray",
    "PackedVector2Array",
    "PackedVector3Array",
    "PackedColorArray",
])

function replace(name: string) {
    const rep = KeywordReplacement[name];
    return typeof rep !== "undefined" ? rep : name;
}
abstract class AbstractWriter implements ScopeWriter {
    abstract line(text: string): void;
    abstract get size(): number;
    abstract get lineno(): number;
    abstract finish(): void;
    abstract get types(): TypeDB;

    constructor() { }

    enum_(name: string): EnumWriter {
        if (name.indexOf('.') >= 0) {
            let layers = name.split('.');
            name = layers.splice(layers.length - 1)[0];
            return new EnumWriter(this.namespace_(layers.join(".")), name).auto();
        }
        return new EnumWriter(this, name);
    }
    namespace_(name: string): NamespaceWriter {
        return new NamespaceWriter(this, name)
    }
    class_(name: string, super_: string, singleton_mode: boolean): ClassWriter {
        return new ClassWriter(this, name, super_, singleton_mode);
    }
    // singleton_(info: jsb.editor.SingletonInfo): SingletonWriter {
    //     return new SingletonWriter(this, info);
    // }
    line_comment_(text: string) {
        this.line(`// ${text}`);
    }
}

const tab = "    ";

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
}

class NamespaceWriter extends IndentWriter {
    protected _name: string;

    constructor(base: ScopeWriter, name: string) {
        super(base);
        this._name = name;
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
    protected _super: string;
    protected _singleton_mode: boolean;

    constructor(base: ScopeWriter, name: string, super_: string, singleton_mode: boolean) {
        super(base);
        this._name = name;
        this._super = super_;
        this._singleton_mode = singleton_mode;
    }
    protected head() {
        if (typeof this._super !== "string" || this._super.length == 0) {
            return `class ${this._name}`
        }
        return `class ${this._name} extends ${this._super}`
    }
    protected make_method_prefix(method_info: jsb.editor.MethodBind): string {
        return this._singleton_mode || method_info.is_static ? "static " : "";
    }
    finish() {
        this._base.line(`${this.head()} {`)
        super.finish()
        this._base.line('}')
    }
    primitive_constant_(constant: jsb.editor.PrimitiveConstantInfo) {
        if (typeof constant.value !== "undefined") {
            this.line(`static readonly ${constant.name} = ${constant.value}`);
        } else {
            const type_name = PrimitiveTypeNames[constant.type];
            this.line(`static readonly ${constant.name}: ${type_name}`);
        }
    }
    constant_(constant: jsb.editor.ConstantInfo) {
        this.line(`static readonly ${constant.name} = ${constant.value}`);
    }
    private make_classname(class_name: string): string {
        const remap_name: string | undefined = RemapTypes[class_name];
        if (typeof remap_name !== "undefined") {
            return remap_name;
        }
        if (class_name in this.types.classes) {
            return class_name;
        } else {
            if (class_name.indexOf(".") >= 0) {
                const layers = class_name.split(".");
                if (layers.length == 2) {
                    // nested enums in primitive types do not exist in class_info, they are manually binded.
                    if (PrimitiveTypesSet.has(layers[0])) {
                        return class_name;
                    }
                    const cls = this.types.classes[layers[0]];
                    if (typeof cls !== "undefined" && cls.enums!.findIndex(v => v.name == layers[1]) >= 0) {
                        return class_name;
                    }
                }
            }
            if (class_name in this.types.globals) {
                return class_name;
            }
            if (class_name in this.types.singletons) {
                return class_name;
            }
            // if (ReservedTypes.has(class_name)) {
            //     return class_name;
            // }
            console.warn("undefined class", class_name);
            return `any /*${class_name}*/`;
        }
    }
    private make_typename(info: jsb.editor.PropertyInfo): string {
        if (info.hint == PropertyHint.PROPERTY_HINT_RESOURCE_TYPE) {
            console.assert(info.hint_string.length != 0, "at least one valid class_name expected");
            return info.hint_string.split(",").map(class_name => this.make_classname(class_name)).join(" | ")
        }
        if (info.class_name.length == 0) {
            const primitive_name = PrimitiveTypeNames[info.type];
            if (typeof primitive_name !== "undefined") {
                return primitive_name;
            }
            return `any /*unhandled: ${info.type}*/`;
        }
        return this.make_classname(info.class_name);
    }
    private make_arg(info: jsb.editor.PropertyInfo): string {
        return `${replace(info.name)}: ${this.make_typename(info)}`
    }
    private make_literal_value(value: jsb.editor.DefaultArgumentInfo) {
        // plain types
        switch (value.type) {
            case Variant.Type.TYPE_BOOL: return value.value == null ? "false" : `${value.value}`;
            case Variant.Type.TYPE_FLOAT: 
            case Variant.Type.TYPE_INT: return value.value == null ? "0" : `${value.value}`;
            case Variant.Type.TYPE_STRING:
            case Variant.Type.TYPE_STRING_NAME: return value.value == null ? "''" : `'${value.value}'`;
            default: break;
        }
        // make them more readable?
        if (value.type == Variant.Type.TYPE_VECTOR2) {
            if (value == null) return 'new Vector2()';
            if (value.value.x == value.value.y) {
                if (value.value.x == 0) return `Vector2.ZERO`;
                if (value.value.x == 1) return `Vector2.ONE`;
            }
            return `new Vector2(${value.value.x}, ${value.value.y})`;
        }
        if (value.type == Variant.Type.TYPE_VECTOR3) {
            if (value == null) return 'new Vector3()';
            if (value.value.x == value.value.y == value.value.z) {
                if (value.value.x == 0) return `Vector3.ZERO`;
                if (value.value.x == 1) return `Vector3.ONE`;
            }
            return `new Vector3(${value.value.x}, ${value.value.y}, ${value.value.z})`;
        }
        if (value.type == Variant.Type.TYPE_COLOR) {
            if (value == null) return 'new Color()';
            return `new Color(${value.value.r}, ${value.value.g}, ${value.value.b}, ${value.value.a})`;
        }
        if (value.value == null) {
            return "<any> {} /*compound.type from nil*/";
        }
        //TODO value sig for compound types
        return `<any> {} /*compound.type from ${value.type}(${value.value})*/`;
    }
    private make_arg_default_value(method_info: jsb.editor.MethodBind, index: number): string {
        const default_arguments = method_info.default_arguments || [];
        const def_index = index - (method_info.args_.length - default_arguments.length);
        if (def_index < 0 || def_index >= default_arguments.length) return this.make_arg(method_info.args_[index]);
        return this.make_arg(method_info.args_[index]) + " = " + this.make_literal_value(default_arguments[def_index]);
    }
    private make_args(method_info: jsb.editor.MethodBind): string {
        //TODO consider default arguments
        const varargs = "...vargargs: any[]";
        const is_vararg = !!(method_info.hint_flags & METHOD_FLAG_VARARG);
        if (method_info.args_.length == 0) {
            return is_vararg ? varargs : "";
        }
        const args = method_info.args_.map((it, index) => this.make_arg_default_value(method_info, index)).join(", ");
        if (is_vararg) {
            return `${args}, ${varargs}`;
        }
        return args;
    }
    private make_return(method_info: jsb.editor.MethodBind): string {
        //TODO
        if (typeof method_info.return_ != "undefined") {
            return this.make_typename(method_info.return_)
        }
        return "void"
    }
    property_(getset_info: jsb.editor.PropertySetGetInfo) {
        // ignore properties which can't be directly represented with javascript (such as `AnimatedTexture.frame_0/texture`)
        if (getset_info.index >= 0 || getset_info.name.indexOf("/") >= 0) {
            return;
        }
        const type_name = this.make_typename(getset_info.info);
        console.assert(getset_info.getter.length != 0);
        if (getset_info.setter.length == 0) {
            this.line(`readonly ${getset_info.name}: ${type_name}`);
        } else {
            this.line(`${getset_info.name}: ${type_name}`);
        }
    }
    primitive_property_(property_info: jsb.editor.PrimitiveGetSetInfo) {
        const type_name = PrimitiveTypeNames[property_info.type];
        this.line(`${property_info.name}: ${type_name}`);
    }
    constructor_(constructor_info: jsb.editor.ConstructorInfo) {
        const args = constructor_info.arguments.map(it => `${replace(it.name)}: ${PrimitiveTypeNames[it.type]}`).join(", ");
        this.line(`constructor(${args})`);
    }
    operator_(operator_info: jsb.editor.OperatorInfo) {
        const return_type_name = PrimitiveTypeNames[operator_info.return_type];
        const left_type_name = PrimitiveTypeNames[operator_info.left_type];
        const right_type_name = PrimitiveTypeNames[operator_info.right_type];
        this.line(`static ${operator_info.name}(left: ${left_type_name}, right: ${right_type_name}): ${return_type_name}`);
    }
    method_(method_info: jsb.editor.MethodBind) {
        // some godot methods declared with special characters
        if (method_info.name.indexOf('/') >= 0 || method_info.name.indexOf('.') >= 0) {
            const args = this.make_args(method_info)
            const rval = this.make_return(method_info)
            const prefix = this.make_method_prefix(method_info);
            this.line(`${prefix}["${method_info.name}"]: (${args}) => ${rval}`);
            return;
        }
        const args = this.make_args(method_info)
        const rval = this.make_return(method_info)
        const prefix = this.make_method_prefix(method_info);
        this.line(`${prefix}${method_info.name}(${args}): ${rval}`);
    }
    // function_(method_info: jsb.editor.MethodInfo) {
    //     const args = this.make_args(method_info)
    //     const rval = this.make_return(method_info)
    //     this.line(`function ${method_info.name}(${args}): ${rval}`);
    // }
    signal_(signal_info: jsb.editor.SignalInfo) {
        if (this._singleton_mode) {
            this.line(`static readonly ${signal_info.name}: Signal`);
        } else {
            this.line(`readonly ${signal_info.name}: Signal`);
        }
        // this.line(`${signal_info.name}(op: jsb.SignalOp.Connect | jsb.SignalOp.Disconnect, callable: Callable): void`);
        // this.line(`${signal_info.name}(op: jsb.SignalOp.IsConnected, callable: Callable): boolean`);
        // this.line(`${signal_info.name}(op: jsb.SignalOp.Emit, ...args: any[]): GodotError`);
    }
}

class EnumWriter extends IndentWriter {
    protected _name: string;
    protected _auto = false;

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
        this.line(`${name} = ${value},`)
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
    private _toplevel: ScopeWriter;
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

class TypeDB {
    singletons: { [name: string]: jsb.editor.SingletonInfo } = {};
    classes: { [name: string]: jsb.editor.ClassInfo } = {};
    primitive_types: { [name: string]: jsb.editor.PrimitiveClassInfo } = {};
    globals: { [name: string]: jsb.editor.GlobalConstantInfo } = {};

    is_primitive_type(name: string): boolean {
        return typeof this.primitive_types[name] !== "undefined";
    }
}

// d.ts generator
export default class TSDCodeGen {
    private _split_index: number;
    private _outDir: string;
    private _splitter: FileSplitter | undefined;
    private _types: TypeDB = new TypeDB();

    constructor(outDir: string) {
        this._split_index = 0;
        this._outDir = outDir;

        const classes = jsb.editor.get_classes();
        const primitive_types = jsb.editor.get_primitive_types();
        const singletons = jsb.editor.get_singletons();
        const globals = jsb.editor.get_global_constants();
        for (let cls of classes) {
            this._types.classes[cls.name] = cls;
        }
        for (let cls of primitive_types) {
            this._types.primitive_types[cls.name] = cls;
        }
        for (let singleton of singletons) {
            this._types.singletons[singleton.name] = singleton;
        }
        for (let global_ of globals) {
            this._types.globals[global_.name] = global_;
        }
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
    private split(): CodeWriter {
        if (this._splitter == undefined) {
            return this.new_splitter().get_writer();
        }
        const len = this._splitter.get_size();
        const lineno = this._splitter.get_lineno();
        if (len > 1024 * 900 || lineno > 12000) {
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
            console.warn("delete file", path);
            jsb.editor.delete_file(path);
        }
    }

    has_class(name?: string): boolean {
        return typeof name === "string" && typeof this._types.classes[name] !== "undefined"
    }

    emit() {
        this.emit_mock();
        this.emit_singletons();
        this.emit_godot();
        this.emit_globals();
        this._splitter?.close();
        this.cleanup();
    }

    private emit_mock() {
        const cg = this.split();
        for (let line of MockLines) {
            cg.line(line);
        }
    }

    private emit_singletons() {
        const cg = this.split();
        for (let singleton_name in this._types.singletons) {
            const singleton = this._types.singletons[singleton_name];

            const cls = this._types.classes[singleton.class_name];
            if (typeof cls !== "undefined") {
                cg.line_comment_("// Singleton Class")
                this.emit_godot_class(cg, cls, true);
            } else {
                cg.line_comment_(`ERROR: singleton ${singleton.name} without class info ${singleton.class_name}`)
            }
        }
    }

    private emit_globals() {
        for (let global_name in this._types.globals) {
            const global_obj = this._types.globals[global_name];
            const cg = this.split();
            const ns = cg.enum_(global_obj.name);
            for (let name in global_obj.values) {
                ns.element_(name, global_obj.values[name]);
            }
            ns.finish();
        }
    }

    private emit_godot() {
        for (let class_name in this._types.classes) {
            const cls = this._types.classes[class_name];
            if (IgnoredTypes.has(class_name)) {
                continue;
            }
            if (typeof this._types.singletons[class_name] !== "undefined") {
                console.log("ignored singleton class", class_name);
                continue;
            }
            this.emit_godot_class(this.split(), cls, false);
        }

        for (let class_name in this._types.primitive_types) {
            const cls = this._types.primitive_types[class_name];
            this.emit_godot_primitive(this.split(), cls);
        }
    }

    private emit_godot_primitive(cg: CodeWriter, cls: jsb.editor.PrimitiveClassInfo) {
        const ignored_consts: Set<string> = new Set();
        const class_ns_cg = cg.namespace_(cls.name);
        if (cls.enums) {
            for (let enum_info of cls.enums) {
                const enum_cg = class_ns_cg.enum_(enum_info.name);
                for (let name of enum_info.literals) {
                    const value = cls.constants!.find(v => v.name == name)!.value;
                    enum_cg.element_(name, value)
                    ignored_consts.add(name);
                }
                enum_cg.finish();
            }
        }
        class_ns_cg.finish();

        const class_cg = cg.class_(cls.name, "", false);
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
            class_cg.method_(method_info);
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
            const ignored_consts: Set<string> = new Set();
            const class_ns_cg = cg.namespace_(cls.name);
            if (cls.enums) {
                for (let enum_info of cls.enums) {
                    const enum_cg = class_ns_cg.enum_(enum_info.name);
                    for (let name of enum_info.literals) {
                        const value = cls.constants!.find(v => v.name == name)!.value;
                        enum_cg.element_(name, value)
                        ignored_consts.add(name);
                    }
                    enum_cg.finish();
                }
            }
            class_ns_cg.finish();

            const class_cg = cg.class_(cls.name, this.has_class(cls.super) ? cls.super! : "", singleton_mode);
            if (cls.constants) {
                for (let constant of cls.constants) {
                    if (!ignored_consts.has(constant.name)) {
                        class_cg.constant_(constant);
                    }
                }
            }
            if (cls.name == "Object") {
                class_cg.line(`free(): void`);
            }
            for (let method_info of cls.methods) {
                class_cg.method_(method_info);
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

