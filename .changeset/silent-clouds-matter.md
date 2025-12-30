---
"@godot-js/editor": minor
---

feat: additionally to @bind.help/experimental/deprecated add an editor setting to enable standard JS comments and JSDoc like annotations for documentation comments.

You need to enable the setting, set ``Editor -> Editor Settings -> GodotJS -> Experimental -> Jsdoc Documentation Comments `` to ``on``.

Here is an example for more information see https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_documentation_comments.html:
````ts
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
export default class DocumentationComments extends Node {

    /**
     * This is a multiline description of the variable v2.
     * The type information below will be extracted for the documentation.
     */
    v2: number = 0;

    /**
     * As the following function is documented, even though its name starts with
     * an underscore, it will appear in the help window.
     */
    _fn(p1: number, p2: string): number {
        return 0;
    }

    /**
     * This function is deprecated and should not appear in the help window.
     * @deprecated Use [method _fn] instead
     */
    _deprecated() {}
}
````