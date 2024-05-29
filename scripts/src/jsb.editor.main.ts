// entry point (editor only)
import { PackedStringArray } from "godot";

export function auto_complete(pattern: string): PackedStringArray {
    let results = new PackedStringArray();
    if (typeof pattern !== "string") {
        return results;
    }
    
    let scope: any = null;
    let head = '';
    let index = pattern.lastIndexOf('.');
    let left = '';
    if (index >= 0) {
        left = pattern.substring(0, index + 1);
        try {
            scope = eval(pattern.substring(0, index));
        } catch (e) {
            return results;
        }
        pattern = pattern.substring(index + 1);
    } else {
        scope = globalThis;
    }

    for (let k in scope) {
        if (k.indexOf(pattern) == 0) {
            results.append(head + left + k);
        }
    }
    return results;
}
