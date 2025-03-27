///<reference path="godot.generated.d.ts" />
declare module "godot" {
    export const IntegerType: unique symbol;
    export const FloatType: unique symbol;

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
    type Callable2<T1, T2, R = void> = Callable<(v1: T1, v2, T2) => R>;

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
    type Signal2<T1, T2> = Signal<(v1: T1, v2, T2) => void>;

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

    type NodePathMap = { [K in string]?: Node };

    type StaticNodePath<Map extends NodePathMap> = (keyof Map & string) | {
        [K in keyof Map & string]: Map[K] extends Node<infer ChildMap>
            ? `${K}/${StaticNodePath<ChildMap>}`
            : never
    }[keyof Map & string];

    type ResolveNodePath<Map extends NodePathMap, Path extends string, Default = never> = Path extends keyof Map
        ? Map[Path]
        : Path extends `${infer Key extends keyof Map & string}/${infer SubPath}`
            ? Map[Key] extends Node<infer ChildMap>
                ? ResolveNodePath<ChildMap, SubPath, Default>
                : Default
            : Default;

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
     * GObject entries are exposed as enumerable properties, so Object.keys(), Object.entries() etc. will work.
     */
    type GDictionaryProxy<T> = {
        [K in keyof T]: T[K] | GProxyValueWrap<T[K]>; // More accurate get type blocked by https://github.com/microsoft/TypeScript/issues/43826
    };

    type GProxyValueWrap<V> = V extends GArray<infer E>
        ? GArrayProxy<E>
        : V extends GDictionary<infer T>
            ? GDictionaryProxy<T>
            : V;

    type GProxyValueUnwrap<V> = V extends GArray<infer E>
      ? E
      : V extends GDictionary<infer T>
        ? T
        : V;

    /**
     * Semi-workaround for https://github.com/microsoft/TypeScript/issues/43826.
     * @see GReadProxyValueWrap
     */
    type GArrayReadProxy<T> = Omit<GArrayProxy<T>, 'forEach'> & {
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

  type BindRight<F extends (this: any, ...args: any[]) => any, B extends any[]> =
    F extends (this: infer T, ...args: [...(infer A), ...B]) => infer R
      ? (this: T, ...args: A) => R
      : never;
}
