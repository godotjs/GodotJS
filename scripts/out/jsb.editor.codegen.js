"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const godot_1 = require("godot");
const jsb = __importStar(require("godot-jsb"));
if (!jsb.TOOLS_ENABLED) {
    throw new Error("codegen is only allowed in editor mode");
}
//TODO use godot.MethodFlags.METHOD_FLAG_VARARG
const METHOD_FLAG_VARARG = 16;
const MockLines = [
    "",
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
    ["bool"]: "bool",
    ["Error"]: "Error",
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
    get class_doc() { return undefined; }
    constructor() { }
    enum_(name) {
        if (name.indexOf('.') >= 0) {
            let layers = name.split('.');
            name = layers.splice(layers.length - 1)[0];
            return new EnumWriter(this.namespace_(layers.join("."), this.class_doc), name).auto();
        }
        return new EnumWriter(this, name);
    }
    namespace_(name, class_doc) {
        return new NamespaceWriter(this, name, class_doc);
    }
    gd_class_(name, super_, singleton_mode, class_doc) {
        return new ClassWriter(this, name, super_, singleton_mode, class_doc);
    }
    valuetype_(name, super_, singleton_mode, class_doc) {
        return new ClassWriter(this, name, super_, singleton_mode, class_doc);
    }
    // singleton_(info: jsb.editor.SingletonInfo): SingletonWriter {
    //     return new SingletonWriter(this, info);
    // }
    line_comment_(text) {
        this.line(`// ${text}`);
    }
}
const tab = "    ";
class Description {
    get text() { return this.result; }
    get length() { return this.result.length; }
    constructor(result) {
        this.result = result;
    }
    static forAny(description) {
        return new Description(description || "");
    }
    /** a link to godot official docs website is added in comment for class description */
    static forClass(types, class_name) {
        let class_doc = types.find_doc(class_name);
        let description = class_doc === null || class_doc === void 0 ? void 0 : class_doc.brief_description;
        let link = jsb.editor.VERSION_DOCS_URL.length != 0 && !!class_doc && class_name.length != 0 ? `\n@link ${jsb.editor.VERSION_DOCS_URL}/classes/class_${class_name.toLowerCase()}.html` : "";
        return new Description((description || "") + link);
    }
}
class DocCommentHelper {
    static get_leading_tab(text) {
        let tab = "";
        for (let i = 0; i < text.length; ++i) {
            if (text.charAt(i) != "\t") {
                break;
            }
            tab += "\t";
        }
        return tab;
    }
    static trim_leading_tab(text, leading_tab) {
        if (leading_tab.length != 0 && text.startsWith(leading_tab))
            return text.substring(leading_tab.length);
        return text;
    }
    static is_empty_or_whitespace(text) {
        for (let i = 0; i < text.length; ++i) {
            let c = text.charCodeAt(i);
            if (c != 32 && c != 9) {
                return false;
            }
        }
        return true;
    }
    // get rid of all `codeblocks` since the `codeblocks` elements are too long to read
    static get_simplified_description(text) {
        text = this.remove_markup_content(text, 0, "[codeblocks]", "[/codeblocks]");
        text = this.remove_markup_content(text, 0, "[codeblock]", "[/codeblock]");
        text = this.replace_markup_content(text, 0, "[code]", "`");
        text = this.replace_markup_content(text, 0, "[/code]", "`");
        text = this.replace_markup_content(text, 0, "[b]Note:[/b]", "  \n**Note:**");
        text = this.replace_markup_content(text, 0, "[b]", "**");
        text = this.replace_markup_content(text, 0, "[/b]", "**");
        text = this.replace_markup_content(text, 0, "[i]", " *");
        text = this.replace_markup_content(text, 0, "[/i]", "* ");
        return text;
    }
    static replace_markup_content(text, from_pos, markup, rep) {
        let index = text.indexOf(markup, from_pos);
        if (index >= 0) {
            return this.replace_markup_content(text.substring(0, index) + rep + text.substring(index + markup.length), index + rep.length, markup, rep);
        }
        return text;
    }
    static remove_markup_content(text, from_pos, markup_begin, markup_end) {
        let start = text.indexOf(markup_begin, from_pos);
        if (start >= 0) {
            let end = text.indexOf(markup_end, from_pos);
            if (end >= 0) {
                return this.remove_markup_content(text.substring(0, start) + text.substring(end + markup_end.length), start, markup_begin, markup_end);
            }
        }
        return text;
    }
    static write(writer, description, newline) {
        if (typeof description === "undefined" || description.length == 0)
            return false;
        let rawlines = typeof description === "string" ? Description.forAny(description).text : description.text;
        let lines = this.get_simplified_description(rawlines).replace("\r\n", "\n").split("\n");
        if (lines.length > 0 && this.is_empty_or_whitespace(lines[0]))
            lines.splice(0, 1);
        if (lines.length > 0 && this.is_empty_or_whitespace(lines[lines.length - 1]))
            lines.splice(lines.length - 1, 1);
        if (lines.length == 0)
            return false;
        let leading_tab = this.get_leading_tab(lines[0]);
        lines = lines.map(value => this.trim_leading_tab(value, leading_tab));
        if (newline)
            writer.line("");
        if (lines.length == 1) {
            writer.line(`/** ${lines[0]} */`);
            return true;
        }
        for (let i = 0; i < lines.length; ++i) {
            // additional tailing whitespaces for better text format rendered
            if (i == 0) {
                writer.line(`/** ${lines[i]}  `);
            }
            else {
                writer.line(` *  ${lines[i]}  `);
            }
        }
        writer.line(` */`);
        return true;
    }
}
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
    // godot utility functions must be in global scope 
    utility_(method_info) {
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
    get class_doc() { return this._doc; }
    constructor(base, name, class_doc) {
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
    get class_doc() { return this._doc; }
    constructor(base, name, super_, singleton_mode, class_doc) {
        super(base);
        this._separator_line = false;
        this._name = name;
        this._super = super_;
        this._singleton_mode = singleton_mode;
        this._doc = class_doc;
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
        DocCommentHelper.write(this._base, Description.forClass(this.types, this._name), false);
        this._base.line(`${this.head()} {`);
        super.finish();
        this._base.line('}');
    }
    primitive_constant_(constant) {
        var _a, _b;
        DocCommentHelper.write(this, (_b = (_a = this._doc) === null || _a === void 0 ? void 0 : _a.constants[constant.name]) === null || _b === void 0 ? void 0 : _b.description, this._separator_line);
        this._separator_line = true;
        if (typeof constant.value !== "undefined") {
            this.line(`static readonly ${constant.name} = ${constant.value}`);
        }
        else {
            const type_name = PrimitiveTypeNames[constant.type];
            this.line(`static readonly ${constant.name}: ${type_name}`);
        }
    }
    constant_(constant) {
        var _a, _b;
        DocCommentHelper.write(this, (_b = (_a = this._doc) === null || _a === void 0 ? void 0 : _a.constants[constant.name]) === null || _b === void 0 ? void 0 : _b.description, this._separator_line);
        this._separator_line = true;
        this.line(`static readonly ${constant.name} = ${constant.value}`);
    }
    property_(getset_info) {
        var _a, _b;
        // ignore properties which can't be directly represented with javascript (such as `AnimatedTexture.frame_0/texture`)
        if (getset_info.index >= 0 || getset_info.name.indexOf("/") >= 0) {
            return;
        }
        const type_name = this.types.make_typename(getset_info.info);
        console.assert(getset_info.getter.length != 0);
        DocCommentHelper.write(this, (_b = (_a = this._doc) === null || _a === void 0 ? void 0 : _a.properties[getset_info.name]) === null || _b === void 0 ? void 0 : _b.description, this._separator_line);
        this._separator_line = true;
        // declare as get/set to avoid the pitfalls of modifying a value type return value 
        // `node.position.x = 0;` (Although, it works in GDScript)
        //
        // It's not an error in javascript which is more dangerous :( the actually modifed value is just a copy of `node.position`.
        this.line(`get ${getset_info.name}(): ${type_name}`);
        if (getset_info.setter.length != 0) {
            this.line(`set ${getset_info.name}(value: ${type_name})`);
        }
    }
    primitive_property_(property_info) {
        this._separator_line = true;
        const type_name = PrimitiveTypeNames[property_info.type];
        this.line(`get ${property_info.name}(): ${type_name}`);
        this.line(`set ${property_info.name}(value: ${type_name})`);
    }
    constructor_(constructor_info) {
        this._separator_line = true;
        const args = constructor_info.arguments.map(it => `${replace(it.name)}: ${PrimitiveTypeNames[it.type]}`).join(", ");
        this.line(`constructor(${args})`);
    }
    constructor_ex_() {
        this.line(`constructor(identifier?: any)`);
    }
    operator_(operator_info) {
        this._separator_line = true;
        const return_type_name = PrimitiveTypeNames[operator_info.return_type];
        const left_type_name = PrimitiveTypeNames[operator_info.left_type];
        const right_type_name = PrimitiveTypeNames[operator_info.right_type];
        this.line(`static ${operator_info.name}(left: ${left_type_name}, right: ${right_type_name}): ${return_type_name}`);
    }
    virtual_method_(method_info) {
        this.method_(method_info, "/* gdvirtual */ ");
    }
    ordinary_method_(method_info) {
        this.method_(method_info, "");
    }
    method_(method_info, category) {
        var _a, _b;
        DocCommentHelper.write(this, (_b = (_a = this._doc) === null || _a === void 0 ? void 0 : _a.methods[method_info.name]) === null || _b === void 0 ? void 0 : _b.description, this._separator_line);
        this._separator_line = true;
        const args = this.types.make_args(method_info);
        const rval = this.types.make_return(method_info);
        const prefix = this.make_method_prefix(method_info);
        // some godot methods declared with special characters which can not be declared literally
        if (!this.types.is_valid_method_name(method_info.name)) {
            this.line(`${category}${prefix}["${method_info.name}"]: (${args}) => ${rval}`);
            return;
        }
        this.line(`${category}${prefix}${method_info.name}(${args}): ${rval}`);
    }
    signal_(signal_info) {
        var _a, _b;
        DocCommentHelper.write(this, (_b = (_a = this._doc) === null || _a === void 0 ? void 0 : _a.signals[signal_info.name]) === null || _b === void 0 ? void 0 : _b.description, this._separator_line);
        this._separator_line = true;
        const args = this.types.make_args(signal_info.method_);
        const rval = this.types.make_return(signal_info.method_);
        const sig = `// ${args} => ${rval}`;
        if (this._singleton_mode) {
            this.line(`static readonly ${signal_info.name}: Signal ${sig}`);
        }
        else {
            this.line(`readonly ${signal_info.name}: Signal ${sig}`);
        }
    }
}
class EnumWriter extends IndentWriter {
    constructor(base, name) {
        super(base);
        this._auto = false;
        this._separator_line = false;
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
        var _a, _b;
        DocCommentHelper.write(this, (_b = (_a = this._base.class_doc) === null || _a === void 0 ? void 0 : _a.constants[name]) === null || _b === void 0 ? void 0 : _b.description, this._separator_line);
        this._separator_line = true;
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
        this.utilities = {};
        // `class_doc` is loaded lazily once used, and be cached in `class_docs`
        this.class_docs = {};
    }
    find_doc(class_name) {
        let class_doc = this.class_docs[class_name];
        if (typeof class_doc === "object") {
            return class_doc;
        }
        if (typeof class_doc === "boolean") {
            return undefined;
        }
        let loaded_doc = jsb.editor.get_class_doc(class_name);
        this.class_docs[class_name] = loaded_doc || false;
        return loaded_doc;
    }
    is_primitive_type(name) {
        return typeof this.primitive_types[name] !== "undefined";
    }
    is_valid_method_name(name) {
        if (typeof KeywordReplacement[name] !== "undefined") {
            return false;
        }
        if (name.indexOf('/') >= 0 || name.indexOf('.') >= 0) {
            return false;
        }
        return true;
    }
    make_classname(class_name) {
        const types = this;
        const remap_name = RemapTypes[class_name];
        if (typeof remap_name !== "undefined") {
            return remap_name;
        }
        if (class_name in types.classes) {
            return class_name;
        }
        else {
            if (class_name.indexOf(".") >= 0) {
                const layers = class_name.split(".");
                if (layers.length == 2) {
                    // nested enums in primitive types do not exist in class_info, they are manually binded.
                    if (PrimitiveTypesSet.has(layers[0])) {
                        return class_name;
                    }
                    const cls = types.classes[layers[0]];
                    if (typeof cls !== "undefined" && cls.enums.findIndex(v => v.name == layers[1]) >= 0) {
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
    make_typename(info) {
        if (info.hint == godot_1.PropertyHint.PROPERTY_HINT_RESOURCE_TYPE) {
            console.assert(info.hint_string.length != 0, "at least one valid class_name expected");
            return info.hint_string.split(",").map(class_name => this.make_classname(class_name)).join(" | ");
        }
        //NOTE there are infos with `.class_name == bool` instead of `.type` only, they will be remapped in `make_classname`
        if (info.class_name.length == 0) {
            const primitive_name = PrimitiveTypeNames[info.type];
            if (typeof primitive_name !== "undefined") {
                return primitive_name;
            }
            return `any /*unhandled: ${info.type}*/`;
        }
        return this.make_classname(info.class_name);
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
        const utilities = jsb.editor.get_utility_functions();
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
        for (let utility of utilities) {
            this._types.utilities[utility.name] = utility;
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
        // limit size and length of the generated file for better readability and being more friendly to the VSCode TS server and diff tools
        if (len > 1024 * 900 || lineno > 9200) {
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
        this.emit_utilities();
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
    emit_utilities() {
        for (let utility_name in this._types.utilities) {
            const utility_func = this._types.utilities[utility_name];
            const cg = this.split();
            cg.utility_(utility_func);
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
        const class_doc = this._types.find_doc(cls.name);
        const ignored_consts = new Set();
        const class_ns_cg = cg.namespace_(cls.name, class_doc);
        if (cls.enums) {
            for (let enum_info of cls.enums) {
                const enum_cg = class_ns_cg.enum_(enum_info.name);
                for (let enumeration_name of enum_info.literals) {
                    const value = cls.constants.find(v => v.name == enumeration_name).value;
                    enum_cg.element_(enumeration_name, value);
                    ignored_consts.add(enumeration_name);
                }
                enum_cg.finish();
            }
        }
        class_ns_cg.finish();
        const class_cg = cg.valuetype_(cls.name, "", false, class_doc);
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
        if (typeof cls.element_type !== "undefined") {
            const element_type_name = PrimitiveTypeNames[cls.element_type];
            class_cg.line(`set_indexed(index: number, value: ${element_type_name})`);
            class_cg.line(`get_indexed(index: number): ${element_type_name}`);
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
    emit_godot_class(cg, cls, singleton_mode) {
        try {
            const class_doc = this._types.find_doc(cls.name);
            const ignored_consts = new Set();
            const class_ns_cg = cg.namespace_(cls.name, class_doc);
            if (cls.enums) {
                for (let enum_info of cls.enums) {
                    const enum_cg = class_ns_cg.enum_(enum_info.name);
                    for (let enumeration_name of enum_info.literals) {
                        const value = cls.constants.find(v => v.name == enumeration_name).value;
                        enum_cg.element_(enumeration_name, value);
                        ignored_consts.add(enumeration_name);
                    }
                    enum_cg.finish();
                }
            }
            class_ns_cg.finish();
            const class_cg = cg.gd_class_(cls.name, this.has_class(cls.super) ? cls.super : "", singleton_mode, class_doc);
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
        }
        catch (error) {
            console.error(`failed to generate '${cls.name}'`);
            throw error;
        }
    }
}
exports.default = TSDCodeGen;
//# sourceMappingURL=jsb.editor.codegen.js.map