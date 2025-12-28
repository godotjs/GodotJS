# @godot-js/editor

## 1.1.0

### Minor Changes

-   14e8cba: GodotJS 1.1
-   5e5214e: feat: Debug on mobile, wait for debugger and LWS/V8 auto-download

    -   There's now Project Settings -> GodotJS -> Runtime -> Wait for Debugger (currently V8 only). This will pause execution before any JavaScript user code runs. This allows you to much more easily debug app start-up.

    -   There is now support for debugging on mobile devices. Unlike Editor builds on your Desktop, mobile builds don't have source distributed with them. Instead debugging works in tandem with an Editor build, which provides the source files to the debugger. Configure the host that provides source code with the new Project Settings -> GodotJS -> Runtime -> Source Map Base URL option. Your debugger (NOT the mobile device) must be able to reach this this URL. By default, that means you'll want to use: http://127.0.0.1:9300 Additionally, you need to ensure your TypeScript build config has sourceMaps enabled. The debugger can then fetch source files over HTTP. It is however, worth noting fetching source files can be pretty slow, particularly if you have a lot of them. Local debugging of desktop editor builds is generally much simpler.

    -   GodotJS Development: libwebsockets (LWS) was previously included as a binary in the repo. It (and V8) are now automatically downloaded from GodotJS' GodotJS-Dependencies release on Github. Whilst not 100% foolproof, this does help validate the integrity of binaries included in builds.

### Patch Changes

-   e28d324: **Types:** Statically resolved return type for `get_node()`/`getNode()`.
-   e28d324: **Types:** `ResourceLoader.load()` overload type.
-   2073ac9: **Fix:** `@ExportObject(Node)` was only working for sub-classes, not `Node` itself.
-   5171c3a: **Fix:** Duplicate "Generating" label appeared in the UI during codegen.
-   0514427: **Types:** `GDictionary` absent values are now correctly typed as returning as `null`, not `undefined`.
-   e28d324: **Feature:** Improved type conversion error messages.
-   e28d324: **Fix:** `@export_` support for enums as keys of `GDictionary`.
-   8979b46: **Types/Fix:** Invalid codegen for certain types (function literals in particular)
-   e28d324: **Fix:** Background thread script instantiation (for 4.5 editor).
-   e28d324: **Fix:** Handle `hint_string` if `@export_var` is a `GArray` with an element type provided via `details.class_`.
-   16450df: **Types:** Added `Resource` `duplicate()` return type.
-   e28d324: **Feature:** Improved user project type configurability.

    -   Codegen for scenes and resources now default to being stored in
        `gen/types` rather than `typings/`. However, a setting has been
        introduced to configure this. `typings/` is no longer used
        because the directory is configured as a type root, which means
        directories contained within are expected to be module
        definitions.
    -   `"types": ["node"]` in the default tsconfig was hiding type errors.
        This is no longer set. Essentially, this setting was disabling
        all types except node types from our type roots.
    -   `@types/node` removed from the default `package.json`. It was
        misleading and made it easy to accidentally use non-existent
        functionality. We no longer need these types because...
    -   Our JS essentials (console, timeout and intervals APIs) are now
        included in our `godot.minimal.d.ts`.
    -   No longer including `<reference no-default-lib=true/>` in our TS
        files. This seemed to be interfering with user tsconfig options,
        and it was not required. Not that it's been removed you're able to
        more freely make changes to your tsconfig. For example, you may set
        `libs` (or `target`) to make use of newer JS APIs.

