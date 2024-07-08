// meta-description: Classic movement for gravity games (platformer, ...)

import { _BASE_, ProjectSettings, Input, move_toward } from "godot";

const speed = 300;
const jump_velocity = -400;

// Get the gravity from the project settings to be synced with RigidBody nodes.
const gravity = <number> ProjectSettings.get_setting("physics/2d/default_gravity");

export default class _CLASS_ extends _BASE_ {
    _physics_process(delta: number): void {
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
            velocity.x = direction.x * speed;
        } else {
            velocity.x = move_toward(this.velocity.x, 0, speed);
        }

        this.velocity = velocity;
        this.move_and_slide();
    }
}
