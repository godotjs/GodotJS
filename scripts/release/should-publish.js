import { execSync } from "child_process";
import { getVersion } from "./get-version.js";

function shouldPublish() {
  const version = getVersion();
  const releases = JSON.parse(
    execSync("gh release list --json name --limit 5").toString().trim(),
  );

  console.log(
    (!releases.some((release) => release.name === version)).toString(),
  );
}

shouldPublish();
