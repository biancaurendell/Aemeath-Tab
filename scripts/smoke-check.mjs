import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const rootArg = process.argv.find((arg) => arg.startsWith("--root="));
const root = resolve(rootArg ? rootArg.slice("--root=".length) : ".");
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
      "content-type": mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));

const { port } = server.address();
const url = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().includes("Failed to load resource")) {
    errors.push(message.text());
  }
});

await page.route("https://api.injahow.cn/**", (route) => {
  route.fulfill({
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify([
      {
        id: "smoke-track",
        name: "Smoke Test Track",
        artist: "Aemeath",
        url: "https://example.com/smoke.mp3",
        cover: ""
      }
    ])
  });
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#searchInput");
  await page.waitForSelector("#settingsButton");

  await page.click("#settingsButton");
  await page.waitForSelector("#settingsDialog[open]");

  await page.click('[data-settings-tab="performance"]');
  await page.check("#perfLowPowerToggle");
  const lowPowerStored = await page.evaluate(() => localStorage.getItem("pixelNewTab.perf.lowPower"));
  if (lowPowerStored !== "true") throw new Error("Low power setting did not persist.");

  await page.click('[data-settings-tab="background"]');
  await page.waitForSelector("#wallpaperGrid .wallpaper-option");
  const wallpaperCount = await page.locator("#wallpaperGrid .wallpaper-option").count();
  if (wallpaperCount < 2) throw new Error("Built-in wallpapers did not render.");

  await page.click('[value="close"]');
  await page.evaluate(() => {
    localStorage.setItem("pixelNewTab.showAddShortcut", "true");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.click("#addShortcutButton");
  await page.fill("#shortcutUrl", "example.com");
  await page.fill("#shortcutName", "Example");
  await page.evaluate(() => {
    const iconText = document.querySelector("#shortcutIconText");
    if (iconText) {
      iconText.value = "EX";
      iconText.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await page.click("#saveShortcutButton");
  await page.waitForSelector('.shortcut-link[data-shortcut-id]');

  const shortcutSaved = await page.evaluate(() => {
    const shortcuts = JSON.parse(localStorage.getItem("pixelNewTab.shortcuts.v2") || "[]");
    return shortcuts.some((shortcut) => shortcut.name === "Example" && shortcut.url === "https://example.com/");
  });
  if (!shortcutSaved) throw new Error("Shortcut was not saved to localStorage.");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('.shortcut-link[data-shortcut-id]');
  const shortcutVisible = await page.getByText("Example", { exact: true }).isVisible();
  if (!shortcutVisible) throw new Error("Shortcut did not restore after reload.");

  await page.click("#settingsButton");
  await page.click('[data-settings-tab="data"]');
  const exportVisible = await page.locator("#exportConfigButton").isVisible();
  const importVisible = await page.locator("#importConfigButton").isVisible();
  if (!exportVisible || !importVisible) throw new Error("Config import/export controls are not visible.");

  if (errors.length) throw new Error(`Browser errors:\n${errors.join("\n")}`);
  console.log(`Smoke check passed at ${url}`);
} finally {
  await browser.close();
  server.close();
}
