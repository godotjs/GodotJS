import TestResource from "../../../../tests/resource/test-resource";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/resource/Resource.tscn": PackedScene<TestResource>;
    }
}
