import { BuildConfigType } from "./data";
import { startConfigProcess } from "../../utils/config-process";
import { CONFIG_NAME } from "../../data";
import { getEditorPath, osMap } from "../../utils/os";
import { platform } from "os";
import { spawn } from "child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const buildPreset = ({
    resolvedEditorPath,
    buildType,
    rootPath,
    preset,
}: {
    resolvedEditorPath: string;
    rootPath: string;
    buildType: string;
    preset: string;
}) => {
    spawn(resolvedEditorPath, ["--editor", "--headless", "--path", rootPath, `--export-${buildType}`, preset], {
        stdio: "inherit",
    });
};

export const buildAction = async (passedConfig: BuildConfigType) => {
    const config = await startConfigProcess(CONFIG_NAME, passedConfig);
    const { dry, rootPath, tsConfigPath, buildPath, editorPath, buildType, preset } = config;

    const os = osMap[platform()];
    if (!os) throw new Error(`Unsupported platform: ${platform()}`);

    const resolvedEditorPath = getEditorPath(os, rootPath, editorPath);
    const resolvedBuildPath = join(rootPath, buildPath);
    const resolvedTSCPath = join(rootPath, "node_modules/typescript/bin/tsc");

    if (dry) {
        const result = { config, resolvedEditorPath, resolvedBuildPath };
        console.log(result);
        return result;
    } else {
        const tsc = spawn(os === "windows" ? "node.exe" : "node", [resolvedTSCPath, "--project", tsConfigPath], {
            stdio: "inherit",
        });
        tsc.on("error", (err) => {
            console.error(`Failed to start tsc: ${err.message}`);
        });
        tsc.on("close", () => {
            console.log("tsc done");
            if (platform() !== "win32") {
                chmodSync(editorPath, 0o755);
            }

            if (!existsSync(resolvedBuildPath)) {
                mkdirSync(resolvedBuildPath);
            }

            if (preset) {
                buildPreset({ resolvedEditorPath, buildType, rootPath, preset });
            } else {
                const resolvedExportPresetConfig = join(rootPath, "export_presets.cfg");

                if (!existsSync(resolvedExportPresetConfig)) {
                    throw new Error(`No export_presets.cfg found in ${rootPath}`);
                }

                const content = readFileSync(resolvedExportPresetConfig, "utf-8");
                const presets =
                    content
                        .match(/name="([^"]+)"/g)
                        ?.map((m) => m.match(/name="([^"]+)"/)?.[1])
                        .filter(Boolean) || [];
                const exportPaths =
                    content
                        .match(/export_path="([^"]+)"/g)
                        ?.map((m) => m.match(/export_path="([^"]+)"/)?.[1])
                        .filter(Boolean) || [];
                exportPaths.forEach((path) => {
                    const resolvedPath = join(rootPath, dirname(path));
                    if (!existsSync(resolvedPath)) {
                        mkdirSync(resolvedPath, { recursive: true });
                    }
                });
                presets.forEach((preset) => {
                    buildPreset({ resolvedEditorPath, buildType, rootPath, preset });
                });
            }
        });
    }
};
