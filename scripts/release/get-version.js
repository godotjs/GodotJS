import { dirname, join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPackageJsonVersion = () => {
    const packagePath = join(__dirname, "../editor/package.json");
    return JSON.parse(readFileSync(packagePath, "utf8")).version;
};
export const getVersion = () => `v${getPackageJsonVersion()}`;
