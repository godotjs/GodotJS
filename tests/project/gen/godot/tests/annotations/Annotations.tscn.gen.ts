import Annotations from "../../../../tests/annotations/annotations";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/annotations/Annotations.tscn": PackedScene<Annotations>;
    }
}
