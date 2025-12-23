import { InitConfigType } from "../data";

export const getGodotJSConfig = ({
    buildPath,
    editorPath,
    templatesPath,
}: Pick<InitConfigType, "buildPath" | "editorPath" | "templatesPath">) =>
    `import type { GodotJsConfig } from "@godot-js/editor";

const config: GodotJsConfig = {
  buildType: "release",
  tsConfigPath: ".",
  rootPath: ".",
  buildPath: "${buildPath}",
  godotVersion: "4.5",
  editorJSEngine: "v8",
  editorPath: "${editorPath}",
  templatesPath: "${templatesPath}",
  exportTemplates: [],
};

export default config;
`;
