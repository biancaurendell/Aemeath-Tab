const {
  buildConfigSnapshot,
  defaultAppearance,
  defaultMetingApiUrl,
  defaultShortcuts,
  importConfigSnapshot,
  migrateLegacyConfig,
  mobileDefaultAppearance,
  storageKeys,
  syncConfigFromLegacyStorage
} = window.PixelNewTabSettings;

const {
  assetKeys,
  assetRef,
  backgroundIndexedRef,
  deleteAsset,
  isAssetRef,
  readAssetByRef,
  readAsset,
  resolveAssetKey,
  writeAsset
} = window.PixelNewTabStorage;

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
const engineName = document.querySelector("#engineName");
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
const clickEffectLayer = document.createElement("div");
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
const canvas = document.querySelector("#meteorCanvas");
const ctx = canvas.getContext("2d");

clickEffectLayer.className = "click-effect-layer";
document.body.append(clickEffectLayer);

let selectedEngine = "google";
let selectedShortcutColor = shortcutColors[0];
let uploadedIcon = "";
let editingShortcutId = "";
let editingShortcutIconAssetRef = "";
let activeShortcutId = "";
let shortcuts = [];
let shortcutPage = 0;
let draggedShortcutId = "";
let shortcutLayout = {
  rows: 1,
  columns: 5,
  paging: true
};
let meteors = [];
let stars = [];
let nextMeteorAt = 0;
let lastTime = performance.now();
let meteorAnimationId = 0;
let lastMeteorPaintAt = 0;
let petX = Math.round(window.innerWidth * 0.42);
let petY = Math.round(window.innerHeight * 0.67);
let petTarget = null;
let petAnimationId = 0;
let petLastMoveAt = 0;
let petIdleTimer = 0;
let petReturnTimer = 0;
let petDragging = false;
let petDragOffsetX = 0;
let petDragOffsetY = 0;
let petPointerMoved = false;
let petLastPointerX = 0;
let localMusicObjectUrl = "";
let playlistTracks = [];
let activeTrackIndex = -1;
let isSeekingMusic = false;
let activeLyrics = [];
let activeLyricIndex = -1;
let lyricRequestId = 0;
let lastFloatingLyricAt = 0;
let lastProgressPaintAt = 0;
let lastClickEffectAt = 0;
let activeBackgroundValue = "";
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

const petStates = {
  move: "./assets/pet/move.gif",
  seal: "./assets/pet/seal.gif",
  sigh: "./assets/pet/sigh.gif",
  stare: "./assets/pet/stare.gif",
  excited: "./assets/pet/excited.gif"
};

