import { Node, Variant } from "godot";
import { createClassBinder } from "godot.annotations";
import PlayerResource from "./player-resource";
const bind = createClassBinder();

@bind()
export default class TestResource extends Node {
    @bind.export(Variant.Type.TYPE_OBJECT)
    accessor warrior!: PlayerResource;

    @bind.export(Variant.Type.TYPE_OBJECT)
    accessor mage!: PlayerResource;

    _ready() {
        console.log("Warrior stats:")
        this.warrior.log();
        console.assert(this.warrior.health === 10)
        console.assert(this.warrior.attack === 3)
        console.log("Mage stats:")
        this.mage.log();
        console.assert(this.mage.health === 5)
        console.assert(this.mage.attack === 5)
    }
}
