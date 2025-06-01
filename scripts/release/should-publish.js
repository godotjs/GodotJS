import { execSync } from "child_process";

function shouldPublish() {
  const version = `v${JSON.parse(execSync("pnpm pkg get version").toString().trim())}`;
  const releases = JSON.parse(
    execSync("gh release list --json name --limit 5").toString().trim(),
  );

  console.log(releases.some((release) => release.name === version).toString());
}

shouldPublish();
