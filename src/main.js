import {
  initEffects,
  startMeteorAnimation,
  stopMeteorAnimation,
  updateEffectsPerformanceSettings
} from "./modules/effects.js";

import {
  initPet,
  handlePetResize,
  updatePetPerformanceSettings
} from "./modules/pet.js";

import {
  initBackground,
  loadBuiltInWallpapers,
  renderWallpapers,
  setBackground,
  isBuiltInWallpaper
} from "./modules/background.js";

import {
  initShortcuts,
  setShortcuts,
  renderShortcuts,
  handleDocumentClickForShortcuts,
  handleDocumentKeydownForShortcuts
} from "./modules/shortcuts.js";

import {
  initMusic,
  isMusicActivelyPlaying,
  updateMusicProgress,
  syncMusicState,
  clearFloatingLyricNodes,
  syncLyricCursorToCurrentTime,
  applyMusicSource,
  loadMetingPlaylist,
  buildAlbumSpectrum,
  buildSpectrum,
  buildMusicNotes
} from "./modules/music.js";

import {
  buildConfigSnapshot,
  defaultAppearance,
  defaultMetingApiUrl,
  defaultShortcuts,
  importConfigSnapshot,
  migrateLegacyConfig,
  mobileDefaultAppearance,
  storageKeys,
  syncConfigFromLegacyStorage,
  readConfig
} from "./state/settings.js";

import {
  assetKeys,
  assetRef,
  backgroundIndexedRef,
  deleteAsset,
  isAssetRef,
  readAssetByRef,
  readAsset,
  resolveAssetKey,
  writeAsset
} from "./state/storage.js";

const engines = {
  google: {
    label: "GOOGLE",
    marker: "G",
    color: "linear-gradient(135deg, #ffd56e, #8ee7e3)",
    url: "https://www.google.com/search?q="
  },
  bing: {
    label: "BING",
    marker: "B",
    color: "linear-gradient(135deg, #5aa1ff, #63e1dd)",
    url: "https://www.bing.com/search?q="
  },
  baidu: {
    label: "BAIDU",
    marker: "百",
    color: "linear-gradient(135deg, #ff6d86, #ffd36a)",
    url: "https://www.baidu.com/s?wd="
  },
  duckduckgo: {
    label: "DUCKDUCKGO",
    marker: "D",
    color: "linear-gradient(135deg, #ff9a52, #ffd76b)",
    url: "https://duckduckgo.com/?q="
  }
};

const shortcutColors = ["#5896f2", "#f7c84e", "#f25c57", "#66513f", "#93bd69", "#315caa", "#d5b76c", "#3e2d39", "#cc4049", "#3769bb", "#9dd3a4", "#e6e8ef"];

const timeText = document.querySelector("#timeText");
const customBackground = document.querySelector("#customBackground");
const dateText = document.querySelector("#dateText");
const clockPanel = document.querySelector("#clockPanel");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const searchSuggestionsPanel = document.querySelector("#searchSuggestions");
const enginePicker = document.querySelector("#enginePicker");
const engineButton = document.querySelector("#engineButton");
const engineMenu = document.querySelector("#engineMenu");
const engineDot = document.querySelector("#engineDot");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsTabs = Array.from(document.querySelectorAll(".settings-tab"));
const settingsPanels = Array.from(document.querySelectorAll(".settings-panel"));
const clockToggle = document.querySelector("#clockToggle");
const addShortcutToggle = document.querySelector("#addShortcutToggle");
const cloudToggle = document.querySelector("#cloudToggle");
const bottomSpectrumToggle = document.querySelector("#bottomSpectrumToggle");
const searchNewTabToggle = document.querySelector("#searchNewTabToggle");
const searchSuggestToggle = document.querySelector("#searchSuggestToggle");
const searchHistoryToggle = document.querySelector("#searchHistoryToggle");
const clearSearchHistoryButton = document.querySelector("#clearSearchHistoryButton");
const customEngineName = document.querySelector("#customEngineName");
const customEngineUrl = document.querySelector("#customEngineUrl");
const addCustomEngineButton = document.querySelector("#addCustomEngineButton");
const customEngineList = document.querySelector("#customEngineList");
const perfLowPowerToggle = document.querySelector("#perfLowPowerToggle");
const perfMeteorsToggle = document.querySelector("#perfMeteorsToggle");
const perfClickEffectsToggle = document.querySelector("#perfClickEffectsToggle");
const perfPetMotionToggle = document.querySelector("#perfPetMotionToggle");
const perfLyricsToggle = document.querySelector("#perfLyricsToggle");
const uiInteractionsToggle = document.querySelector("#uiInteractionsToggle");
const backgroundFile = document.querySelector("#backgroundFile");
const backgroundUrl = document.querySelector("#backgroundUrl");
const wallpaperGrid = document.querySelector("#wallpaperGrid");
const applyUrlButton = document.querySelector("#applyUrlButton");
const resetBackgroundButton = document.querySelector("#resetBackgroundButton");
const resetAppearanceButton = document.querySelector("#resetAppearanceButton");
const exportConfigButton = document.querySelector("#exportConfigButton");
const importConfigButton = document.querySelector("#importConfigButton");
const importConfigFile = document.querySelector("#importConfigFile");
const shortcutRow = document.querySelector("#shortcutRow");
const shortcutPager = document.querySelector("#shortcutPager");
const addShortcutButton = document.querySelector("#addShortcutButton");
const shortcutDialog = document.querySelector("#shortcutDialog");
const shortcutDialogTitle = document.querySelector("#shortcutDialogTitle");
const shortcutForm = document.querySelector("#shortcutForm");
const shortcutUrl = document.querySelector("#shortcutUrl");
const shortcutName = document.querySelector("#shortcutName");
const shortcutIconText = document.querySelector("#shortcutIconText");
const shortcutKey = document.querySelector("#shortcutKey");
const fetchIconButton = document.querySelector("#fetchIconButton");
const clearShortcutKeyButton = document.querySelector("#clearShortcutKeyButton");
const colorSwatches = document.querySelector("#colorSwatches");
const textIconPreview = document.querySelector("#textIconPreview");
const uploadIconPreview = document.querySelector("#uploadIconPreview");
const iconUpload = document.querySelector("#iconUpload");
const saveMoreShortcutButton = document.querySelector("#saveMoreShortcutButton");
const saveShortcutButton = document.querySelector("#saveShortcutButton");
const closeShortcutDialogButton = document.querySelector("#closeShortcutDialogButton");
const cancelShortcutButton = document.querySelector("#cancelShortcutButton");
const shortcutMenu = document.querySelector("#shortcutMenu");
const shortcutPagingToggle = document.querySelector("#shortcutPagingToggle");
const shortcutColumnsInput = document.querySelector("#shortcutColumnsInput");
const shortcutRowsInput = document.querySelector("#shortcutRowsInput");
const petSprite = document.querySelector("#petSprite");
const petImage = document.querySelector("#petImage");
const pixelGround = document.querySelector(".pixel-ground");
const musicUrl = document.querySelector("#musicUrl");
const metingApiUrl = document.querySelector("#metingApiUrl");
const musicFile = document.querySelector("#musicFile");
const applyMusicButton = document.querySelector("#applyMusicButton");
const loadPlaylistButton = document.querySelector("#loadPlaylistButton");
const musicPlayer = document.querySelector("#musicPlayer");
const musicCollapseButton = document.querySelector("#musicCollapseButton");
const musicAudio = document.querySelector("#musicAudio");
const musicPlayButton = document.querySelector("#musicPlayButton");
const musicPrevButton = document.querySelector("#musicPrevButton");
const musicNextButton = document.querySelector("#musicNextButton");
const neteaseButton = document.querySelector("#neteaseButton");
const trackTitle = document.querySelector("#trackTitle");
const trackSubtitle = document.querySelector("#trackSubtitle");
const trackCover = document.querySelector("#trackCover");
const musicProgressBar = document.querySelector("#musicProgressBar");
const musicCurrentTime = document.querySelector("#musicCurrentTime");
const musicDuration = document.querySelector("#musicDuration");
const playlistPanel = document.querySelector("#playlistPanel");
const albumSpectrum = document.querySelector("#albumSpectrum");
const bottomSpectrum = document.querySelector("#bottomSpectrum");
const musicNoteLayer = document.querySelector(".music-note-layer");
const bottomNotes = document.querySelector(".bottom-notes");
const floatingLyrics = document.querySelector("#floatingLyrics");

