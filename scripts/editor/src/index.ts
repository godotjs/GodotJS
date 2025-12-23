import { InitConfigType } from "./commands/init/data";
import { BuildConfigType } from "./commands/build/data";
import { DevConfigType } from "./commands/dev/data";
import { PrepareConfigType } from "./commands/prepare/data";

export type GodotJsConfig = Partial<InitConfigType & BuildConfigType & DevConfigType & PrepareConfigType>;
