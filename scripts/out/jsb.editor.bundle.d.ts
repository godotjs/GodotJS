declare module "jsb.editor.codegen" {
    import * as jsb from "godot-jsb";
    export class TypeDB {
        singletons: {
            [name: string]: jsb.editor.SingletonInfo;
        };
        classes: {
            [name: string]: jsb.editor.ClassInfo;
        };
        primitive_types: {
            [name: string]: jsb.editor.PrimitiveClassInfo;
        };
        primitive_type_names: {
            [type: number]: string;
        };
        globals: {
            [name: string]: jsb.editor.GlobalConstantInfo;
        };
        utilities: {
            [name: string]: jsb.editor.MethodBind;
        };
        class_docs: {
            [name: string]: jsb.editor.ClassDoc | false;
        };
        constructor();
        find_doc(class_name: string): jsb.editor.ClassDoc | undefined;
        is_primitive_type(name: string): boolean;
        is_valid_method_name(name: string): boolean;
        make_classname(class_name: string, used_as_input: boolean): string;
        make_typename(info: jsb.editor.PropertyInfo, used_as_input: boolean): string;
        make_arg(info: jsb.editor.PropertyInfo, type_replacer?: (name: string) => string): string;
        make_literal_value(value: jsb.editor.DefaultArgumentInfo): string;
        replace_type_inplace(name: string | undefined, type_replacer?: (name: string) => string): string;
        make_arg_default_value(method_info: jsb.editor.MethodBind, index: number, type_replacer?: (name: string) => string): string;
        make_args(method_info: jsb.editor.MethodBind, type_replacer?: (name: string) => string): string;
        make_return(method_info: jsb.editor.MethodBind, type_replacer?: (name: string) => string): string;
        make_signal_type(method_info: jsb.editor.MethodBind): string;
    }
    export default class TSDCodeGen {
        private _split_index;
        private _outDir;
        private _splitter;
        private _types;
        constructor(outDir: string);
        private make_path;
        private new_splitter;
        private split;
        private cleanup;
        has_class(name?: string): boolean;
        emit(): void;
        private emit_mock;
        private emit_singletons;
        private emit_utilities;
        private emit_globals;
        private emit_godot;
        private emit_godot_primitive;
        private emit_godot_class;
    }
}
declare module "jsb.editor.main" {
    import { PackedStringArray } from "godot";
    export function auto_complete(pattern: string): PackedStringArray;
    export function run_npm_install(): void;
}
