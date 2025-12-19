// meta-description: Classic movement for gravity games (platformer, ...)

import { _BASE_, ProjectSettings, Input, move_toward, Variant, Vector2 } from "godot";
import { createClassBinder } from "godot.annotations";

const jump_velocity = -400;

// Get the gravity from the project settings to be synced with RigidBody nodes.
const gravity = ProjectSettings.get_setting("physics/2d/default_gravity");

const bind = createClassBinder();

@bind()
export default class _CLASS_ extends _BASE_ {
    @bind.export(Variant.Type.TYPE_FLOAT)
    accessor speed = 300;

    _physics_process(delta): void {
        let velocity = this.velocity;

        // Add the gravity.
        if (!this.is_on_floor()) {
            velocity.y += gravity * delta;
        }

        // Handle Jump.
        if (Input.is_action_just_pressed("ui_accept") && this.is_on_floor()) {
            velocity.y = jump_velocity;
        }

        // Get the input direction and handle the movement/deceleration.
        // As good practice, you should replace UI actions with custom gameplay actions.
        let direction = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down");
        if (Vector2.EQUAL(direction, Vector2.ZERO)) {
            velocity.x = direction.x * this.speed;
        } else {
            velocity.x = move_toward(this.velocity.x, 0, this.speed);
        }

        this.velocity = velocity;
        this.move_and_slide();
    }
}
