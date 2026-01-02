import { build } from "esbuild";

await build({
  entryPoints: ["./src/cli.ts"],
  bundle: true,
  outfile: "./dist/index.js",
  platform: "node",
  format: "esm",
  packages: "external",
  // minify: true,
});
