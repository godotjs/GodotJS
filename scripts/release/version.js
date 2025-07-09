import { writeFileSync } from "fs";
import { execSync } from "child_process";

function updateVersion() {
  const version = `${JSON.parse(execSync("pnpm pkg get version").toString().trim())}`;
  const [major, minor, patch] = version.split(".");
  const newContent = `#ifndef GODOTJS_VERSION_H
#define GODOTJS_VERSION_H

#include "jsb.gen.h"

#define JSB_MAJOR_VERSION ${major}
#define JSB_MINOR_VERSION ${minor}
#define JSB_PATCH_VERSION ${patch}

#endif`;
  writeFileSync("jsb_version.h", newContent, "utf8");
}

updateVersion();
