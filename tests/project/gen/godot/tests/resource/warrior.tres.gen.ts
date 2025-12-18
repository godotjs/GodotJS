import PlayerResource from "../../../../tests/resource/player-resource";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/resource/warrior.tres": PlayerResource;
    }
}