function getDefaultAppearance() {
  return isMobileViewport() ? mobileDefaultAppearance : defaultAppearance;
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

function readShortcutLayout() {
  return {
    rows: clampNumber(localStorage.getItem(storageKeys.shortcutRows), 1, 3, 1),
    columns: clampNumber(localStorage.getItem(storageKeys.shortcutColumns), 3, 8, 5),
    paging: readBoolStorage(storageKeys.shortcutPaging, true)
  };
}

function saveShortcutLayout() {
  localStorage.setItem(storageKeys.shortcutRows, String(shortcutLayout.rows));
  localStorage.setItem(storageKeys.shortcutColumns, String(shortcutLayout.columns));
  localStorage.setItem(storageKeys.shortcutPaging, String(shortcutLayout.paging));
  syncConfigFromLegacyStorage();
}

function syncShortcutLayoutControls() {
  shortcutRowsInput.value = String(shortcutLayout.rows);
  shortcutColumnsInput.value = String(shortcutLayout.columns);
  shortcutPagingToggle.checked = shortcutLayout.paging;
  updateRangeVisual(shortcutRowsInput);
  updateRangeVisual(shortcutColumnsInput);
}

function getShortcutSlotsPerPage() {
  return Math.max(1, shortcutLayout.rows * getEffectiveShortcutColumns());
}

function getEffectiveShortcutColumns() {
  return isMobileViewport() ? Math.min(shortcutLayout.columns, 4) : shortcutLayout.columns;
}

function getShortcutPageCount() {
  if (!shortcutLayout.paging) return 1;
  return Math.max(1, Math.ceil((shortcuts.length + 1) / getShortcutSlotsPerPage()));
}

function clampShortcutPage() {
  shortcutPage = Math.min(shortcutPage, getShortcutPageCount() - 1);
  shortcutPage = Math.max(0, shortcutPage);
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

  if (areMeteorsEnabled() && !isMusicActivelyPlaying()) {
    startMeteorAnimation();
  } else {
    stopMeteorAnimation();
  }

  if (isPetMotionEnabled()) {
    startPetIdle();
  } else {
    clearPetTimers();
    setPetImage("seal");
  }

  if (!areLyricsEnabled()) clearDynamicLyrics();
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
  shortcutLayout = readShortcutLayout();
  syncShortcutLayoutControls();
  performanceSettings = readPerformanceSettings();
  uiSettings = readUiSettings();
  if (uiInteractionsToggle) uiInteractionsToggle.checked = uiSettings.interactions;
  syncPerformanceToggles();
  applyUiSettings();
  selectedEngine = savedEngine && engines[savedEngine] ? savedEngine : "google";
  shortcuts = savedShortcuts ? JSON.parse(savedShortcuts) : defaultShortcuts;

  const showClock = savedClock !== "false";
  const showAddShortcut = savedAddShortcut ? savedAddShortcut !== "false" : false;
  const showClouds = savedClouds !== "false";
  const showBottomSpectrum = savedBottomSpectrum !== "false";
  const openSearchInNewTab = savedSearchNewTab ? savedSearchNewTab === "true" : true;
  clockToggle.checked = showClock;
  addShortcutToggle.checked = showAddShortcut;
  cloudToggle.checked = showClouds;
  bottomSpectrumToggle.checked = showBottomSpectrum;
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
    applyMusicSource(savedMusicUrl);
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
  renderShortcuts();
  buildColorSwatches();
  await wallpaperLoad;
  if (isBuiltInWallpaper(activeBackgroundValue)) backgroundUrl.value = "";
  renderWallpapers();
  buildAlbumSpectrum();
  buildSpectrum(bottomSpectrum, 64);
  buildMusicNotes(musicNoteLayer, 12, 8, 92);
  buildMusicNotes(bottomNotes, 28, 8, 104);
  updateMusicProgress();
  loadMetingPlaylist(savedMetingApiUrl, { silent: true });
  applyPerformanceSettings();
  syncConfigFromLegacyStorage();
}

function applyAppearance(settings) {
  const fallback = getDefaultAppearance();
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--shortcut-opacity", String(settings.iconOpacity / 100));
  rootStyle.setProperty("--shortcut-scale", String(settings.iconScale / 100));
  rootStyle.setProperty("--clock-opacity", String(settings.timeOpacity / 100));
  rootStyle.setProperty("--clock-scale", String(settings.timeScale / 100));
  rootStyle.setProperty("--clock-x", `${settings.timeX}vw`);
  rootStyle.setProperty("--clock-y", `${settings.timeY * 0.45}vh`);
  rootStyle.setProperty("--search-opacity", String(settings.searchOpacity / 100));
  rootStyle.setProperty("--search-scale", String(settings.searchScale / 100));
  rootStyle.setProperty("--dust-opacity", String((settings.dustOverlayStrength / 100) * 0.88));
  rootStyle.setProperty("--page-bg-blur", `${settings.backgroundBlur ?? fallback.backgroundBlur}px`);
  rootStyle.setProperty("--page-bg-scale", String(1.018 + ((settings.backgroundBlur ?? fallback.backgroundBlur) / 360)));
  rootStyle.setProperty("--search-x", `${settings.searchX}vw`);
  rootStyle.setProperty("--search-y", `${settings.searchY * 0.45}vh`);

  for (const [key, input] of Object.entries(appearanceInputs)) {
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

function buildSpectrum(container, count) {
  container.innerHTML = "";
  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement("i");
    bar.className = "spectrum-bar";
    bar.style.setProperty("--i", index);
    bar.style.setProperty("--level", String(0.22 + Math.random() * 0.86));
    container.append(bar);
  }
}

function buildAlbumSpectrum() {
  albumSpectrum.innerHTML = "";
  for (let index = 0; index < 46; index += 1) {
    const bar = document.createElement("i");
    const leftStackLevel = 1.06 - index * 0.085;
    const tailLevel = 0.14 + Math.random() * 0.08;
    const level = index < 10 ? Math.max(0.26, leftStackLevel) : tailLevel;
    bar.className = "spectrum-bar";
    bar.style.setProperty("--i", index);
    bar.style.setProperty("--level", String(level));
    albumSpectrum.append(bar);
  }
}

function buildMusicNotes(container, count, lower = 0, upper = 100) {
  const marks = ["♪", "♫", "♬", "♩"];
  container.innerHTML = "";
  for (let index = 0; index < count; index += 1) {
    const note = document.createElement("i");
    note.textContent = marks[index % marks.length];
    note.style.setProperty("--x", `${((index * 37) % 96) + 2}%`);
    note.style.setProperty("--y", `${lower + Math.random() * (upper - lower)}px`);
    note.style.setProperty("--size", `${13 + Math.random() * 12}px`);
    note.style.setProperty("--delay", `${-Math.random() * 5.2}s`);
    note.style.setProperty("--dur", `${2.4 + Math.random() * 2.2}s`);
    container.append(note);
  }
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnClickEffect(event) {
  if (!areClickEffectsEnabled()) return;
  if (event.button !== 0 && event.button !== undefined) return;
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
  if (event.target.closest("input, button, select, textarea, label, dialog, .music-player, .shortcut-menu")) return;

  const now = performance.now();
  if (now - lastClickEffectAt < 180) return;
  lastClickEffectAt = now;

  const x = `${event.clientX}px`;
  const y = `${event.clientY}px`;
  const hearts = 3;

  for (let index = 0; index < hearts; index += 1) {
    const heart = document.createElement("img");
    const angle = -135 + index * 28 + randomBetween(-12, 12);
    const distance = randomBetween(28, 88);
    const radians = (angle * Math.PI) / 180;
    heart.src = "./assets/effects/blue-heart.png";
    heart.alt = "";
    heart.className = "click-heart";
    heart.style.setProperty("--click-x", x);
    heart.style.setProperty("--click-y", y);
    heart.style.setProperty("--heart-dx", `${Math.cos(radians) * distance}px`);
    heart.style.setProperty("--heart-dy", `${Math.sin(radians) * distance - randomBetween(8, 34)}px`);
    heart.style.setProperty("--heart-size", `${randomBetween(18, 34)}px`);
    heart.style.setProperty("--heart-scale", String(randomBetween(0.68, 1.18)));
    heart.style.setProperty("--heart-rotate", `${randomBetween(-18, 18)}deg`);
    heart.style.setProperty("--heart-delay", `${index * 26}ms`);
    heart.style.setProperty("--heart-duration", `${randomBetween(820, 1180)}ms`);
    clickEffectLayer.append(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }

  for (let index = 0; index < 1; index += 1) {
    const spark = document.createElement("span");
    const angle = -150 + index * 36 + randomBetween(-10, 10);
    const distance = randomBetween(34, 76);
    const radians = (angle * Math.PI) / 180;
    spark.className = "click-spark";
    spark.style.setProperty("--click-x", x);
    spark.style.setProperty("--click-y", y);
    spark.style.setProperty("--spark-dx", `${Math.cos(radians) * distance}px`);
    spark.style.setProperty("--spark-dy", `${Math.sin(radians) * distance}px`);
    spark.style.setProperty("--spark-angle", `${angle}deg`);
    spark.style.setProperty("--spark-width", `${randomBetween(24, 48)}px`);
    spark.style.setProperty("--spark-delay", `${index * 38}ms`);
    spark.style.setProperty("--spark-duration", `${randomBetween(720, 1060)}ms`);
    clickEffectLayer.append(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}

function setTrackCover(src) {
  const cover = (src || "").trim();
  if (!cover) {
    trackCover.removeAttribute("src");
    return;
  }
  trackCover.src = cover;
}

function clearDynamicLyrics() {
  lyricRequestId += 1;
  activeLyrics = [];
  activeLyricIndex = -1;
  lastFloatingLyricAt = 0;
  floatingLyrics.innerHTML = "";
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 680px), (pointer: coarse)").matches;
}

function isMobileBackgroundPage() {
  return isMobileViewport() && document.hidden;
}

function getLyricText(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(getLyricText).filter(Boolean).join("\n");
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return getLyricText(value.lyric || value.lrc || value.text || value.content || value.data || value.result || value.klyric || "");
  }
  return "";
}

function isUrlLike(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function getTrackId(track) {
  return track.id || track.songId || track.songid || track.song_id || track.mid || "";
}

function buildMetingLyricUrl(track, type = "lyric") {
  const id = getTrackId(track);
  if (!id || !metingApiUrl.value) return "";

  try {
    const url = new URL(metingApiUrl.value);
    url.searchParams.set("type", type);
    url.searchParams.set("id", id);
    return url.toString();
  } catch {
    return "";
  }
}

function getLyricUrls(item) {
  return [
    item.lrcUrl,
    item.lyricUrl,
    item.lyricsUrl,
    item.lrc_url,
    item.lyric_url,
    isUrlLike(item.lrc) ? item.lrc : "",
    isUrlLike(item.lyric) ? item.lyric : "",
    buildMetingLyricUrl(item, "lyric"),
    buildMetingLyricUrl(item, "lrc")
  ].filter((url, index, urls) => url && urls.indexOf(url) === index);
}

function parseLyricTime(minutes, seconds) {
  return Number(minutes) * 60 + Number(seconds);
}

function stripLyricTimestamps(value) {
  return String(value || "")
    .replace(/\[(?:\d{1,2}:)?\d{1,2}(?:\.\d{1,3})?]/g, "")
    .replace(/<(?:\d{1,2}:)?\d{1,2}(?:\.\d{1,3})?>/g, "")
    .trim();
}

function parseLrc(text) {
  const metadataPrefixes = ["\u4f5c\u8bcd", "\u4f5c\u66f2", "\u7f16\u66f2", "\u5236\u4f5c\u4eba", "\u6df7\u97f3", "\u6bcd\u5e26", "\u5f55\u97f3", "OP", "SP", "\u53d1\u884c"];
  return String(text || "")
    .split(/\r?\n/)
    .flatMap((line) => {
      const content = stripLyricTimestamps(line.replace(/\[[^\]]+]/g, ""));
      if (!content || metadataPrefixes.some((prefix) => content.startsWith(prefix))) return [];
      const times = [...line.matchAll(/\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)]/g)];
      return times.map((match) => ({ time: parseLyricTime(match[1], match[2]), text: content }));
    })
    .filter((line) => Number.isFinite(line.time) && line.text)
    .sort((a, b) => a.time - b.time);
}

async function loadTrackLyrics(track, requestId) {
  const inlineLyric = getLyricText(track.lyric || track.lyrics || track.lrc || track.rawLrc);
  if (inlineLyric && !isUrlLike(inlineLyric)) return parseLrc(inlineLyric);

  const lyricUrls = [
    isUrlLike(inlineLyric) ? inlineLyric : "",
    ...(track.lrcUrls || []),
    ...getLyricUrls(track)
  ].filter((url, index, urls) => url && urls.indexOf(url) === index);
  if (!lyricUrls.length) return [];

  for (const lyricUrl of lyricUrls) {
    try {
      const response = await fetch(lyricUrl, { cache: "no-store" });
      if (!response.ok) continue;
      if (requestId !== lyricRequestId) return [];

      const contentType = response.headers.get("content-type") || "";
      const text = contentType.includes("application/json")
        ? getLyricText((await response.json()))
        : await response.text();
      const lines = parseLrc(text);
      if (lines.length) return lines;
    } catch (error) {
      console.warn("Lyric source failed.", lyricUrl, error);
    }
  }

  return [];
}

function spawnFloatingLyric(text) {
  if (!text || document.hidden || isMobileBackgroundPage()) return;
  const maxLyrics = isMobileViewport() ? 4 : 8;
  while (floatingLyrics.children.length >= maxLyrics) {
    floatingLyrics.firstElementChild?.remove();
  }
  const lyric = document.createElement("span");
  lyric.textContent = stripLyricTimestamps(text);
  if (!lyric.textContent) return;
  lyric.style.setProperty("--lyric-x", `${10 + Math.random() * 80}vw`);
  lyric.style.setProperty("--lyric-y", `${12 + Math.random() * 58}vh`);
  lyric.style.setProperty("--lyric-size", `${18 + Math.random() * 18}px`);
  lyric.style.setProperty("--lyric-dur", `${3.2 + Math.random() * 1.8}s`);
  lyric.style.setProperty("--lyric-tilt", `${-4 + Math.random() * 8}deg`);
  floatingLyrics.append(lyric);
  lyric.addEventListener("animationend", () => lyric.remove(), { once: true });
}

function updateDynamicLyric(currentTime) {
  if (!areLyricsEnabled()) return;
  if (document.hidden) return;
  if (musicAudio.paused || !activeLyrics.length || !Number.isFinite(currentTime)) return;

  let nextIndex = Math.max(0, activeLyricIndex);
  while (nextIndex + 1 < activeLyrics.length && currentTime >= activeLyrics[nextIndex + 1].time) {
    nextIndex += 1;
  }
  while (nextIndex > 0 && currentTime < activeLyrics[nextIndex].time) {
    nextIndex -= 1;
  }
  if (currentTime < activeLyrics[nextIndex].time) return;

  if (nextIndex !== activeLyricIndex && currentTime >= activeLyrics[nextIndex].time) {
    activeLyricIndex = nextIndex;
    lastFloatingLyricAt = currentTime;
    if (!isMobileBackgroundPage()) spawnFloatingLyric(activeLyrics[nextIndex].text);
    return;
  }

  if (currentTime - lastFloatingLyricAt > 8) {
    lastFloatingLyricAt = currentTime;
    if (!isMobileBackgroundPage()) {
      spawnFloatingLyric(activeLyrics[activeLyricIndex]?.text || activeLyrics[nextIndex].text);
    }
  }
}

function clearFloatingLyricNodes() {
  floatingLyrics.innerHTML = "";
}

function syncLyricCursorToCurrentTime() {
  if (!activeLyrics.length || !Number.isFinite(musicAudio.currentTime)) {
    activeLyricIndex = -1;
    lastFloatingLyricAt = 0;
    return;
  }
  let index = -1;
  for (let i = 0; i < activeLyrics.length; i += 1) {
    if (musicAudio.currentTime >= activeLyrics[i].time) {
      index = i;
    } else {
      break;
    }
  }
  activeLyricIndex = index;
  lastFloatingLyricAt = musicAudio.currentTime;
}

function applyMusicSource(value) {
  const url = value.trim();
  if (!url) return;
  musicAudio.src = url;
  musicAudio.currentTime = 0;
  activeTrackIndex = -1;
  setTrackCover("");
  clearDynamicLyrics();
  updateMusicProgress();
  renderPlaylist();
  localStorage.setItem(storageKeys.musicUrl, url);
  syncConfigFromLegacyStorage();
  trackSubtitle.textContent = "Direct Audio";
  try {
    const parsed = new URL(url);
    const filename = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "网易云音乐");
    trackTitle.textContent = filename.replace(/\.(mp3|ogg|wav|m4a)$/i, "") || "网易云音乐";
  } catch {
    trackTitle.textContent = "网易云音乐";
  }
}

function applyLocalMusicFile(file) {
  if (!file) return;
  if (localMusicObjectUrl) URL.revokeObjectURL(localMusicObjectUrl);
  localMusicObjectUrl = URL.createObjectURL(file);
  musicAudio.src = localMusicObjectUrl;
  musicAudio.currentTime = 0;
  activeTrackIndex = -1;
  trackTitle.textContent = file.name.replace(/\.(mp3|ogg|wav|m4a|flac)$/i, "");
  trackSubtitle.textContent = "Local Audio";
  setTrackCover("");
  clearDynamicLyrics();
  renderPlaylist();
  updateMusicProgress();
  localStorage.removeItem(storageKeys.musicUrl);
  syncConfigFromLegacyStorage();
  musicUrl.value = "";
}

function unwrapPlaylistPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.result)) return payload.result;
  if (Array.isArray(payload.playlist)) return payload.playlist;
  if (Array.isArray(payload.songs)) return payload.songs;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.data?.songs)) return payload.data.songs;
  if (Array.isArray(payload.data?.list)) return payload.data.list;
  if (Array.isArray(payload.playlist?.tracks)) return payload.playlist.tracks;
  return [];
}

