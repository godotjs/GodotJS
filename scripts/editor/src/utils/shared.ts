import { ProgramOptionsType } from "../data";

export type OutConfigType = {
    out?: string;
};
export type BuildPathConfigType = {
    buildPath?: string;
};

export type DryConfigType = {
    dry?: boolean;
};

export type ConfigType = {
    config?: string;
};
export type RootPathConfigType = {
    rootPath?: string;
};
export type EditorPathConfigType = {
    editorPath?: string;
};
export type TemplatesPathConfigType = {
    templatesPath?: string;
};

export const dryRunOption: ProgramOptionsType = {
    name: "dry",
    description: "Do a dry run with this command - prints/returns output",
    defaultValue: false,
};

export const rootPathOption: ProgramOptionsType = {
    name: "rootPath",
    defaultValue: ".",
    description: "Root path for your project",
};
export const buildPathOption: ProgramOptionsType = {
    name: "buildPath",
    defaultValue: "./build",
    description: "Relative path from root where build is written",
};

export const editorPathOption: ProgramOptionsType = {
    name: "editorPath",
    defaultValue: "./.editor",
    description: "Relative path from root where editor is downloaded",
};

export const templatesPathOption: ProgramOptionsType = {
    name: "templatesPath",
    defaultValue: "./.editor/templates",
    description: "Relative path from root where export templates are downloaded",
};
