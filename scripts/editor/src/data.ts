import { devOptions } from "./commands/dev/data";
import { devAction } from "./commands/dev";
import { buildOptions } from "./commands/build/data";
import { buildAction } from "./commands/build";
import { initOptions } from "./commands/init/data";
import { initAction } from "./commands/init";
import { prepareOptions } from "./commands/prepare/data";
import { prepareAction } from "./commands/prepare";

export const CONFIG_NAME = "godot-js";
export const programName = "@godot-js/editor";
export const programDescription = "Manages GodotJS editor";

export type Command = {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: (...args: any[]) => void | Promise<any>;
    description?: string;
    options?: ProgramOptionsType[];
};

export type ProgramOptionsType = {
    name: string;
    short?: string;
    long?: string;
    array?: boolean;
    required?: boolean;
    description?: string;
    defaultValue?: string | boolean | string[];
    inquirer?: {
        input?: { message: string };
    };
};

export const godotJS: Command[] = [
    {
        name: "init",
        description: "Creates a new GodotJS project with TypeScript support",
        options: initOptions,
        action: initAction,
    },
    {
        name: "build",
        description: "Build game with export templates",
        options: buildOptions,
        action: buildAction,
    },
    {
        name: "dev",
        description: "Start TypeScript compilation and opens editor",
        options: devOptions,
        action: devAction,
    },
    {
        name: "prepare",
        description: "Downloads editor and export templates",
        options: prepareOptions,
        action: prepareAction,
    },
];
