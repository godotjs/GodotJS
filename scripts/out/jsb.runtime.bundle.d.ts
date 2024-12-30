declare module "jsb.core" {
    import { PropertyHint, PropertyUsageFlags, StringName, Variant, MultiplayerAPI, MultiplayerPeer } from "godot";
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
declare module "jsb.inject" { }