function normalizeArtist(value) {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : item?.name)).filter(Boolean).join(" / ");
  }
  if (value && typeof value === "object") return value.name || value.nickname || "";
  return value || "";
}

function normalizePlaylistTracks(payload) {
  return unwrapPlaylistPayload(payload)
    .map((item, index) => {
      const title = item.name || item.title || item.songname || item.songName || `Track ${index + 1}`;
      const artist = normalizeArtist(item.artist || item.artists || item.author || item.singer || item.ar || item.creator);
      const url = item.url || item.src || item.link || item.audio || item.mp3 || item.song_url || item.songUrl;
      const cover = item.cover || item.pic || item.picture || item.artwork || item.album?.picUrl || item.al?.picUrl || "";
      const lyric = isUrlLike(item.lrc) ? (item.lyric || item.lyrics || item.rawLrc || "") : (item.lyric || item.lyrics || item.lrc || item.rawLrc || "");
      const lrcUrls = getLyricUrls(item);
      const id = getTrackId(item);
      return { id, title, artist, url, cover, lyric, lrcUrls };
    })
    .filter((item) => item.url);
}

function renderPlaylist() {
  playlistPanel.innerHTML = "";
  playlistTracks.forEach((track, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "playlist-track";
    button.classList.toggle("is-active", index === activeTrackIndex);
    const title = document.createElement("span");
    const artist = document.createElement("small");
    title.textContent = track.title;
    artist.textContent = track.artist || "Unknown";
    button.append(title, artist);
    button.addEventListener("click", () => selectPlaylistTrack(index, true));
    playlistPanel.append(button);
  });
}

