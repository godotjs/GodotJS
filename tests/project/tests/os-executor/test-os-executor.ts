import { GArray, Node, OS } from "godot";

export default class TestOsExecutor extends Node {
    _ready() {
        let output: GArray = GArray.create([]);
        const code = OS.execute("node", ["-v"], output);
        console.assert(code === 0);
        console.assert(output.proxy().toString().startsWith("v"));
        console.log(code, output.proxy());
    }
}
