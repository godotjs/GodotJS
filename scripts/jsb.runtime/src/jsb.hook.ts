
/**
 * @param type the loaded type or function in godot module
 * @returns the return value will be used as the actually loaded type in godot module, simply return the `type` in most situations.
 */
export type GodotTypeLoadedCallback = (type: any) => any;

const typeload_callbacks = new Map<string, Array<GodotTypeLoadedCallback>>();

// callback on a godot type loaded by jsb_godot_module_loader.
// each callback will be called only once.
export function on_godot_type_loaded(type_name: string, callback: GodotTypeLoadedCallback) {
    if (!typeload_callbacks.has(type_name)) {
        typeload_callbacks.set(type_name, [ callback]);
    } else {
        typeload_callbacks.get(type_name)!.push(callback);
    }
}

// hide it in d.ts
// callback on a godot type loaded by jsb_godot_module_loader
exports._godot_type_loaded = function (type_name: string, type: any) {
    let list = typeload_callbacks.get(type_name);
    if (list !== undefined) {
        typeload_callbacks.delete(type_name);
        for (let cb of list) {
            const rval = cb(type);
            if (typeof rval !== "undefined") {
                type = rval;
            }
        }
    }
    return type;
}
