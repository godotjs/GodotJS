import { ProgramOptionsType } from "../../data";
import { DevConfigType, devOptions } from "../dev/data";
import { BuildPathConfigType, buildPathOption, OutConfigType } from "../../utils/shared";

export type BuildConfigType = {
    buildType: "debug" | "release";
    preset?: string;
} & DevConfigType &
    BuildPathConfigType;

export const buildOptions: ProgramOptionsType[] = [
    ...devOptions,
    buildPathOption,
    {
        name: "buildType",
        defaultValue: "release",
        description: "If the export should use the debug or release template",
    },
    {
        name: "preset",
        description: "The name of the preset which should be build otherwise build all",
    },
];
