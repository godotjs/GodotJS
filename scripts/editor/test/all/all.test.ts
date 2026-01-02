import { describe, expect, test } from "vitest";
import { readdirSync } from "node:fs";
import { initAction } from "../../src/commands/init";
import { prepareAction } from "../../src/commands/prepare";
import { platform } from "node:os";

const gameName = "game";
const root = `./test/all/${gameName}`;

const expectedFiles = [
    "node_modules",
    "example.ts",
    ".gitignore",
    "package.json",
    "project.godot",
    "tsconfig.json",
    "build",
    "gen",
    "typings",
    ".editor",
    ".godot",
];

describe("all", () => {
    test(
        `test init and prepare`,
        async () => {
            await initAction({
                name: gameName,
                out: root,
                forceDelete: true,
                editorPath: "./.editor",
                templatesPath: "./.editor/templates",
                dry: false,
                buildPath: "./build",
            });
            const files: string[] = readdirSync(root);
            expect(files).toHaveLength(12);
            for (const file of expectedFiles) {
                expect(files).toContain(file);
            }

            await prepareAction({
                rootPath: root,
                gitTag: "v1.1.0-generate-typings",
                editorPath: ".editor",
                templatesPath: ".editor/templates",
                dry: false,
                editorJSEngine: "v8",
                godotVersion: "4.5",
                generateInitialTypings: true,
                exportTemplates: [
                    {
                        target: "web",
                        engine: "qjs-ng",
                    },
                ],
            });
            const editorFiles: string[] = readdirSync(`${root}/.editor`);
            const os = platform();
            editorFiles.includes(
                os === "darwin"
                    ? "Godot.app"
                    : os === "win32"
                      ? "godot.windows.editor.x86_64.exe"
                      : "godot.linuxbsd.editor.x86_64",
            );
        },
        { timeout: 10 * 60 * 1000 },
    );
});