const appearanceInputs = {
  iconOpacity: document.querySelector("#iconOpacity"),
  iconScale: document.querySelector("#iconScale"),
  timeOpacity: document.querySelector("#timeOpacity"),
  timeScale: document.querySelector("#timeScale"),
  timeX: document.querySelector("#timeX"),
  timeY: document.querySelector("#timeY"),
  searchOpacity: document.querySelector("#searchOpacity"),
  searchScale: document.querySelector("#searchScale"),
  dustOverlayStrength: document.querySelector("#dustOverlayStrength"),
  backgroundBlur: document.querySelector("#backgroundBlur"),
  searchX: document.querySelector("#searchX"),
  searchY: document.querySelector("#searchY")
};


let selectedEngine = "google";






let customSearchEngines = [];
let searchHistory = [];
let searchSuggestions = [];
let activeSuggestionIndex = -1;
let searchSuggestTimer = 0;
let searchSuggestRequestId = 0;
let searchSettings = {
  suggestions: true,
  historyEnabled: true
};
let performanceSettings = {
  lowPower: false,
  meteors: true,
  clickEffects: true,
  petMotion: true,
  lyrics: true
};
let uiSettings = {
  interactions: true
};
const backgroundAssetKey = assetKeys.backgroundOriginal;
const wallpaperDirectory = "./assets/wallpapers/";
const wallpaperManifest = `${wallpaperDirectory}wallpapers.json`;
const wallpaperFilePattern = /\.(?:png|jpe?g|webp|gif|avif)$/i;
const defaultBackground = `${wallpaperDirectory}default-config.png`;
const mobileDefaultBackground = `${wallpaperDirectory}mobile-default.jpg`;
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

function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

function getShortcutIconAssetKey(shortcutId) {
  return `${assetKeys.shortcutIconPrefix}${shortcutId}`;
}

function getShortcutIconAssetRef(shortcutId) {
  return assetRef(getShortcutIconAssetKey(shortcutId));
}

function getMusicCoverAssetKey(track) {
  const trackId = getTrackId(track);
  return trackId ? `${assetKeys.musicCoverPrefix}${trackId}` : "";
}

function getMusicCoverAssetRef(track) {
  const key = getMusicCoverAssetKey(track);
  return key ? assetRef(key) : "";
}

async function resolveShortcutIconSource(image) {
  if (!image) return "";
  if (isAssetRef(image)) return readAssetByRef(image).catch(() => "");
  return image;
}

async function persistShortcutIconAsset(shortcutId, image, previousImage = "") {
  if (!image) return "";
  if (isAssetRef(image)) return image;
  if (!isDataUrl(image)) return image;

  if (isAssetRef(previousImage)) {
    const previousSource = await readAssetByRef(previousImage).catch(() => "");
    if (previousSource && previousSource === image) {
      return previousImage;
    }
  }

  const assetKey = getShortcutIconAssetKey(shortcutId);
  await writeAsset(assetKey, image);
  return getShortcutIconAssetRef(shortcutId);
}

async function cleanupShortcutIconAsset(image) {
  if (!isAssetRef(image)) return;
  await deleteAsset(resolveAssetKey(image));
}

async function resolveMusicCoverSource(track) {
  const cover = (track?.cover || "").trim();
  if (!cover) return "";
  if (isAssetRef(cover)) return readAssetByRef(cover).catch(() => "");

  const cachedCover = await readAssetByRef(getMusicCoverAssetRef(track)).catch(() => "");
  return cachedCover || cover;
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(typeof reader.result === "string" ? reader.result : ""));
    reader.addEventListener("error", () => resolve(""));
    reader.readAsDataURL(blob);
  });
}

