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

const digitMap = {
  "0": ["111", "101", "101", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "010", "010", "111"],
  "2": ["111", "001", "001", "111", "100", "100", "111"],
  "3": ["111", "001", "001", "111", "001", "001", "111"],
  "4": ["101", "101", "101", "111", "001", "001", "001"],
  "5": ["111", "100", "100", "111", "001", "001", "111"],
  "6": ["111", "100", "100", "111", "101", "101", "111"],
  "7": ["111", "001", "001", "010", "010", "010", "010"],
  "8": ["111", "101", "101", "111", "101", "101", "111"],
  "9": ["111", "101", "101", "111", "001", "001", "111"]
};

const shortcutColors = ["#5896f2", "#f7c84e", "#f25c57", "#66513f", "#93bd69", "#315caa", "#d5b76c", "#3e2d39", "#cc4049", "#3769bb", "#9dd3a4", "#e6e8ef"];

const storageKeys = {
  engine: "pixelNewTab.engine",
  showClock: "pixelNewTab.showClock",
  showAddShortcut: "pixelNewTab.showAddShortcut",
  openSearchInNewTab: "pixelNewTab.openSearchInNewTab",
  background: "pixelNewTab.background",
  shortcuts: "pixelNewTab.shortcuts.v2",
  appearance: "pixelNewTab.appearance",
  musicUrl: "pixelNewTab.musicUrl",
  metingApiUrl: "pixelNewTab.metingApiUrl"
};

const defaultAppearance = {
  iconOpacity: 100,
  iconScale: 100,
  timeOpacity: 100,
  timeScale: 100,
  timeX: 0,
  timeY: 0,
  searchOpacity: 100,
  searchScale: 100,
  searchX: 0,
  searchY: 0
};

const defaultShortcuts = [
  {
    id: "default-bilibili",
    name: "BILIBILI",
    url: "https://www.bilibili.com/",
    iconText: "B",
    color: "#59c7e3",
    image: "",
    hotkey: ""
  }
];

const timeText = document.querySelector("#timeText");
const customBackground = document.querySelector("#customBackground");
const dateText = document.querySelector("#dateText");
const clockPanel = document.querySelector("#clockPanel");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const enginePicker = document.querySelector("#enginePicker");
const engineButton = document.querySelector("#engineButton");
const engineMenu = document.querySelector("#engineMenu");
const engineName = document.querySelector("#engineName");
const engineDot = document.querySelector("#engineDot");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const clockToggle = document.querySelector("#clockToggle");
const addShortcutToggle = document.querySelector("#addShortcutToggle");
const searchNewTabToggle = document.querySelector("#searchNewTabToggle");
const backgroundFile = document.querySelector("#backgroundFile");
const backgroundUrl = document.querySelector("#backgroundUrl");
const applyUrlButton = document.querySelector("#applyUrlButton");
const resetBackgroundButton = document.querySelector("#resetBackgroundButton");
const exportConfigButton = document.querySelector("#exportConfigButton");
const importConfigButton = document.querySelector("#importConfigButton");
const importConfigFile = document.querySelector("#importConfigFile");
const shortcutRow = document.querySelector("#shortcutRow");
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
const closeShortcutDialogButton = document.querySelector("#closeShortcutDialogButton");
const cancelShortcutButton = document.querySelector("#cancelShortcutButton");
const shortcutMenu = document.querySelector("#shortcutMenu");
const petSprite = document.querySelector("#petSprite");
const petImage = document.querySelector("#petImage");
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
const playlistPanel = document.querySelector("#playlistPanel");
const miniSpectrum = document.querySelector("#miniSpectrum");
const bottomSpectrum = document.querySelector("#bottomSpectrum");
const musicNoteLayer = document.querySelector(".music-note-layer");
const bottomNotes = document.querySelector(".bottom-notes");
const appearanceInputs = {
  iconOpacity: document.querySelector("#iconOpacity"),
  iconScale: document.querySelector("#iconScale"),
  timeOpacity: document.querySelector("#timeOpacity"),
  timeScale: document.querySelector("#timeScale"),
  timeX: document.querySelector("#timeX"),
  timeY: document.querySelector("#timeY"),
  searchOpacity: document.querySelector("#searchOpacity"),
  searchScale: document.querySelector("#searchScale"),
  searchX: document.querySelector("#searchX"),
  searchY: document.querySelector("#searchY")
};
const canvas = document.querySelector("#meteorCanvas");
const ctx = canvas.getContext("2d");