-   e28d324: **Feature:** Ergonomics overhaul. Camel-case, TS types, codegen + more.

    -   There's now a project setting which can be toggled to swap to a
        more idiomatic JS naming scheme for Godot bindings. We use
        camel and pascal case to more closely align with typical
        JavaScript/TypeScript conventions. For `@Decorators` we've gone
        with pascal case, which is used in libraries like Angular. Camel
        case is perhaps more popular, but pascal case allows us to avoid
        reserved names, and thus we can cleanly write `@Export`, instead of
        needing to include the trailing underscore on `@export_`.

    -   TypeScript types have been improved. Particularly `Signal<>` and
        `Callable<>`. `Signal1`, `Signal2`, etc. are now deprecated, as are
        `AnySignal` and `AnyCallable`, since the new `Signal<T>` and `Callable<T>`
        types handle an arbitrary number of parameters. Importantly,
        `Callable.bind(...)` is now accurately typed, so you'll receive
        type errors when connecting to signals.

    -   `GArray` and `GDictionary` now have a static `.create<T>()` method
        which allows you to create nested data structures from literals
        and benefit from full type checking. When a `GArray` or `GDictionary`
        is expected as a property, a `.proxy()` can be provided in its
        place.

    -   Partially worked around https://github.com/microsoft/TypeScript/issues/43826
        whereby our proxied `GArray` and `GDictionary` always return proxied
        nested values, but will accept non-proxied values when mutating
        a property. Basically, there's now `GArrayReadProxy` and
        `GDictionaryReadProxy`. These aren't runtime types, they're just
        TS types that make it easier to work with proxies. Under normal
        circumstances, you likely won't need to know these types exist.

    -   Codegen leveled up. Any TS module can now export a function
        named `codegen` with the type `CodeGenHandler`. This function
        will be called during codegen to allow you to optionally
        augment type generation involving user-defined types. Consider,
        for example, the `SceneNodes` codegen which previously only knew
        how to handle Godot/native types in the scene hierarchy. When
        a user type was encountered, it'd write the native type, which
        is still useful, but it'd be nice to be able to include user
        types. The reason we don't by default is user types are not
        required to follow our generic parameter convention where
        each node is passed a `Map` argument.

        Let's see an example:

        ```ts
          export default class CardCollection<Card extends CardNode = CardNode> extends GameNode<SceneNodes['scenes/card_collection_3d.tscn']>
        ```

        the type above does not take a `Map`. Perhaps more interesting, it
        takes a different generic parameter, a `CardNode`. If we encounter
        a `CardCollection` script attached to a node in the scene somewhere,
        GodotJS' internal codegen can't possibly know what that generic
        parameter ought to be. So we can help it out. In the same file
        where `CardCollection` is defined, we could provide a `codegen`
        handler like so:

        ```ts
        export const codegen: CodeGenHandler = (rawRequest) => {
            const request = rawRequest.proxy();

            switch (request.type) {
                case CodeGenType.ScriptNodeTypeDescriptor: {
                    const cardNodeScript = request.node.get("cardNodeScript");
                    return GDictionary.create<UserTypeDescriptor>({
                        type: DescriptorType.User,
                        name: "CardCollection",
                        resource: "res://src/card-collection.ts",
                        arguments: GArray.create<TypeDescriptor>([
                            GDictionary.create<UserTypeDescriptor>({
                                type: DescriptorType.User,
                                name: cardNodeScript?.getGlobalName() ?? "CardNode",
                                resource: cardNodeScript?.resourcePath ?? "res://src/card-node.ts",
                            }),
                        ]),
                    });
                }
            }

            return undefined;
        };
        ```

        Above we handle the codegen request to determine the node type
        of the provided `request.node`. What's _really_ neat here is we
        don't need to hard-code that generic. We've instead exported a
        configurable `Script` reference for use in the editor:

        ```ts
          @ExportObject(Script)
          cardNodeScript: Script = ResourceLoader.load('res://src/card-node.ts') as Script;
        ```

        So the codegen logic simply grabs the type exported from the
        chosen script, and provides it as a generic argument to
        `CardCollection<>`.

        One thing worth noting, your class does NOT need to be a `@Tool`.
        In the above example, `CardCollection<T>` is not a `@Tool`, and
        hence the node script is not instantiated during codegen, which
        is why we've used `request.node.get('cardNodeScript')` rather
        than trying to access the property directly. That said, if you
        want, codegen can be combined with `@Tool`.

    -   There's also a bunch of logging/error reporting improvements.

-   5c5943e: **Feature:** Bumped default tsconfig target from es2016 to es2022

    All supported runtimes ought to support the 2022 standard. You can
    still manually change the target if desired. This change is to
    provide a better user experience by default.

-   64f5ee8: **Feature:** Godot String methods now exposed as static methods on `String`.

    This doesn't change anything about how strings are used within
    JavaScript i.e. we're still using JS native string type, not
    Godot's String. However, Godot's String class has many utility
    functions, some of them static and some of them as instance
    methods. These are now all available for consumption in JavaScript.
    Godot String instance methods are mapped to static methods that
    take a `target: string` as their first parameter.

    In general, if there's an equivalent native JS string method, you
    should always use it instead since it will be much more performant.

