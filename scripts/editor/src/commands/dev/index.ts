import { DevConfigType } from "./data";
import { startConfigProcess } from "../../utils/config-process";
import { CONFIG_NAME } from "../../data";

import { spawn } from "child_process";
import { platform } from "node:os";
import { getEditorPath, osMap } from "../../utils/os";
import { join } from "node:path";
import { chmodSync } from "node:fs";

export const devAction = async (passedConfig: DevConfigType) => {
    const config = await startConfigProcess(CONFIG_NAME, passedConfig);
    const { dry, rootPath, tsConfigPath, editorPath } = config;

    const os = osMap[platform()];
    if (!os) throw new Error(`Unsupported platform: ${platform()}`);

    const resolvedEditorPath = getEditorPath(os, rootPath, editorPath);
    const resolvedTSCPath = join(rootPath, "node_modules/typescript/bin/tsc");

    if (dry) {
        const result = { config, editorPath };
        console.log(result);
        return result;
    } else {
        const tsc = spawn(
            os === "windows" ? "node.exe" : "node",
            [resolvedTSCPath, "--watch", "--project", tsConfigPath],
            {
                stdio: "inherit",
            },
        );
        tsc.on("error", (err) => {
            console.error(`Failed to start tsc: ${err.message}`);
        });


        if (platform() !== "win32") {
            chmodSync(resolvedEditorPath, 0o755);
        }
        const editor = spawn(resolvedEditorPath, ["--editor", "--path", rootPath], {
            stdio: "inherit",
        });
        editor.on("error", (err) => {
            console.error(`Failed to start editor: ${err.message}`);
        });
    }
};
