import { writeFileSync, readFileSync } from "node:fs";
import { execSync } from "child_process";
import { getVersion } from "./get-version.js";

const releaseNotesPath = "release-notes.md";

function extractChangelogContent(filePath) {
  const changelog = readFileSync(filePath, "utf-8");
  const lines = changelog.split(/\r?\n/); // Split by line endings for different OS
  let content = "";
  let capture = false;

  for (const line of lines) {
    let firstCapture = false;
    if (line.startsWith("## ")) {
      if (capture) break; // Stop capturing if another "## " is found
      capture = true; // Start capturing
      firstCapture = true;
    }

    if (!firstCapture && capture) {
      content += line + "\n"; // Add the line to the content
    }
  }

  return content.trim().replaceAll("###", "##"); // Remove trailing whitespace
}

function publishRelease(godotVersions) {
  const content = extractChangelogContent("CHANGELOG.md");

  writeFileSync(
    releaseNotesPath,
    `Godot version: ${godotVersions}\n\n` + content,
  );

  const version = getVersion();
  console.log(`Found version:`, version);

  const releaseCommand = `gh release create "${version}" --target main --title "${version}" --notes-file "${releaseNotesPath}"`;
  if (process.env.CI) {
    console.log(execSync(releaseCommand).toString());
  } else {
    console.log(
      "process.env.CI not set would run command:\n",
      releaseCommand,
      "\n\nContent for changelog:\n",
      content,
    );
  }
}
const [, , godotVersions] = process.argv;
if (!godotVersions) {
  console.error("Cannot find Godot versions");
  process.exit(1);
}
publishRelease(godotVersions);