-   d87eea1: **Feature:** Constructor params support and GDScript compatible `new`

    Support for `new` is very important for improving interop with
    other scripting languages, allowing them to instantiate objects
    from a Script reference. Crucially, this allows native
    GDExtension to instantiate Nodes/Objects/Resources implemented
    in GodotJS.

    Object construction has been refactored. Previously we had three
    cases to handle:

    1. new SomeJSWrapperAroundAGodotObject() – JS construction
    2. CDO (Class default object) construction - used to determine
       default parameters on a class (for use in the editor).
    3. Cross binding. Which is when a Godot Object is constructed and
       our script latter needs to attach to it.

    In the past, case 1 was the only situation in which instantiating
    a JS class ought to also instantiate the Godot native object.
    However, in my previous commit I changed CDOs so also instantiate
    the underlying native object. So case 2 was eliminated.

    Case 3 (cross binding) is a common situation, it was previously
    implemented in a somewhat intrusive fashion. All JS objects were
    being constructed and passed a parameter as their first argument.
    This indicated whether the object was cross binding (or a CDO).
    This prevented users from (easily) implementing constructors, the
    user had to know about the internal parameter and pass this
    up through to super(). For the most part I imagine users (myself
    included) simply avoided using constructors. However, this
    complicated some code that would otherwise be trivial in GDScript
    or C# because the latter has constructors and the former \_init.

    Consequently, I've implemented a new strategy to determine whether
    a constructor is being called from C++ (cross binding) or from JS.
    The implementation is quite straight forward, but arriving at this
    solution was not necessarily obvious. V8 doesn't expose APIs to
    intercept construction, and we can't naively use shared flags
    to mark a native constructor in progress because the solution
    needs to support reentrancy since during construction an object
    may instantiate other objects. Additionally, we can't just use
    different constructors (V8 templates) because there's issues with
    both sub-classing and `instanceof` detection.

    The solution was to take advantage of JS' `Reflect.construct` API.
    This allows us to call a constructor but have `new.target` set to
    an arbitrary constructable. `new.target` survives whilst
    traversing up through super() constructors (similar to how we
    previously passed arguments up). This let's us mark a particular
    instantiation as coming from C++. `Reflect.construct` instantiates
    `this` to match the prototype chain from the provided `newTarget`
    so we simply set it to the prototype of the original constructor
    and we're on our way.

    Using `Reflect.construct` is also standard JS, so it's available
    on our support JS runtimes without needing to resort to any
    runtime-specific code.

-   72e0bf6: **Types:** Improved GObject types
-   d5c1dfa: **Fix:** Bind script instance during default prop evaluation.

    If properties are implemented in JavaScript as properties (getters)
    they'll often want to call Godot methods on self. Without the
    script instance being bound this led to a crash.

-   29d9a48: fix: QuickJS number -> int32 conversion
-   e28d324: **Feature:** Introduced a setting to control whether `.d.ts` for scenes are auto-generated on when scenes are saved in the Editor.
-   f554365: **Feature:** Expose Godot Variant utility method typeof() as `godot_typeof()`/`godotTypeof()`.
-   460737c: **Fix:** Threading / Godot address reuse crash.
-   e28d324: **Types:** Codegen + type checking for animations.
-   e28d324: **Feature:** `CameraFeed` types.
-   abce9e2: **Types/Fix:** Codegen now types more `GArray`/`GDictionary` generic params based on exported variable hint strings.

    Additionally, fixed some codegen for enums when camel-case bindings are enabled.

-   e28d324: **Feature:** Support async module loader in quickjs.impl.
-   ea214c4: fix: null handling in GArray/GDictionary create() helpers
-   cffe0d8: **Feature:** Use TypeScript 5.9.2 (latest) by default
-   a883172: **Feature:** Godot 4.5 support
-   5bc325e: **Types:** "Generate Godot d.ts" in the UI is now "Generate types" and in addition to
    generating all Godot and project types (which it already did), the
    autogen directory will now be wiped of all files/directories before
    commencing generation. This ensures old generated files no longer
    pollute the project.
