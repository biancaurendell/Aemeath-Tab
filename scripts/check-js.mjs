import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["src", "scripts"];
const files = [];

async function collectJsFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectJsFiles(fullPath);
      continue;
    }
    if (entry.isFile() && /\.(?:mjs|js)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
}

for (const root of roots) {
  await collectJsFiles(root);
}

let hasError = false;
for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) hasError = true;
}

if (hasError) {
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length} JavaScript modules.`);
}
