---
"@godot-js/editor": patch
---

**Feature:** Ergonomics overhaul. Camel-case, TS types, codegen + more.

- There's now a project setting which can be toggled to swap to a
  more idiomatic JS naming scheme for Godot bindings. We use
  camel and pascal case to more closely align with typical
  JavaScript/TypeScript conventions. For `@Decorators` we've gone
  with pascal case, which is used in libraries like Angular. Camel
  case is perhaps more popular, but pascal case allows us to avoid
  reserved names, and thus we can cleanly write `@Export`, instead of
  needing to include the trailing underscore on `@export_`.

- TypeScript types have been improved. Particularly `Signal<>` and
  `Callable<>`. `Signal1`, `Signal2`, etc. are now deprecated, as are
  `AnySignal` and `AnyCallable`, since the new `Signal<T>` and `Callable<T>`
  types handle an arbitrary number of parameters. Importantly,
  `Callable.bind(...)` is now accurately typed, so you'll receive
  type errors when connecting to signals.

- `GArray` and `GDictionary` now have a static `.create<T>()` method
  which allows you to create nested data structures from literals
  and benefit from full type checking. When a `GArray` or `GDictionary`
  is expected as a property, a `.proxy()` can be provided in its
  place.

- Partially worked around https://github.com/microsoft/TypeScript/issues/43826
  whereby our proxied `GArray` and `GDictionary` always return proxied
  nested values, but will accept non-proxied values when mutating
  a property. Basically, there's now `GArrayReadProxy` and
  `GDictionaryReadProxy`. These aren't runtime types, they're just
  TS types that make it easier to work with proxies. Under normal
  circumstances, you likely won't need to know these types exist.

- Codegen leveled up. Any TS module can now export a function
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
  export const codegen: CodeGenHandler = rawRequest => {
    const request = rawRequest.proxy();

    switch (request.type) {
      case CodeGenType.ScriptNodeTypeDescriptor: {
        const cardNodeScript = request.node.get('cardNodeScript');
        return GDictionary.create<UserTypeDescriptor>({
          type: DescriptorType.User,
          name: 'CardCollection',
          resource: 'res://src/card-collection.ts',
          arguments: GArray.create<TypeDescriptor>([
            GDictionary.create<UserTypeDescriptor>({
              type: DescriptorType.User,
              name: cardNodeScript?.getGlobalName() ?? 'CardNode',
              resource: cardNodeScript?.resourcePath ?? 'res://src/card-node.ts',
            }),
          ]),
        });
      }
    }

    return undefined;
  };
  ```

  Above we handle the codegen request to determine the node type
  of the provided `request.node`. What's *really* neat here is we
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

- There's also a bunch of logging/error reporting improvements.