-   6e96120: **Fix:** Duplicate PackedByteArray to_array_buffer() registration
-   4bb388b: **Fix:** Added missing `PROPERTY_USAGE_SCRIPT_VARIABLE` flag on exported variables.
-   94ac86d: **Types:** `NodePathMap` now permits `undefined`/optional children.
-   e28d324: **Feature/Types:** Types + codegen for project input actions.
-   555acc6: **Types:** `EditorUndoRedoManager` API types
-   c82dfac: **Types**: Ensure the GAny union type includes null
-   1341389: **Fix:** Critical bug fixes (for crashes) that may occur due to the
    current isolate not being set.
-   e28d324: **Feature:** `GDictionary`/`GArray` recursive handling and `toJSON()`/`toString()`

    `GArrayProxy` (now a named type) will now JSON encode like a regular
    JS array i.e. `[1,2,3]` instead of `{"0": 1, "1": 2, "2": 3}`.

    We previously ensured that values accessed via a proxy were
    themselves proxied. Thus allowing access to nested properties
    via chained access e.g. dict_proxy.a.b. However, when setting or
    inserting a proxy-wrapped value, we previously inserted the proxy
    itself, rather than the wrapped target. This has now been rectified,
    it's not safe to do something like:

    ```ts
    const a = new GDictionary().proxy();
    a.b = new Dictionary().proxy();
    ```

    The above will result in a `GDictionary` containing a `b`
    property that is an empty `GDictionary`.

-   9ebe4f6: **Fix:** TStringNameCache v8::String reference loss

    https://github.com/godotjs/GodotJS/issues/110

-   15d1e25: fix: issue with `node_module` resolving
-   dcb33db: fix: Non-V8 Godot object construction
-   b207444: **Feature:** Native object now guaranteed bound during JS initializaation.

    Previously, when a JS class was being instantiated for an existing
    native Godot object (e.g. ResourceLoader.load('...')) the JS
    instance wasn't actually being bound to the native Godot object
    until _after_ the JS instance was constructed/initialized. This
    created a problem in which field/property initializers and the
    constructor were unable to call any native functions, but could
    call JS functions.

    Now, the Godot object is always bound to our instantiated object
    as part of our Godot native class constructor. Thus, we can now
    safely call methods during initialization. Importantly, this also
    fixes TC39 Stage 3 decorator `@bind.signal()` support for fields.

-   64dbebc: fix: Background/async resource loading where scripts are present.

    Shadow script instance replacement was failing due to calling the
    wrong GodotJSScript::instance_create() overload. The overloads
    have been replaced with separate functions to mitigate future
    occurrences.

    Additionally, shadow script instance replacement was not properly
    handling user types, only built-ins. This broke in a subtle hard
    to debug fashion, whereby you received back a valid JS class
    instance for the expected Godot object, however its prototype
    chain was incomplete. The JS object was an instance of the base
    Godot native object rather than the script on the object.

-   1d85819: **Fix:** `JSWorker` transfer crash.
-   e28d324: **Feature:** Async module loader.
-   e0f44db: **Types:** Improved generated typings formatting.
-   70e28af: **Fix:** Ensure usercode triggered from `get('prop')`/`set('prop')` does not crash the process, JS runtime errors are caught and logged.
-   e28d324: **Fix:** `godot.lib.api` `instanceof` checks against proxied classes.
-   e94bbf0: **Fix:** Don't crash when a GodotJS class implementation's parent class does not match the attached node.

    Instead, we log an error and prevent the script from being instantiated.

-   5f96ffc: **Fix:** Enum codegen (and godot.lib.api iteration).
-   e28d324: **Performance:** Added LRU support for `StringNameCache`.
-   e28d324: **Types**: Refined `SceneTree` `GArray` return types.
-   937c6f6: **Fix:** Don't leak temporary default properties object
-   21dffd1: fix: Array counts props incorrectly typed as any
-   e28d324: **Feature:** Introduced settings to ensure dependencies are included in exported builds.

    -   "Referenced Node Modules" can be enabled to package an _entire_ node module when any file belonging to that module is referenced.
    -   "Include directories" is another setting that allows you to explicitly add additional directories you want included in your exported builds.

