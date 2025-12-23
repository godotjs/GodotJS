import { ExportTemplateType, PrepareDownloadType } from "./data";
import { version } from "package.json";

const releaseUrl = "https://github.com/godotjs/GodotJS/releases/download";

export const getDownloads = ({
    os,
    editorPath,
    templatesPath,
    editorJSEngine,
    godotVersion,
    exportTemplates,
    gitTag,
}: {
    os: string;
    exportTemplates?: ExportTemplateType[];
} & PrepareDownloadType) => {
    const downloadVersion = gitTag ? gitTag : `v${version}`;

    const downloads = [
        {
            name: "editor",
            url: `${releaseUrl}/${downloadVersion}/${os}-${os === "macos" ? "editor-app" : "editor"}-${godotVersion}-${editorJSEngine}.zip`,
            marker:
                os === "macos"
                    ? "Godot.app"
                    : os === "windows"
                      ? "godot.windows.editor.x86_64.exe"
                      : "godot.linuxbsd.editor.x86_64",
            targetDir: editorPath,
        },
    ];

    for (const { target, engine } of exportTemplates ?? []) {
        // TODO: Do we need the app here?
        // const types = target === "macos" ? ["-app"] : ["_debug", "_release"];
        const types = ["_debug", "_release"];

        for (const type of types) {
            downloads.push({
                name: `${target}-template${type}-${engine}`,
                url: `${releaseUrl}/${downloadVersion}/${target}-template${type}-${godotVersion}-${engine}.zip`,
                marker: `${target}-template${type}-${godotVersion}-${engine}`,
                targetDir: templatesPath,
            });
        }
    }

    return downloads;
};
