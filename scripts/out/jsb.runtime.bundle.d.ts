declare module "godot.annotations" {
    import { PropertyHint, PropertyUsageFlags, Variant, MultiplayerAPI, MultiplayerPeer } from "godot";
    import * as jsb from "godot-jsb";
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
    export function export_multiline(): (target: any, key: string) => void;
    export function export_range(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, key: string) => void;
    export function export_range_i(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, key: string) => void;
    /** String as a path to a file, custom filter provided as hint. */
    export function export_file(filter: string): (target: any, key: string) => void;
    export function export_dir(filter: string): (target: any, key: string) => void;
    export function export_global_file(filter: string): (target: any, key: string) => void;
    export function export_global_dir(filter: string): (target: any, key: string) => void;
    export function export_exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only"): (target: any, key: string) => void;
    /**
     * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
     */
    export function export_array(clazz: ClassDescriptor): (target: any, key: string) => void;
    /**
     * A Shortcut for `export_(Variant.Type.TYPE_DICTIONARY, { class_: [key_class, value_class] })`
     */
    export function export_dictionary(key_class: ClassDescriptor, value_class: ClassDescriptor): (target: any, key: string) => void;
    export function export_object(class_: ClassDescriptor): (target: any, key: string) => void;
    /**
     * [low level export]
     */
    export function export_(type: Variant.Type, details?: {
        class_?: ClassDescriptor;
        hint?: PropertyHint;
        hint_string?: string;
        usage?: PropertyUsageFlags;
    }): (target: any, key: string) => void;
    /**
     * In Godot, class members can be exported.
     * This means their value gets saved along with the resource (such as the scene) they're attached to.
     * They will also be available for editing in the property editor.
     * Exporting is done by using the `@export_var` (or `@export_`) annotation.
     */
    export function export_var(type: Variant.Type, details?: {
        class_?: ClassDescriptor;
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
    export interface RPCConfig {
        mode?: MultiplayerAPI.RPCMode;
        sync?: "call_remote" | "call_local";
        transfer_mode?: MultiplayerPeer.TransferMode;
        transfer_channel?: number;
    }
    export function rpc(config?: RPCConfig): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
    /**
     * auto initialized on ready (before _ready called)
     * @param evaluator for now, only string is accepted
     */
    export function onready(evaluator: string | jsb.internal.OnReadyEvaluatorFunc): (target: any, key: string) => void;
    export function tool(): (target: any) => void;
    export function icon(path: string): (target: any) => void;
    export function deprecated(message?: string): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
    export function experimental(message?: string): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
    export function help(message?: string): (target: any, propertyKey?: PropertyKey, descriptor?: PropertyDescriptor) => void;
}
declare module "godot.typeloader" {
    /**
     * @param type the loaded type or function in godot module
     */
    export type TypeLoadedCallback = (type: any) => void;
    export function on_type_loaded(type_name: string | string[], callback: TypeLoadedCallback): void;
}
declare module "jsb.core" { }
