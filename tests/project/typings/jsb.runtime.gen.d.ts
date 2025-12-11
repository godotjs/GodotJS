declare module "godot.annotations" {
    import * as Godot from "godot";
    import * as GodotJsb from "godot-jsb";
    type ClassBinder = (() => 
            ((
                target: GObjectConstructor, 
                context: ClassDecoratorContext
            ) => void))
        & {
            tool: () => 
                ((
                    target: GObjectConstructor, 
                    _context: ClassDecoratorContext
                ) => void);
            icon: (path: string) => 
                ((
                    target: GObjectConstructor, 
                    _context: ClassDecoratorContext
                ) => void);
            export: ((
                    type: Godot.Variant.Type, 
                    options?: ExportOptions
                ) => ClassMemberDecorator)
                & {
                    multiline: () => ClassMemberDecorator;
                    range: (
                        min: number, 
                        max: number, 
                        step: number, 
                        ...extra_hints: string[]
                    ) => ClassMemberDecorator;
                    range_int: (
                        min: number, 
                        max: number, 
                        step: number, 
                        ...extra_hints: string[]
                    ) => ClassMemberDecorator;
                    file: (filter: string) => ClassMemberDecorator;
                    dir: (filter: string) => ClassMemberDecorator;
                    global_file: (filter: string) => ClassMemberDecorator;
                    global_dir: (filter: string) => ClassMemberDecorator;
                    exp_easing: (
                        hint?: ""
                            | "attenuation"
                            | "positive_only"
                            | "attenuation,positive_only"
                    ) => ClassMemberDecorator;
                    array: (clazz: ClassSpecifier) => ClassMemberDecorator;
                    dictionary: (
                        key_class: VariantConstructor, 
                        value_class: VariantConstructor
                    ) => ClassMemberDecorator;
                    object: <
                    Constructor extends GObjectConstructor>(clazz: Constructor
                    ) => 
                        ClassMemberDecorator<
                            ClassValueMemberDecoratorContext<
                                unknown,
                                null
                                    | InstanceType<Constructor>
                            >
                        >;
                    "enum": (
                        enum_type: Record<
                            string,
                            string
                                | number
                        >
                    ) => ClassMemberDecorator;
                    flags: (
                        enum_type: Record<
                            string,
                            string
                                | number
                        >
                    ) => ClassMemberDecorator;
                    cache: () => 
                        ClassMemberDecorator<
                            ClassAccessorDecoratorContext<Godot.Object>
                                | ClassSetterDecoratorContext<Godot.Object>
                        >;
                };
            signal: () => 
                (<
                Context extends ClassAccessorDecoratorContext<
                        Godot.Object,
                        Godot.Signal
                    >
                    | ClassGetterDecoratorContext<
                        Godot.Object,
                        Godot.Signal
                    >
                    | ClassFieldDecoratorContext<
                        Godot.Object,
                        Godot.Signal
                    >>(
                    _target: unknown, 
                    context: Context
                ) => ClassMemberDecoratorReturn<Context>);
            rpc: (config?: RPCConfig) => 
                ((
                    _target: Function, 
                    context: string
                        | ClassMethodDecoratorContext
                ) => void);
            onready: (
                evaluator: string
                    | GodotJsb.internal.OnReadyEvaluatorFunc
            ) => 
                ((
                    _target: undefined, 
                    context: string
                        | ClassMethodDecoratorContext
                ) => void);
            deprecated: (message?: string) => 
                Decorator<
                    ClassDecoratorContext<GObjectConstructor>
                        | ClassValueMemberDecoratorContext<GObjectConstructor>
                >;
            experimental: (message?: string) => 
                Decorator<
                    ClassDecoratorContext<GObjectConstructor>
                        | ClassValueMemberDecoratorContext<GObjectConstructor>
                >;
            help: (message?: string) => 
                Decorator<
                    ClassDecoratorContext<GObjectConstructor>
                        | ClassValueMemberDecoratorContext<GObjectConstructor>
                >;
        }
    type ExportOptions = {
        "class"?: any;
        hint?: Godot.PropertyHint;
        hint_string?: string;
        usage?: Godot.PropertyUsageFlags;
    }
    type RPCConfig = {
        mode?: Godot.MultiplayerAPI.RPCMode;
        sync?: "call_remote"
            | "call_local";
        transfer_mode?: Godot.MultiplayerPeer.TransferMode;
        transfer_channel?: number;
    }
}
