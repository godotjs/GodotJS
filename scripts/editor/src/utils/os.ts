import { join } from "node:path";

export const osMap: Record<string, string> = {
    win32: "windows",
    darwin: "macos",
    linux: "linux",
};

export const getEditorPath = (os: string, rootPath: string, editorPath: string): string => {
    return os === "macos"
        ? join(rootPath, editorPath, "Godot.app/Contents/MacOS/Godot")
        : os === "windows"
          ? join(rootPath, editorPath, "godot.windows.editor.x86_64.exe")
          : join(rootPath, editorPath, "godot.linuxbsd.editor.x86_64");
};
