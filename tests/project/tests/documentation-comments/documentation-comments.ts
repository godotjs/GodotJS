import { Node, Signal, Variant } from "godot";
import { createClassBinder } from "godot.annotations";

const bind = createClassBinder();

/** This is a description of the below enum. */
enum Direction {
    /** Direction up. */
    UP = 0,
    /** Direction down. */
    DOWN = 1,
    /** Direction left. */
    LEFT = 2,
    /** Direction right. */
    RIGHT = 3,
}

/**
 * A brief description of the class's role and functionality.
 *
 * The description of the script, what it can do,
 * and any further detail.
 *
 * @tutorial https://example.com/tutorial_1
 * @tutorial(Tutorial 2) https://example.com/tutorial_2
 * @experimental
 */
@bind()
export default class DocumentationComments extends Node {
    /** The description of a signal. */
    @bind.signal()
    accessor my_signal!: Signal<() => void>;

    /** The description of a constant. */
    static readonly GRAVITY = 9.8;

    /** The description of the variable v1. */
    v1: any;

    /**
     * This is a multiline description of the variable v2.
     * The type information below will be extracted for the documentation.
     */
    v2: number = 0;

    /**
     * If the member has any annotation, the annotation should
     * immediately precede it.
     */
    @bind.export(Variant.Type.TYPE_INT)
    accessor v3: number = some_func();

    /**
     * As the following function is documented, even though its name starts with
     * an underscore, it will appear in the help window.
     */
    _fn(p1: number, p2: string): number {
        return 0;
    }

    // The below function isn't documented and its name starts with an underscore
    // so it will treated as private and will not be shown in the help window.
    _internal(): void {}

    /**
     * This function is deprecated and should not appear in the help window.
     * @deprecated Use [method _fn] instead
     */
    _deprecated() {}
}

function some_func(): number {
    return 0;
}
