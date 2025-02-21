/// <reference no-default-lib="true"/>
declare module "godot" {
    export const IntegerType: unique symbol;
    export const FloatType: unique symbol;
    export const EnumType: unique symbol;

    /** A built-in type representing a method or a standalone function.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.2/classes/class_callable.html  
     */
    interface AnyCallable {
        /** Returns `true` if this [Callable] has no target to call the method on. */
        is_null(): boolean

        /** Returns `true` if this [Callable] is a custom callable. Custom callables are created from [method bind] or [method unbind]. In GDScript, lambda functions are also custom callables. */
        is_custom(): boolean

        /** Returns `true` if this [Callable] is a standard callable. This method is the opposite of [method is_custom]. Returns `false` if this callable is a lambda function. */
        is_standard(): boolean

        /** Returns `true` if the callable's object exists and has a valid method name assigned, or is a custom callable. */
        is_valid(): boolean

        /** Returns the object on which this [Callable] is called. */
        get_object(): Object

        /** Returns the ID of this [Callable]'s object (see [method Object.get_instance_id]). */
        get_object_id(): int64

        /** Returns the name of the method represented by this [Callable]. If the callable is a GDScript lambda function, returns the function's name or `"<anonymous lambda>"`. */
        get_method(): StringName

        /** Returns the total amount of arguments bound (or unbound) via successive [method bind] or [method unbind] calls. If the amount of arguments unbound is greater than the ones bound, this function returns a value less than zero. */
        get_bound_arguments_count(): int64

        /** Return the bound arguments (as long as [method get_bound_arguments_count] is greater than zero), or empty (if [method get_bound_arguments_count] is less than or equal to zero). */
        get_bound_arguments(): Array

        /** Returns the 32-bit hash value of this [Callable]'s object.  
         *      
         *  **Note:** [Callable]s with equal content will always produce identical hash values. However, the reverse is not true. Returning identical hash values does  *not*  imply the callables are equal, because different callables can have identical hash values due to hash collisions. The engine uses a 32-bit hash algorithm for [method hash].  
         */
        hash(): int64

        /** Returns a copy of this [Callable] with one or more arguments bound. When called, the bound arguments are passed  *after*  the arguments supplied by [method call]. See also [method unbind].  
         *      
         *  **Note:** When this method is chained with other similar methods, the order in which the argument list is modified is read from right to left.  
         */
        bind(...vargargs: any[]): AnyCallable

        /** Returns a copy of this [Callable] with one or more arguments bound, reading them from an array. When called, the bound arguments are passed  *after*  the arguments supplied by [method call]. See also [method unbind].  
         *      
         *  **Note:** When this method is chained with other similar methods, the order in which the argument list is modified is read from right to left.  
         */
        bindv(arguments_: GArray): AnyCallable

        /** Returns a copy of this [Callable] with a number of arguments unbound. In other words, when the new callable is called the last few arguments supplied by the user are ignored, according to [param argcount]. The remaining arguments are passed to the callable. This allows to use the original callable in a context that attempts to pass more arguments than this callable can handle, e.g. a signal with a fixed number of arguments. See also [method bind].  
         *      
         *  **Note:** When this method is chained with other similar methods, the order in which the argument list is modified is read from right to left.  
         *    
         */
        unbind(argcount: int64): AnyCallable
        
        /** Calls the method represented by this [Callable]. Arguments can be passed and should match the method's signature. */
        call(...vargargs: any[]): any
        
        /** Calls the method represented by this [Callable]. Unlike [method call], this method expects all arguments to be contained inside the [param arguments] [Array]. */
        callv(arguments_: GArray): any
        
        /** Calls the method represented by this [Callable] in deferred mode, i.e. at the end of the current frame. Arguments can be passed and should match the method's signature.  
         *    
         *      
         *  **Note:** Deferred calls are processed at idle time. Idle time happens mainly at the end of process and physics frames. In it, deferred calls will be run until there are none left, which means you can defer calls from other deferred calls and they'll still be run in the current idle time cycle. This means you should not call a method deferred from itself (or from a method called by it), as this causes infinite recursion the same way as if you had called the method directly.  
         *  See also [method Object.call_deferred].  
         */
        call_deferred(...vargargs: any[]): void
    }

