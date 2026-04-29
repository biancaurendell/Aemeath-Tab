import { storageKeys, syncConfigFromLegacyStorage } from "../state/settings.js";
import { assetKeys, deleteAsset, writeAsset, backgroundIndexedRef } from "../state/storage.js";

const backgroundAssetKey = assetKeys.backgroundOriginal;
const wallpaperDirectory = "./assets/wallpapers/";
const wallpaperManifest = "./assets/wallpapers/wallpapers.json";
const wallpaperFilePattern = /\.(jpg|jpeg|png|webp|gif)$/i;

const builtInWallpaperSeeds = [
  { name: "默认", src: "./assets/wallpapers/default-config.png" },
  { name: "移动端默认", src: "./assets/wallpapers/mobile-default.jpg" },
  { name: "碎花", src: "./assets/wallpapers/suihua.png" },
  { name: "贺图", src: "./assets/wallpapers/hetu.jpg" },
  { name: "贺图2", src: "./assets/wallpapers/贺图2.jpg" },
  { name: "星海", src: "./assets/wallpapers/hdnrtj.jpg" },
  { name: "小爱", src: "./assets/wallpapers/xiaoa.png" },
  { name: "微笑", src: "./assets/wallpapers/weixiao.png" },
  { name: "星轨", src: "./assets/wallpapers/xinghai.jpg" },
  { name: "B站贺图", src: "./assets/wallpapers/bilibili-hetu.png" }
];

let builtInWallpapers = [...builtInWallpaperSeeds];
let activeBackgroundValue = "";
let customBackground = null;
let wallpaperGrid = null;
let backgroundUrl = null;
let backgroundFile = null;

export function isBuiltInWallpaper(value) {
  return builtInWallpapers.some((wallpaper) => wallpaper.src === value);
}

export async function loadBuiltInWallpapers() {
  const [manifestWallpapers, discoveredWallpapers] = await Promise.all([
    loadWallpaperManifest(),
    discoverWallpaperDirectory()
  ]);
  builtInWallpapers = mergeWallpaperLists(builtInWallpaperSeeds, manifestWallpapers, discoveredWallpapers);
}

async function loadWallpaperManifest() {
  try {
    const response = await fetch(wallpaperManifest, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizeWallpaperEntry).filter(Boolean);
  } catch {
    return [];
  }
}

