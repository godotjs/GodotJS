---
"@godot-js/editor": patch
---

**Types:** Dynamic dispatch methods (e.g.,`call_deferred`) are now typesafe.

Typing these methods was not nearly as straight-forward as I would
have liked. There's also a small usage gotcha due to method
parameters being bivariant in TypeScript. Even with strict function
types enabled, contravariant parameter enforcement only applies
when comparing the variance of non-method functions. This might be
a bit theoretical, so I'll demonstrate with an example.

```ts
class Sound {
    play() {
        console.log('Ba-ding!');
    }
}

class Moo extends Sound {
    moo() {
        console.log('Moo!');
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
function callLater<T, S extends keyof T>(delayMs: number, target: T, methodName: S, ...args: T[S] extends (...args: any[]) => any ? Parameters<T[S]> : never) {
    setTimeout(() => (target[methodName] as (...args: any[]) => any)(...args), delayMs);
}

class Animal {
    vocalize(sound: Sound) {
        sound.play();
    }

    vocalizeLater(sound: Sound) {
        callLater(1000, this, 'vocalize', sound); // Error on this line
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
this.callDeferred('remove_child', someChild);
```

Which leads to a similar error with `removeChild` parameters not
being known for the `this` type. The solution is to introduce a
cast to the same type (or a parent type):

```ts
(this as Node).callDeferred('remove_child', someChild);
```

This works around the issue. Of course, this *technically* isn't
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
      call: 'call';
      callv: 'callv';
      call_deferred: 'call_deferred';
      add_do_method: 'add_do_method';
      add_undo_method: 'add_undo_method';
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