-   e28d324: **Feature:** Godot 4.4 support.
-   102806b: fix: Ensure setTimeout correctly handles negative delays
-   88c3060: fix: Improved node_modules handling during game exports.
-   e28d324: **Fix:** Improved TypeScript class matching regex.

    It was failing in the presence of generics which contain an `extends`
    clause e.g.

    ```ts
    export default class GameNode<Map extends Record<string, Node> = {}> extends Node3D<Map>
    ```

    The regex will now look for the last `extends` on the line in order
    to detect the base class. This is only an improvement, it's not
    fool-proof and will fail if the base class has a generic that
    contains a conditional type expression. Since we only have access
    to PCRE2, this is probably the best we can do with just regex.

-   d70a467: **Fix:** Another missing `Isolate::Scope` that could lead to a runtime crash.
-   17f7731: fix: .ts/.js files not included in game export

    Exporting GodotJS games was fundamentally broken by
    a Godot engine change which altered the way .skip()
    behaved on exported files. Basically, we were skipping
    .ts files because we don't want them in the export,
    only .js files which we added as extra files. However,
    the change to skip's behavior meant extra files are
    also skipped. Instead .ts files are now remapped to
    the .js file, not skipped. The result is as
    previously intended i.e. only .js files ship.

-   e28d324: **Fix/Types:** Ensure that codegen quotes property keys when necessary.
-   e28d324: **Feature:** Support for importing `.json` files.
-   a4bafef: **Feature:** New decorator syntax for exporting properties.

    TC39 (JavaScript standard body) have progressed a new decorator
    syntax to Stage 3, and TypeScript 5.0 implemented support. The new
    syntax is not quite as flexible but is type-safe and will be
    more performant when implemented directly in JS engines.
    Consequently, all existing decorators have deprecated (but
    remain for backwards compatibility). In their place a new API,
    `createClassBinder`, has been introduced.

    Our default `tsconfig.json` has been updated to turn off legacy
    decorators, unlocking access to the newer syntax. You cannot use
    both at once. Both sets of decorators contain warnings if used
    with in incompatible tsconfig.

    The new decorator syntax looks something like:

    ```
    const bind = createClassBinder();

    @bind()
    @bind.tool()
    export default class Player extends CharacterBody2D {
      @bind.export.cache()
      @bind.export.object(SceneSynchronizer)
      accessor synchronizer!: SceneSynchronizer;

      @bind.export.cache()
      @bind.export(Variant.Type.TypeInt)
      accessor walkSpeed: number = 350;

      @bind.export.cache()
      @bind.export(Variant.Type.TypeInt)
      accessor dashSpeed: number = 1000;

      @bind.export(Variant.Type.TypeInt)
      accessor dashCooldownMs: number = 500;

      @bind.export.enum(Direction)
      accessor facing = Direction.Down;

      @bind.export(Variant.Type.TypeInt)
      accessor useCooldownMs: number = 500;
    }
    ```

    A few key points:

    1. You must create a ClassBinder using createClassBinder().
       This is a function and contains properties/APIs on it.
       You can use any variable name, but the convention I'll be
       using going forward is to use a variable named `bind`.
    2. The decorator APIs are all functions that return a decorator
       i.e. It's `@bind()` and `@bind.export.cache()` not `@bind`
       or `@bind.export.cache`.
    3. We're using JavaScript's new/upcoming auto-accessor syntax.
       This is not a requirement for all decorators, but not all
       decorators (e.g., the new cache() decorator) are supported
       on fields.
    4. The new cache decorator enables caching of variants on the
       Godot side of the JS <-> Godot bridge.
       The decorator generates a `set` accessor that updates the cache
       automatically whenever a value is assigned to the JS property.
       The purpose of the cache is that is provides a fairly sizeable
       performance improvement when using Godot's general purpose
       .get("property_name") method. This is particularly useful if
       you want to expose data to performance sensitive GDExtensions.
    5. The order of decorators matters!
       Decorators are evaluated "inside->out" and class decorators are
       evaluated after all property decorators. `bind()` MUST be
       executed AFTER all other decorators. The `@bind.export.cache()`
       decorator MUST be evaluated AFTER the property export.

-   e28d324: **Fix:** Always use thread-safe variant pool allocator.
-   01895d4: **Types:** Added types for `Node` direct child APIs:

    -   add_child
    -   get_child
    -   get_children
    -   move_child
    -   remove_child