async function loadMetingPlaylist(url, { silent = false } = {}) {
  const apiUrl = (url || "").trim();
  if (!apiUrl) return;

  metingApiUrl.value = apiUrl;
  localStorage.setItem(storageKeys.metingApiUrl, apiUrl);
  syncConfigFromLegacyStorage();
  trackSubtitle.textContent = "Loading playlist...";

  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) {
      console.warn(`Meting playlist load failed. HTTP ${response.status}`);
      trackSubtitle.textContent = "Playlist unavailable";
      if (!silent) alert("歌单加载失败，请确认 Meting API 可以跨域访问，并且返回了歌曲 url。");
      return;
    }
    const payload = await response.json();
    const tracks = normalizePlaylistTracks(payload);
    if (!tracks.length) {
      console.warn("Meting playlist load failed. No playable track url in playlist.");
      trackSubtitle.textContent = "Playlist unavailable";
      if (!silent) alert("歌单加载失败，请确认 Meting API 可以跨域访问，并且返回了歌曲 url。");
      return;
    }

    playlistTracks = tracks;
    activeTrackIndex = 0;
    renderPlaylist();
    selectPlaylistTrack(0, false);
  } catch (error) {
    console.warn("Meting playlist load failed.", error);
    trackSubtitle.textContent = "Playlist unavailable";
    if (!silent) alert("歌单加载失败，请确认 Meting API 可以跨域访问，并且返回了歌曲 url。");
  }
}

async function selectPlaylistTrack(index, shouldPlay = false) {
  const track = playlistTracks[index];
  if (!track) return;

  activeTrackIndex = index;
  musicAudio.src = track.url;
  musicAudio.currentTime = 0;
  trackTitle.textContent = track.title;
  trackSubtitle.textContent = track.artist || "Netease Playlist";
  setTrackCover(await resolveMusicCoverSource(track));
  clearDynamicLyrics();
  const requestId = ++lyricRequestId;
  localStorage.removeItem(storageKeys.musicUrl);
  syncConfigFromLegacyStorage();
  musicUrl.value = "";
  renderPlaylist();
  updateMusicProgress();
  cacheMusicCoverAsset(track).catch((error) => console.warn("Music cover cache failed.", error));

  loadTrackLyrics(track, requestId)
    .then((lines) => {
      if (requestId !== lyricRequestId) return;
      activeLyrics = lines;
      activeLyricIndex = -1;
    })
    .catch((error) => {
      if (requestId === lyricRequestId) clearDynamicLyrics();
      console.warn("Lyric load failed.", error);
    });

  if (shouldPlay) {
    try {
      await musicAudio.play();
    } catch (error) {
      console.warn("Selected track could not play.", error);
    }
  }
}

function playAdjacentTrack(direction) {
  if (!playlistTracks.length) return false;
  const nextIndex = activeTrackIndex < 0
    ? 0
    : (activeTrackIndex + direction + playlistTracks.length) % playlistTracks.length;
  selectPlaylistTrack(nextIndex, true);
  return true;
}

function formatMusicTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function getMusicDuration() {
  return Number.isFinite(musicAudio.duration) && musicAudio.duration > 0 ? musicAudio.duration : 0;
}

function setProgressVisual(value) {
  const clamped = Math.min(1000, Math.max(0, Number(value) || 0));
  musicProgressBar.value = String(Math.round(clamped));
  musicProgressBar.style.setProperty("--progress", `${clamped / 10}%`);
}

function updateMusicProgress() {
  const duration = getMusicDuration();
  const currentTime = Number.isFinite(musicAudio.currentTime) ? musicAudio.currentTime : 0;
  const now = performance.now();
  const shouldPaintProgress = !isMusicActivelyPlaying() || now - lastProgressPaintAt > 240;

  musicProgressBar.disabled = !duration;
  if (!isSeekingMusic && shouldPaintProgress) {
    lastProgressPaintAt = now;
    setProgressVisual(duration ? (currentTime / duration) * 1000 : 0);
    musicCurrentTime.textContent = formatMusicTime(currentTime);
  }
  if (shouldPaintProgress) musicDuration.textContent = formatMusicTime(duration);
  updateDynamicLyric(currentTime);
}

function seekMusicFromProgress() {
  const duration = getMusicDuration();
  const progress = Number(musicProgressBar.value) || 0;
  setProgressVisual(progress);

  if (!duration) {
    musicCurrentTime.textContent = "0:00";
    return;
  }

  const nextTime = (progress / 1000) * duration;
  musicCurrentTime.textContent = formatMusicTime(nextTime);
  musicAudio.currentTime = nextTime;
}

