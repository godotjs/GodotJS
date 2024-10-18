import { Node, Variant } from "godot"
import { tool, export_, help } from "jsb.core"

export function call_me() {
    return 123;
}

@tool()
@help("Just a test!")
export default class TestNode extends Node {

    @export_(Variant.Type.TYPE_STRING)
    hello = "hello";

    _process(delta: number): void {
    }
}
