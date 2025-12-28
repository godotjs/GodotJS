import { getProgram } from "./program";
import { CONFIG_NAME, programDescription, programName } from "./data";
import { markdownTable } from "markdown-table";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";

const docsDirectory = "./docs";

const getBooleanValue = (value: unknown): string => {
    if (String(value) === "true") {
        return "✅";
    } else if (String(value) === "false") {
        return "❌";
    }

    return String(value);
};

export const generateApiDocs = (name: string, programDescription: string) => {
    const mProgram = getProgram(name, programDescription);
    let result = `# API - ${mProgram.name()}\n\n`;
    result += `${mProgram.description()}\n\n`;
    result += `> You can use \`${CONFIG_NAME}.json\` as a config file. 
  By default it tries to search for the configuration otherwise use a correct path by passing \`--config=./${CONFIG_NAME}.json\`.\n\n`;

    for (const command of mProgram.commands.slice().sort((a, b) => a.name().localeCompare(b.name()))) {
        result += `## ${command.name()}\n\n`;
        result += `${command.description()}\n\n`;

        const mTable: string[][] = [["long", "short", "description", "required", "defaultValue"]];
        for (const { description, required, short, long, defaultValue } of command.options
            .slice()
            .sort((a, b) => (a.required === b.required ? 0 : a.required ? -1 : 1))) {
            mTable.push([
                `\`${long}\``,
                short && short?.length > 0 ? `\`${short}\`` : "",
                description,
                `\`${getBooleanValue(required)}\``,
                defaultValue ? `\`${JSON.stringify(defaultValue)}\`` : "",
            ]);
        }
        result += `${markdownTable(mTable, { align: ["l", "c", "l", "c", "l"] })}\n\n`;
    }

    if (!existsSync(docsDirectory)) {
        mkdirSync(docsDirectory, { recursive: true });
    }

    writeFileSync(`${docsDirectory}/API.md`, result);
};

generateApiDocs(programName, programDescription);
