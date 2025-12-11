import { Node, PackedScene, ResourceLoader } from "godot";

export default class Start extends Node {
    async _ready() {
        const scenes = [
            "res://tests/resource/Resource.tscn",
            "res://tests/singleton/Singleton.tscn",
            "res://tests/extend/Extend.tscn",
            "res://tests/papaparse/Papaparse.tscn",
        ];

        for (const scene of scenes) {
            console.log("Loading scene", scene);

            const loadedScene: PackedScene = <PackedScene>ResourceLoader.load(scene);
            const sceneAsNode = loadedScene.instantiate();

            this.get_tree().root?.call_deferred("add_child", sceneAsNode);
            await new Promise((resolve) => setTimeout(resolve, 100));
            this.get_tree().root?.call_deferred("remove_child", sceneAsNode);
        }

        this.get_tree().quit();
    }
}
