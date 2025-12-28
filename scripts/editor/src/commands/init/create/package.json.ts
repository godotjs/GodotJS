export const getPackageJson = (name: string, version: string, typescript: string) =>
    JSON.stringify(
        {
            name: `${name.replaceAll(" ", "-").toLowerCase()}`,
            version: "0.0.0",
            type: "module",
            scripts: {
                build: "godot-js build",
                dev: "godot-js dev",
                postinstall: "godot-js prepare",
            },
            devDependencies: {
                "@godot-js/editor": `${version}`,
                typescript: `${typescript}`,
            },
        },
        undefined,
        2,
    );
