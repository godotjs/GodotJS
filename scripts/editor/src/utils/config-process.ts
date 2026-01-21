import { cosmiconfig, CosmiconfigResult } from "cosmiconfig";

export const startConfigProcess = async <T>(moduleName: string, config: T): Promise<T> => {
    const explorerSync = cosmiconfig(moduleName, {
        searchPlaces: [
            "package.json",
            `.${moduleName}`,
            `.${moduleName}.json`,
            `.${moduleName}.yaml`,
            `.${moduleName}.yml`,
            `.${moduleName}.js`,
            `.${moduleName}.ts`,
            `.${moduleName}.mjs`,
            `.${moduleName}.cjs`,
            `.config/${moduleName}`,
            `.config/${moduleName}.json`,
            `.config/${moduleName}.yaml`,
            `.config/${moduleName}.yml`,
            `.config/${moduleName}.js`,
            `.config/${moduleName}.ts`,
            `.config/${moduleName}.mjs`,
            `.config/${moduleName}.cjs`,
        ],
    });

    const configPath = config["config"];
    const configResult: CosmiconfigResult = await (configPath ? explorerSync.load(configPath) : explorerSync.search());

    if (configResult && !configResult.isEmpty) {
        return { ...config, ...configResult.config };
    }

    return config;
};