-   e28d324: **Feature:** Module resolution now supports modules that utilize `exports` in their `package.json`.
-   e28d324: **Fix:** Do not instantiate `GodotJSMonitor` if the JS runtime does not support `Performance`.
-   6399703: **Fix/Types:** Don't allow codegen failures to output malformed types.
-   e28d324: **Feature:** Added settings to optionally generate `.d.ts` files for Godot scene files in the Editor.
-   e28d324: fix: exported properties no longer leak into the base class.
    feat: inherited properties now class categorized in the Editor.

    Previously sub-classes were reusing the same [[ClassProperties]]
    and [[ClassSignals]] as super classes. Thus sub-classes were
    exporting properties against super-classes. This also meant that
    classes with a shared parent were receiving each others'
    properties. Each class no longer looks up the prototype chain
    for these objects.

    Consequently, to ensure properties are exported and appear in the
    Editor, we now recurse in a similar fashion to GDScript.
    Fortunately, we don't need to worry about the cycle detection
    logic that GDScript implements, since TypeScript handles this for
    us and cycles won't compile. Added benefit is now that properties
    appear in the editor categorized appropriately by class.

-   4d24683: **Types:** GDictionary keys() return type
-   d24b974: **Types:** ResolveNodePathMap utility type.

    This type makes it easier to dynamically define your own `NodePathMap` types derived from generated SceneNodes.

    It's also useful for creating Node scripts that don't live at the top level of a scene e.g.

    ```ts
    export default class Table extends Node3D<ResolveNodePathMap<SceneNodes["scenes/example/table.tscn"], "Table">> {
        // ...
    }
    ```

    The above assumes a `Table` node exists as a child of the root in scenes/example/table.tscn. Now
    `this.get_node`/`this.getNode` will auto-complete (and provided types for) children of `Table`.

