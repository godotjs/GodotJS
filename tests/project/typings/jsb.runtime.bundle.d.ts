declare module "godot.lib.api" {
    import type * as Godot from "godot";
    import type * as GodotJsb from "godot-jsb";
    function proxy_unwrap_value<T>(value: T): T;
    function proxy_wrap_value<T>(value: T): T;
    function array_proxy<T extends any[]>(arr: T): T;
    function object_proxy<T extends object>(obj: T, remap_properties?: boolean): T;
    function key_only_proxy<T extends object | ((...args: any[]) => any)>(target: T): any;
    function instance_proxy<T extends object>(target_instance: T): T;
    function class_proxy<T extends object>(target_class: T): T;
    function function_proxy<T extends (...args: any[]) => any>(fn: T): T;
    function enum_proxy<T extends object>(target_enum: T): T;
    const proxy: {
        array_proxy: typeof array_proxy;
        class_proxy: typeof class_proxy;
        enum_proxy: typeof enum_proxy;
        function_proxy: typeof function_proxy;
        instance_proxy: typeof instance_proxy;
        key_only_proxy: typeof key_only_proxy;
        object_proxy: typeof object_proxy;
        proxy_unwrap_value: typeof proxy_unwrap_value;
        proxy_wrap_value: typeof proxy_wrap_value;
    };
    type GodotLibApi = typeof Godot & {
        jsb: typeof GodotJsb;
        proxy: typeof proxy;
    };
    const api: GodotLibApi;
    /**
     * This is a starting point for writing GodotJS code that is camel-case binding agnostic at runtime.
     *
     * Library code must consume this API rather than "godot", and be built with camel case bindings disabled. This is to
     * ensure that the library will function at runtime for all projects irrespective of whether they have camel-case
     * bindings enabled.
     */
    export = api;
}
declare module "godot.annotations" {
    import type * as Godot from "godot";
    import type { ClassBinder, RPCConfig } from "godot.annotations";
    type VariantConstructor = abstract new (...args: any[]) => NonNullable<Godot.GAny> | Number | String | Boolean;
    type GObjectConstructor = abstract new (...args: any[]) => Godot.Object;
    type ClassSpecifier = VariantConstructor | Symbol | EnumPlaceholder | TypePairPlaceholder;
    interface EnumPlaceholder {
        target: Record<string, string | number>;
    }
    interface TypePairPlaceholder {
        key: VariantConstructor;
        value: VariantConstructor;
    }
    export function EnumType(type: Record<string, string | number>): EnumPlaceholder;
    export function TypePair(key: VariantConstructor, value: VariantConstructor): TypePairPlaceholder;
    /** @deprecated Use createClassBinder() instead. */
    export function signal(): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportSignal: typeof signal;
    /** @deprecated Use createClassBinder() instead. */
    export function export_multiline(): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportMultiline: typeof export_multiline;
    /** @deprecated Use createClassBinder() instead. */
    export function export_range(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportRange: typeof export_range;
    /** @deprecated Use createClassBinder() instead. */
    export function export_range_i(min: number, max: number, step?: number, ...extra_hints: string[]): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportIntRange: typeof export_range_i;
    /** String as a path to a file, custom filter provided as hint. */
    /** @deprecated Use createClassBinder() instead. */
    export function export_file(filter: string): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportFile: typeof export_file;
    /** @deprecated Use createClassBinder() instead. */
    export function export_dir(filter: string): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export function export_global_file(filter: string): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportGlobalFile: typeof export_global_file;
    /** @deprecated Use createClassBinder() instead. */
    export function export_global_dir(filter: string): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportGlobalDir: typeof export_global_dir;
    /** @deprecated Use createClassBinder() instead. */
    export function export_exp_easing(hint?: "" | "attenuation" | "positive_only" | "attenuation,positive_only"): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportExpEasing: typeof export_exp_easing;
    /**
     * A Shortcut for `export_(Variant.Type.TYPE_ARRAY, { class_: clazz })`
     */
    /** @deprecated Use createClassBinder() instead. */
    export function export_array(clazz: ClassSpecifier): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportArray: typeof export_array;
    /**
     * A Shortcut for exporting a dictionary { class_: [key_class, value_class] })`
     */
    /** @deprecated Use createClassBinder() instead. */
    export function export_dictionary(key_class: VariantConstructor, value_class: VariantConstructor): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportDictionary: typeof export_dictionary;
    /** @deprecated Use createClassBinder() instead. */
    export function export_object(clazz: GObjectConstructor): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportObject: typeof export_object;
    /**
     * [low level export]
     * @deprecated Use createClassBinder() instead.
     * */
    export function export_(type: Godot.Variant.Type, details?: {
        class_?: ClassSpecifier;
        hint?: Godot.PropertyHint;
        hint_string?: string;
        usage?: Godot.PropertyUsageFlags;
    }): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export function Export(type: Godot.Variant.Type, details?: {
        class?: ClassSpecifier;
        hint?: Godot.PropertyHint;
        hintString?: string;
        usage?: Godot.PropertyUsageFlags;
    }): (target: any, name: string) => void;
    /**
     * In Godot, class members can be exported.
     * This means their value gets saved along with the resource (such as the scene) they're attached to.
     * They will also be available for editing in the property editor.
     * Exporting is done by using the `@export_var` (or `@export_`) annotation.
     */
    /** @deprecated Use createClassBinder() instead. */
    export function export_var(type: Godot.Variant.Type, details?: {
        class_?: ClassSpecifier;
        hint?: Godot.PropertyHint;
        hint_string?: string;
        usage?: Godot.PropertyUsageFlags;
    }): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportVar: typeof export_var;
    /**
     * NOTE only int value enums are allowed
     */
    /** @deprecated Use createClassBinder() instead. */
    export function export_enum(enum_type: Record<string, string | number>): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportEnum: typeof export_enum;
    /**
     * NOTE only int value enums are allowed
     */
    /** @deprecated Use createClassBinder() instead. */
    export function export_flags(enum_type: Record<string, string | number>): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const ExportFlags: typeof export_flags;
    /** @deprecated Use createClassBinder() instead. */
    export function rpc(config?: RPCConfig): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const Rpc: typeof rpc;
    /**
     * auto initialized on ready (before _ready called)
     *
     * @deprecated Use createClassBinder() instead.
     */
    export function onready(evaluator: string): (target: any, name: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const OnReady: typeof onready;
    /** @deprecated Use createClassBinder() instead. */
    export function tool(): (target: any, name: undefined) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const Tool: typeof tool;
    /** @deprecated Use createClassBinder() instead. */
    export function icon(path: string): (target: any, name: undefined) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const Icon: typeof icon;
    /** @deprecated Use createClassBinder() instead. */
    export function deprecated(message?: string): (target: any, name?: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const Deprecated: typeof deprecated;
    /** @deprecated Use createClassBinder() instead. */
    export function experimental(message?: string): (target: any, name?: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const Experimental: typeof experimental;
    /** @deprecated Use createClassBinder() instead. */
    export function help(message?: string): (target: any, name?: string) => void;
    /** @deprecated Use createClassBinder() instead. */
    export const Help: typeof help;
    export type ClassMemberDecorator<RestrictedContext extends ClassMemberDecoratorContext = ClassMemberDecoratorContext> = <Context extends RestrictedContext>(target: ClassMemberDecoratorTarget<Context>, context: Context) => void | ClassMemberDecoratorReturn<Context>;
    export type ClassMemberDecoratorTarget<Context extends ClassMemberDecoratorContext> = Context extends ClassMethodDecoratorContext<infer _, infer Value> ? (...args: unknown[]) => Value : Context extends ClassGetterDecoratorContext<infer _, infer Value> ? () => Value : Context extends ClassSetterDecoratorContext<infer _, infer Value> ? (value: Value) => void : Context extends ClassFieldDecoratorContext ? undefined : Context extends ClassAccessorDecoratorContext<infer _, infer Value> ? {
        get: () => Value;
        set: (value: Value) => void;
    } : never;
    export type ClassMemberDecoratorReturn<Context extends ClassMemberDecoratorContext> = Context extends ClassMethodDecoratorContext<infer This, infer Value> ? (this: This, ...args: unknown[]) => Value : Context extends ClassGetterDecoratorContext<infer This, infer Value> ? (this: This) => Value : Context extends ClassSetterDecoratorContext<infer This, infer Value> ? (this: This, value: Value) => void : Context extends ClassFieldDecoratorContext<infer This, infer Value> ? (this: This, initialValue: Value) => Value : Context extends ClassAccessorDecoratorContext<infer This, infer Value> ? {
        get?(this: This): Value;
        set?(this: This, value: Value): void;
        init?(this: This, initialValue: Value): Value;
    } : never;
    export type ClassDecorator<This extends abstract new (...args: any) => any = abstract new (...args: any) => any> = (target: This, context: ClassDecoratorContext<This>) => void;
    export type ClassDecoratorClass<Context extends ClassDecoratorContext> = Context extends ClassDecoratorContext<infer Class> ? Class : never;
    export type Decorator<RestrictedContext extends DecoratorContext = DecoratorContext> = RestrictedContext extends ClassDecoratorContext ? <Context extends RestrictedContext>(target: ClassDecoratorClass<Context>, context: Context) => void : RestrictedContext extends ClassMemberDecoratorContext ? <Context extends RestrictedContext>(target: ClassMemberDecoratorTarget<Context>, context: Context) => void | ClassMemberDecoratorReturn<Context> : never;
    export type AnyDecorator = (value: unknown, context: DecoratorContext) => unknown;
    export type ClassValueMemberDecoratorContext<This = unknown, Value = unknown> = ClassGetterDecoratorContext<This, Value> | ClassSetterDecoratorContext<This, Value> | ClassFieldDecoratorContext<This, Value> | ClassAccessorDecoratorContext<This, Value>;
    export function createClassBinder(): ClassBinder;
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
