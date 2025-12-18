import { Label, Node, Signal, Variant } from "godot";
import { createClassBinder } from "godot.annotations";

const bind = createClassBinder();

enum MyColor {
    White,
    Black,
    Red,
    Blue,
    Green,
}

enum MyTags {
    None = 0,
    Cold = 1,
    Hot = 2,
    Soft = 4,
    Hard = 8,
    Opaque = 16,
}

@bind()
@bind.icon("res://assets/icon.svg")
@bind.help("Just a test!")
export default class Annotations extends Node {
    @bind.onready("Label")
    ready_node!: Label;

    @bind.help("Just a test xxx!")
    @bind.export.flags(MyTags)
    accessor tags: MyTags = MyTags.None;

    @bind.export.enum(MyColor)
    accessor color: MyColor = MyColor.White;

    @bind.export(Variant.Type.TYPE_STRING)
    accessor hello = "hello";

    @bind.export.multiline()
    accessor ml_text = "hello\nworld";

    @bind.export(Variant.Type.TYPE_INT)
    accessor int_value = 0;

    @bind.export.range(0, 100, 0.1)
    accessor float_range = 0;

    @bind.export.range_int(0, 100, 1)
    accessor int_range = 0;

    @bind.export.range_int(0, 100, 1, "suffix:px")
    accessor px_range = 0;

    @bind.export.file("*.svg")
    accessor svg_path = "";

    @bind.export.global_file("*.txt")
    accessor global_txt_path = "";

    @bind.export.exp_easing("positive_only")
    accessor ev_val = 0;

    @bind.signal()
    @bind.help("Just a test!")
    accessor test_signal!: Signal<() => void>;

    @bind.experimental("Alternative to [method Annotations.doNewStuff].")
    public doNewStuff() {
        // ...
    }

    doStuff() {
        // ...
    }

    @bind.deprecated("Use [method Annotations.doNewStuff] instead.")
    doOldStuff() {
        // ...
    }

    _ready() {
        console.log("onready works:", this.ready_node.text);
        console.assert(this.ready_node.text === "Annotations");
    }
}
