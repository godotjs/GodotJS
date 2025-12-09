declare module "godot" {
    const IntegerType: unique symbol;
    const FloatType: unique symbol;
    /**
     * Proxy objects are typically transparent by design, allowing a proxy to impersonate a type. However, GodotJS also
     * makes use of proxies to wrap existing objects in order to provide a more convenient API. In such cases, it is
     * convenient to be able to unwrap the object i.e. obtain access to the target object. In order to achieve this,
     * GodotJS exposes a property with the key ProxyTarget. You can access this to, for example, obtain direct access
     * to the original GDictionary wrapped via a call to .proxy(). Additionally, GodotJS uses this property internally
     * to unwrap proxies, thus allowing you to pass a proxy wrapped GArray/GDictionary as an argument to any function
     * expecting a GArray/GDictionary parameter.
     */
    const ProxyTarget: unique symbol;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Callable/Callable<T>.
     */
    type AnyCallable = Callable;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Signal/Signal<T>.
     */
    type AnySignal = Signal;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Callable<T>.
     */
    type Callable0<R = void> = Callable<() => R>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Callable<T>.
     */
    type Callable1<T1, R = void> = Callable<(v1: T1) => R>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Callable<T>.
     */
    type Callable2<T1, T2, R = void> = Callable<(v1: T1, v2: T2) => R>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Callable<T>.
     */
    type Callable3<T1, T2, T3, R = void> = Callable<(v1: T1, v2: T2, v3: T3) => R>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Callable<T>.
     */
    type Callable4<T1, T2, T3, T4, R = void> = Callable<(v1: T1, v2: T2, v3: T3, v4: T4) => R>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Callable<T>.
     */
    type Callable5<T1, T2, T3, T4, T5, R = void> = Callable<(v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => R>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Signal<T>.
     */
    type Signal0 = Signal<() => void>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Signal<T>.
     */
    type Signal1<T1> = Signal<(v1: T1) => void>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Signal<T>.
     */
    type Signal2<T1, T2> = Signal<(v1: T1, v2: T2) => void>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Signal<T>.
     */
    type Signal3<T1, T2, T3> = Signal<(v1: T1, v2: T2, v3: T3) => void>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Signal<T>.
     */
    type Signal4<T1, T2, T3, T4> = Signal<(v1: T1, v2: T2, v3: T3, v4: T4) => void>;

    /**
     * FOR BACKWARD COMPATIBILITY ONLY
     * @deprecated [WARNING] Use Signal<T>.
     */
    type Signal5<T1, T2, T3, T4, T5> = Signal<(v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => void>;

    type ExtractValueKeys<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
    type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;

    type UndefinedToNull<T> = T extends undefined ? null : T;

    // A bit convoluted, but written this way to mitigate type definitions circularly depending on themselves.
    type GodotNames<T> = '__godotNameMap' extends keyof T
        ? keyof T['__godotNameMap'] | Exclude<keyof T, T['__godotNameMap'][keyof T['__godotNameMap']]>
        : keyof T;
    type ResolveGodotName<T, Name> = Name extends keyof T
        ? Name
        : '__godotNameMap' extends keyof T
            ? Name extends keyof T['__godotNameMap']
                ? T['__godotNameMap'][Name]
                : never
            : never;
    type ResolveGodotNameValue<T, Name> = Name extends keyof T
        ? T[Name]
        : '__godotNameMap' extends keyof T
            ? Name extends keyof T['__godotNameMap']
                ? T['__godotNameMap'][Name] extends keyof T
                    ? T[T['__godotNameMap'][Name]]
                    : never
                : never
            : never;
    type ResolveGodotNameParameters<T, Name> = Name extends GodotDynamicDispatchName
        ? GAny[]
        : ResolveGodotName<T, Name> extends keyof T
            ? T[ResolveGodotName<T, Name>] extends {
                    bivarianceHack(...args: infer P extends GAny[]): void | GAny
                }["bivarianceHack"]
                ? P
                : never
            : never;
    type ResolveGodotReturnType<T, Name> = Name extends GodotDynamicDispatchName
        ? void | GAny
        : ResolveGodotName<T, Name> extends keyof T
            ? T[ResolveGodotName<T, Name>] extends (...args: any[]) => infer R
                ? R
                : never
            : never;

    /**
     * Godot has many APIs that are a form of dynamic dispatch, i.e., they take the name of a function or property and
     * then operate on the value matching the name. TypeScript is powerful enough to allow us to type these APIs.
     * However, since these APIs can be used to call each other, the type checker can get hung up trying to infinitely
     * recurse on these types. What follows is an interface with the built-in dynamic dispatch names. GodotJS' types
     * will not recurse through methods matching these names. If you want to build your own dynamic dispatch APIs, you
     * can use interface merging to insert additional method names.
     */
    interface GodotDynamicDispatchNames {
        call: 'call';
        callv: 'callv';
        call_deferred: 'call_deferred';
        add_do_method: 'add_do_method';
        add_undo_method: 'add_undo_method';
    }

    type GodotDynamicDispatchName = GodotDynamicDispatchNames[keyof GodotDynamicDispatchNames];

    /**
     * This namespace and the values within do not exist at runtime. They're declared here, for internal use only, as a
     * work-around for limitations of TypeScript's type system.
     */
    namespace __PathMappableDummyKeys {
    }

    type PathMappable<DummyKey extends symbol, Map extends PathMap = PathMap> = {
        [K in DummyKey]: Map;
    };

    type PathMap<T = unknown> = Record<string, T>;

    type StaticPath<
        Map extends PathMap,
        Permitted = any,
        DefaultKey extends string = never,
        DummyKey extends symbol = typeof __PathMappableDummyKeys[keyof typeof __PathMappableDummyKeys]
    > = IfAny<
        Map,
        string,
        ExtractValueKeys<Map, Permitted> & string
        | (
        DummyKey extends any
            ? (
                (
                    Map[DefaultKey] extends never
                        ? never
                        : (
                            Map[DefaultKey] extends PathMappable<DummyKey, infer ChildMap>
                                ? StaticPath<ChildMap, Permitted, DefaultKey>
                                : never
                            )
                    )
                | {
                [K in Exclude<keyof Map, DefaultKey> & string]: Map[K] extends PathMappable<DummyKey, infer ChildMap>
                    ? `${K}/${StaticPath<ChildMap, Permitted, DefaultKey>}`
                    : never
            }[Exclude<keyof Map, DefaultKey> & string]
                )
            : never
        )
    >;

    type ResolvePath<
        Map extends PathMap,
        Path extends string,
        Default,
        Permitted,
        DefaultKey extends string = never,
        DummyKey extends symbol = typeof __PathMappableDummyKeys[keyof typeof __PathMappableDummyKeys]
    > = IfAny<
        Map,
        Permitted,
        DummyKey extends any
            ? (
                Path extends keyof Map
                    ? [Map[Path]] extends [Permitted]
                        ? [undefined] extends [Map[Path]]
                            ? null | Exclude<Map[Path], undefined>
                            : Map[Path]
                        : Default
                    : Path extends `${infer Key extends Exclude<keyof Map, DefaultKey> & string}/${infer SubPath}`
                        ? Map[Key] extends PathMappable<DummyKey, infer ChildMap>
                            ? ResolvePath<ChildMap, SubPath, Default, Permitted>
                            : Default
                        : Map[DefaultKey] extends PathMappable<DummyKey, infer ChildMap>
                            ? ResolvePath<ChildMap, Path, Default, Permitted>
                            : never
                )
            : never
    >;

    type PathMapChild<Map extends NodePathMap, Permitted, Default> = IfAny<
        Map,
        Permitted,
        Map[keyof Map] extends undefined | Permitted ? Exclude<Map[keyof Map], undefined> : Default
    >;

    type NodePathMap = PathMap<undefined | Node>;
    type StaticNodePath<Map extends NodePathMap, Permitted = Node> = StaticPath<Map, Permitted, never, typeof __PathMappableDummyKeys.Node>;
    type ResolveNodePath<Map extends NodePathMap, Path extends string, Default = never, Permitted = Node> =
        ResolvePath<Map, Path, Default, Permitted, never, typeof __PathMappableDummyKeys.Node>;
    type ResolveNodePathMap<Map extends NodePathMap, Path extends string, Default = never> = Path extends keyof Map
        ? Map[Path] extends Node<infer ChildMap>
            ? ChildMap
            : Default
        : Path extends `${infer Key extends keyof Map & string}/${infer SubPath}`
            ? Map[Key] extends Node<infer ChildMap>
                ? ResolveNodePathMap<ChildMap, SubPath, Default>
                : Default
            : Default;
    type NodePathMapChild<Map extends NodePathMap> = PathMapChild<Map, Node, Node>;

    type AnimationMixerPathMap = PathMap<AnimationLibrary>;
    type StaticAnimationMixerPath<Map extends AnimationMixerPathMap> =
        StaticPath<Map, Animation, "", typeof __PathMappableDummyKeys["AnimationLibrary" | "AnimationMixer"]>;
    type ResolveAnimationMixerPath<Map extends AnimationMixerPathMap, Path extends string, Default = never> =
        ResolvePath<Map, Path, Default, Animation, "", typeof __PathMappableDummyKeys["AnimationLibrary" | "AnimationMixer"]>;

    type GArrayElement<T extends GAny | GAny[], I extends int64 = int64> = T extends any[]
        ? T[I]
        : T;

    /**
     * GArray elements are exposed with a subset of JavaScript's standard Array API. Array indexes are exposed as
     * enumerable properties, thus if you want to perform more complex operations you can convert to a regular
     * JavaScript array with [...g_array.proxy()].
     */
    class GArrayProxy<T> {
        [Symbol.iterator](): IteratorObject<GProxyValueWrap<T>>;

        /**
         * Gets the length of the array. This is a number one higher than the highest index in the array.
         */
        get length(): number;

        /**
         * Performs the specified action for each element in an array.
         * @param callback A function that accepts up to three arguments. forEach calls the callback function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callback function. If thisArg is omitted, undefined is used as the this value.
         */
        forEach<S = GArrayProxy<T>>(callback: (this: GArrayProxy<T>, value: GProxyValueWrap<T>, index: number) => void, thisArg?: S): void;

        /**
         * Removes the last element from an array and returns it.
         * If the array is empty, undefined is returned and the array is not modified.
         */
        pop(): GProxyValueWrap<T> | undefined;

        /**
         * Appends new elements to the end of an array, and returns the new length of the array.
         * @param item New element to add to the array.
         * @param additionalItems Additional new elements to add to the array.
         */
        push(item: T | GProxyValueWrap<T>, ...additionalItems: Array<T | GProxyValueWrap<T>>): number;

        /**
         * Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
         * @param searchElement The value to locate in the array.
         * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
         */
        indexOf(searchElement: T | GProxyValueWrap<T>, fromIndex?: number): number;

        /**
         * Determines whether an array includes a certain element, returning true or false as appropriate.
         * @param searchElement The element to search for.
         */
        includes(searchElement: T | GProxyValueWrap<T>): boolean;

        toJSON(key?: any): any;

        toString(): string;

        [n: number]: T | GProxyValueWrap<T>; // More accurate get type blocked by https://github.com/microsoft/TypeScript/issues/43826
    }

    // Ideally this would be a class, but TS currently doesn't provide a way to type a class with mapped properties.
    /**
     * GObject entries are exposed as enumerable properties, so Object.keys(), GObject.entries() etc. will work.
     */
    type GDictionaryProxy<T> = {
        [K in keyof T]: T[K] | GProxyValueWrap<T[K]>; // More accurate get type blocked by https://github.com/microsoft/TypeScript/issues/43826
    };

    type GProxyValueWrap<V> = V extends GArray<infer T>
        ? GArrayProxy<GArrayElement<T>>
        : V extends GDictionary<infer T>
            ? GDictionaryProxy<T>
            : V;

    type GProxyValueUnwrap<V> = V extends GArrayProxy<infer E>
        ? E
        : V extends GDictionaryProxy<infer T>
            ? T
            : V;

    type GWrappableValue = GAny | GWrappableValue[] | { [key: number | string]: GWrappableValue };
    type GValueWrapUnchecked<V> = V extends any[]
        ? number extends V["length"]
            ? GArray<GValueWrapUnchecked<V[number]>>
            : GArray<{ [I in keyof V]: GValueWrapUnchecked<V[I]> }>
        : V extends GAny
            ? V
            : GDictionary<{ [K in keyof V]: GValueWrapUnchecked<V[K]> }>;
    type GValueWrap<V> = [keyof V] extends [never]
        ? GDictionary<{}>
        : [V] extends [GWrappableValue]
            ? GValueWrapUnchecked<V>
            : never;

    type GValueUnwrap<V> = V extends GArray<infer T>
        ? T extends any[]
            ? { [I in keyof T]: GValueUnwrap<T[I]> }
            : Array<GValueUnwrap<T>>
        : V extends GDictionary<infer T>
            ? { [K in keyof T]: GValueUnwrap<T[K]> }
            : V;

    /**
     * Semi-workaround for https://github.com/microsoft/TypeScript/issues/43826.
     * @see GReadProxyValueWrap
     */
    type GArrayReadProxy<T> = Omit<GArrayProxy<T>, "forEach"> & {
        [Symbol.iterator](): IteratorObject<GReadProxyValueWrap<T>>;
        forEach<S = GArrayReadProxy<T>>(callback: (this: GArrayReadProxy<T>, value: GReadProxyValueWrap<T>, index: number) => void, thisArg?: S): void;
        [n: number]: GReadProxyValueWrap<T>;
    }

    /**
     * Semi-workaround for https://github.com/microsoft/TypeScript/issues/43826.
     * @see GReadProxyValueWrap
     */
    type GDictionaryReadProxy<T> = {
        [K in keyof T]: GReadProxyValueWrap<T[K]>;
    };

    // At runtime we only have the one kind of dictionary proxy and one kind of array proxy. The read interfaces have
    // indexers typed correctly for access i.e. return proxied types. The non-read interfaces have indexers accurate for
    // assignment and will accept both GArray/GDictionary and proxies. The read interfaces exist for convenience only,
    // you can safely cast between the two interfaces types as desired.
    type GReadProxyValueWrap<V> = V extends GArray<infer E>
        ? GArrayReadProxy<E>
        : V extends GDictionary<infer T>
            ? GDictionaryReadProxy<T>
            : V;

    interface PropertyInfo {
        name: string;
        type: Variant.Type;
        class_name: string;
        hint: PropertyHint;
        hint_string: string;
        usage: PropertyUsageFlags;
    }

    type BindRight<F extends Function, B extends any[]> =
        F extends (this: infer T, ...args: [...(infer A), ...B]) => infer R
            ? (this: T, ...args: A) => R
            : never;
}
