import { execSync } from "child_process";

export const getVersion = () =>
  `v${JSON.parse(execSync("pnpm pkg get version").toString().trim())}`;
