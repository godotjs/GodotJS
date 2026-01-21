import { ProgramOptionsType } from "../../data";
import {
    BuildPathConfigType,
    buildPathOption,
    DryConfigType,
    dryRunOption,
    EditorPathConfigType,
    editorPathOption,
    OutConfigType,
    TemplatesPathConfigType,
    templatesPathOption,
} from "../../utils/shared";

export type InitConfigType = {
    name?: string;
    forceDelete?: boolean;
} & DryConfigType &
    OutConfigType &
    BuildPathConfigType &
    EditorPathConfigType &
    TemplatesPathConfigType;

export const initOptions: ProgramOptionsType[] = [
    {
        name: "name",
        defaultValue: "my-game",
        description: "The name of your project",
        required: true,
        inquirer: {
            input: { message: "Enter the name of your Game" },
        },
    },
    {
        name: "out",
        defaultValue: ".",
        description: "Relative path where project is written",
    },
    {
        name: "forceDelete",
        defaultValue: false,
        description: "Removes project dir if it's already there",
    },
    dryRunOption,
    buildPathOption,
    editorPathOption,
    templatesPathOption,
];

export const EXAMPLE_FILE = "example.ts";
export const GITIGNORE = ".gitignore";
export const TS_CONFIG_FILE = "tsconfig.json";
export const PACKAGE_JSON_FILE = "package.json";
export const GODOT_JS_CONFIG_FILE = ".config/godot-js.ts";
export const GODOT_PROJECT_FILE: string = "project.godot";