let selectedEngine = "google";
let selectedShortcutColor = shortcutColors[0];
let uploadedIcon = "";
let editingShortcutId = "";
let activeShortcutId = "";
let shortcuts = [];
let meteors = [];
let stars = [];
let nextMeteorAt = 0;
let lastTime = performance.now();
let petX = Math.round(window.innerWidth * 0.42);
let petY = Math.round(window.innerHeight * 0.67);
let petTarget = null;
let petAnimationId = 0;
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
const defaultMetingApiUrl = "https://api.injahow.cn/meting/?server=netease&type=playlist&id=17929070065";
const backgroundDbName = "pixelNewTab.assets";
const backgroundStoreName = "assets";
const backgroundAssetKey = "background.original";
const backgroundIndexedRef = "indexeddb:background.original";

const petStates = {
  move: "./assets/pet/move.gif",
  seal: "./assets/pet/seal.gif",
  sigh: "./assets/pet/sigh.gif",
  stare: "./assets/pet/stare.gif",
  excited: "./assets/pet/excited.gif"
};

async function loadSettings() {
  const savedEngine = localStorage.getItem(storageKeys.engine);
  const savedClock = localStorage.getItem(storageKeys.showClock);
  const savedAddShortcut = localStorage.getItem(storageKeys.showAddShortcut);
  const savedSearchNewTab = localStorage.getItem(storageKeys.openSearchInNewTab);
  const savedBackground = localStorage.getItem(storageKeys.background);
  const savedShortcuts = localStorage.getItem(storageKeys.shortcuts);
  const savedAppearance = localStorage.getItem(storageKeys.appearance);
  const savedMusicUrl = localStorage.getItem(storageKeys.musicUrl);
  const savedMetingApiUrl = localStorage.getItem(storageKeys.metingApiUrl) || defaultMetingApiUrl;

  selectedEngine = savedEngine && engines[savedEngine] ? savedEngine : "google";
  shortcuts = savedShortcuts ? JSON.parse(savedShortcuts) : defaultShortcuts;

  const showClock = savedClock !== "false";
  const showAddShortcut = savedAddShortcut !== "false";
  const openSearchInNewTab = savedSearchNewTab === "true";
  clockToggle.checked = showClock;
  addShortcutToggle.checked = showAddShortcut;
  searchNewTabToggle.checked = openSearchInNewTab;
  clockPanel.classList.toggle("is-hidden", !showClock);
  shortcutRow.classList.toggle("is-hidden", !showAddShortcut);

  if (savedBackground) {
    if (savedBackground === backgroundIndexedRef) {
      const storedBackground = await readAsset(backgroundAssetKey);
      if (storedBackground) setBackground(storedBackground);
    } else {
      setBackground(savedBackground);
      backgroundUrl.value = savedBackground.startsWith("data:") ? "" : savedBackground;
    }
  }

  if (savedMusicUrl) {
    musicUrl.value = savedMusicUrl;
    applyMusicSource(savedMusicUrl);
  }

  metingApiUrl.value = savedMetingApiUrl;

  let appearance = defaultAppearance;
  if (savedAppearance) {
    try {
      appearance = { ...defaultAppearance, ...JSON.parse(savedAppearance) };
    } catch {
      appearance = defaultAppearance;
    }
  }
  applyAppearance(appearance);

  buildEngineMenu();
  renderEngine();
  renderShortcuts();
  buildColorSwatches();
  buildSpectrum(miniSpectrum, 54);
  buildSpectrum(bottomSpectrum, 180);
  buildMusicNotes(musicNoteLayer, 24, 8, 92);
  buildMusicNotes(bottomNotes, 56, 8, 104);
  loadMetingPlaylist(savedMetingApiUrl, { silent: true });
}

