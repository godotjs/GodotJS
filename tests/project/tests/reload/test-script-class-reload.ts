import { FileAccess, Node } from "godot";
import { beginAsyncTest, endAsyncTest, reportTestFailure } from "../test-status";

declare function require(id: string): any;

const jsb = require("godot-jsb") as { internal: { scan_external_changes: () => void } };

const SCRIPT_PATH = "res://tests/reload/script-class-target.js";
const BASE_PATH = "res://tests/reload/transitive-base.js";

function readFile(path: string): string {
    const reader = FileAccess.open(path, FileAccess.ModeFlags.READ);
    if (!reader) throw new Error(`failed to open ${path} for read`);
    const s = reader.get_as_text();
    reader.close();
    return s;
}

function writeFile(path: string, content: string): void {
    const writer = FileAccess.open(path, FileAccess.ModeFlags.WRITE);
    if (!writer) throw new Error(`failed to open ${path} for write`);
    writer.store_string(content);
    writer.close();
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Verifies the fix for the `Object.defineProperty(exports, "default", { configurable: false, ... })`
// trap: re-running a reloaded module that uses ES `export default` (or its CJS
// equivalent emitted by tsc/swc/esbuild) would throw "Cannot redefine property:
// default" on the second run; before the env-side `exports` reset, the engine
// swallowed the exception and the class identity (and prototype) stayed pinned
// at the pre-reload class.
async function runDirectScriptClassReloadTest(): Promise<void> {
    const original = readFile(SCRIPT_PATH);
    try {
        const before = require("./script-class-target");
        const beforeProto = before?.default?.prototype;
        if (typeof beforeProto?.getValue !== "function") {
            throw new Error("baseline: getValue() not found on prototype");
        }

        // FileAccess::get_modified_time is 1-second-granular on most platforms.
        await sleep(1100);
        const mutated = original
            .replace("return 1;", "return 2;\n    }\n    getSentinel() { return \"hot-reload-ok\"; ");
        if (mutated === original) throw new Error("mutation produced no diff");
        writeFile(SCRIPT_PATH, mutated);

        jsb.internal.scan_external_changes();

        const after = require("./script-class-target");
        const afterProto = after?.default?.prototype;
        if (typeof afterProto?.getSentinel !== "function") {
            throw new Error(
                "post-reload: new getSentinel() method missing from prototype — exports.default did not pick up the reloaded class (likely the defineProperty trap)",
            );
        }
        const sentinelValue = afterProto.getSentinel.call(null);
        if (sentinelValue !== "hot-reload-ok") {
            throw new Error(`post-reload: getSentinel() returned ${JSON.stringify(sentinelValue)} (expected "hot-reload-ok")`);
        }
        console.log("TestScriptClassReload: direct-reload OK");
    } finally {
        writeFile(SCRIPT_PATH, original);
        await sleep(1100);
        jsb.internal.scan_external_changes();
    }
}

// Verifies the transitive cascade: when an imported dependency reloads, any
// module whose `children` array contains the dirty module is also re-executed
// so its top-level closures (and any class declarations that depend on the
// imported values) pick up the new module state.
async function runTransitiveReloadTest(): Promise<void> {
    const baseOriginal = readFile(BASE_PATH);
    try {
        const beforeDep = require("./transitive-dependent");
        const beforeCombined = beforeDep?.default?.prototype?.getCombined?.call(null);
        if (beforeCombined !== 11) {
            throw new Error(`baseline: getCombined() returned ${beforeCombined} (expected 11)`);
        }

        await sleep(1100);
        const baseMutated = baseOriginal.replace("return 10;", "return 100;");
        if (baseMutated === baseOriginal) throw new Error("base mutation produced no diff");
        writeFile(BASE_PATH, baseMutated);

        jsb.internal.scan_external_changes();

        const afterDep = require("./transitive-dependent");
        const afterCombined = afterDep?.default?.prototype?.getCombined?.call(null);
        if (afterCombined !== 101) {
            throw new Error(
                `post-cascade: getCombined() returned ${afterCombined} (expected 101 — the dependent module did not transitively reload after its base changed)`,
            );
        }
        console.log("TestScriptClassReload: transitive-reload OK");
    } finally {
        writeFile(BASE_PATH, baseOriginal);
        await sleep(1100);
        jsb.internal.scan_external_changes();
    }
}

export default class TestScriptClassReload extends Node {
    _ready(): void {
        beginAsyncTest();
        (async () => {
            await runDirectScriptClassReloadTest();
            await runTransitiveReloadTest();
        })()
            .catch((error) => reportTestFailure("script-class-reload", error))
            .finally(() => endAsyncTest());
    }
}
