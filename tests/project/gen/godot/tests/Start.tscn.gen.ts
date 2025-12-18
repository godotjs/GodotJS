import Start from "../../../tests/start";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/Start.tscn": PackedScene<Start>;
    }
}
