import { PrepareConfigType } from "./data";
import { startConfigProcess } from "../../utils/config-process";
import { CONFIG_NAME } from "../../data";
import { osMap } from "../../utils/os";
import { platform } from "os";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { get } from "node:https";
import AdmZip from "adm-zip";
import { getDownloads } from "./downloads";
import { join } from "node:path";
import type { IncomingMessage } from "node:http";

const downloadWithProgress = (
    response: IncomingMessage,
    output: string,
    resolve: () => void,
    reject: (err: Error) => void,
) => {
    if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
    }

    const totalSize = parseInt(response.headers["content-length"] || "0");
    let downloaded = 0;
    const fileStream = createWriteStream(output);

    response.on("data", (chunk) => {
        downloaded += chunk.length;
        const percent = totalSize ? ((downloaded / totalSize) * 100).toFixed(1) : "?";
        process.stdout.write(`\rProgress: ${percent}% (${(downloaded / 1024 / 1024).toFixed(2)} MB)`);
    });

    response.pipe(fileStream);
    fileStream.on("finish", () => {
        fileStream.close();
        resolve();
    });
    fileStream.on("error", reject);
};

export const prepareAction = async (passedConfig: PrepareConfigType) => {
    const config = await startConfigProcess(CONFIG_NAME, passedConfig);
    const { dry, editorPath, templatesPath, editorJSEngine, godotVersion, rootPath, exportTemplates, gitTag } = config;

    const os = osMap[platform()];
    if (!os) throw new Error(`Unsupported platform: ${platform()}`);

    const resolvedEditorPath = join(rootPath, editorPath);
    const resolvedTemplatesPath = join(rootPath, templatesPath);

    if (dry) {
        const result = { config, resolvedEditorPath, resolvedTemplatesPath };
        console.log(result);
        return result;
    } else {
        if (!existsSync(resolvedEditorPath)) mkdirSync(resolvedEditorPath, { recursive: true });
        if (!existsSync(resolvedTemplatesPath)) mkdirSync(resolvedTemplatesPath, { recursive: true });

        const downloads = getDownloads({
            os,
            editorPath: resolvedEditorPath,
            templatesPath: resolvedTemplatesPath,
            editorJSEngine,
            godotVersion,
            exportTemplates,
            gitTag,
        });

        for (const { name, url, marker, targetDir } of downloads) {
            const markerPath = join(targetDir, marker);

            if (existsSync(markerPath)) {
                console.log(`Skipping ${name}: already exists`);
                continue;
            }

            const output = join(targetDir, `${name}.zip`);

            console.log(`Downloading ${name}: ${url}`);

            await new Promise<void>((resolve, reject) => {
                get(url, (response) => {
                    if (response.statusCode === 302 || response.statusCode === 301) {
                        get(response.headers.location!, (redirectResponse) => {
                            downloadWithProgress(redirectResponse, output, resolve, reject);
                        });
                    } else {
                        downloadWithProgress(response, output, resolve, reject);
                    }
                }).on("error", reject);
            });

            console.log(); // New line after progress

            console.log(`Extracting: ${output}`);

            const zip = new AdmZip(output);

            if (name === "editor") {
                const entries = zip.getEntries();
                const rootDir = entries[0]?.entryName.split("/")[0];

                for (const entry of entries) {
                    if (entry.isDirectory) continue;
                    const relativePath = rootDir ? entry.entryName.substring(rootDir.length + 1) : entry.entryName;
                    if (relativePath) {
                        zip.extractEntryTo(entry, targetDir, false, true, false, relativePath);
                    }
                }
            } else {
                zip.extractAllTo(targetDir, true);
            }

            unlinkSync(output);
        }

        console.log("Done: All files extracted");
    }
};