function isMusicActivelyPlaying() {
  return !musicAudio.paused && !musicAudio.ended;
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

async function toggleMusic() {
  if (!musicAudio.src) {
    window.open("https://music.163.com/", "_blank", "noopener,noreferrer");
    return;
  }

  try {
    if (musicAudio.paused) {
      await musicAudio.play();
    } else {
      musicAudio.pause();
    }
  } catch (error) {
    console.warn("音乐无法播放，请确认链接是可直接播放的音频地址。", error);
  }
}

function syncMusicState() {
  const playing = isMusicActivelyPlaying();
  document.body.classList.toggle("is-music-playing", playing);
  musicPlayButton.textContent = playing ? "Ⅱ" : "▶";
  if (playing) {
    stopMeteorAnimation();
  } else {
    startMeteorAnimation();
  }
  updateMusicProgress();
}

function isBuiltInWallpaper(value) {
  return builtInWallpapers.some((wallpaper) => wallpaper.src === value);
}

async function loadBuiltInWallpapers() {
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
    if (!response.ok) return [];
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
  if (typeof entry === "string") {
    return createWallpaperEntry(entry, "");
  }

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

function renderWallpapers() {
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
    label.textContent = wallpaper.name;
    button.append(image, label);
    button.addEventListener("click", () => applyBuiltInWallpaper(wallpaper.src));
    wallpaperGrid.append(button);
  }
}

function updateWallpaperSelection() {
  for (const button of wallpaperGrid.querySelectorAll(".wallpaper-option")) {
    const image = button.querySelector("img");
    button.classList.toggle("is-active", image?.getAttribute("src") === activeBackgroundValue);
  }
}

function applyBuiltInWallpaper(src) {
  setBackground(src);
  localStorage.setItem(storageKeys.background, src);
  syncConfigFromLegacyStorage();
  deleteAsset(backgroundAssetKey).catch((error) => console.warn("背景资源删除失败。", error));
  backgroundUrl.value = "";
  backgroundFile.value = "";
}

function setBackground(value) {
  activeBackgroundValue = value;
  customBackground.src = value;
  customBackground.classList.add("is-active");
  updateWallpaperSelection();
}

function saveBackground(value) {
  try {
    localStorage.setItem(storageKeys.background, value);
    syncConfigFromLegacyStorage();
    return true;
  } catch (error) {
    console.warn("背景图片已应用，但图片过大，无法保存到本地。", error);
    return false;
  }
}

function compressBackgroundImage(dataUrl, fileType) {
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

function resetBackground() {
  localStorage.removeItem(storageKeys.background);
  syncConfigFromLegacyStorage();
  deleteAsset(backgroundAssetKey).catch((error) => console.warn("背景资源删除失败。", error));
  setBackground(getDefaultBackground());
  backgroundUrl.value = "";
  backgroundFile.value = "";
}

function getDayPeriodLabel(hours) {
  if (hours < 5) return "凌晨";
  if (hours < 11) return "上午";
  if (hours < 13) return "中午";
  if (hours < 18) return "下午";
  return "晚上";
}

function formatLunarDate(date) {
  try {
    return new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      month: "long",
      day: "numeric"
    }).format(date).replace(/^闰?/, "");
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
  engineName.textContent = engine.label;

  for (const option of engineMenu.querySelectorAll(".engine-option")) {
    option.setAttribute("aria-selected", String(option.dataset.engine === selectedEngine));
  }
}

function saveShortcuts() {
  localStorage.setItem(storageKeys.shortcuts, JSON.stringify(shortcuts));
  syncConfigFromLegacyStorage();
}

function renderShortcuts() {
  for (const item of shortcutRow.querySelectorAll(".shortcut-link")) {
    item.remove();
  }

  clampShortcutPage();
  const slots = getShortcutSlotsPerPage();
  const totalPages = getShortcutPageCount();
  const pageStart = shortcutLayout.paging ? shortcutPage * slots : 0;
  const pageLimit = shortcutLayout.paging && shortcutPage === totalPages - 1 ? slots - 1 : slots;
  const pageShortcuts = shortcutLayout.paging ? shortcuts.slice(pageStart, pageStart + pageLimit) : shortcuts;
  document.documentElement.style.setProperty("--shortcut-columns", String(getEffectiveShortcutColumns()));
  shortcutRow.style.setProperty("--shortcut-columns", String(getEffectiveShortcutColumns()));

  for (const shortcut of pageShortcuts) {
    const link = document.createElement("a");
    link.className = "shortcut shortcut-link";
    link.href = shortcut.url;
    link.rel = "noreferrer";
    link.draggable = true;
    link.dataset.shortcutId = shortcut.id;
    link.dataset.hotkey = shortcut.hotkey || "";
    link.addEventListener("dragstart", (event) => {
      draggedShortcutId = shortcut.id;
      link.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", shortcut.id);
    });
    link.addEventListener("dragend", () => {
      draggedShortcutId = "";
      link.classList.remove("is-dragging");
      clearShortcutDropTargets();
    });
    link.addEventListener("dragover", (event) => {
      if (!draggedShortcutId || draggedShortcutId === shortcut.id) return;
      event.preventDefault();
      link.classList.add("is-drop-target");
    });
    link.addEventListener("dragleave", () => {
      link.classList.remove("is-drop-target");
    });
    link.addEventListener("drop", (event) => {
      event.preventDefault();
      reorderShortcut(draggedShortcutId, shortcut.id);
    });
    link.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openShortcutMenu(event, shortcut.id);
    });

    const icon = document.createElement("span");
    icon.className = "shortcut-icon";
    icon.style.setProperty("--shortcut-color", shortcut.color || shortcutColors[0]);

    if (shortcut.image) {
      const image = document.createElement("img");
      image.alt = "";
      if (isAssetRef(shortcut.image)) {
        resolveShortcutIconSource(shortcut.image)
          .then((src) => {
            if (src) image.src = src;
          })
          .catch(() => {});
      } else {
        image.src = shortcut.image;
      }
      icon.append(image);
    } else {
      icon.textContent = (shortcut.iconText || shortcut.name.slice(0, 1) || "A").slice(0, 2).toUpperCase();
    }

    const label = document.createElement("span");
    label.textContent = shortcut.name;
    link.append(icon, label);
    shortcutRow.insertBefore(link, addShortcutButton);
  }

  const shouldShowAdd = !shortcutLayout.paging || shortcutPage === totalPages - 1;
  addShortcutButton.hidden = !shouldShowAdd;
  renderShortcutPager();
  shortcutPager.classList.toggle("is-visible", !shortcutRow.classList.contains("is-hidden") && shortcutLayout.paging && totalPages > 1);
}

function clearShortcutDropTargets() {
  for (const item of shortcutRow.querySelectorAll(".is-drop-target")) {
    item.classList.remove("is-drop-target");
  }
}

function reorderShortcut(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const fromIndex = shortcuts.findIndex((shortcut) => shortcut.id === sourceId);
  const toIndex = shortcuts.findIndex((shortcut) => shortcut.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = shortcuts.splice(fromIndex, 1);
  shortcuts.splice(toIndex, 0, moved);
  draggedShortcutId = "";
  saveShortcuts();
  renderShortcuts();
}

function renderShortcutPager() {
  shortcutPager.innerHTML = "";
  const totalPages = getShortcutPageCount();
  shortcutPager.classList.toggle("is-visible", shortcutLayout.paging && totalPages > 1);
  if (!shortcutLayout.paging || totalPages <= 1) return;

  for (let index = 0; index < totalPages; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "shortcut-page-button";
    button.classList.toggle("is-active", index === shortcutPage);
    button.setAttribute("aria-label", `第 ${index + 1} 页`);
    button.addEventListener("click", () => {
      shortcutPage = index;
      renderShortcuts();
    });
    shortcutPager.append(button);
  }
}

function openShortcutMenu(event, shortcutId) {
  activeShortcutId = shortcutId;
  shortcutMenu.classList.add("is-open");
  shortcutMenu.setAttribute("aria-hidden", "false");

  const menuWidth = 132;
  const menuHeight = 132;
  const x = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
  const y = Math.min(event.clientY, window.innerHeight - menuHeight - 12);
  shortcutMenu.style.left = `${Math.max(12, x)}px`;
  shortcutMenu.style.top = `${Math.max(12, y)}px`;
}

function closeShortcutMenu() {
  shortcutMenu.classList.remove("is-open");
  shortcutMenu.setAttribute("aria-hidden", "true");
  activeShortcutId = "";
}

function buildColorSwatches() {
  colorSwatches.innerHTML = "";
  shortcutColors.forEach((color, index) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.dataset.color = color;
    swatch.style.background = color;
    swatch.setAttribute("aria-label", `选择颜色 ${index + 1}`);
    swatch.addEventListener("click", () => {
      selectedShortcutColor = color;
      updateShortcutPreview();
      for (const item of colorSwatches.children) item.classList.remove("active");
      swatch.classList.add("active");
    });
    if (index === 0) swatch.classList.add("active");
    colorSwatches.append(swatch);
  });
}

