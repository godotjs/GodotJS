/* THIS FILE IS GENERATED DO NOT EDIT */

#ifndef _CODE_TEMPLATES_H
#define _CODE_TEMPLATES_H

#include "core/object/object.h"
#include "core/object/script_language.h"

static const int TEMPLATES_ARRAY_SIZE = 3;

static const struct ScriptLanguage::ScriptTemplate TEMPLATES[3] = {
	{ String("CharacterBody2D"), String("Basic Movement"),  String("Classic movement for gravity games (platformer, ...)"),  String("import { _BASE_, ProjectSettings, Input, move_toward } from \"godot\";\n\nconst speed = 300;\nconst jump_velocity = -400;\n\n// Get the gravity from the project settings to be synced with RigidBody nodes.\nconst gravity = <number> ProjectSettings.get_setting(\"physics/2d/default_gravity\");\n\nexport default class _CLASS_ extends _BASE_ {\n_TS__physics_process(delta: number): void {\n_TS__TS_let velocity = this.velocity;\n\n_TS__TS_// Add the gravity.\n_TS__TS_if (!this.is_on_floor()) {\n_TS__TS__TS_velocity.y += gravity * delta;\n_TS__TS_}\n\n_TS__TS_// Handle Jump.\n_TS__TS_if (Input.is_action_just_pressed(\"ui_accept\") && this.is_on_floor()) {\n_TS__TS__TS_velocity.y = jump_velocity;\n_TS__TS_}\n\n_TS__TS_// Get the input direction and handle the movement/deceleration.\n_TS__TS_// As good practice, you should replace UI actions with custom gameplay actions.\n_TS__TS_let direction = Input.get_vector(\"ui_left\", \"ui_right\", \"ui_up\", \"ui_down\");\n_TS__TS_if (Vector2.EQUAL(direction, Vector2.ZERO)) {\n_TS__TS__TS_velocity.x = direction.x * speed;\n_TS__TS_} else {\n_TS__TS__TS_velocity.x = move_toward(this.velocity.x, 0, speed);\n_TS__TS_}\n\n_TS__TS_this.velocity = velocity;\n_TS__TS_this.move_and_slide();\n_TS_}\n}\n") },
	{ String("Node"), String("Default"),  String("Base template for Node with default Godot cycle methods"),  String("import { _BASE_ } from \"godot\";\nimport { onready } from \"jsb/jsb.core\";\n\n\nexport default class _CLASS_ extends _BASE_ {\n_TS_// Called when the node enters the scene tree for the first time.\n_TS__ready(): void {\n\n_TS_}\n\n_TS_// Called every frame. 'delta' is the elapsed time since the previous frame.\n_TS__process(delta: number): void {\n_TS_}\n}\n") },
	{ String("Object"), String("Empty"),  String("Empty template suitable for all Objects"),  String("import { _BASE_ } from \"godot\";\n\nexport default class _CLASS_ extends _BASE_ {\n}\n") },
};

#endif