function applyAppearance(settings) {
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--shortcut-opacity", String(settings.iconOpacity / 100));
  rootStyle.setProperty("--shortcut-scale", String(settings.iconScale / 100));
  rootStyle.setProperty("--clock-opacity", String(settings.timeOpacity / 100));
  rootStyle.setProperty("--clock-scale", String(settings.timeScale / 100));
  rootStyle.setProperty("--clock-x", `${settings.timeX}vw`);
  rootStyle.setProperty("--clock-y", `${settings.timeY * 0.45}vh`);
  rootStyle.setProperty("--search-opacity", String(settings.searchOpacity / 100));
  rootStyle.setProperty("--search-scale", String(settings.searchScale / 100));
  rootStyle.setProperty("--search-x", `${settings.searchX}vw`);
  rootStyle.setProperty("--search-y", `${settings.searchY * 0.45}vh`);

  for (const [key, input] of Object.entries(appearanceInputs)) {
    input.value = settings[key] ?? defaultAppearance[key];
  }
}

function readAppearanceInputs() {
  return Object.fromEntries(
    Object.entries(appearanceInputs).map(([key, input]) => [key, Number(input.value)])
  );
}

function saveAppearance() {
  const settings = readAppearanceInputs();
  applyAppearance(settings);
  localStorage.setItem(storageKeys.appearance, JSON.stringify(settings));
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

function applyMusicSource(value) {
  const url = value.trim();
  if (!url) return;
  musicAudio.src = url;
  activeTrackIndex = -1;
  renderPlaylist();
  localStorage.setItem(storageKeys.musicUrl, url);
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
  activeTrackIndex = -1;
  trackTitle.textContent = file.name.replace(/\.(mp3|ogg|wav|m4a|flac)$/i, "");
  trackSubtitle.textContent = "Local Audio";
  renderPlaylist();
  localStorage.removeItem(storageKeys.musicUrl);
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
      const cover = item.cover || item.pic || item.picture || item.artwork || item.al?.picUrl || "";
      return { title, artist, url, cover };
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
  trackSubtitle.textContent = "Loading playlist...";

  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const tracks = normalizePlaylistTracks(payload);
    if (!tracks.length) throw new Error("No playable track url in playlist.");

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
  trackTitle.textContent = track.title;
  trackSubtitle.textContent = track.artist || "Netease Playlist";
  localStorage.removeItem(storageKeys.musicUrl);
  musicUrl.value = "";
  renderPlaylist();

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

async function buildConfigSnapshot() {
  const settings = {};
  for (const key of Object.values(storageKeys)) {
    settings[key] = localStorage.getItem(key);
  }

  return {
    app: "pixel-new-tab",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    assets: {
      backgroundOriginal: await readAsset(backgroundAssetKey).catch(() => "")
    }
  };
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
  if (snapshot.app !== "pixel-new-tab" || !snapshot.settings) {
    throw new Error("不是有效的 Pixel New Tab 配置文件。");
  }

  for (const [key, value] of Object.entries(snapshot.settings)) {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  if (snapshot.assets?.backgroundOriginal) {
    await writeAsset(backgroundAssetKey, snapshot.assets.backgroundOriginal);
    localStorage.setItem(storageKeys.background, backgroundIndexedRef);
  }

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
  const playing = !musicAudio.paused && !musicAudio.ended;
  document.body.classList.toggle("is-music-playing", playing);
  musicPlayButton.textContent = playing ? "Ⅱ" : "▶";
}

function setBackground(value) {
  customBackground.src = value;
  customBackground.classList.add("is-active");
}

function openAssetDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(backgroundDbName, 1);
    request.addEventListener("upgradeneeded", () => {
      request.result.createObjectStore(backgroundStoreName);
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function writeAsset(key, value) {
  const db = await openAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(backgroundStoreName, "readwrite");
    transaction.objectStore(backgroundStoreName).put(value, key);
    transaction.addEventListener("complete", () => {
      db.close();
      resolve();
    });
    transaction.addEventListener("error", () => {
      db.close();
      reject(transaction.error);
    });
  });
}

async function readAsset(key) {
  const db = await openAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(backgroundStoreName, "readonly");
    const request = transaction.objectStore(backgroundStoreName).get(key);
    request.addEventListener("success", () => resolve(request.result || ""));
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => db.close());
  });
}

