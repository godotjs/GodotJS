import TestOsExecutor from "../../../../tests/os-executor/test-os-executor";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/os-executor/OSExecutor.tscn": PackedScene<TestOsExecutor>;
    }
}