-   8e3bc27: **Fix:** Variant constructor failure on first bound Variant class.
-   3fa1679: fix: resolving `.mjs` file extension
-   e28d324: **Fix:** `@export_dictionary` decorator.
-   1675f15: **Fix:** Don't crash when script binding fails.
-   e28d324: **Fix:** NIL is now permitted as convertible to any other variant types.
-   be2c73c: **Types:** `UserTypeDescriptor` `resource` property is now type-safe and will auto-complete, accepting `Script` resources.
-   b96f13a: **Fix:** Ensure resource types are (re)generated when a scene saves
-   59abb7f: **Types:** Dynamic dispatch methods (e.g.,`call_deferred`) are now typesafe.

    Typing these methods was not nearly as straight-forward as I would
    have liked. There's also a small usage gotcha due to method
    parameters being bivariant in TypeScript. Even with strict function
    types enabled, contravariant parameter enforcement only applies
    when comparing the variance of non-method functions. This might be
    a bit theoretical, so I'll demonstrate with an example.

    ```ts
    class Sound {
        play() {
            console.log("Ba-ding!");
        }
    }

    class Moo extends Sound {
        moo() {
            console.log("Moo!");
        }
    }

    class Animal {
        vocalize(sound: Sound) {
            sound.play();
        }
    }

    class Cow extends Animal {
        override vocalize(moo: Moo) {
            moo.moo();
        }
    }

    function vocalize(animal: Animal, sound: Sound) {
        animal.vocalize(sound);
    }

    vocalize(new Cow(), new Sound());
    ```

    The above is perfectly valid in TypeScript, no type errors, but
    will crash at runtime. The issue is TypeScript allows us to
    override vocalize() and take a covariant (subtype) parameter. So,
    we proceed to call moo() on what the implementation believes is
    a Moo, but we end up receiving a Sound instead. This obviously
    isn't ideal, and the TypeScript language developers are well aware
    of the situation, but at present this behavior is required to
    support structural type checking on generics, and to handle some
    DOM type weirdness.

    Now if we add:

    ```ts
    function callLater<T, S extends keyof T>(
        delayMs: number,
        target: T,
        methodName: S,
        ...args: T[S] extends (...args: any[]) => any ? Parameters<T[S]> : never
    ) {
        setTimeout(() => (target[methodName] as (...args: any[]) => any)(...args), delayMs);
    }

    class Animal {
        vocalize(sound: Sound) {
            sound.play();
        }

        vocalizeLater(sound: Sound) {
            callLater(1000, this, "vocalize", sound); // Error on this line
        }
    }
    ```

    This gives the error:

    > Argument of type '[Sound]' is not assignable to parameter of type 'this["vocalize"] extends (...args: any[]) => any ? Parameters<this["vocalize"]> : never'.(2345)

    Basically, `this` is NOT the same as `Animal`, it's a polymorphic
    type. Due to the use of `this` the type checker is unable to
    validate that `[Sound]` is the correct parameter types tuple. This
    occurs BECAUSE the parameter types are bivariant, the parameter
    types can be (and in this example are) more restrictive than those
    declared in the `Animal` type.

    Now, this poses an interesting problem for Godot's call_deferred
    (and similar) APIs. Because it's quite common to want to do:

    ```ts
    this.callDeferred("remove_child", someChild);
    ```

    Which leads to a similar error with `removeChild` parameters not
    being known for the `this` type. The solution is to introduce a
    cast to the same type (or a parent type):

    ```ts
    (this as Node).callDeferred("remove_child", someChild);
    ```

    This works around the issue. Of course, this _technically_ isn't
    type-safe if a sub-class was to override `removeChild` similarly
    to our `vocalize` example above. The cast is basically telling
    the typechecker, "Go away. I know what I'm doing. Probably."

    Now that I've explained the usage gotcha, I'll touch on some
    technical details of the implementation.

    Using our example above, if you were to try pull `callLater` into
    the `Animal` class, drop the `T` generic parameter and replace its
    usages with the type `this`. When you try use the method you'll
    run into the dreaded:

    > Type instantiation is excessively deep and possibly infinite.

    This occurs because `callLater` attempts to handle parameters for
    all functions on the `Animal` class. But one of those functions
    is `callLater`. So the parameters for a call to callLater are
    potentially the parameters for another callLater... you see where
    this is going.

    The solution is basically to explicitly prevent recursion through
    `callLater`. Easy enough for this one example. But Godot has
    several dynamic dispatch methods, they all need to be excluded,
    not just the function itself, because you could chain calls back
    and forth between them.

    So, this is where the new 'godot' module interface comes in:

    ```ts
    /**
     * Godot has many APIs that are a form of dynamic dispatch, i.e., they take the name of a function or property and
     * then operate on the value matching the name. TypeScript is powerful enough to allow us to type these APIs.
     * However, since these APIs can be used to call each other, the type checker can get hung up trying to infinitely
     * recurse on these types. What follows is an interface with the built-in dynamic dispatch names. GodotJS' types
     * will not recurse through methods matching these names. If you want to build your own dynamic dispatch APIs, you
     * can use interface merging to insert additional method names.
     */
    interface GodotDynamicDispatchNames {
        call: "call";
        callv: "callv";
        call_deferred: "call_deferred";
        add_do_method: "add_do_method";
        add_undo_method: "add_undo_method";
    }
    ```

    An interface isn't actually the most obvious way to define the
    exclusions, a union would be simpler. However, if you were to add
    your own dynamic dispatch type method in a sub-class, GodotJS
    types will need to avoid recursing through it too. So you can use
    interface merging to add to the set.

    There's actually a bit more complexity than just calls to those
    methods. Because TS type checking is structural, without the above
    you hit up against infinite recursion simply by virtue of the
    methods existing on the type, even if you're not calling them.

-   e28d324: **Types:** Godot/GDScript best effort typing for nullability of Object types.

    Although they're technically nullable everywhere (Ref<> in C++),
    many APIs won't ever return to `null`. Unfortunately, properties do
    not have flags to tell us this, so we are making best effort guesses
    as follows:

    -   Getters/setters are nullable.
    -   Function return types are nullable, unless the function name
        starts with `"create"`.
    -   Function arguments are non-nullable.

    This seems to be a reasonable starting point, and we will continue to manually tweak
    types from here.

-   e28d324: **Fix:** Support for script instantiation from a ResourceLoader executing on another thread.
-   26590b4: fix: exported property hint_string regression w/ camel-case bindings

    This was causing enums, ranges etc. to display incorrectly in the Godot Editor.

-   a89e27c: fix: non-V8 increased value stack (hard limit) size
-   f341cda: **Fix/Types:** Ensure GDScript singleton class accessors/modifiers are `static`.

    Fixes https://github.com/godotjs/GodotJS/issues/99