async function deleteAsset(key) {
  const db = await openAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(backgroundStoreName, "readwrite");
    transaction.objectStore(backgroundStoreName).delete(key);
    transaction.addEventListener("complete", () => {
      db.close();
      resolve();
    });
    transaction.addEventListener("error", () => {
      db.close();
      reject(transaction.error);
    });
  });
}

function saveBackground(value) {
  try {
    localStorage.setItem(storageKeys.background, value);
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
  deleteAsset(backgroundAssetKey).catch((error) => console.warn("背景资源删除失败。", error));
  customBackground.removeAttribute("src");
  customBackground.classList.remove("is-active");
  backgroundUrl.value = "";
  backgroundFile.value = "";
}

function renderPixelTime(value) {
  timeText.innerHTML = "";
  timeText.setAttribute("aria-label", value);

  for (const char of value) {
    const node = document.createElement("span");
    node.className = char === ":" ? "pixel-colon" : "pixel-digit";

    if (char === ":") {
      node.innerHTML = "<i></i><i></i>";
    } else {
      for (const row of digitMap[char]) {
        for (const bit of row) {
          const pixel = document.createElement("i");
          if (bit === "1") pixel.className = "on";
          node.append(pixel);
        }
      }
    }

    timeText.append(node);
  }
}

function updateClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(now);
  const date = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(now);

  renderPixelTime(time);
  dateText.textContent = date.replace("日", "日 ");
}

function buildEngineMenu() {
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
      enginePicker.classList.remove("is-open");
      engineButton.setAttribute("aria-expanded", "false");
      renderEngine();
      searchInput.focus();
    });
    engineMenu.append(option);
  }
}

function renderEngine() {
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
}

function renderShortcuts() {
  for (const item of shortcutRow.querySelectorAll(".shortcut-link")) {
    item.remove();
  }

  for (const shortcut of shortcuts) {
    const link = document.createElement("a");
    link.className = "shortcut shortcut-link";
    link.href = shortcut.url;
    link.rel = "noreferrer";
    link.dataset.shortcutId = shortcut.id;
    link.dataset.hotkey = shortcut.hotkey || "";
    link.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openShortcutMenu(event, shortcut.id);
    });

    const icon = document.createElement("span");
    icon.className = "shortcut-icon";
    icon.style.setProperty("--shortcut-color", shortcut.color || shortcutColors[0]);

    if (shortcut.image) {
      const image = document.createElement("img");
      image.src = shortcut.image;
      image.alt = "";
      icon.append(image);
    } else {
      icon.textContent = (shortcut.iconText || shortcut.name.slice(0, 1) || "A").slice(0, 2).toUpperCase();
    }

    const label = document.createElement("span");
    label.textContent = shortcut.name;
    link.append(icon, label);
    shortcutRow.insertBefore(link, addShortcutButton);
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

function openShortcutEditor(shortcut) {
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
  uploadedIcon = shortcut.image || "";

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
  const text = (shortcutIconText.value || "A").slice(0, 2).toUpperCase();
  textIconPreview.textContent = text;
  textIconPreview.style.setProperty("--shortcut-color", selectedShortcutColor);
}

