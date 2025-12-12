import { Node } from "godot";

export default class Child extends Node {
    _ready() {
        console.log("Child ready");
    }

    childFn() {
        return true;
    }
}
