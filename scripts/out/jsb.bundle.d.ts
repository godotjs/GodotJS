declare module "jsb.core" {
    import { PropertyHint, PropertyUsageFlags, StringName, Variant } from "godot";
    import * as jsb from "godot-jsb";
    /**
     *
     */
    export function signal(): (target: any, key: string) => void;
    export function export_multiline(): (target: any, key: string) => void;
    export function export_range(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, key: string) => void;
    export function export_range_i(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, key: string) => void;
    export function export_file(filter: string): (target: any, key: string) => void;
    export function export_dir(filter: string): (target: any, key: string) => void;
    export function export_global_file(filter: string): (target: any, key: string) => void;
    export function export_global_dir(filter: string): (target: any, key: string) => void;
    export function export_exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only"): (target: any, key: string) => void;
    export function export_(type: Variant.Type, details?: {
        class_?: Function;
        hint?: PropertyHint;
        hint_string?: string;
        usage?: PropertyUsageFlags;
    }): (target: any, key: string) => void;
    /**
     * NOTE only int value enums are allowed
     */
    export function export_enum(enum_type: any): (target: any, key: string) => void;
    /**
     * NOTE only int value enums are allowed
     */
    export function export_flags(enum_type: any): (target: any, key: string) => void;
    /**
     * auto initialized on ready (before _ready called)
     * @param evaluator for now, only string is accepted
     */
    export function onready(evaluator: string | jsb.internal.OnReadyEvaluatorFunc): (target: any, key: string) => void;
    export function tool(): (target: any) => void;
    export function icon(path: string): (target: any) => void;
    export function deprecated(message?: string): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
    export function experimental(message?: string): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
    export function help(message?: string): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
    export function $wait(signal: any): Promise<unknown>;
    /**
     * Wait for seconds
     * @param secs time to wait in seconds
     * @returns Promise to await
     */
    export function seconds(secs: number): Promise<unknown>;
    /** shorthand for getting project settings */
    export function GLOBAL_GET(entry_path: StringName): any;
    /**
     * shorthand for getting editor settings
     * NOTE: calling before EditorSettings created will cause null reference exception.
     */
    export function EDITOR_GET(entry_path: StringName): any;
}
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
