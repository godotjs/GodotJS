import { ProgramOptionsType } from "../../data";
import {
    ConfigType,
    DryConfigType,
    dryRunOption,
    editorPathOption,
    EditorPathConfigType,
    RootPathConfigType,
    templatesPathOption,
    TemplatesPathConfigType,
    rootPathOption,
} from "../../utils/shared";

export type ExportTemplateType = {
    target:
        | "web"
        | "web-dlink"
        | "web-nothreads"
        | "web-dlink-nothreads"
        | "macos"
        | "android"
        | "ios"
        | "windows"
        | "linux";
    engine: "v8" | "qjs-ng" | "browser";
};

export type PrepareDownloadType = {
    godotVersion?: "4.4" | "4.5";
    editorJSEngine?: "v8" | "qjs_ng";
    exportTemplates?: ExportTemplateType[];
    gitTag?: string;
    generateInitialTypings?: boolean;
} & EditorPathConfigType &
    TemplatesPathConfigType &
    RootPathConfigType;

export type PrepareConfigType = {} & DryConfigType & ConfigType & PrepareDownloadType;

export const prepareOptions: ProgramOptionsType[] = [
    dryRunOption,
    {
        name: "godotVersion",
        defaultValue: "4.5",
        description: "The version for the Godot editor",
    },
    {
        name: "editorJSEngine",
        defaultValue: "v8",
        description: "The version for the JavaScript engine",
    },
    {
        name: "generateInitialTypings",
        defaultValue: true,
        description: "Enable initial typings generation",
    },
    {
        name: "exportTemplates",
        array: true,
        description: "An array of export templates to download",
    },
    {
        name: "gitTag",
        description: "Change to another gitTag for download",
    },
    editorPathOption,
    templatesPathOption,
    rootPathOption,
];
