import TestExtend from "../../../../tests/extend/test-extend";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/extend/Extend.tscn": PackedScene<TestExtend>;
    }
}