async function cacheMusicCoverAsset(track) {
  const cover = (track?.cover || "").trim();
  const assetRefValue = getMusicCoverAssetRef(track);
  if (!assetRefValue || !cover || isAssetRef(cover) || isDataUrl(cover)) return;

  try {
    const response = await fetch(cover, { cache: "force-cache", mode: "cors" });
    if (!response.ok) return;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return;
    const dataUrl = await blobToDataUrl(await response.blob());
    if (dataUrl) {
      await writeAsset(resolveAssetKey(assetRefValue), dataUrl);
      if (track && typeof track === "object") track.cover = assetRefValue;
    }
  } catch {
    // 忽略跨域或网络错误，保留远程封面直链兜底。
  }
}



function getDefaultAppearance() {
  return isMobileViewport() ? mobileDefaultAppearance : defaultAppearance;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 680px), (pointer: coarse)").matches;
}

function getDefaultBackground() {
  return isMobileViewport() ? mobileDefaultBackground : defaultBackground;
}

function readJsonStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readBoolStorage(key, fallback) {
  const value = localStorage.getItem(key);
  return value === null ? fallback : value === "true";
}

function createCustomEngineId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeSearchTemplate(value) {
  const template = value.trim();
  if (!template || !/^https?:\/\//i.test(template) || !template.includes("%s")) return "";
  return template;
}

function loadCustomSearchEngines() {
  customSearchEngines = readJsonStorage(storageKeys.customSearchEngines, [])
    .filter((engine) => engine && typeof engine === "object")
    .map((engine) => ({
      id: String(engine.id || createCustomEngineId()),
      label: String(engine.label || engine.name || "").trim().slice(0, 18),
      url: normalizeSearchTemplate(String(engine.url || ""))
    }))
    .filter((engine) => engine.label && engine.url);

  for (const key of Object.keys(engines)) {
    if (key.startsWith("custom-")) delete engines[key];
  }

  customSearchEngines.forEach((engine, index) => {
    engines[engine.id] = {
      label: engine.label.toUpperCase(),
      marker: engine.label.slice(0, 1).toUpperCase() || "搜",
      color: `linear-gradient(135deg, ${shortcutColors[index % shortcutColors.length]}, #f0dcff)`,
      url: engine.url,
      custom: true
    };
  });
}

function saveCustomSearchEngines() {
  saveJsonStorage(storageKeys.customSearchEngines, customSearchEngines);
  syncConfigFromLegacyStorage();
}

function readSearchSettings() {
  return {
    suggestions: readBoolStorage(storageKeys.searchSuggestions, true),
    historyEnabled: readBoolStorage(storageKeys.searchHistoryEnabled, true)
  };
}

function saveSearchSettings() {
  localStorage.setItem(storageKeys.searchSuggestions, String(searchSettings.suggestions));
  localStorage.setItem(storageKeys.searchHistoryEnabled, String(searchSettings.historyEnabled));
  syncConfigFromLegacyStorage();
}

function readSearchHistory() {
  return readJsonStorage(storageKeys.searchHistory, [])
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function saveSearchHistory() {
  saveJsonStorage(storageKeys.searchHistory, searchHistory.slice(0, 30));
}

function rememberSearchQuery(query) {
  const value = query.trim();
  if (!value || !searchSettings.historyEnabled) return;
  searchHistory = [value, ...searchHistory.filter((item) => item !== value)].slice(0, 30);
  saveSearchHistory();
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}



function readPerformanceSettings() {
  const readBool = (key, fallback) => {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  };
  return {
    lowPower: readBool(storageKeys.perfLowPower, false),
    meteors: readBool(storageKeys.perfMeteors, true),
    clickEffects: readBool(storageKeys.perfClickEffects, true),
    petMotion: readBool(storageKeys.perfPetMotion, true),
    lyrics: readBool(storageKeys.perfLyrics, true)
  };
}

function isLowPowerMode() {
  return performanceSettings.lowPower;
}

function areMeteorsEnabled() {
  return performanceSettings.meteors && !isLowPowerMode();
}

function areClickEffectsEnabled() {
  return performanceSettings.clickEffects && !isLowPowerMode();
}

function isPetMotionEnabled() {
  return performanceSettings.petMotion && !isLowPowerMode();
}

function areLyricsEnabled() {
  return performanceSettings.lyrics && !isLowPowerMode();
}

function savePerformanceSettings() {
  localStorage.setItem(storageKeys.perfLowPower, String(performanceSettings.lowPower));
  localStorage.setItem(storageKeys.perfMeteors, String(performanceSettings.meteors));
  localStorage.setItem(storageKeys.perfClickEffects, String(performanceSettings.clickEffects));
  localStorage.setItem(storageKeys.perfPetMotion, String(performanceSettings.petMotion));
  localStorage.setItem(storageKeys.perfLyrics, String(performanceSettings.lyrics));
  syncConfigFromLegacyStorage();
}

function readUiSettings() {
  return {
    interactions: readBoolStorage(storageKeys.uiInteractions, true)
  };
}

function saveUiSettings() {
  localStorage.setItem(storageKeys.uiInteractions, String(uiSettings.interactions));
  syncConfigFromLegacyStorage();
}

function applyUiSettings() {
  const root = document.documentElement;
  const enabled = uiSettings.interactions;
  root.classList.toggle("ui-interactions-enabled", enabled);
  root.style.setProperty("--ui-duration-fast", enabled ? "140ms" : "0ms");
  root.style.setProperty("--ui-duration-mid", enabled ? "220ms" : "0ms");
  root.style.setProperty("--ui-hover-scale", enabled ? "1.015" : "1");
  root.style.setProperty("--ui-press-scale", enabled ? "0.97" : "1");
  root.style.setProperty("--ui-lift", enabled ? "-2px" : "0px");
  if (!enabled) {
    root.classList.remove("search-focused");
    for (const item of document.querySelectorAll(".is-pressing")) {
      item.classList.remove("is-pressing");
    }
  }
}

function initializeInteractionFeedback() {
  const selector = [
    ".icon-button",
    ".text-button",
    ".dark-button",
    ".round-close",
    ".search-submit",
    ".engine-button",
    ".engine-option",
    ".suggestion-item",
    ".shortcut",
    ".shortcut-page-button",
    ".wallpaper-option",
    ".playlist-track",
    ".music-controls button",
    ".music-collapse",
    ".settings-tab"
  ].join(",");

  document.addEventListener("pointerdown", (event) => {
    if (!uiSettings.interactions) return;
    const target = event.target.closest(selector);
    if (!target || target.classList.contains("pet-sprite")) return;
    target.classList.add("is-pressing");
  }, true);

  const clearPressState = () => {
    for (const item of document.querySelectorAll(".is-pressing")) {
      item.classList.remove("is-pressing");
    }
  };

  document.addEventListener("pointerup", clearPressState, true);
  document.addEventListener("pointercancel", clearPressState, true);
  document.addEventListener("dragstart", clearPressState, true);
}

function initializeClockInteraction() {
  if (!clockPanel) return;

  clockPanel.addEventListener("pointermove", (event) => {
    if (!uiSettings.interactions) return;
    const rect = clockPanel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    clockPanel.style.setProperty("--clock-tilt-x", `${(-y * 8).toFixed(2)}deg`);
    clockPanel.style.setProperty("--clock-tilt-y", `${(x * 10).toFixed(2)}deg`);
  });

  const resetClockTilt = () => {
    clockPanel.style.setProperty("--clock-tilt-x", "3deg");
    clockPanel.style.setProperty("--clock-tilt-y", "-4deg");
  };

  clockPanel.addEventListener("pointerleave", resetClockTilt);
  clockPanel.addEventListener("pointercancel", resetClockTilt);
}

function syncPerformanceToggles() {
  perfLowPowerToggle.checked = performanceSettings.lowPower;
  perfMeteorsToggle.checked = performanceSettings.meteors;
  perfClickEffectsToggle.checked = performanceSettings.clickEffects;
  perfPetMotionToggle.checked = performanceSettings.petMotion;
  perfLyricsToggle.checked = performanceSettings.lyrics;

  for (const toggle of [perfMeteorsToggle, perfClickEffectsToggle, perfPetMotionToggle, perfLyricsToggle]) {
    toggle.disabled = performanceSettings.lowPower;
    toggle.closest(".setting-line")?.classList.toggle("is-disabled", performanceSettings.lowPower);
  }
}

function applyPerformanceSettings() {
  document.documentElement.classList.toggle("perf-low-power", isLowPowerMode());
  document.documentElement.classList.toggle("perf-no-meteors", !areMeteorsEnabled());
  document.documentElement.classList.toggle("perf-no-click-effects", !areClickEffectsEnabled());
  document.documentElement.classList.toggle("perf-no-pet-motion", !isPetMotionEnabled());
  document.documentElement.classList.toggle("perf-no-lyrics", !areLyricsEnabled());

  updateEffectsPerformanceSettings({
    lowPower: performanceSettings.lowPower,
    meteors: performanceSettings.meteors,
    clickEffects: performanceSettings.clickEffects
  });

  updatePetPerformanceSettings({
    lowPower: performanceSettings.lowPower,
    petMotion: performanceSettings.petMotion
  });

  if (!areLyricsEnabled()) clearFloatingLyricNodes();
  syncPerformanceToggles();
}

function updatePerformanceSetting(key, value) {
  performanceSettings = { ...performanceSettings, [key]: value };
  savePerformanceSettings();
  applyPerformanceSettings();
}

async function loadSettings() {
  migrateLegacyConfig();
  const wallpaperLoad = loadBuiltInWallpapers();
  const savedEngine = localStorage.getItem(storageKeys.engine);
  const savedClock = localStorage.getItem(storageKeys.showClock);
  const savedAddShortcut = localStorage.getItem(storageKeys.showAddShortcut);
  const savedClouds = localStorage.getItem(storageKeys.showClouds);
  const savedBottomSpectrum = localStorage.getItem(storageKeys.showBottomSpectrum);
  const savedSearchNewTab = localStorage.getItem(storageKeys.openSearchInNewTab);
  const savedBackground = localStorage.getItem(storageKeys.background);
  const savedShortcuts = localStorage.getItem(storageKeys.shortcuts);
  const savedAppearance = localStorage.getItem(storageKeys.appearance);
  const savedMusicUrl = localStorage.getItem(storageKeys.musicUrl);
  const savedMetingApiUrl = localStorage.getItem(storageKeys.metingApiUrl) || defaultMetingApiUrl;

  loadCustomSearchEngines();
  searchSettings = readSearchSettings();
  searchHistory = readSearchHistory();
  searchSuggestToggle.checked = searchSettings.suggestions;
  searchHistoryToggle.checked = searchSettings.historyEnabled;
  renderCustomSearchEngines();
  const savedShortcutsArr = savedShortcuts ? JSON.parse(savedShortcuts) : defaultShortcuts;
  setShortcuts(savedShortcutsArr);

  performanceSettings = readPerformanceSettings();
  uiSettings = readUiSettings();
  if (uiInteractionsToggle) uiInteractionsToggle.checked = uiSettings.interactions;
  syncPerformanceToggles();
  applyUiSettings();
  selectedEngine = savedEngine && engines[savedEngine] ? savedEngine : "google";

  const showClock = savedClock !== "false";
  const showAddShortcut = savedAddShortcut ? savedAddShortcut !== "false" : true;
  const showClouds = savedClouds !== "false";
  const showBottomSpectrum = savedBottomSpectrum !== "false";
  const savedShowMusic = localStorage.getItem(storageKeys.showMusic);
  const showMusic = savedShowMusic === null ? false : savedShowMusic === "true";
  const openSearchInNewTab = savedSearchNewTab ? savedSearchNewTab === "true" : true;
  clockToggle.checked = showClock;
  addShortcutToggle.checked = showAddShortcut;
  cloudToggle.checked = showClouds;
  bottomSpectrumToggle.checked = showBottomSpectrum;
  // Music visibility preference
  if (musicPlayer) musicPlayer.classList.toggle("is-hidden", !showMusic);
  document.documentElement.classList.toggle("prefers-music-hidden", !showMusic);
  searchNewTabToggle.checked = openSearchInNewTab;
  document.documentElement.classList.toggle("prefers-clock-hidden", !showClock);
  document.documentElement.classList.toggle("prefers-shortcuts-hidden", !showAddShortcut);
  document.documentElement.classList.toggle("prefers-clouds-hidden", !showClouds);
  document.documentElement.classList.toggle("prefers-bottom-spectrum-hidden", !showBottomSpectrum);
  clockPanel.classList.toggle("is-hidden", !showClock);
  shortcutRow.classList.toggle("is-hidden", !showAddShortcut);
  pixelGround.classList.toggle("is-hidden", !showClouds);
  setBottomSpectrumVisibility(showBottomSpectrum);

  if (savedBackground) {
    if (savedBackground === backgroundIndexedRef) {
      const storedBackground = await readAsset(backgroundAssetKey);
      if (storedBackground) setBackground(storedBackground);
    } else {
      setBackground(savedBackground);
      backgroundUrl.value = savedBackground.startsWith("data:") ? "" : savedBackground;
    }
  } else {
    setBackground(getDefaultBackground());
  }

  if (savedMusicUrl) {
    musicUrl.value = savedMusicUrl;
    applyMusicSource(savedMusicUrl, { revealPlayer: showMusic });
  }

  metingApiUrl.value = savedMetingApiUrl;

  let appearance = getDefaultAppearance();
  if (savedAppearance) {
    try {
      appearance = { ...appearance, ...JSON.parse(savedAppearance) };
    } catch {
      appearance = getDefaultAppearance();
    }
  }
  applyAppearance(appearance);

  buildEngineMenu();
  renderEngine();

  initShortcuts({
    shortcutRow,
    addShortcutButton,
    shortcutPager,
    shortcutMenu,
    shortcutDialog,
    shortcutForm,
    shortcutUrl,
    shortcutName,
    shortcutIconText,
    shortcutKey,
    colorSwatches,
    textIconPreview,
    uploadIconPreview,
    saveShortcutButton,
    saveMoreShortcutButton,
    closeShortcutDialogButton,
    shortcutDialogTitle,
    shortcutRowsInput,
    shortcutColumnsInput,
    shortcutPagingToggle,
    cancelShortcutButton: document.querySelector("#cancelShortcutButton"),
    clearShortcutKeyButton: document.querySelector("#clearShortcutKeyButton"),
    fetchIconButton: document.querySelector("#fetchIconButton"),
    iconUpload: document.querySelector("#iconUpload")
  });
  renderShortcuts();
  initBackground({
    applyUrlButton,
    resetBackgroundButton,
    getDefaultBackgroundCallback: getDefaultBackground
  });
  loadBuiltInWallpapers().then(() => {
    renderWallpapers();
  });
  buildAlbumSpectrum(albumSpectrum);
  buildSpectrum(bottomSpectrum, 64);
  buildMusicNotes(musicNoteLayer, 12, 8, 92);
  buildMusicNotes(bottomNotes, 28, 8, 104);
  updateMusicProgress();
  loadMetingPlaylist(savedMetingApiUrl, { silent: true, revealPlayer: showMusic });
  initPet();
  initEffects({
    musicCheckCallback: isMusicActivelyPlaying
  });
  applyPerformanceSettings();
  syncConfigFromLegacyStorage();
}

function applyAppearance(settings) {
  const fallback = getDefaultAppearance();
  const rootStyle = document.documentElement.style;

  // On mobile, prefer mobile-friendly positions for clock/search while keeping other user settings.
  const effective = { ...settings };
  if (isMobileViewport()) {
    effective.timeX = mobileDefaultAppearance.timeX;
    effective.timeY = mobileDefaultAppearance.timeY;
    effective.searchX = mobileDefaultAppearance.searchX;
    effective.searchY = mobileDefaultAppearance.searchY;
  }

  rootStyle.setProperty("--shortcut-opacity", String(effective.iconOpacity / 100));
  rootStyle.setProperty("--shortcut-scale", String(effective.iconScale / 100));
  rootStyle.setProperty("--clock-opacity", String(effective.timeOpacity / 100));
  rootStyle.setProperty("--clock-scale", String(effective.timeScale / 100));
  rootStyle.setProperty("--clock-x", `${effective.timeX}vw`);
  rootStyle.setProperty("--clock-y", `${effective.timeY * 0.45}vh`);
  rootStyle.setProperty("--search-opacity", String(effective.searchOpacity / 100));
  rootStyle.setProperty("--search-scale", String(effective.searchScale / 100));
  rootStyle.setProperty("--dust-opacity", String((effective.dustOverlayStrength / 100) * 0.88));
  rootStyle.setProperty("--page-bg-blur", `${effective.backgroundBlur ?? fallback.backgroundBlur}px`);
  rootStyle.setProperty("--page-bg-scale", String(1.018 + ((effective.backgroundBlur ?? fallback.backgroundBlur) / 360)));
  rootStyle.setProperty("--search-x", `${effective.searchX}vw`);
  rootStyle.setProperty("--search-y", `${effective.searchY * 0.45}vh`);

  for (const [key, input] of Object.entries(appearanceInputs)) {
    // Keep settings panel inputs in sync with the stored settings (not overridden mobile-only preview)
    input.value = settings[key] ?? fallback[key];
    updateRangeVisual(input);
  }
}

function updateRangeVisual(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || 0);
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.setProperty("--range-progress", `${Math.min(100, Math.max(0, progress))}%`);
}

function readAppearanceInputs() {
  return Object.fromEntries(
    Object.entries(appearanceInputs).map(([key, input]) => [key, Number(input.value)])
  );
}

function saveAppearance() {
  for (const input of Object.values(appearanceInputs)) updateRangeVisual(input);
  const settings = readAppearanceInputs();
  applyAppearance(settings);
  localStorage.setItem(storageKeys.appearance, JSON.stringify(settings));
  syncConfigFromLegacyStorage();
}

function resetAppearanceToDeviceDefault() {
  localStorage.removeItem(storageKeys.appearance);
  const settings = getDefaultAppearance();
  applyAppearance(settings);
  syncConfigFromLegacyStorage();
}

function setBottomSpectrumVisibility(isVisible) {
  document.documentElement.classList.toggle("prefers-bottom-spectrum-hidden", !isVisible);
  bottomSpectrum.classList.toggle("is-hidden", !isVisible);
}









async function exportConfig() {
  const snapshot = await buildConfigSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pixel-new-tab-config-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importConfig(file) {
  if (!file) return;
  const text = await file.text();
  const snapshot = JSON.parse(text);
  await importConfigSnapshot(snapshot);
  window.location.reload();
}

function getDayPeriodLabel(hours) {
  if (hours < 5) return "凌晨";
  if (hours < 11) return "上午";
  if (hours < 13) return "中午";
  if (hours < 18) return "下午";
  return "晚上";
}

function numberToChineseDay(day) {
  const value = Number(day);
  if (!Number.isInteger(value) || value < 1 || value > 30) return day;
  const digits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (value <= 10) return value === 10 ? "十" : digits[value];
  if (value < 20) return `十${digits[value - 10]}`;
  if (value === 20) return "二十";
  if (value < 30) return `二十${digits[value - 20]}`;
  return "三十";
}

function formatLunarDate(date) {
  try {
    return new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      month: "long",
      day: "numeric"
    }).format(date).replace(/^闰?/, "").replace(/(\d{1,2})日$/, (_, day) => `${numberToChineseDay(day)}日`);
  } catch {
    return "";
  }
}

