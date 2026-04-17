import { Node, PackedScene, ResourceLoader } from "godot";
import {
	getActiveAsyncTestCount,
	hasActiveAsyncTests,
	hasTestFailure,
	reportTestCompleted,
	reportTestFailure,
} from "./test-status";

const SCENE_SETTLE_DELAY_MS = 100;
const ASYNC_TEST_DRAIN_TIMEOUT_MS = 20000;
const ASYNC_TEST_DRAIN_POLL_MS = 10;

export default class Start extends Node {
    async _ready() {
        try {
            const scenes = [
                "res://tests/resource/Resource.tscn",
                "res://tests/singleton/Singleton.tscn",
                "res://tests/extend/Extend.tscn",
                "res://tests/papaparse/Papaparse.tscn",
                "res://tests/os-executor/OSExecutor.tscn",
                "res://tests/worker/Worker.tscn",
            ];

            for (const scene of scenes) {
                if (hasTestFailure()) {
                    break;
                }
                console.log("Loading scene", scene);

                const loadedScene = ResourceLoader.load(scene);
                if (!(loadedScene instanceof PackedScene)) {
                    throw new Error(`failed to load PackedScene: ${scene}`);
                }
                const sceneAsNode = loadedScene.instantiate();

                this.get_tree().root?.call_deferred("add_child", sceneAsNode);
                await new Promise((resolve) => setTimeout(resolve, SCENE_SETTLE_DELAY_MS));
                this.get_tree().root?.call_deferred("remove_child", sceneAsNode);
            }

            const asyncDrainStartedAt = Date.now();
			while (hasActiveAsyncTests() && !hasTestFailure()) {
				const elapsedMs = Date.now() - asyncDrainStartedAt;
				if (elapsedMs > ASYNC_TEST_DRAIN_TIMEOUT_MS) {
					throw new Error(
						`async tests did not drain before completion timeout (remaining=${String(getActiveAsyncTestCount())}, timeoutMs=${String(ASYNC_TEST_DRAIN_TIMEOUT_MS)})`
					);
				}
				await new Promise((resolve) => setTimeout(resolve, ASYNC_TEST_DRAIN_POLL_MS));
			}

            reportTestCompleted();
        } catch (error) {
            reportTestFailure("start", error);
        } finally {
            this.get_tree().quit();
        }
    }
}
