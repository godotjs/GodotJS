#ifndef DEF
#define DEF(x)
#endif

// ONLY FREQUENTLY USED NAMES SHOULD BE LISTED HERE

// name to name
DEF(prototype)
DEF(__proto__)
DEF(constructor)
DEF(value)
DEF(id)
DEF(path)
DEF(exports)
DEF(filename)
DEF(loaded)
DEF(name)
DEF(main)
DEF(cache)
DEF(children)
DEF(type)
DEF(evaluator)
DEF(_notification)
DEF(Reflect)
DEF(construct)

// class names
DEF(Object)
DEF(Node)
DEF(Variant)

// special names
DEF(free)
DEF(hint)
DEF(hint_string)
DEF(usage)
DEF(class_)

DEF(deprecated)
DEF(experimental)
DEF(help)

// special identifier for the convenience to get Variant::Type in scripts
DEF(__builtin_type__)

// godot rpc config fields
DEF(rpc_mode)
DEF(call_local)
DEF(transfer_mode)
DEF(channel)

// keyword names
DEF(default)

// worker
DEF(JSWorker)
DEF(ontransfer)
DEF(onmessage)
DEF(onready)
DEF(onerror)
DEF(postMessage)
DEF(transfer)
DEF(close)

// editor
#ifdef TOOLS_ENABLED
DEF(arguments)
DEF(base)
DEF(codegen)
DEF(index)
DEF(node)
DEF(properties)
DEF(resource)
DEF(GodotJSScript)
#endif
