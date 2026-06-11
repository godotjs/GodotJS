import { FileAccess, Node } from "godot";
import { beginAsyncTest, endAsyncTest, reportTestFailure } from "../test-status";

declare function require(id: string): any;

const jsb = require("godot-jsb") as { internal: { scan_external_changes: () => void } };

const TARGET_PATH = "res://tests/reload/target.js";

async function runReloadTest(): Promise<void> {
    const reader = FileAccess.open(TARGET_PATH, FileAccess.ModeFlags.READ);
    if (!reader) throw new Error("failed to open target.js for read");
    const original = reader.get_as_text();
    reader.close();

    try {
        const initial = require("./target");
        const initialValue = initial.getValue();
        if (initialValue !== 1) {
            throw new Error(`expected initial value 1, got ${initialValue}`);
        }

        // FileAccess::get_modified_time is 1-second-granular on most platforms;
        // wait so mark_as_reloading() sees a distinct mtime on the second write.
        await new Promise<void>((resolve) => setTimeout(resolve, 1100));

        const writer = FileAccess.open(TARGET_PATH, FileAccess.ModeFlags.WRITE);
        if (!writer) throw new Error("failed to open target.js for write");
        writer.store_string("module.exports = { getValue: () => 2 };\n");
        writer.close();

        const t0 = Date.now();
        jsb.internal.scan_external_changes();
        const reloaded = require("./target");
        const elapsed = Date.now() - t0;

        const newValue = reloaded.getValue();
        if (newValue !== 2) {
            throw new Error(`expected reloaded value 2, got ${newValue}`);
        }
        console.log(`TestReload: module hot reload OK (${elapsed}ms)`);
    } finally {
        const restorer = FileAccess.open(TARGET_PATH, FileAccess.ModeFlags.WRITE);
        if (restorer) {
            restorer.store_string(original);
            restorer.close();
        }
    }
}

export default class TestReload extends Node {
    _ready(): void {
        beginAsyncTest();
        runReloadTest()
            .catch((error) => reportTestFailure("reload", error))
            .finally(() => endAsyncTest());
    }
}
