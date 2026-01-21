import { ProgramOptionsType } from "../../data";
import {
    ConfigType,
    DryConfigType,
    dryRunOption,
    editorPathOption,
    EditorPathConfigType,
    OutConfigType,
    RootPathConfigType,
    rootPathOption,
} from "../../utils/shared";

export type DevConfigType = {
    tsConfigPath?: string;
} & DryConfigType &
    ConfigType &
    RootPathConfigType &
    EditorPathConfigType;

export const devOptions: ProgramOptionsType[] = [
    {
        name: "tsConfigPath",
        defaultValue: ".",
        description: "Relative path where tsconfig.json is located",
    },
    dryRunOption,
    rootPathOption,
    editorPathOption,
];
