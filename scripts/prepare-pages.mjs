import { cp, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(".");
const outDir = join(root, "dist");

const copyTargets = [
  ["index.html", "index.html"],
  ["styles.css", "styles.css"],
  ["src", "src"],
  ["assets", "assets"]
];

await mkdir(outDir, { recursive: true });

for (const [from, to] of copyTargets) {
  await cp(join(root, from), join(outDir, to), {
    recursive: true,
    force: true,
    errorOnExist: false
  });
}

await writeFile(
  join(outDir, "_headers"),
  [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "",
    "/assets/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "",
    "/src/*",
    "  Cache-Control: public, max-age=3600",
    ""
  ].join("\n"),
  "utf8"
);

console.log(`Prepared static Pages output in ${outDir}`);