-   e28d324: **Fix:** Adhere to typical JS semantics and use default arg when undefined is passed (not just when the parameter is omitted).
-   e28d324: **Feature:** Added `@export_object` shorthand decorator for exporting objects.
-   e28d324: **Feature:** Ensure string representation of Godot objects include the script class name.
-   eedd327: fix: setTimeout/setInterval invocation crash
-   3d66a57: **Types:** Improved support for statically typed optional nodes.
-   d7353ab: **Feature:** Worker postMessage support for structured clone and transfer.

    This enables bi-directional transfer of all Godot types between
    workers and the host environment. The structured clone algorithm
    uses referential equality of Variant rather than structural
    equality. This both gives us a performance boost and also ensures
    that if the same Variant is referred to in nested structures,
    upon deserialization, these relationships will remain intact.

    `JSWorkerParent.transfer()` is now deprecated since `postMessage` can
    achieve the same and more.

    As before, this is still a v8 only feature. I would say this makes
    workers somewhat LESS experimental, but not yet stable.

-   eabb12a: **Feature:** `GArray` tuple support.

    For example, with the type `GArray<[number, string]>` `.get(0)` will return a `number` and `.get(1)` will return a `string`.

-   ed2e47f: fix: non-V8 JS object -> Godot type conversion
-   e28d324: **Types:** Codegen — treat Signal args as output types, not input types.
-   47904ff: **Types:** `get_tree()`/`getTree()` no longer types as returning `null`.

    Although it _will_ return `null` when not inside a tree. This is a runtime error, with an error message
    being logged i.e., you should not ever call this function expecting a `null` result.

-   e28d324: **Fix:** TypeLoader `post_bind` now supports reentrancy.
-   e28d324: **Feature/Types:** Codegen/types for resources in your project i.e., `ResourceLoader.load("res://whatever")` is now strongly typed depending on the file path.
-   e28d324: **Feature:** API to access `GDictionary`/`GArray` like JS objects/arrays (`.proxy()`) and
    improved type definitions for `GDictionary` and `GArray`.
-   63dc143: **Fix:** Make Variant constants (e.g., `Vector3.ZERO`) Readonly<> so they can't (easily) be accidentally mutated.

## 1.0.0

### Major Changes

-   Implement a [_Monitor_](https://github.com/godotjs/GodotJS/wiki/Statistics) of the runtime statistics of a running project
-   Implement _console.time/console.timeEnd_
-   Refactor [_Worker_](https://github.com/godotjs/GodotJS/wiki/Worker) to support _Godot Object_ transfer

### Minor Changes

-   Add _worker.onready_ callback
-   Add threading support for _InstanceBindingCallback_
-   Improve multi-threading support for _IConsoleOutput_
-   Refactor _GodotJSScript_ to support loading in _Worker_
-   Add a setting entry for _Exporter_ to manually include source files
-   More strict type check for native object bindings
-   _TypeConvert_ returns _true_ and _nullptr_ for dead object pointers
-   Ignore _Thread_ class in d.ts codegen

### Patch Changes

-   Fix a godot profiler crash on _GodotJSScriptLanguage::profiling*get*_
-   Fix a possible crash in _Worker::finish()_
-   Fix an access violation issue in _Worker_

## 0.9.9

### Minor Changes

-   Add prebuilt libs of lws/v8 for Windows/Linux on ARM64
-   Add support for hooking godot typeloader
-   Add support for JavaScriptCore

### Patch Changes

-   Minor bugfix

## 0.9.8

### Patch Changes

-   Fix a crash issue in `jsb::Buffer` destructor when using _quickjs-ng_ as runtime
-   Support for pure JavaScript projects (still with typings)
-   Refactor annotations and helper functions in `jsb.core`

### Breaking Changes

-   All annotations are moved into `godot.annotations` module (from `jsb.core`).
-   `GLOBAL_GET` and `EDITOR_GET` are moved into `godot` module (from `jsb.core`).
-   `callable()` is removed from `jsb.core`, use `Callable.create` in `godot` module instead.
-   `to_array_buffer()` is removed from `jsb.core`, use `PackedByteArray.to_array_buffer()` instead.
-   `$wait` is removed from `jsb.core`, use `SignalN<...>.as_promise()` instead.

> [!NOTE]
> Regenerating `.d.ts` files in your project will help you a lot to fix most errors caused by the breaking changes below.
> _VSCode_ (or `tsc`) will report all relevant changes as errors.
> Old annotations still work temporarily in this version but will be removed in a future version. Please update your codes.
