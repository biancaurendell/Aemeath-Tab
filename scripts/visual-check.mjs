import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(".");
const outDir = join(root, "artifacts", "visual");
const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".cur", "image/x-icon"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"]
]);

function localPathFromUrl(url) {
  const { pathname } = new URL(url, "http://localhost");
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const fullPath = normalize(join(root, requested));
  if (!fullPath.startsWith(root)) return null;
  return fullPath;
}

const server = createServer(async (request, response) => {
  const filePath = localPathFromUrl(request.url || "/");
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream"
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await mkdir(outDir, { recursive: true });
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));

const { port } = server.address();
const url = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();

try {
  const demoShortcuts = [
    { id: "demo-tiktok", name: "抖音精选", url: "https://www.douyin.com", iconText: "♪", color: "#76d8e7", hotkey: "" },
    { id: "demo-bili", name: "哔哩哔哩", url: "https://www.bilibili.com", iconText: "B", color: "#5eb6ff", hotkey: "" },
    { id: "demo-x", name: "X.com", url: "https://x.com", iconText: "X", color: "#f5f0ff", hotkey: "" },
    { id: "demo-ai", name: "Perplexity", url: "https://www.perplexity.ai", iconText: "P", color: "#ff8ec9", hotkey: "" },
    { id: "demo-youtube", name: "YouTube", url: "https://www.youtube.com", iconText: "▶", color: "#ff6d86", hotkey: "" },
    { id: "demo-qaq", name: "CialloQAQ", url: "https://example.com", iconText: "Q", color: "#7c8cff", hotkey: "" },
    { id: "demo-speed", name: "互联网测速", url: "https://example.com", iconText: "⌁", color: "#ff6d86", hotkey: "" },
    { id: "demo-grok", name: "Grok", url: "https://grok.com", iconText: "G", color: "#9dd3a4", hotkey: "" }
  ];

  const viewports = [
    ["desktop", { width: 1365, height: 768 }],
    ["mobile", { width: 390, height: 844 }]
  ];

  for (const [name, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate(({ shortcuts, rows }) => {
      localStorage.setItem("pixelNewTab.showAddShortcut", "true");
      localStorage.setItem("pixelNewTab.shortcuts.v2", JSON.stringify(shortcuts));
      localStorage.setItem("pixelNewTab.shortcuts.layout.rows", String(rows));
      localStorage.setItem("pixelNewTab.shortcuts.layout.columns", "5");
      localStorage.setItem("pixelNewTab.shortcuts.layout.paging", "true");
      localStorage.removeItem("pixelNewTab.appearance");
      localStorage.removeItem("pixelNewTab.config");
    }, { shortcuts: demoShortcuts, rows: name === "mobile" ? 1 : 2 });
    await page.reload({ waitUntil: "networkidle" });
    await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
    await page.close();
  }

  const report = join(outDir, "report.txt");
  const stream = createWriteStream(report, { encoding: "utf8" });
  stream.end(`Visual check completed for ${url}\nScreenshots: ${outDir}\n`);
  await new Promise((resolveDone) => stream.on("finish", resolveDone));
  console.log(`Visual check completed. Screenshots saved to ${outDir}`);
} finally {
  await browser.close();
  server.close();
}
