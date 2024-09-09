/// <reference no-default-lib="true"/>
declare module "godot" {
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

    interface Callable0 extends AnyCallable {
        call(): void;
    }

    interface Callable1<T1> extends AnyCallable {
        call(v1: T1): void;
    }

    interface Callable2<T1, T2> extends AnyCallable {
        call(v1: T1, v2, T2): void;
    }

    interface Callable3<T1, T2, T3> extends AnyCallable {
        call(v1: T1, v2: T2, v3: T3): void;
    }

    interface Callable4<T1, T2, T3, T4> extends AnyCallable {
        call(v1: T1, v2: T2, v3: T3, v4: T4): void;
    }

    interface Callable5<T1, T2, T3, T4, T5> extends AnyCallable {
        call(v1: T1, v2: T2, v3: T3, v4: T4, v5: T5): void;
    }

    interface Signal0 extends AnySignal {
        connect(callable: Callable0, flags: int64 = 0): void;
        disconnect(callable: Callable0): void;
        is_connected(callable: Callable0): boolean;
        emit(): void;
    }

    interface Signal1<T1> extends AnySignal {
        connect(callable: Callable1<T1>, flags: int64 = 0): void;
        disconnect(callable: Callable1<T1>): void;
        is_connected(callable: Callable1<T1>): boolean;
        emit(v1: T1): void;
    }

    interface Signal2<T1, T2> extends AnySignal {
        connect(callable: Callable2<T1, T2>, flags: int64 = 0): void;
        disconnect(callable: Callable2<T1, T2>): void;
        is_connected(callable: Callable2<T1, T2>): boolean;
        emit(v1: T1, v2: T2): void;
    }

    interface Signal3<T1, T2, T3> extends AnySignal {
        connect(callable: Callable3<T1, T2, T3>, flags: int64 = 0): void;
        disconnect(callable: Callable3<T1, T2, T3>): void;
        is_connected(callable: Callable3<T1, T2, T3>): boolean;
        emit(v1: T1, v2: T2, v3: T3): void;
    }

    interface Signal4<T1, T2, T3, T4> extends AnySignal {
        connect(callable: Callable4<T1, T2, T3, T4>, flags: int64 = 0): void;
        disconnect(callable: Callable4<T1, T2, T3, T4>): void;
        is_connected(callable: Callable4<T1, T2, T3, T4>): boolean;
        emit(v1: T1, v2: T2, v3: T3, v4: T4): void;
    }

    interface Signal5<T1, T2, T3, T4, T5> extends AnySignal {
        connect(callable: Callable5<T1, T2, T3, T4, T5>, flags: int64 = 0): void;
        disconnect(callable: Callable5<T1, T2, T3, T4, T5>): void;
        is_connected(callable: Callable5<T1, T2, T3, T4, T5>): boolean;
        emit(v1: T1, v2: T2, v3: T3, v4: T4, v5: T5): void;
    }

}