function normalizeUrl(value) {
  if (!value.trim()) return "";
  if (/^https?:\/\//i.test(value)) return value.trim();
  return `https://${value.trim()}`;
}

function faviconForUrl(value) {
  try {
    const parsed = new URL(normalizeUrl(value));
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(parsed.origin)}`;
  } catch {
    return "";
  }
}

function createShortcutFromForm() {
  const url = normalizeUrl(shortcutUrl.value);
  const name = shortcutName.value.trim();
  const iconText = (shortcutIconText.value || name.slice(0, 1) || "A").slice(0, 2).toUpperCase();

  if (!url || !name) return null;

  return {
    id: editingShortcutId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    name,
    url,
    iconText,
    color: selectedShortcutColor,
    image: uploadedIcon,
    hotkey: shortcutKey.value.trim()
  };
}

function saveShortcut({ keepOpen = false } = {}) {
  const shortcut = createShortcutFromForm();
  if (!shortcut) return;

  if (editingShortcutId) {
    shortcuts = shortcuts.map((item) => (item.id === editingShortcutId ? shortcut : item));
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
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.floor(window.innerWidth / 28) }, () => ({
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
  if (petDragging) return;
  window.clearTimeout(petIdleTimer);
  setPetImage("move");
  petTarget = randomPetTarget();
  setPetDirection(petTarget.x - petX);
  const speed = 0.85 + Math.random() * 0.45;

  function step() {
    if (petDragging || !petTarget) return;

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
  petIdleTimer = window.setTimeout(startPetMove, 600);
}

function spawnMeteor(now) {
  const y = Math.random() * window.innerHeight * 0.35 + 28;
  const length = Math.random() * 170 + 190;
  meteors.push({
    x: window.innerWidth + 80,
    y,
    vx: -(Math.random() * 420 + 760),
    vy: Math.random() * 130 + 170,
    length,
    life: 1,
    hue: Math.random() > 0.5 ? "pink" : "cyan"
  });
  nextMeteorAt = now + Math.random() * 2400 + 1500;
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
  ctx.shadowBlur = 18;
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

  requestAnimationFrame(animate);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }

  const searchUrl = `${engines[selectedEngine].url}${encodeURIComponent(query)}`;
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

document.addEventListener("click", (event) => {
  if (!enginePicker.contains(event.target)) {
    enginePicker.classList.remove("is-open");
    engineButton.setAttribute("aria-expanded", "false");
  }
});

settingsButton.addEventListener("click", () => {
  settingsDialog.showModal();
});

clockToggle.addEventListener("change", () => {
  const showClock = clockToggle.checked;
  localStorage.setItem(storageKeys.showClock, String(showClock));
  clockPanel.classList.toggle("is-hidden", !showClock);
});

addShortcutToggle.addEventListener("change", () => {
  const showAddShortcut = addShortcutToggle.checked;
  localStorage.setItem(storageKeys.showAddShortcut, String(showAddShortcut));
  shortcutRow.classList.toggle("is-hidden", !showAddShortcut);
});

searchNewTabToggle.addEventListener("change", () => {
  localStorage.setItem(storageKeys.openSearchInNewTab, String(searchNewTabToggle.checked));
});

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
  saveShortcut();
});

saveMoreShortcutButton.addEventListener("click", () => {
  saveShortcut({ keepOpen: true });
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

musicAudio.addEventListener("play", syncMusicState);
musicAudio.addEventListener("pause", syncMusicState);
musicAudio.addEventListener("ended", () => {
  if (!playAdjacentTrack(1)) syncMusicState();
});

for (const input of Object.values(appearanceInputs)) {
  input.addEventListener("input", saveAppearance);
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
    openShortcutEditor(shortcut);
  }

  if (action === "delete" && window.confirm(`删除快捷方式“${shortcut.name}”？`)) {
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

document.addEventListener("pointerdown", (event) => {
  if (event.button === 0) document.body.classList.add("is-dragging-cursor");
});

document.addEventListener("pointerup", () => {
  document.body.classList.remove("is-dragging-cursor");
});

document.addEventListener("pointercancel", () => {
  document.body.classList.remove("is-dragging-cursor");
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
});

loadSettings();
updateClock();
setInterval(updateClock, 1000);
resizeCanvas();
initializePet();
nextMeteorAt = performance.now() + 500;
requestAnimationFrame(animate);
