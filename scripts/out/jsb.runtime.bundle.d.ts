declare module "godot.annotations" {
    import type * as Godot from "godot";
    import type * as GodotJsb from "godot-jsb";
    export interface EnumPlaceholder {
    }
    export interface TypePairPlaceholder {
    }
    export function EnumType(type: any): EnumPlaceholder;
    export function TypePair(key: ClassDescriptor, value: ClassDescriptor): TypePairPlaceholder;
    export type ClassDescriptor = Function | Symbol | EnumPlaceholder | TypePairPlaceholder;
    /**
     *
     */
    export function signal(): (target: any, key: string) => void;
    export const ExportSignal: typeof signal;
    export function export_multiline(): (target: any, key: string) => void;
    export const ExportMultiline: typeof export_multiline;
    export function export_range(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, key: string) => void;
    export const ExportRange: typeof export_range;
    export function export_range_i(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, key: string) => void;
    export const ExportIntRange: typeof export_range_i;
    /** String as a path to a file, custom filter provided as hint. */
    export function export_file(filter: string): (target: any, key: string) => void;
    export const ExportFile: typeof export_file;
    export function export_dir(filter: string): (target: any, key: string) => void;
    export function export_global_file(filter: string): (target: any, key: string) => void;
    export const ExportGlobalFile: typeof export_global_file;
    export function export_global_dir(filter: string): (target: any, key: string) => void;
    export const ExportGlobalDir: typeof export_global_dir;
    export function export_exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only"): (target: any, key: string) => void;
    export const ExportExpEasing: typeof export_exp_easing;
    /**
     * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
     */
    export function export_array(clazz: ClassDescriptor): (target: any, key: string) => void;
    export const ExportArray: typeof export_array;
    /**
     * A Shortcut for exporting a dictionary { class_: [key_class, value_class] })`
     */
    export function export_dictionary(key_class: ClassDescriptor, value_class: ClassDescriptor): (target: any, key: string) => void;
    export const ExportDictionary: typeof export_dictionary;
    export function export_object(class_: ClassDescriptor): (target: any, key: string) => void;
    export const ExportObject: typeof export_object;
    /**
     * [low level export]
     */
    export function export_(type: Godot.Variant.Type, details?: {
        class_?: ClassDescriptor;
        hint?: Godot.PropertyHint;
        hint_string?: string;
        usage?: Godot.PropertyUsageFlags;
    }): (target: any, key: string) => void;
    export function Export(type: Godot.Variant.Type, details?: {
        class?: ClassDescriptor;
        hint?: Godot.PropertyHint;
        hintString?: string;
        usage?: Godot.PropertyUsageFlags;
    }): (target: any, key: string) => void;
    /**
     * In Godot, class members can be exported.
     * This means their value gets saved along with the resource (such as the scene) they're attached to.
     * They will also be available for editing in the property editor.
     * Exporting is done by using the `@export_var` (or `@export_`) annotation.
     */
    export function export_var(type: Godot.Variant.Type, details?: {
        class_?: ClassDescriptor;
        hint?: Godot.PropertyHint;
        hint_string?: string;
        usage?: Godot.PropertyUsageFlags;
    }): (target: any, key: string) => void;
    export const ExportVar: typeof export_var;
    /**
     * NOTE only int value enums are allowed
     */
    export function export_enum(enum_type: any): (target: any, key: string) => void;
    export const ExportEnum: typeof export_enum;
    /**
     * NOTE only int value enums are allowed
     */
    export function export_flags(enum_type: any): (target: any, key: string) => void;
    export const ExportFlags: typeof export_flags;
    export interface RPCConfig {
        mode?: Godot.MultiplayerAPI.RPCMode;
        sync?: "call_remote" | "call_local";
        transfer_mode?: Godot.MultiplayerPeer.TransferMode;
        transfer_channel?: number;
    }
    export function rpc(config?: RPCConfig): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
    export const Rpc: typeof rpc;
    /**
     * auto initialized on ready (before _ready called)
     * @param evaluator for now, only string is accepted
     */
    export function onready(evaluator: string | GodotJsb.internal.OnReadyEvaluatorFunc): (target: any, key: string) => void;
    export const OnReady: typeof onready;
    export function tool(): (target: any) => void;
    export const Tool: typeof tool;
    export function icon(path: string): (target: any) => void;
    export const Icon: typeof icon;
    export function deprecated(message?: string): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
    export const Deprecated: typeof deprecated;
    export function experimental(message?: string): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
    export const Experimental: typeof experimental;
    export function help(message?: string): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
    export const Help: typeof help;
}
declare module "godot.lib.api" {
    import type * as Godot from "godot";
    import type * as GodotJsb from "godot-jsb";
    const api: typeof Godot & {
        jsb: typeof GodotJsb;
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
declare module "godot.typeloader" {
    /**
     * @param type the loaded type or function in godot module
     */
    export type TypeLoadedCallback = (type: any) => void;
    export function on_type_loaded(type_name: string | string[], callback: TypeLoadedCallback): void;
}
declare module "jsb.core" { }
declare module "jsb.inject" { }