function renderPixelTime({ main, seconds, period, full }) {
  timeText.innerHTML = `
    <span class="time-main">${main}</span>
    <span class="time-side" aria-hidden="true">
      <span class="time-seconds">${seconds}</span>
      <span class="time-period">${period}</span>
    </span>
  `;
  timeText.setAttribute("aria-label", full);
}

function updateClock() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === "hour")?.value || "00";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";
  const second = parts.find((part) => part.type === "second")?.value || "00";
  const date = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(now);
  const lunarDate = formatLunarDate(now);
  const mainTime = `${hour}:${minute}`;
  const fullTime = `${mainTime}:${second}`;

  renderPixelTime({
    main: mainTime,
    seconds: second,
    period: getDayPeriodLabel(Number(hour)),
    full: fullTime
  });
  dateText.textContent = lunarDate ? `${date} ${lunarDate}` : date;
}

function buildEngineMenu() {
  loadCustomSearchEngines();
  engineMenu.innerHTML = "";
  for (const [key, engine] of Object.entries(engines)) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "engine-option";
    option.dataset.engine = key;
    option.setAttribute("role", "option");
    option.innerHTML = `<span class="engine-dot" style="background: ${engine.color}">${engine.marker}</span><span>${engine.label}</span>`;
    option.addEventListener("click", () => {
      selectedEngine = key;
      localStorage.setItem(storageKeys.engine, selectedEngine);
      syncConfigFromLegacyStorage();
      enginePicker.classList.remove("is-open");
      engineButton.setAttribute("aria-expanded", "false");
      renderEngine();
      searchInput.focus();
    });
    engineMenu.append(option);
  }
}

