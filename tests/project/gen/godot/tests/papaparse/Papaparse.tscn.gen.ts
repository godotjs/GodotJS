import TestPapaparse from "../../../../tests/papaparse/test-papaparse";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/papaparse/Papaparse.tscn": PackedScene<TestPapaparse>;
    }
}
