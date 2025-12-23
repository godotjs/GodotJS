import { describe, expect, test } from "vitest";
import { readdirSync } from "node:fs";
import { initAction } from "../../src/commands/init";
import { prepareAction } from "../../src/commands/prepare";

const gameName = "game";
const root = "./test/all";

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
            const files: string[] = readdirSync(`${root}/${gameName}`);
            expect(files).toHaveLength(12);
            for (const file of expectedFiles) {
                expect(files).toContain(file);
            }

            await prepareAction({
                rootPath: `${root}/${gameName}`,
                gitTag: "v1.1.0-web-dlink",
                editorPath: ".editor",
                templatesPath: ".editor/templates",
                dry: false,
                editorJSEngine: "v8",
                godotVersion: "4.5",
                exportTemplates: [
                    {
                        target: "web",
                        engine: "qjs-ng",
                    },
                ],
            });
            const editorFiles: string[] = readdirSync(`${root}/${gameName}/.editor`);
            expect(editorFiles).toHaveLength(5);
        },
        { timeout: 10 * 60 * 1000 },
    );
});
