import TestWorker from "../../../../tests/worker/test-worker";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/worker/Worker.tscn": PackedScene<TestWorker>;
    }
}