function renderEngine() {
  if (!engines[selectedEngine]) selectedEngine = "google";
  const engine = engines[selectedEngine];
  engineDot.textContent = engine.marker;
  engineDot.style.background = engine.color;

  for (const option of engineMenu.querySelectorAll(".engine-option")) {
    option.setAttribute("aria-selected", String(option.dataset.engine === selectedEngine));
  }
}


function buildSearchUrl(query) {
  const engine = engines[selectedEngine] || engines.google;
  const encoded = encodeURIComponent(query);
  return engine.url.includes("%s") ? engine.url.replaceAll("%s", encoded) : `${engine.url}${encoded}`;
}

function renderCustomSearchEngines() {
  customEngineList.innerHTML = "";
  if (!customSearchEngines.length) {
    const empty = document.createElement("small");
    empty.textContent = "还没有自定义搜索引擎。";
    customEngineList.append(empty);
    return;
  }

  for (const engine of customSearchEngines) {
    const item = document.createElement("div");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    const url = document.createElement("small");
    const remove = document.createElement("button");
    item.className = "custom-engine-item";
    title.textContent = engine.label;
    url.textContent = engine.url;
    remove.type = "button";
    remove.className = "text-button ghost";
    remove.textContent = "删除";
    remove.addEventListener("click", () => {
      customSearchEngines = customSearchEngines.filter((itemEngine) => itemEngine.id !== engine.id);
      if (selectedEngine === engine.id) {
        selectedEngine = "google";
        localStorage.setItem(storageKeys.engine, selectedEngine);
      }
      saveCustomSearchEngines();
      loadCustomSearchEngines();
      buildEngineMenu();
      renderEngine();
      renderCustomSearchEngines();
    });
    copy.append(title, url);
    item.append(copy, remove);
    customEngineList.append(item);
  }
}