function resetShortcutForm() {
  shortcutForm.reset();
  editingShortcutId = "";
  editingShortcutIconAssetRef = "";
  shortcutDialogTitle.textContent = "添加网址快捷方式";
  saveShortcutButton.textContent = "保存";
  saveMoreShortcutButton.hidden = false;
  shortcutIconText.value = "A";
  shortcutKey.value = "";
  selectedShortcutColor = shortcutColors[0];
  uploadedIcon = "";
  uploadIconPreview.textContent = "＋";
  uploadIconPreview.style.backgroundImage = "";
  for (const item of colorSwatches.children) item.classList.toggle("active", item === colorSwatches.firstElementChild);
  updateShortcutPreview();
}

async function openShortcutEditor(shortcut) {
  resetShortcutForm();
  editingShortcutId = shortcut.id;
  shortcutDialogTitle.textContent = "修改网址快捷方式";
  saveShortcutButton.textContent = "保存修改";
  saveMoreShortcutButton.hidden = true;
  shortcutUrl.value = shortcut.url;
  shortcutName.value = shortcut.name;
  shortcutIconText.value = shortcut.iconText || shortcut.name.slice(0, 1).toUpperCase();
  shortcutKey.value = shortcut.hotkey || "";
  selectedShortcutColor = shortcut.color || shortcutColors[0];
  editingShortcutIconAssetRef = isAssetRef(shortcut.image) ? shortcut.image : "";
  uploadedIcon = (await resolveShortcutIconSource(shortcut.image)) || shortcut.image || "";

  for (const item of colorSwatches.children) {
    item.classList.toggle("active", item.dataset.color === selectedShortcutColor);
  }

  if (uploadedIcon) {
    uploadIconPreview.textContent = "";
    uploadIconPreview.style.backgroundImage = `url("${uploadedIcon}")`;
  }

  updateShortcutPreview();
  shortcutDialog.showModal();
  shortcutName.focus();
}

function updateShortcutPreview() {
  textIconPreview.textContent = (shortcutIconText.value || "A").slice(0, 2).toUpperCase();
  textIconPreview.style.setProperty("--shortcut-color", selectedShortcutColor);
}

function normalizeUrl(value) {
  if (!value.trim()) return "";
  if (/^https?:\/\//i.test(value)) return value.trim();
  return `https://${value.trim()}`;
}

function getValidShortcutUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "";

  try {
    return new URL(normalized).toString();
  } catch {
    return "";
  }
}

