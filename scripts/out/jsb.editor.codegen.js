"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const godot_1 = require("godot");
if (!jsb.TOOLS_ENABLED) {
    throw new Error("codegen is only allowed in editor mode");
}
//TODO use godot.MethodFlags.METHOD_FLAG_VARARG
const METHOD_FLAG_VARARG = 16;
//TODO remove all these lines after all primitive types implemented
const MockLines = [
    "class GodotError {}",
];
const KeywordReplacement = {
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
};
const PrimitiveTypeNames = {
    [godot_1.Variant.Type.TYPE_NIL]: "any",
    [godot_1.Variant.Type.TYPE_BOOL]: "boolean",
    [godot_1.Variant.Type.TYPE_INT]: "number /*i64*/",
    [godot_1.Variant.Type.TYPE_FLOAT]: "number /*f64*/",
    [godot_1.Variant.Type.TYPE_STRING]: "string",
    //TODO the following mappings could be replaced with Variant::get_type_name()
    // math types
    [godot_1.Variant.Type.TYPE_VECTOR2]: "Vector2",
    [godot_1.Variant.Type.TYPE_VECTOR2I]: "Vector2i",
    [godot_1.Variant.Type.TYPE_RECT2]: "Rect2",
    [godot_1.Variant.Type.TYPE_RECT2I]: "Rect2i",
    [godot_1.Variant.Type.TYPE_VECTOR3]: "Vector3",
    [godot_1.Variant.Type.TYPE_VECTOR3I]: "Vector3i",
    [godot_1.Variant.Type.TYPE_TRANSFORM2D]: "Transform2D",
    [godot_1.Variant.Type.TYPE_VECTOR4]: "Vector4",
    [godot_1.Variant.Type.TYPE_VECTOR4I]: "Vector4i",
    [godot_1.Variant.Type.TYPE_PLANE]: "Plane",
    [godot_1.Variant.Type.TYPE_QUATERNION]: "Quaternion",
    [godot_1.Variant.Type.TYPE_AABB]: "AABB",
    [godot_1.Variant.Type.TYPE_BASIS]: "Basis",
    [godot_1.Variant.Type.TYPE_TRANSFORM3D]: "Transform3D",
    [godot_1.Variant.Type.TYPE_PROJECTION]: "Projection",
    // misc types
    [godot_1.Variant.Type.TYPE_COLOR]: "Color",
    [godot_1.Variant.Type.TYPE_STRING_NAME]: "StringName",
    [godot_1.Variant.Type.TYPE_NODE_PATH]: "NodePath",
    [godot_1.Variant.Type.TYPE_RID]: "RID",
    [godot_1.Variant.Type.TYPE_OBJECT]: "Object",
    [godot_1.Variant.Type.TYPE_CALLABLE]: "Callable",
    [godot_1.Variant.Type.TYPE_SIGNAL]: "Signal",
    [godot_1.Variant.Type.TYPE_DICTIONARY]: "Dictionary",
    [godot_1.Variant.Type.TYPE_ARRAY]: "Array",
    // typed arrays
    [godot_1.Variant.Type.TYPE_PACKED_BYTE_ARRAY]: "PackedByteArray",
    [godot_1.Variant.Type.TYPE_PACKED_INT32_ARRAY]: "PackedInt32Array",
    [godot_1.Variant.Type.TYPE_PACKED_INT64_ARRAY]: "PackedInt64Array",
    [godot_1.Variant.Type.TYPE_PACKED_FLOAT32_ARRAY]: "PackedFloat32Array",
    [godot_1.Variant.Type.TYPE_PACKED_FLOAT64_ARRAY]: "PackedFloat64Array",
    [godot_1.Variant.Type.TYPE_PACKED_STRING_ARRAY]: "PackedStringArray",
    [godot_1.Variant.Type.TYPE_PACKED_VECTOR2_ARRAY]: "PackedVector2Array",
    [godot_1.Variant.Type.TYPE_PACKED_VECTOR3_ARRAY]: "PackedVector3Array",
    [godot_1.Variant.Type.TYPE_PACKED_COLOR_ARRAY]: "PackedColorArray",
};
const RemapTypes = {
    ["Error"]: "GodotError",
};
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
]);
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
]);
function replace(name) {
    const rep = KeywordReplacement[name];
    return typeof rep !== "undefined" ? rep : name;
}
class AbstractWriter {
    constructor() { }
    enum_(name) {
        if (name.indexOf('.') >= 0) {
            let layers = name.split('.');
            name = layers.splice(layers.length - 1)[0];
            return new EnumWriter(this.namespace_(layers.join(".")), name).auto();
        }
        return new EnumWriter(this, name);
    }
    namespace_(name) {
        return new NamespaceWriter(this, name);
    }
    class_(name, super_, singleton_mode) {
        return new ClassWriter(this, name, super_, singleton_mode);
    }
    // singleton_(info: jsb.editor.SingletonInfo): SingletonWriter {
    //     return new SingletonWriter(this, info);
    // }
    line_comment_(text) {
        this.line(`// ${text}`);
    }
}
const tab = "    ";
class IndentWriter extends AbstractWriter {
    constructor(base) {
        super();
        this._size = 0;
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
    line(text) {
        this._lines.push(text);
        this._size += tab.length + text.length;
    }
}
class ModuleWriter extends IndentWriter {
    constructor(base, name) {
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
    constructor(base, name) {
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
    constructor(base, name, super_, singleton_mode) {
        super(base);
        this._name = name;
        this._super = super_;
        this._singleton_mode = singleton_mode;
    }
    head() {
        if (typeof this._super !== "string" || this._super.length == 0) {
            return `class ${this._name}`;
        }
        return `class ${this._name} extends ${this._super}`;
    }
    make_method_prefix(method_info) {
        return this._singleton_mode || method_info.is_static ? "static " : "";
    }
    finish() {
        this._base.line(`${this.head()} {`);
        super.finish();
        this._base.line('}');
    }
    primitive_constant_(constant) {
        if (typeof constant.value !== "undefined") {
            this.line(`static readonly ${constant.name} = ${constant.value}`);
        }
        else {
            const type_name = PrimitiveTypeNames[constant.type];
            this.line(`static readonly ${constant.name}: ${type_name}`);
        }
    }
    constant_(constant) {
        this.line(`static readonly ${constant.name} = ${constant.value}`);
    }
    make_typename(info) {
        if (info.class_name.length == 0) {
            const primitive_name = PrimitiveTypeNames[info.type];
            if (typeof primitive_name !== "undefined") {
                return primitive_name;
            }
            return `any /*unhandled: ${info.type}*/`;
        }
        const remap_name = RemapTypes[info.class_name];
        if (typeof remap_name !== "undefined") {
            return remap_name;
        }
        if (info.class_name in this.types.classes) {
            return info.class_name;
        }
        else {
            if (info.class_name.indexOf(".") >= 0) {
                const layers = info.class_name.split(".");
                if (layers.length == 2) {
                    // nested enums in primitive types do not exist in class_info, they are manually binded.
                    if (PrimitiveTypesSet.has(layers[0])) {
                        return info.class_name;
                    }
                    const cls = this.types.classes[layers[0]];
                    if (typeof cls !== "undefined" && cls.enums.findIndex(v => v.name == layers[1]) >= 0) {
                        return info.class_name;
                    }
                }
            }
            if (info.class_name in this.types.globals) {
                return info.class_name;
            }
            if (info.class_name in this.types.singletons) {
                return info.class_name;
            }
            // if (ReservedTypes.has(info.class_name)) {
            //     return info.class_name;
            // }
            console.warn("undefined class", info.class_name);
            return `any /*${info.class_name}*/`;
        }
    }
    make_arg(info) {
        return `${replace(info.name)}: ${this.make_typename(info)}`;
    }
    make_literal_value(value) {
        // plain types
        switch (value.type) {
            case godot_1.Variant.Type.TYPE_BOOL: return value.value == null ? "false" : `${value.value}`;
            case godot_1.Variant.Type.TYPE_FLOAT:
            case godot_1.Variant.Type.TYPE_INT: return value.value == null ? "0" : `${value.value}`;
            case godot_1.Variant.Type.TYPE_STRING:
            case godot_1.Variant.Type.TYPE_STRING_NAME: return value.value == null ? "''" : `'${value.value}'`;
            default: break;
        }
        // make them more readable?
        if (value.type == godot_1.Variant.Type.TYPE_VECTOR2) {
            if (value == null)
                return 'new Vector2()';
            if (value.value.x == value.value.y) {
                if (value.value.x == 0)
                    return `Vector2.ZERO`;
                if (value.value.x == 1)
                    return `Vector2.ONE`;
            }
            return `new Vector2(${value.value.x}, ${value.value.y})`;
        }
        if (value.type == godot_1.Variant.Type.TYPE_VECTOR3) {
            if (value == null)
                return 'new Vector3()';
            if (value.value.x == value.value.y == value.value.z) {
                if (value.value.x == 0)
                    return `Vector3.ZERO`;
                if (value.value.x == 1)
                    return `Vector3.ONE`;
            }
            return `new Vector3(${value.value.x}, ${value.value.y}, ${value.value.z})`;
        }
        if (value.type == godot_1.Variant.Type.TYPE_COLOR) {
            if (value == null)
                return 'new Color()';
            return `new Color(${value.value.r}, ${value.value.g}, ${value.value.b}, ${value.value.a})`;
        }
        if (value.value == null) {
            return "<any> {} /*compound.type from nil*/";
        }
        //TODO value sig for compound types
        return `<any> {} /*compound.type from ${value.type}(${value.value})*/`;
    }
    make_arg_default_value(method_info, index) {
        const default_arguments = method_info.default_arguments || [];
        const def_index = index - (method_info.args_.length - default_arguments.length);
        if (def_index < 0 || def_index >= default_arguments.length)
            return this.make_arg(method_info.args_[index]);
        return this.make_arg(method_info.args_[index]) + " = " + this.make_literal_value(default_arguments[def_index]);
    }
    make_args(method_info) {
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
    make_return(method_info) {
        //TODO
        if (typeof method_info.return_ != "undefined") {
            return this.make_typename(method_info.return_);
        }
        return "void";
    }
    property_(property_info) {
        const type_name = PrimitiveTypeNames[property_info.type];
        this.line_comment_(`// godot.getset: ${property_info.name}: ${type_name}`);
    }
    primitive_property_(property_info) {
        const type_name = PrimitiveTypeNames[property_info.type];
        this.line(`${property_info.name}: ${type_name}`);
    }
    constructor_(constructor_info) {
        const args = constructor_info.arguments.map(it => `${replace(it.name)}: ${PrimitiveTypeNames[it.type]}`).join(", ");
        this.line(`constructor(${args})`);
    }
    operator_(operator_info) {
        const return_type_name = PrimitiveTypeNames[operator_info.return_type];
        const left_type_name = PrimitiveTypeNames[operator_info.left_type];
        const right_type_name = PrimitiveTypeNames[operator_info.right_type];
        this.line(`static ${operator_info.name}(left: ${left_type_name}, right: ${right_type_name}): ${return_type_name}`);
    }
    method_(method_info) {
        // some godot methods declared with special characters
        if (method_info.name.indexOf('/') >= 0 || method_info.name.indexOf('.') >= 0) {
            const args = this.make_args(method_info);
            const rval = this.make_return(method_info);
            const prefix = this.make_method_prefix(method_info);
            this.line(`${prefix}["${method_info.name}"]: (${args}) => ${rval}`);
            return;
        }
        const args = this.make_args(method_info);
        const rval = this.make_return(method_info);
        const prefix = this.make_method_prefix(method_info);
        this.line(`${prefix}${method_info.name}(${args}): ${rval}`);
    }
    // function_(method_info: jsb.editor.MethodInfo) {
    //     const args = this.make_args(method_info)
    //     const rval = this.make_return(method_info)
    //     this.line(`function ${method_info.name}(${args}): ${rval}`);
    // }
    signal_(signal_info) {
        if (this._singleton_mode) {
            this.line(`static ${signal_info.name}: Signal`);
        }
        else {
            this.line(`${signal_info.name}: Signal`);
        }
        // this.line(`${signal_info.name}(op: jsb.SignalOp.Connect | jsb.SignalOp.Disconnect, callable: Callable): void`);
        // this.line(`${signal_info.name}(op: jsb.SignalOp.IsConnected, callable: Callable): boolean`);
        // this.line(`${signal_info.name}(op: jsb.SignalOp.Emit, ...args: any[]): GodotError`);
    }
}
class EnumWriter extends IndentWriter {
    constructor(base, name) {
        super(base);
        this._auto = false;
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
    element_(name, value) {
        this.line(`${name} = ${value},`);
    }
}
class FileWriter extends AbstractWriter {
    constructor(types, file) {
        super();
        this._size = 0;
        this._lineno = 0;
        this._types = types;
        this._file = file;
    }
    get size() { return this._size; }
    get lineno() { return this._lineno; }
    get types() { return this._types; }
    line(text) {
        this._file.store_line(text);
        this._size += text.length;
        this._lineno += 1;
    }
    finish() {
        this._file.flush();
    }
}
class FileSplitter {
    constructor(types, filePath) {
        this._types = types;
        this._file = godot_1.FileAccess.open(filePath, godot_1.FileAccess.ModeFlags.WRITE);
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
    constructor() {
        this.singletons = {};
        this.classes = {};
        this.primitive_types = {};
        this.globals = {};
    }
    is_primitive_type(name) {
        return typeof this.primitive_types[name] !== "undefined";
    }
}
// d.ts generator
class TSDCodeGen {
    constructor(outDir) {
        this._types = new TypeDB();
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
    make_path(index) {
        const filename = `godot${index}.gen.d.ts`;
        if (typeof this._outDir !== "string" || this._outDir.length == 0) {
            return filename;
        }
        if (this._outDir.endsWith("/")) {
            return this._outDir + filename;
        }
        return this._outDir + "/" + filename;
    }
    new_splitter() {
        if (this._splitter !== undefined) {
            this._splitter.close();
        }
        const filename = this.make_path(this._split_index++);
        console.log("new writer", filename);
        this._splitter = new FileSplitter(this._types, filename);
        return this._splitter;
    }
    // the returned writer will be `finished` automatically
    split() {
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
    cleanup() {
        while (true) {
            const path = this.make_path(this._split_index++);
            if (!godot_1.FileAccess.file_exists(path)) {
                break;
            }
            console.warn("delete file", path);
            jsb.editor.delete_file(path);
        }
    }
    has_class(name) {
        return typeof name === "string" && typeof this._types.classes[name] !== "undefined";
    }
    emit() {
        var _a;
        this.emit_mock();
        this.emit_singletons();
        this.emit_godot();
        this.emit_globals();
        (_a = this._splitter) === null || _a === void 0 ? void 0 : _a.close();
        this.cleanup();
    }
    emit_mock() {
        const cg = this.split();
        for (let line of MockLines) {
            cg.line(line);
        }
    }
    emit_singletons() {
        const cg = this.split();
        for (let singleton_name in this._types.singletons) {
            const singleton = this._types.singletons[singleton_name];
            const cls = this._types.classes[singleton.class_name];
            if (typeof cls !== "undefined") {
                cg.line_comment_("// Singleton Class");
                this.emit_godot_class(cg, cls, true);
            }
            else {
                cg.line_comment_(`ERROR: singleton ${singleton.name} without class info ${singleton.class_name}`);
            }
        }
    }
    emit_globals() {
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
    emit_godot() {
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
    emit_godot_primitive(cg, cls) {
        const ignored_consts = new Set();
        const class_ns_cg = cg.namespace_(cls.name);
        if (cls.enums) {
            for (let enum_info of cls.enums) {
                const enum_cg = class_ns_cg.enum_(enum_info.name);
                for (let name of enum_info.literals) {
                    const value = cls.constants.find(v => v.name == name).value;
                    enum_cg.element_(name, value);
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
    emit_godot_class(cg, cls, singleton_mode) {
        const ignored_consts = new Set();
        const class_ns_cg = cg.namespace_(cls.name);
        if (cls.enums) {
            for (let enum_info of cls.enums) {
                const enum_cg = class_ns_cg.enum_(enum_info.name);
                for (let name of enum_info.literals) {
                    const value = cls.constants.find(v => v.name == name).value;
                    enum_cg.element_(name, value);
                    ignored_consts.add(name);
                }
                enum_cg.finish();
            }
        }
        class_ns_cg.finish();
        const class_cg = cg.class_(cls.name, this.has_class(cls.super) ? cls.super : "", singleton_mode);
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
    }
}
exports.default = TSDCodeGen;
//# sourceMappingURL=jsb.editor.codegen.js.map