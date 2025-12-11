import TestSingleton from "../../../../tests/singleton/test-singleton";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/singleton/Singleton.tscn": PackedScene<TestSingleton>;
    }
}