async function discoverWallpaperDirectory() {
  try {
    const response = await fetch(wallpaperDirectory, { cache: "no-store" });
    if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) return [];
    const html = await response.text();
    const documentFromHtml = new DOMParser().parseFromString(html, "text/html");
    return Array.from(documentFromHtml.querySelectorAll("a[href]"))
      .map((link) => getFileNameFromHref(link.getAttribute("href"), response.url))
      .map((fileName) => normalizeWallpaperEntry(fileName))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getFileNameFromHref(href, baseUrl) {
  try {
    const url = new URL(href, baseUrl);
    return decodeURIComponent(url.pathname.split("/").pop() || "");
  } catch {
    return "";
  }
}

function mergeWallpaperLists(...lists) {
  const merged = [];
  const seen = new Set();
  for (const list of lists) {
    for (const entry of list) {
      const wallpaper = normalizeWallpaperEntry(entry);
      if (!wallpaper || seen.has(wallpaper.src)) continue;
      seen.add(wallpaper.src);
      merged.push(wallpaper);
    }
  }
  return merged;
}

function normalizeWallpaperEntry(entry) {
  if (typeof entry === "string") return createWallpaperEntry(entry, "");
  if (!entry || typeof entry !== "object") return null;
  const src = typeof entry.src === "string" ? entry.src : entry.file;
  const name = typeof entry.name === "string" ? entry.name : "";
  return createWallpaperEntry(src, name);
}

function createWallpaperEntry(src, name) {
  if (typeof src !== "string") return null;
  const normalizedSrc = normalizeWallpaperSrc(src);
  if (!normalizedSrc || !wallpaperFilePattern.test(normalizedSrc)) return null;
  return {
    name: name.trim() || createWallpaperName(normalizedSrc),
    src: normalizedSrc
  };
}

function normalizeWallpaperSrc(src) {
  const cleanSrc = src.trim().replaceAll("\\", "/");
  if (!cleanSrc || cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://")) return "";
  if (cleanSrc.startsWith("./assets/wallpapers/")) return cleanSrc;
  if (cleanSrc.startsWith("assets/wallpapers/")) return `./${cleanSrc}`;
  return `${wallpaperDirectory}${cleanSrc.split("/").pop()}`;
}

function createWallpaperName(src) {
  const fileName = src.split("/").pop() || "壁纸";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return decodeURIComponent(baseName).replace(/[-_]+/g, " ");
}

export function renderWallpapers() {
  if (!wallpaperGrid) return;
  wallpaperGrid.innerHTML = "";
  for (const wallpaper of builtInWallpapers) {
    const button = document.createElement("button");
    const image = document.createElement("img");
    const label = document.createElement("span");
    button.type = "button";
    button.className = "wallpaper-option";
    button.classList.toggle("is-active", activeBackgroundValue === wallpaper.src);
    button.setAttribute("aria-label", `使用内置壁纸：${wallpaper.name}`);
    image.src = wallpaper.src;
    image.alt = "";
    image.loading = "lazy";
    label.textContent = wallpaper.name;
    button.append(image, label);
    button.addEventListener("click", () => applyBuiltInWallpaper(wallpaper.src));
    wallpaperGrid.append(button);
  }
}

export function updateWallpaperSelection() {
  if (!wallpaperGrid) return;
  for (const button of wallpaperGrid.querySelectorAll(".wallpaper-option")) {
    const image = button.querySelector("img");
    button.classList.toggle("is-active", image?.getAttribute("src") === activeBackgroundValue);
  }
}

export function applyBuiltInWallpaper(src) {
  setBackground(src);
  localStorage.setItem(storageKeys.background, src);
  syncConfigFromLegacyStorage();
  deleteAsset(backgroundAssetKey).catch((error) => console.warn("背景资源删除失败。", error));
  if (backgroundUrl) backgroundUrl.value = "";
  if (backgroundFile) backgroundFile.value = "";
}

export function setBackground(value) {
  activeBackgroundValue = value;
  if (customBackground) {
    customBackground.src = value;
    customBackground.classList.add("is-active");
  }
  updateWallpaperSelection();
}

export function saveBackground(value) {
  try {
    localStorage.setItem(storageKeys.background, value);
    syncConfigFromLegacyStorage();
    return true;
  } catch (error) {
    console.warn("背景图片已应用，但图片过大，无法保存到本地。", error);
    return false;
  }
}

export function compressBackgroundImage(dataUrl, fileType) {
  return new Promise((resolve) => {
    if (fileType === "image/gif") {
      resolve(dataUrl);
      return;
    }

    const image = new Image();
    image.addEventListener("load", () => {
      const maxSize = 1920;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvasEl = document.createElement("canvas");
      canvasEl.width = width;
      canvasEl.height = height;
      const canvasCtx = canvasEl.getContext("2d");
      canvasCtx.drawImage(image, 0, 0, width, height);
      resolve(canvasEl.toDataURL("image/jpeg", 0.86));
    });
    image.addEventListener("error", () => resolve(dataUrl));
    image.src = dataUrl;
  });
}

export function resetBackground(getDefaultBackgroundCallback) {
  localStorage.removeItem(storageKeys.background);
  syncConfigFromLegacyStorage();
  deleteAsset(backgroundAssetKey).catch((error) => console.warn("背景资源删除失败。", error));
  if (getDefaultBackgroundCallback) setBackground(getDefaultBackgroundCallback());
  if (backgroundUrl) backgroundUrl.value = "";
  if (backgroundFile) backgroundFile.value = "";
}

export function initBackground({ applyUrlButton, resetBackgroundButton, getDefaultBackgroundCallback }) {
  customBackground = document.querySelector("#customBackground");
  wallpaperGrid = document.querySelector("#wallpaperGrid");
  backgroundUrl = document.querySelector("#backgroundUrl");
  backgroundFile = document.querySelector("#backgroundFile");

  if (backgroundFile) {
    backgroundFile.addEventListener("change", () => {
      const file = backgroundFile.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.addEventListener("load", async () => {
        const result = reader.result;
        if (typeof result !== "string") return;
        setBackground(result);
        try {
          await writeAsset(backgroundAssetKey, result);
          localStorage.setItem(storageKeys.background, backgroundIndexedRef);
          syncConfigFromLegacyStorage();
          if (backgroundUrl) backgroundUrl.value = "";
        } catch (error) {
          console.warn("原图保存失败，尝试保存压缩版本。", error);
          const storableBackground = await compressBackgroundImage(result, file.type);
          saveBackground(storableBackground);
        }
      });
      reader.readAsDataURL(file);
    });
  }

  if (applyUrlButton) {
    applyUrlButton.addEventListener("click", () => {
      const url = backgroundUrl?.value.trim();
      if (!url) return;
      setBackground(url);
      localStorage.setItem(storageKeys.background, url);
      syncConfigFromLegacyStorage();
      deleteAsset(backgroundAssetKey).catch((error) => console.warn("背景资源删除失败。", error));
      if (backgroundFile) backgroundFile.value = "";
    });
  }

  if (resetBackgroundButton) {
    resetBackgroundButton.addEventListener("click", () => resetBackground(getDefaultBackgroundCallback));
  }
}