    /** A built-in type representing a signal of an [Object].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.2/classes/class_signal.html  
     */
    interface AnySignal {
        /** Returns `true` if the signal's name does not exist in its object, or the object is not valid. */
        is_null(): boolean

        /** Returns the object emitting this signal. */
        get_object(): Object

        /** Returns the ID of the object emitting this signal (see [method Object.get_instance_id]). */
        get_object_id(): int64

        /** Returns the name of this signal. */
        get_name(): StringName

        /** Returns `true` if the specified [Callable] is connected to this signal. */
        is_connected(callable: AnyCallable): boolean

        /** Returns an [Array] of connections for this signal. Each connection is represented as a [Dictionary] that contains three entries:  
         *  - `signal` is a reference to this signal;  
         *  - `callable` is a reference to the connected [Callable];  
         *  - `flags` is a combination of [enum Object.ConnectFlags].  
         */
        get_connections(): Array
    }

    interface Callable0<R = void> extends AnyCallable {
        call(): R;
    }

    interface Callable1<T1, R = void> extends AnyCallable {
        call(v1: T1): R;
    }

    interface Callable2<T1, T2, R = void> extends AnyCallable {
        call(v1: T1, v2, T2): R;
    }

    interface Callable3<T1, T2, T3, R = void> extends AnyCallable {
        call(v1: T1, v2: T2, v3: T3): R;
    }

    interface Callable4<T1, T2, T3, T4, R = void> extends AnyCallable {
        call(v1: T1, v2: T2, v3: T3, v4: T4): R;
    }

    interface Callable5<T1, T2, T3, T4, T5, R = void> extends AnyCallable {
        call(v1: T1, v2: T2, v3: T3, v4: T4, v5: T5): R;
    }

    interface Signal0 extends AnySignal {
        connect(callable: Callable0, flags: int64 = 0): void;
        disconnect(callable: Callable0): void;
        is_connected(callable: Callable0): boolean;
        emit(): void;

        as_promise(): Promise<void>;
    }

    interface Signal1<T1> extends AnySignal {
        connect(callable: Callable1<T1>, flags: int64 = 0): void;
        disconnect(callable: Callable1<T1>): void;
        is_connected(callable: Callable1<T1>): boolean;
        emit(v1: T1): void;

        // the first argument is used as the resolved value
        as_promise(): Promise<T1>;
    }

    interface Signal2<T1, T2> extends AnySignal {
        connect(callable: Callable2<T1, T2>, flags: int64 = 0): void;
        disconnect(callable: Callable2<T1, T2>): void;
        is_connected(callable: Callable2<T1, T2>): boolean;
        emit(v1: T1, v2: T2): void;

        // the first argument is used as the resolved value
        as_promise(): Promise<T1>;
    }

    interface Signal3<T1, T2, T3> extends AnySignal {
        connect(callable: Callable3<T1, T2, T3>, flags: int64 = 0): void;
        disconnect(callable: Callable3<T1, T2, T3>): void;
        is_connected(callable: Callable3<T1, T2, T3>): boolean;
        emit(v1: T1, v2: T2, v3: T3): void;

        // the first argument is used as the resolved value
        as_promise(): Promise<T1>;
    }

    interface Signal4<T1, T2, T3, T4> extends AnySignal {
        connect(callable: Callable4<T1, T2, T3, T4>, flags: int64 = 0): void;
        disconnect(callable: Callable4<T1, T2, T3, T4>): void;
        is_connected(callable: Callable4<T1, T2, T3, T4>): boolean;
        emit(v1: T1, v2: T2, v3: T3, v4: T4): void;

        // the first argument is used as the resolved value
        as_promise(): Promise<T1>;
    }

    interface Signal5<T1, T2, T3, T4, T5> extends AnySignal {
        connect(callable: Callable5<T1, T2, T3, T4, T5>, flags: int64 = 0): void;
        disconnect(callable: Callable5<T1, T2, T3, T4, T5>): void;
        is_connected(callable: Callable5<T1, T2, T3, T4, T5>): boolean;
        emit(v1: T1, v2: T2, v3: T3, v4: T4, v5: T5): void;

        // the first argument is used as the resolved value
        as_promise(): Promise<T1>;
    }

}