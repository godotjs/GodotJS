import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const initPath = "src/commands/init";
const copyPath = `${initPath}/copy`;

const prepare = () => {
    const files = readdirSync(`${initPath}/copy`);
    let result = "";
    for (const file of files) {
        const content = readFileSync(`${copyPath}/${file}`);
        result += `export const ${file.replaceAll(".", "_").toUpperCase()} = [${Uint8Array.from(content)}];\n\n`;
    }

    writeFileSync(`${initPath}/generated.ts`, result);
};

prepare();