function faviconForUrl(value) {
  try {
    const parsed = new URL(getValidShortcutUrl(value));
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(parsed.origin)}`;
  } catch {
    return "";
  }
}

async function createShortcutFromForm(previousShortcut = null) {
  const url = getValidShortcutUrl(shortcutUrl.value);
  const name = shortcutName.value.trim();
  const iconText = (shortcutIconText.value || name.slice(0, 1) || "A").slice(0, 2).toUpperCase();
  const shortcutId = editingShortcutId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

  shortcutUrl.setCustomValidity(url || !shortcutUrl.value.trim() ? "" : "请输入有效的网址");
  if (!url) shortcutUrl.reportValidity();
  if (!url || !name) return null;

  return {
    id: shortcutId,
    name,
    url,
    iconText,
    color: selectedShortcutColor,
    image: await persistShortcutIconAsset(shortcutId, uploadedIcon, previousShortcut?.image || editingShortcutIconAssetRef),
    hotkey: shortcutKey.value.trim()
  };
}

async function saveShortcut({ keepOpen = false } = {}) {
  const previousShortcut = editingShortcutId ? shortcuts.find((item) => item.id === editingShortcutId) : null;
  const shortcut = await createShortcutFromForm(previousShortcut);
  if (!shortcut) return;

  if (editingShortcutId) {
    shortcuts = shortcuts.map((item) => (item.id === editingShortcutId ? shortcut : item));
    if (previousShortcut && previousShortcut.image && previousShortcut.image !== shortcut.image) {
      await cleanupShortcutIconAsset(previousShortcut.image).catch((error) => console.warn("快捷图标资源删除失败。", error));
    }
  } else {
    shortcuts.push(shortcut);
  }
  saveShortcuts();
  renderShortcuts();

  if (keepOpen) {
    resetShortcutForm();
    shortcutUrl.focus();
  } else {
    shortcutDialog.close();
  }
}

function resizeCanvas() {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 1.25));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.floor(window.innerWidth / 42) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.72,
    size: Math.random() > 0.72 ? 2 : 1,
    phase: Math.random() * Math.PI * 2
  }));
}

function petBounds() {
  const size = petSprite.getBoundingClientRect().width || 112;
  const margin = 18;
  return {
    size,
    minX: margin,
    minY: Math.max(76, margin),
    maxX: Math.max(margin, window.innerWidth - size - margin),
    maxY: Math.max(margin, window.innerHeight - size - 92)
  };
}

function clampPetPosition(x, y) {
  const bounds = petBounds();
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, y))
  };
}

function setPetImage(state) {
  const next = petStates[state] || petStates.move;
  if (!petImage.src.endsWith(next.replace("./", ""))) {
    petImage.src = next;
  }
}

function setPetDirection(dx) {
  if (Math.abs(dx) < 1) return;
  petSprite.classList.toggle("is-facing-left", dx < 0);
}

function placePet(x, y) {
  const pos = clampPetPosition(x, y);
  petX = pos.x;
  petY = pos.y;
  petSprite.style.transform = `translate3d(${Math.round(petX)}px, ${Math.round(petY)}px, 0)`;
}

function randomPetTarget() {
  const bounds = petBounds();
  const forbidden = {
    x1: window.innerWidth * 0.22,
    x2: window.innerWidth * 0.78,
    y1: window.innerHeight * 0.22,
    y2: window.innerHeight * 0.6
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
    if (x < forbidden.x1 || x > forbidden.x2 || y < forbidden.y1 || y > forbidden.y2) {
      return { x, y };
    }
  }

  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
  };
}

function clearPetTimers() {
  window.clearTimeout(petIdleTimer);
  window.clearTimeout(petReturnTimer);
  window.cancelAnimationFrame(petAnimationId);
}

function startPetMove() {
  if (!isPetMotionEnabled()) {
    clearPetTimers();
    setPetImage("seal");
    return;
  }
  if (petDragging) return;
  window.clearTimeout(petIdleTimer);
  setPetImage("move");
  petTarget = randomPetTarget();
  setPetDirection(petTarget.x - petX);
  const speed = 0.85 + Math.random() * 0.45;

  function step(now) {
    if (petDragging || !petTarget) return;
    if (now - petLastMoveAt < 1000 / 24) {
      petAnimationId = requestAnimationFrame(step);
      return;
    }
    petLastMoveAt = now;

    const dx = petTarget.x - petX;
    const dy = petTarget.y - petY;
    const distance = Math.hypot(dx, dy);

    if (distance < 2) {
      placePet(petTarget.x, petTarget.y);
      petTarget = null;
      startPetIdle();
      return;
    }

    placePet(petX + (dx / distance) * speed, petY + (dy / distance) * speed);
    petAnimationId = requestAnimationFrame(step);
  }

  petAnimationId = requestAnimationFrame(step);
}

function startPetIdle() {
  if (!isPetMotionEnabled()) return;
  if (petDragging) return;
  setPetImage(Math.random() > 0.5 ? "seal" : "sigh");
  petIdleTimer = window.setTimeout(startPetMove, 1800 + Math.random() * 2400);
}

function startPetTemporaryState(state, duration = 1800) {
  if (petDragging) return;
  window.cancelAnimationFrame(petAnimationId);
  window.clearTimeout(petIdleTimer);
  window.clearTimeout(petReturnTimer);
  setPetImage(state);
  petReturnTimer = window.setTimeout(startPetMove, duration);
}

function initializePet() {
  placePet(window.innerWidth * 0.42, window.innerHeight * 0.67);
  if (isPetMotionEnabled()) {
    petIdleTimer = window.setTimeout(startPetMove, 600);
  } else {
    setPetImage("seal");
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
    button.append(icon, text, source);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      applySearchSuggestion(index, true);
    });
    searchSuggestionsPanel.append(button);
  });

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

function spawnMeteor(now) {
  const y = Math.random() * window.innerHeight * 0.35 + 28;
  const length = Math.random() * 120 + 150;
  meteors.push({
    x: window.innerWidth + 80,
    y,
    vx: -(Math.random() * 300 + 560),
    vy: Math.random() * 90 + 130,
    length,
    life: 1,
    hue: Math.random() > 0.5 ? "pink" : "cyan"
  });
  nextMeteorAt = now + Math.random() * 4600 + 2800;
}

function drawStars(now) {
  for (const star of stars) {
    const alpha = 0.18 + Math.abs(Math.sin(now / 620 + star.phase)) * 0.46;
    ctx.fillStyle = `rgba(236, 229, 255, ${alpha})`;
    ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
  }
}

function drawMeteor(meteor) {
  const tailX = meteor.x + meteor.length;
  const tailY = meteor.y - meteor.length * 0.24;
  const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
  const glow = meteor.hue === "pink" ? "255, 143, 204" : "133, 231, 255";

  gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.life})`);
  gradient.addColorStop(0.18, `rgba(${glow}, ${meteor.life * 0.92})`);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 4;
  ctx.strokeStyle = gradient;
  ctx.shadowColor = `rgba(${glow}, 0.9)`;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(meteor.x, meteor.y);
  ctx.lineTo(tailX, tailY);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 255, 255, ${meteor.life})`;
  ctx.fillRect(Math.round(meteor.x - 2), Math.round(meteor.y - 9), 4, 18);
  ctx.fillStyle = `rgba(${glow}, ${meteor.life * 0.72})`;
  ctx.fillRect(Math.round(meteor.x - 6), Math.round(meteor.y - 4), 12, 8);
  ctx.restore();
}

function animate(now) {
  if (document.hidden || isMusicActivelyPlaying() || !areMeteorsEnabled()) {
    meteorAnimationId = 0;
    return;
  }

  if (now - lastMeteorPaintAt < 1000 / 24) {
    meteorAnimationId = requestAnimationFrame(animate);
    return;
  }
  lastMeteorPaintAt = now;

  const delta = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawStars(now);

  if (now > nextMeteorAt) spawnMeteor(now);

  meteors = meteors.filter((meteor) => {
    meteor.x += meteor.vx * delta;
    meteor.y += meteor.vy * delta;
    meteor.life -= delta * 0.36;
    drawMeteor(meteor);
    return meteor.life > 0 && meteor.x > -meteor.length - 80 && meteor.y < window.innerHeight + 80;
  });

  meteorAnimationId = requestAnimationFrame(animate);
}

function startMeteorAnimation() {
  if (meteorAnimationId || document.hidden || isMusicActivelyPlaying() || !areMeteorsEnabled()) return;
  lastTime = performance.now();
  lastMeteorPaintAt = 0;
  meteorAnimationId = requestAnimationFrame(animate);
}

function stopMeteorAnimation() {
  cancelAnimationFrame(meteorAnimationId);
  meteorAnimationId = 0;
  meteors = [];
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
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
  spawnClickEffect(event);
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
  shortcutPager.classList.toggle("is-visible", showAddShortcut && shortcutLayout.paging && getShortcutPageCount() > 1);
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

shortcutPagingToggle.addEventListener("change", () => {
  shortcutLayout.paging = shortcutPagingToggle.checked;
  shortcutPage = 0;
  saveShortcutLayout();
  renderShortcuts();
});

shortcutColumnsInput.addEventListener("input", () => {
  updateRangeVisual(shortcutColumnsInput);
  shortcutLayout.columns = clampNumber(shortcutColumnsInput.value, 3, 8, 5);
  shortcutPage = 0;
  saveShortcutLayout();
  renderShortcuts();
});

shortcutRowsInput.addEventListener("input", () => {
  updateRangeVisual(shortcutRowsInput);
  shortcutLayout.rows = clampNumber(shortcutRowsInput.value, 1, 3, 1);
  shortcutPage = 0;
  saveShortcutLayout();
  renderShortcuts();
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

addShortcutButton.addEventListener("click", () => {
  resetShortcutForm();
  shortcutDialog.showModal();
  shortcutUrl.focus();
});

closeShortcutDialogButton.addEventListener("click", () => {
  shortcutDialog.close();
});

cancelShortcutButton.addEventListener("click", () => {
  shortcutDialog.close();
});

shortcutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveShortcut().catch((error) => console.error("保存快捷方式失败。", error));
});

saveMoreShortcutButton.addEventListener("click", () => {
  void saveShortcut({ keepOpen: true }).catch((error) => console.error("保存快捷方式失败。", error));
});

shortcutName.addEventListener("input", () => {
  if (!shortcutIconText.value.trim()) {
    shortcutIconText.value = shortcutName.value.slice(0, 1).toUpperCase();
  }
});

shortcutIconText.addEventListener("input", updateShortcutPreview);

shortcutKey.addEventListener("keydown", (event) => {
  event.preventDefault();
  const keys = [];
  if (event.ctrlKey) keys.push("Ctrl");
  if (event.altKey) keys.push("Alt");
  if (event.shiftKey) keys.push("Shift");
  if (event.metaKey) keys.push("Meta");
  if (!["Control", "Alt", "Shift", "Meta"].includes(event.key)) keys.push(event.key.toUpperCase());
  shortcutKey.value = keys.join("+");
});

clearShortcutKeyButton.addEventListener("click", () => {
  shortcutKey.value = "";
});

fetchIconButton.addEventListener("click", () => {
  const icon = faviconForUrl(shortcutUrl.value);
  if (!icon) return;
  uploadedIcon = icon;
  uploadIconPreview.textContent = "";
  uploadIconPreview.style.backgroundImage = `url("${icon}")`;
});

iconUpload.addEventListener("change", () => {
  const file = iconUpload.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result !== "string") return;
    uploadedIcon = reader.result;
    uploadIconPreview.textContent = "";
    uploadIconPreview.style.backgroundImage = `url("${uploadedIcon}")`;
  });
  reader.readAsDataURL(file);
});

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
      backgroundUrl.value = "";
    } catch (error) {
      console.warn("原图保存失败，尝试保存压缩版本。", error);
      const storableBackground = await compressBackgroundImage(result, file.type);
      saveBackground(storableBackground);
    }
  });
  reader.readAsDataURL(file);
});

applyUrlButton.addEventListener("click", () => {
  const value = backgroundUrl.value.trim();
  if (!value) return;
  setBackground(value);
  deleteAsset(backgroundAssetKey).catch((error) => console.warn("背景资源删除失败。", error));
  saveBackground(value);
});

resetBackgroundButton.addEventListener("click", resetBackground);

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

applyMusicButton.addEventListener("click", () => {
  applyMusicSource(musicUrl.value);
});

loadPlaylistButton.addEventListener("click", () => {
  loadMetingPlaylist(metingApiUrl.value);
});

musicFile.addEventListener("change", () => {
  const file = musicFile.files?.[0];
  applyLocalMusicFile(file);
});

musicCollapseButton.addEventListener("click", () => {
  musicPlayer.classList.toggle("is-collapsed");
});

musicPlayButton.addEventListener("click", toggleMusic);

musicPrevButton.addEventListener("click", () => {
  if (playAdjacentTrack(-1)) return;
  musicAudio.currentTime = Math.max(0, musicAudio.currentTime - 10);
});

musicNextButton.addEventListener("click", () => {
  if (playAdjacentTrack(1)) return;
  if (Number.isFinite(musicAudio.duration)) {
    musicAudio.currentTime = Math.min(musicAudio.duration, musicAudio.currentTime + 10);
  }
});

neteaseButton.addEventListener("click", () => {
  window.open("https://music.163.com/", "_blank", "noopener,noreferrer");
});

musicProgressBar.addEventListener("pointerdown", () => {
  isSeekingMusic = true;
});

musicProgressBar.addEventListener("input", seekMusicFromProgress);

musicProgressBar.addEventListener("change", () => {
  seekMusicFromProgress();
  isSeekingMusic = false;
  updateMusicProgress();
});

musicProgressBar.addEventListener("pointerup", () => {
  seekMusicFromProgress();
  isSeekingMusic = false;
  updateMusicProgress();
});

musicProgressBar.addEventListener("pointercancel", () => {
  isSeekingMusic = false;
  updateMusicProgress();
});

musicAudio.addEventListener("play", syncMusicState);
musicAudio.addEventListener("playing", syncMusicState);
musicAudio.addEventListener("pause", syncMusicState);
musicAudio.addEventListener("loadedmetadata", updateMusicProgress);
musicAudio.addEventListener("durationchange", updateMusicProgress);
musicAudio.addEventListener("timeupdate", updateMusicProgress);
musicAudio.addEventListener("emptied", updateMusicProgress);
musicAudio.addEventListener("ended", () => {
  if (!playAdjacentTrack(1)) syncMusicState();
});

for (const input of Object.values(appearanceInputs)) {
  input.addEventListener("input", () => {
    updateRangeVisual(input);
    saveAppearance();
  });
}

shortcutMenu.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !activeShortcutId) return;

  const shortcut = shortcuts.find((item) => item.id === activeShortcutId);
  const action = button.dataset.action;
  closeShortcutMenu();
  if (!shortcut) return;

  if (action === "open") {
    window.location.href = shortcut.url;
  }

  if (action === "edit") {
    void openShortcutEditor(shortcut).catch((error) => console.error("打开快捷方式编辑器失败。", error));
  }

  if (action === "delete" && window.confirm(`删除快捷方式“${shortcut.name}”？`)) {
    if (shortcut.image) {
      void cleanupShortcutIconAsset(shortcut.image).catch((error) => console.warn("快捷图标资源删除失败。", error));
    }
    shortcuts = shortcuts.filter((item) => item.id !== shortcut.id);
    saveShortcuts();
    renderShortcuts();
  }
});

document.addEventListener("click", (event) => {
  if (!shortcutMenu.contains(event.target)) closeShortcutMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeShortcutMenu();
});

petSprite.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  clearPetTimers();
  petDragging = true;
  petPointerMoved = false;
  petSprite.classList.add("is-dragging");
  setPetImage("excited");
  const rect = petSprite.getBoundingClientRect();
  petDragOffsetX = event.clientX - rect.left;
  petDragOffsetY = event.clientY - rect.top;
  petLastPointerX = event.clientX;
  petSprite.setPointerCapture(event.pointerId);
});

petSprite.addEventListener("pointermove", (event) => {
  if (!petDragging) return;
  petPointerMoved = true;
  setPetDirection(event.clientX - petLastPointerX);
  petLastPointerX = event.clientX;
  placePet(event.clientX - petDragOffsetX, event.clientY - petDragOffsetY);
});

petSprite.addEventListener("pointerup", (event) => {
  if (!petDragging) return;
  petDragging = false;
  petSprite.classList.remove("is-dragging");
  if (petSprite.hasPointerCapture(event.pointerId)) {
    petSprite.releasePointerCapture(event.pointerId);
  }

  if (petPointerMoved) {
    startPetTemporaryState("excited", 950);
  } else {
    startPetTemporaryState("stare", 1700);
  }
});

petSprite.addEventListener("click", (event) => {
  event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  const combo = [];
  if (event.ctrlKey) combo.push("Ctrl");
  if (event.altKey) combo.push("Alt");
  if (event.shiftKey) combo.push("Shift");
  if (event.metaKey) combo.push("Meta");
  if (!["Control", "Alt", "Shift", "Meta"].includes(event.key)) combo.push(event.key.toUpperCase());
  const pressed = combo.join("+");
  const match = shortcuts.find((shortcut) => shortcut.hotkey && shortcut.hotkey === pressed);
  if (match) window.location.href = match.url;
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("resize", () => {
  placePet(petX, petY);
  renderShortcuts();
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
loadSettings();
updateClock();
setInterval(updateClock, 1000);
resizeCanvas();
initializePet();
nextMeteorAt = performance.now() + 500;
startMeteorAnimation();
