import {
    EXAMPLE_FILE,
    GITIGNORE,
    GODOT_JS_CONFIG_FILE,
    GODOT_PROJECT_FILE,
    InitConfigType,
    initOptions,
    PACKAGE_JSON_FILE,
    TS_CONFIG_FILE,
} from "./data";
import { startInquirerProcess } from "../../utils/inquirer-process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { getGodotProject } from "./create/project.godot";
import { getPackageJson } from "./create/package.json";
import { devDependencies, version } from "package.json";

import { _GITIGNORE, EXAMPLE_TS, TSCONFIG_JSON } from "./generated";
import { rimrafSync } from "rimraf";
import { basename, join, resolve } from "node:path";
import { startConfigProcess } from "../../utils/config-process";
import { CONFIG_NAME } from "../../data";
import { getGodotJSConfig } from "./create/godot-js";

const writeIgnoreFolders = (projectDir: string, buildPath: string, editorPath: string, templatesPath: string) => {
    const ignoreFolders = [
        "node_modules",
        "gen/godot",
        "typings",
        ".config",
        ".godot/GodotJS",
        buildPath,
        editorPath,
        templatesPath,
    ];

    for (const folder of ignoreFolders) {
        const path = join(projectDir, folder);
        if (!existsSync(path)) {
            mkdirSync(path, { recursive: true });
        }
        const gdIgnoreNodeModulesPath = join(path, ".gdignore");
        if (!existsSync(gdIgnoreNodeModulesPath)) {
            writeFileSync(gdIgnoreNodeModulesPath, "");
        }
    }
};

const generateFiles = ({
    createNewProject,
    name,
    root,
    forceDelete,
    filesToCreate,
    buildPath,
    editorPath,
    templatesPath,
}: {
    createNewProject: boolean;
    name: string;
    root: string;
    forceDelete: boolean;
    filesToCreate: Record<string, string>;
    buildPath: string;
    editorPath: string;
    templatesPath: string;
}) => {
    let projectDir = join(root, name);
    if (createNewProject) {
        if (existsSync(projectDir)) {
            if (forceDelete) {
                rimrafSync(projectDir);
                mkdirSync(projectDir);
            } else {
                throw Error(`${projectDir} exists already`);
            }
        } else {
            mkdirSync(projectDir);
        }
    } else {
        projectDir = ".";
    }

    writeIgnoreFolders(projectDir, buildPath, editorPath, templatesPath);

    for (const [fileName, content] of Object.entries(filesToCreate)) {
        try {
            const path = join(projectDir, fileName);
            if (!existsSync(path)) {
                writeFileSync(path, content, "utf8");
            }
        } catch (e: unknown) {
            console.warn(e);
        }
    }

    console.log("Generated files done, start by running:");
    if (createNewProject) {
        console.log(`cd ${name}`);
    }
    console.log("npm install");
    console.log("npm run dev");
};

const byteArrayAsString = (array: number[]): string => String.fromCharCode.apply(null, array);

export const initAction = async (initConfig: InitConfigType) => {
    const readConfig = await startConfigProcess(CONFIG_NAME, initConfig);
    const config = await startInquirerProcess<InitConfigType>(readConfig, initOptions);
    const { name, dry, out, forceDelete, buildPath, editorPath, templatesPath } = config;

    const filesToCreate: Record<string, string> = {};
    const root = out.endsWith("/") ? out.slice(0, out.length - 1) : out;
    const currentDir = readdirSync(root);

    let createNewProject = basename(resolve(root)) !== name;
    if (currentDir.includes(GODOT_PROJECT_FILE)) {
        createNewProject = false;
    } else {
        filesToCreate[GODOT_PROJECT_FILE] = getGodotProject(name);
    }

    filesToCreate[PACKAGE_JSON_FILE] = getPackageJson(name, version, devDependencies.typescript);
    filesToCreate[TS_CONFIG_FILE] = byteArrayAsString(TSCONFIG_JSON);
    filesToCreate[GODOT_JS_CONFIG_FILE] = getGodotJSConfig({ buildPath, editorPath, templatesPath });
    filesToCreate[EXAMPLE_FILE] = byteArrayAsString(EXAMPLE_TS);
    filesToCreate[GITIGNORE] = byteArrayAsString(_GITIGNORE);

    if (dry) {
        const result = {
            config,
            createNewProject,
            filesToCreate: Object.keys(filesToCreate),
        };
        console.log(result);
        return result;
    } else {
        generateFiles({
            createNewProject,
            name,
            root,
            forceDelete,
            filesToCreate,
            buildPath,
            editorPath,
            templatesPath,
        });
    }
};
