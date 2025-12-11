import { Resource, Variant } from "godot";
import { createClassBinder } from "godot.annotations";

const bind = createClassBinder();

@bind()
export default class PlayerResource extends Resource {
    @bind.export(Variant.Type.TYPE_INT)
    accessor health: number = 0;

    @bind.export(Variant.Type.TYPE_INT)
    accessor attack: number = 0;

    log() {
        console.log("health:", this.health, "attack", this.attack);
    }
}
