declare module "jsb.editor.codegen" {
    import type { GArray, GDictionary, Node, PropertyInfo, Resource } from "godot";
    import type * as GodotJsb from "godot-jsb";
    export enum DescriptorType {
        Godot = 0,
        User = 1,
        FunctionLiteral = 2,
        ObjectLiteral = 3,
        StringLiteral = 4,
        NumericLiteral = 5,
        BooleanLiteral = 6,
        Union = 7,
        Intersection = 8,
        Conditional = 9,
        Tuple = 10,
        Infer = 11,
        Mapped = 12,
        Indexed = 13
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
        template?: boolean;
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
        name?: string;
        type: TypeDescriptor;
    }>;
    export type TupleTypeDescriptor = GDictionary<{
        type: DescriptorType.Tuple;
        elements: GArray<TupleElementDescriptor>;
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
        name: string;
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
    export type TypeDescriptor = GodotTypeDescriptor | UserTypeDescriptor | FunctionLiteralTypeDescriptor | ObjectLiteralTypeDescriptor | StringLiteralTypeDescriptor | NumberLiteralTypeDescriptor | BooleanLiteralTypeDescriptor | TupleTypeDescriptor | UnionTypeDescriptor | IntersectionTypeDescriptor | InferTypeDescriptor | ConditionalTypeDescriptor | MappedTypeDescriptor | IndexedTypeDescriptor;
    /**
     * Codegen analogue of NodePathMap.
     */
    export type NodeTypeDescriptorPathMap = GDictionary<Partial<Record<string, TypeDescriptor>>>;
    export enum CodeGenType {
        ScriptNodeTypeDescriptor = 0,
        ScriptResourceTypeDescriptor = 1
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
    export class TypeDB {
        singletons: {
            [name: string]: GodotJsb.editor.SingletonInfo;
        };
        classes: {
            [name: string]: GodotJsb.editor.ClassInfo;
        };
        primitive_types: {
            [name: string]: GodotJsb.editor.PrimitiveClassInfo;
        };
        globals: {
            [name: string]: GodotJsb.editor.GlobalConstantInfo;
        };
        utilities: {
            [name: string]: GodotJsb.editor.MethodBind;
        };
        class_docs: {
            [name: string]: GodotJsb.editor.ClassDoc | false;
        };
        constructor();
        find_doc(class_name: string): GodotJsb.editor.ClassDoc | undefined;
        is_primitive_type(name: string): boolean;
        is_valid_method_name(name: string): boolean;
        make_classname(internal_class_name: string): string;
        make_typename(info: PropertyInfo, used_as_input: boolean, non_nullable: boolean): string;
        make_arg(info: PropertyInfo, optional?: boolean): string;
        make_literal_value(value: GodotJsb.editor.DefaultArgumentInfo): string;
        make_arg_default_value(method_info: GodotJsb.editor.MethodBind, index: number): string;
        make_args(method_info: GodotJsb.editor.MethodBind): string;
        make_return(method_info: GodotJsb.editor.MethodBind): string;
        make_signal_type(method_info: GodotJsb.editor.MethodBind): string;
    }
    export class TSDCodeGen {
        private _split_index;
        private _outDir;
        private _splitter;
        private _types;
        private _use_project_settings;
        constructor(outDir: string, use_project_settings: boolean);
        private make_path;
        private new_splitter;
        private split;
        private cleanup;
        has_class(name?: string): boolean;
        emit(): Promise<void>;
        private emit_utility;
        private emit_global;
        private emit_aliases;
        private emit_singleton;
        private emit_godot_primitive;
        private emit_godot_class;
    }
    export class SceneTSDCodeGen {
        private _out_dir;
        private _scene_paths;
        private _types;
        constructor(out_dir: string, scene_paths: string[]);
        private make_scene_path;
        emit(): Promise<void>;
        private emit_children_node_types;
        private emit_scene_node_types;
    }
    export class ResourceTSDCodeGen {
        private _out_dir;
        private _resource_paths;
        private _types;
        constructor(out_dir: string, resource_paths: string[]);
        private make_resource_path;
        emit(): Promise<void>;
        private emit_resource_type;
    }
}
declare module "jsb.editor.main" {
    import { PackedStringArray } from "godot";
    export function auto_complete(pattern: string): PackedStringArray;
    export function run_npm_install(): void;
}