function closeSearchSuggestions() {
  searchSuggestions = [];
  activeSuggestionIndex = -1;
  searchSuggestionsPanel.classList.remove("is-open");
  searchSuggestionsPanel.innerHTML = "";
}

function renderSearchSuggestions(items) {
  searchSuggestions = items.slice(0, 8);
  activeSuggestionIndex = -1;
  searchSuggestionsPanel.innerHTML = "";

  if (!searchSuggestions.length) {
    closeSearchSuggestions();
    return;
  }

  let hasHistory = false;

  searchSuggestions.forEach((item, index) => {
    const button = document.createElement("button");
    const icon = document.createElement("span");
    const text = document.createElement("span");
    const source = document.createElement("small");
    button.type = "button";
    button.className = "suggestion-item";
    button.setAttribute("role", "option");
    button.dataset.index = String(index);
    icon.textContent = item.source === "history" ? "↺" : "⌕";
    text.textContent = item.text;
    source.textContent = item.source === "history" ? "历史" : "建议";
    
    if (item.source === "history") {
      hasHistory = true;
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "suggestion-delete";
      deleteBtn.innerHTML = "×";
      deleteBtn.title = "删除此记录";
      deleteBtn.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        event.preventDefault();
        searchHistory = searchHistory.filter(h => h !== item.text);
        saveSearchHistory();
        updateSearchSuggestions();
      });
      button.append(icon, text, source, deleteBtn);
    } else {
      button.append(icon, text, source);
    }
    
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      applySearchSuggestion(index, true);
    });
    searchSuggestionsPanel.append(button);
  });

  if (hasHistory) {
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "suggestion-clear-all";
    clearBtn.textContent = "清空历史记录";
    clearBtn.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      event.preventDefault();
      searchHistory = [];
      saveSearchHistory();
      updateSearchSuggestions();
    });
    searchSuggestionsPanel.append(clearBtn);
  }

  searchSuggestionsPanel.classList.add("is-open");
}

