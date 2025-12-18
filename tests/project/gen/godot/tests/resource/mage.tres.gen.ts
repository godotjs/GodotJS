import PlayerResource from "../../../../tests/resource/player-resource";
declare module "godot" {
    interface ResourceTypes {
        "res://tests/resource/mage.tres": PlayerResource;
    }
}