function updateActiveSuggestion(nextIndex) {
  if (!searchSuggestions.length) return;
  activeSuggestionIndex = (nextIndex + searchSuggestions.length) % searchSuggestions.length;
  for (const button of searchSuggestionsPanel.querySelectorAll(".suggestion-item")) {
    button.classList.toggle("is-active", Number(button.dataset.index) === activeSuggestionIndex);
  }
  searchInput.value = searchSuggestions[activeSuggestionIndex].text;
}

function applySearchSuggestion(index, shouldSubmit = false) {
  const item = searchSuggestions[index];
  if (!item) return;
  searchInput.value = item.text;
  closeSearchSuggestions();
  if (shouldSubmit) searchForm.requestSubmit();
}

async function fetchRemoteSuggestions(query, requestId) {
  if (!query || !searchSettings.suggestions) return [];
  try {
    const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`, { cache: "no-store" });
    if (!response.ok || requestId !== searchSuggestRequestId) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map((item) => item.phrase || item.text || "").filter(Boolean);
  } catch {
    return [];
  }
}

function updateSearchSuggestions() {
  window.clearTimeout(searchSuggestTimer);
  const query = searchInput.value.trim();
  if (!query || !searchSettings.suggestions) {
    closeSearchSuggestions();
    return;
  }

  const localItems = searchHistory
    .filter((item) => item.includes(query))
    .slice(0, 5)
    .map((text) => ({ text, source: "history" }));
  renderSearchSuggestions(localItems);

  const requestId = ++searchSuggestRequestId;
  searchSuggestTimer = window.setTimeout(async () => {
    const remote = await fetchRemoteSuggestions(query, requestId);
    if (requestId !== searchSuggestRequestId) return;
    const merged = [...localItems];
    for (const text of remote) {
      if (!merged.some((item) => item.text === text)) merged.push({ text, source: "remote" });
      if (merged.length >= 8) break;
    }
    renderSearchSuggestions(merged);
  }, 220);
}



searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }

  rememberSearchQuery(query);
  closeSearchSuggestions();
  const searchUrl = buildSearchUrl(query);
  if (searchNewTabToggle.checked) {
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = searchUrl;
  }
});

engineButton.addEventListener("click", () => {
  const isOpen = enginePicker.classList.toggle("is-open");
  engineButton.setAttribute("aria-expanded", String(isOpen));
});

searchInput.addEventListener("input", updateSearchSuggestions);

searchInput.addEventListener("focus", updateSearchSuggestions);

searchForm.addEventListener("focusin", () => {
  if (uiSettings.interactions) document.documentElement.classList.add("search-focused");
});

searchForm.addEventListener("focusout", () => {
  window.setTimeout(() => {
    if (!searchForm.contains(document.activeElement)) {
      document.documentElement.classList.remove("search-focused");
    }
  }, 0);
});

searchInput.addEventListener("keydown", (event) => {
  if (!searchSuggestions.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    updateActiveSuggestion(activeSuggestionIndex + 1);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    updateActiveSuggestion(activeSuggestionIndex - 1);
  }
  if (event.key === "Escape") {
    closeSearchSuggestions();
  }
  if (event.key === "Enter" && activeSuggestionIndex >= 0) {
    event.preventDefault();
    applySearchSuggestion(activeSuggestionIndex, true);
  }
});

document.addEventListener("click", (event) => {

  if (!enginePicker.contains(event.target)) {
    enginePicker.classList.remove("is-open");
    engineButton.setAttribute("aria-expanded", "false");
  }
  if (!searchForm.contains(event.target)) closeSearchSuggestions();
});

settingsButton.addEventListener("click", () => {
  settingsDialog.showModal();
});

settingsDialog.addEventListener("click", (event) => {
  if (event.target === settingsDialog) settingsDialog.close();
});

for (const tab of settingsTabs) {
  tab.addEventListener("click", () => {
    const target = tab.dataset.settingsTab;
    for (const item of settingsTabs) {
      item.classList.toggle("is-active", item === tab);
    }
    for (const panel of settingsPanels) {
      panel.classList.toggle("is-active", panel.dataset.settingsPanel === target);
    }
  });
}

clockToggle.addEventListener("change", () => {
  const showClock = clockToggle.checked;
  localStorage.setItem(storageKeys.showClock, String(showClock));
  syncConfigFromLegacyStorage();
  document.documentElement.classList.toggle("prefers-clock-hidden", !showClock);
  clockPanel.classList.toggle("is-hidden", !showClock);
});

addShortcutToggle.addEventListener("change", () => {
  const showAddShortcut = addShortcutToggle.checked;
  localStorage.setItem(storageKeys.showAddShortcut, String(showAddShortcut));
  syncConfigFromLegacyStorage();
  document.documentElement.classList.toggle("prefers-shortcuts-hidden", !showAddShortcut);
  shortcutRow.classList.toggle("is-hidden", !showAddShortcut);
  renderShortcuts();
});

cloudToggle.addEventListener("change", () => {
  const showClouds = cloudToggle.checked;
  localStorage.setItem(storageKeys.showClouds, String(showClouds));
  syncConfigFromLegacyStorage();
  document.documentElement.classList.toggle("prefers-clouds-hidden", !showClouds);
  pixelGround.classList.toggle("is-hidden", !showClouds);
});

bottomSpectrumToggle.addEventListener("change", () => {
  const showBottomSpectrum = bottomSpectrumToggle.checked;
  localStorage.setItem(storageKeys.showBottomSpectrum, String(showBottomSpectrum));
  syncConfigFromLegacyStorage();
  setBottomSpectrumVisibility(showBottomSpectrum);
});

searchNewTabToggle.addEventListener("change", () => {
  localStorage.setItem(storageKeys.openSearchInNewTab, String(searchNewTabToggle.checked));
  syncConfigFromLegacyStorage();
});

searchSuggestToggle.addEventListener("change", () => {
  searchSettings.suggestions = searchSuggestToggle.checked;
  saveSearchSettings();
  updateSearchSuggestions();
});

searchHistoryToggle.addEventListener("change", () => {
  searchSettings.historyEnabled = searchHistoryToggle.checked;
  saveSearchSettings();
  if (!searchSettings.historyEnabled) closeSearchSuggestions();
});

clearSearchHistoryButton.addEventListener("click", () => {
  searchHistory = [];
  saveSearchHistory();
  closeSearchSuggestions();
});

addCustomEngineButton.addEventListener("click", () => {
  const label = customEngineName.value.trim();
  const url = normalizeSearchTemplate(customEngineUrl.value);
  if (!label || !url) {
    customEngineUrl.setCustomValidity(url ? "" : "请输入包含 %s 的有效 http/https 搜索 URL");
    customEngineUrl.reportValidity();
    return;
  }
  customEngineUrl.setCustomValidity("");
  customSearchEngines.push({ id: createCustomEngineId(), label, url });
  customEngineName.value = "";
  customEngineUrl.value = "";
  saveCustomSearchEngines();
  loadCustomSearchEngines();
  buildEngineMenu();
  renderEngine();
  renderCustomSearchEngines();
});

perfLowPowerToggle.addEventListener("change", () => {
  updatePerformanceSetting("lowPower", perfLowPowerToggle.checked);
});

perfMeteorsToggle.addEventListener("change", () => {
  updatePerformanceSetting("meteors", perfMeteorsToggle.checked);
});

perfClickEffectsToggle.addEventListener("change", () => {
  updatePerformanceSetting("clickEffects", perfClickEffectsToggle.checked);
});

perfPetMotionToggle.addEventListener("change", () => {
  updatePerformanceSetting("petMotion", perfPetMotionToggle.checked);
});

perfLyricsToggle.addEventListener("change", () => {
  updatePerformanceSetting("lyrics", perfLyricsToggle.checked);
});

if (uiInteractionsToggle) {
  uiInteractionsToggle.addEventListener("change", () => {
    uiSettings.interactions = uiInteractionsToggle.checked;
    saveUiSettings();
    applyUiSettings();
  });
}

if (resetAppearanceButton) {
  resetAppearanceButton.addEventListener("click", resetAppearanceToDeviceDefault);
}

exportConfigButton.addEventListener("click", () => {
  exportConfig().catch((error) => {
    console.error(error);
    alert("导出配置失败。");
  });
});

importConfigButton.addEventListener("click", () => {
  importConfigFile.click();
});

importConfigFile.addEventListener("change", () => {
  const file = importConfigFile.files?.[0];
  importConfig(file).catch((error) => {
    console.error(error);
    alert(error.message || "导入配置失败。");
  });
});

  initMusic({
    applyMusicButton,
    loadPlaylistButton,
    musicFile,
    musicCollapseButton,
    musicPlayButton,
    musicPrevButton,
    musicNextButton,
    neteaseButton,
    musicProgressBar,
    musicAudio,
    musicPlayer,
    musicUrl,
    metingApiUrl,
    trackTitle,
    trackSubtitle,
    trackCover,
    musicCurrentTime,
    musicDuration,
    playlistPanel,
    floatingLyrics
  }, {
    areLyricsEnabledCallback: areLyricsEnabled
  });



for (const input of Object.values(appearanceInputs)) {
  input.addEventListener("input", () => {
    updateRangeVisual(input);
    saveAppearance();
  });
}

document.addEventListener("click", handleDocumentClickForShortcuts);
document.addEventListener("keydown", handleDocumentKeydownForShortcuts);
window.addEventListener("resize", () => {
  handlePetResize();
  renderShortcuts();
  // Re-apply appearance to honor mobile/desktop overrides when crossing breakpoints
  try {
    const savedAppearanceRaw = localStorage.getItem(storageKeys.appearance);
    const appearance = savedAppearanceRaw ? { ...getDefaultAppearance(), ...JSON.parse(savedAppearanceRaw) } : getDefaultAppearance();
    applyAppearance(appearance);
  } catch {}
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopMeteorAnimation();
    clearFloatingLyricNodes();
    syncLyricCursorToCurrentTime();
    return;
  }

  clearFloatingLyricNodes();
  syncLyricCursorToCurrentTime();

  if (isMusicActivelyPlaying()) {
    updateMusicProgress();
  } else {
    startMeteorAnimation();
  }
});

performanceSettings = readPerformanceSettings();
uiSettings = readUiSettings();
syncPerformanceToggles();
applyUiSettings();
initializeInteractionFeedback();
initializeClockInteraction();
loadSettings();
updateClock();
setInterval(updateClock, 1000);
startMeteorAnimation();
