(() => {
  const { assetKeys, readAssetKeys, readAssetMap, writeAsset } = window.PixelNewTabStorage;

  const storageKeys = {
    config: "pixelNewTab.config",
    engine: "pixelNewTab.engine",
    showClock: "pixelNewTab.showClock",
    showAddShortcut: "pixelNewTab.showAddShortcut",
    showClouds: "pixelNewTab.showClouds",
    showBottomSpectrum: "pixelNewTab.showBottomSpectrum",
    openSearchInNewTab: "pixelNewTab.openSearchInNewTab",
    searchSuggestions: "pixelNewTab.search.suggestions",
    searchHistoryEnabled: "pixelNewTab.search.historyEnabled",
    searchHistory: "pixelNewTab.search.history",
    customSearchEngines: "pixelNewTab.search.customEngines",
    background: "pixelNewTab.background",
    shortcuts: "pixelNewTab.shortcuts.v2",
    shortcutRows: "pixelNewTab.shortcuts.layout.rows",
    shortcutColumns: "pixelNewTab.shortcuts.layout.columns",
    shortcutPaging: "pixelNewTab.shortcuts.layout.paging",
    appearance: "pixelNewTab.appearance",
    musicUrl: "pixelNewTab.musicUrl",
    metingApiUrl: "pixelNewTab.metingApiUrl",
    perfLowPower: "pixelNewTab.perf.lowPower",
    perfMeteors: "pixelNewTab.perf.meteors",
    perfClickEffects: "pixelNewTab.perf.clickEffects",
    perfPetMotion: "pixelNewTab.perf.petMotion",
    perfLyrics: "pixelNewTab.perf.lyrics",
    uiInteractions: "pixelNewTab.ui.interactions"
  };

  const defaultMetingApiUrl = "https://api.injahow.cn/meting/?server=netease&type=playlist&id=17929070065";

  const defaultAppearance = {
    iconOpacity: 100,
    iconScale: 94,
    timeOpacity: 66,
    timeScale: 85,
    timeX: -26,
    timeY: -38,
    searchOpacity: 61,
    searchScale: 100,
    dustOverlayStrength: 31,
    backgroundBlur: 6,
    searchX: -21,
    searchY: -34
  };

  const mobileDefaultAppearance = {
    ...defaultAppearance,
    timeOpacity: 78,
    timeScale: 78,
    timeX: 0,
    timeY: -18,
    searchOpacity: 76,
    searchScale: 92,
    backgroundBlur: 4,
    searchX: 0,
    searchY: 2
  };

  const defaultShortcuts = [];
  const currentConfigVersion = 1;

  function getDeviceDefaultAppearance() {
    return window.matchMedia("(max-width: 680px), (pointer: coarse)").matches
      ? mobileDefaultAppearance
      : defaultAppearance;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const defaultConfig = {
    app: "pixel-new-tab",
    version: currentConfigVersion,
    display: {
      showClock: true,
      showShortcuts: false,
      showClouds: true,
      showBottomSpectrum: true
    },
    search: {
      engine: "google",
      openInNewTab: true,
      suggestions: true,
      historyEnabled: true,
      customEngines: []
    },
    appearance: clone(defaultAppearance),
    background: {
      value: "",
      source: "default"
    },
    shortcuts: clone(defaultShortcuts),
    shortcutLayout: {
      rows: 1,
      columns: 5,
      paging: true
    },
    music: {
      url: "",
      metingApiUrl: defaultMetingApiUrl
    },
    performance: {
      lowPower: false,
      meteors: true,
      clickEffects: true,
      petMotion: true,
      lyrics: true
    },
    ui: {
      interactions: true
    },
    assets: {
      backgroundOriginal: assetKeys.backgroundOriginal,
      backgroundCurrent: assetKeys.backgroundCurrent,
      backgroundDark: assetKeys.backgroundDark,
      shortcutIconPrefix: assetKeys.shortcutIconPrefix,
      musicCoverPrefix: assetKeys.musicCoverPrefix
    }
  };

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeSnapshotAssets(assets) {
    const normalized = {};

    const visit = (entry, path = []) => {
      if (!entry || typeof entry !== "object") return;

      for (const [key, value] of Object.entries(entry)) {
        const nextPath = [...path, key];
        const joinedPath = nextPath.join(".");

        if (typeof value === "string" && value) {
          if (joinedPath === "backgroundOriginal") {
            normalized[assetKeys.backgroundOriginal] = value;
            continue;
          }
          if (joinedPath === "backgroundCurrent") {
            normalized[assetKeys.backgroundCurrent] = value;
            continue;
          }
          if (joinedPath === "backgroundDark") {
            normalized[assetKeys.backgroundDark] = value;
            continue;
          }
          if (joinedPath.startsWith("shortcutIcons.")) {
            normalized[`${assetKeys.shortcutIconPrefix}${joinedPath.slice("shortcutIcons.".length)}`] = value;
            continue;
          }
          if (joinedPath.startsWith("musicCovers.")) {
            normalized[`${assetKeys.musicCoverPrefix}${joinedPath.slice("musicCovers.".length)}`] = value;
            continue;
          }
          if (
            joinedPath.startsWith("background.") ||
            joinedPath.startsWith("shortcut.icon.") ||
            joinedPath.startsWith("music.cover.")
          ) {
            normalized[joinedPath] = value;
          }
          continue;
        }

        if (value && typeof value === "object") {
          visit(value, nextPath);
        }
      }
    };

    visit(assets);
    return normalized;
  }

  async function collectSnapshotAssets() {
    const keys = await readAssetKeys();
    return readAssetMap(keys);
  }

  async function restoreSnapshotAssets(assets) {
    const normalizedAssets = normalizeSnapshotAssets(assets);
    for (const [key, value] of Object.entries(normalizedAssets)) {
      await writeAsset(key, value);
    }
  }

  function parseBoolean(value, fallback) {
    if (value === null || value === undefined) return fallback;
    return value === "true";
  }

  function mergeConfig(config) {
    return {
      ...clone(defaultConfig),
      ...config,
      display: { ...defaultConfig.display, ...(config?.display || {}) },
      search: { ...defaultConfig.search, ...(config?.search || {}) },
      appearance: { ...defaultConfig.appearance, ...(config?.appearance || {}) },
      background: { ...defaultConfig.background, ...(config?.background || {}) },
      shortcuts: Array.isArray(config?.shortcuts) ? config.shortcuts : clone(defaultShortcuts),
      shortcutLayout: { ...defaultConfig.shortcutLayout, ...(config?.shortcutLayout || {}) },
      music: { ...defaultConfig.music, ...(config?.music || {}) },
      performance: { ...defaultConfig.performance, ...(config?.performance || {}) },
      ui: { ...defaultConfig.ui, ...(config?.ui || {}) },
      assets: { ...defaultConfig.assets, ...(config?.assets || {}) },
      version: currentConfigVersion
    };
  }

  function readConfig() {
    return mergeConfig(readJson(storageKeys.config, {}));
  }

  function writeConfig(config) {
    const normalized = mergeConfig(config);
    writeJson(storageKeys.config, normalized);
    return normalized;
  }

  function readLegacySettings() {
    const appearance = readJson(storageKeys.appearance, {});
    const shortcuts = readJson(storageKeys.shortcuts, defaultShortcuts);
    return {
      display: {
        showClock: parseBoolean(localStorage.getItem(storageKeys.showClock), true),
        showShortcuts: parseBoolean(localStorage.getItem(storageKeys.showAddShortcut), false),
        showClouds: parseBoolean(localStorage.getItem(storageKeys.showClouds), true),
        showBottomSpectrum: parseBoolean(localStorage.getItem(storageKeys.showBottomSpectrum), true)
      },
      search: {
        engine: localStorage.getItem(storageKeys.engine) || "google",
        openInNewTab: parseBoolean(localStorage.getItem(storageKeys.openSearchInNewTab), true),
        suggestions: parseBoolean(localStorage.getItem(storageKeys.searchSuggestions), true),
        historyEnabled: parseBoolean(localStorage.getItem(storageKeys.searchHistoryEnabled), true),
        customEngines: readJson(storageKeys.customSearchEngines, [])
      },
      appearance: { ...getDeviceDefaultAppearance(), ...appearance },
      background: {
        value: localStorage.getItem(storageKeys.background) || "",
        source: localStorage.getItem(storageKeys.background) ? "saved" : "default"
      },
      shortcuts: Array.isArray(shortcuts) ? shortcuts : clone(defaultShortcuts),
      shortcutLayout: {
        rows: Number(localStorage.getItem(storageKeys.shortcutRows) || 1),
        columns: Number(localStorage.getItem(storageKeys.shortcutColumns) || 5),
        paging: parseBoolean(localStorage.getItem(storageKeys.shortcutPaging), true)
      },
      music: {
        url: localStorage.getItem(storageKeys.musicUrl) || "",
        metingApiUrl: localStorage.getItem(storageKeys.metingApiUrl) || defaultMetingApiUrl
      },
      performance: {
        lowPower: parseBoolean(localStorage.getItem(storageKeys.perfLowPower), false),
        meteors: parseBoolean(localStorage.getItem(storageKeys.perfMeteors), true),
        clickEffects: parseBoolean(localStorage.getItem(storageKeys.perfClickEffects), true),
        petMotion: parseBoolean(localStorage.getItem(storageKeys.perfPetMotion), true),
        lyrics: parseBoolean(localStorage.getItem(storageKeys.perfLyrics), true)
      },
      ui: {
        interactions: parseBoolean(localStorage.getItem(storageKeys.uiInteractions), true)
      }
    };
  }

  function syncConfigFromLegacyStorage() {
    return writeConfig({
      ...readConfig(),
      ...readLegacySettings()
    });
  }

  function migrateLegacyConfig() {
    if (!localStorage.getItem(storageKeys.config)) {
      return syncConfigFromLegacyStorage();
    }
    const config = writeConfig(readConfig());
    applyConfigToLegacyStorage(config, { onlyMissing: true });
    return config;
  }

  function writeStorageValue(key, value) {
    if (value === "" || value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  function writeStorageJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function applyConfigToLegacyStorage(configInput, { onlyMissing = false } = {}) {
    const config = mergeConfig(configInput);
    const writeIfNeeded = (key, value, writer = writeStorageValue) => {
      if (onlyMissing && localStorage.getItem(key) !== null) return;
      writer(key, value);
    };

    writeIfNeeded(storageKeys.engine, config.search.engine);
    writeIfNeeded(storageKeys.openSearchInNewTab, String(config.search.openInNewTab));
    writeIfNeeded(storageKeys.searchSuggestions, String(config.search.suggestions));
    writeIfNeeded(storageKeys.searchHistoryEnabled, String(config.search.historyEnabled));
    writeIfNeeded(storageKeys.customSearchEngines, config.search.customEngines, writeStorageJson);
    writeIfNeeded(storageKeys.showClock, String(config.display.showClock));
    writeIfNeeded(storageKeys.showAddShortcut, String(config.display.showShortcuts));
    writeIfNeeded(storageKeys.showClouds, String(config.display.showClouds));
    writeIfNeeded(storageKeys.showBottomSpectrum, String(config.display.showBottomSpectrum));
    writeIfNeeded(storageKeys.background, config.background.value);
    writeIfNeeded(storageKeys.shortcuts, config.shortcuts, writeStorageJson);
    writeIfNeeded(storageKeys.shortcutRows, String(config.shortcutLayout.rows));
    writeIfNeeded(storageKeys.shortcutColumns, String(config.shortcutLayout.columns));
    writeIfNeeded(storageKeys.shortcutPaging, String(config.shortcutLayout.paging));
    writeIfNeeded(storageKeys.appearance, config.appearance, writeStorageJson);
    writeIfNeeded(storageKeys.musicUrl, config.music.url);
    writeIfNeeded(storageKeys.metingApiUrl, config.music.metingApiUrl);
    writeIfNeeded(storageKeys.perfLowPower, String(config.performance.lowPower));
    writeIfNeeded(storageKeys.perfMeteors, String(config.performance.meteors));
    writeIfNeeded(storageKeys.perfClickEffects, String(config.performance.clickEffects));
    writeIfNeeded(storageKeys.perfPetMotion, String(config.performance.petMotion));
    writeIfNeeded(storageKeys.perfLyrics, String(config.performance.lyrics));
    writeIfNeeded(storageKeys.uiInteractions, String(config.ui.interactions));
  }

  async function buildConfigSnapshot() {
    const legacySettings = {};
    for (const key of Object.values(storageKeys)) {
      if (key === storageKeys.config) continue;
      legacySettings[key] = localStorage.getItem(key);
    }

    return {
      app: "pixel-new-tab",
      version: currentConfigVersion,
      exportedAt: new Date().toISOString(),
      config: syncConfigFromLegacyStorage(),
      settings: legacySettings,
      assets: await collectSnapshotAssets()
    };
  }

  async function importConfigSnapshot(snapshot) {
    if (snapshot.app !== "pixel-new-tab") {
      throw new Error("不是有效的 Pixel New Tab 配置文件。");
    }

    if (snapshot.settings && typeof snapshot.settings === "object") {
      for (const [key, value] of Object.entries(snapshot.settings)) {
        if (value === null || value === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }
    }

    if (snapshot.config && typeof snapshot.config === "object") {
      const config = writeConfig(snapshot.config);
      applyConfigToLegacyStorage(config);
    } else if (snapshot.settings) {
      syncConfigFromLegacyStorage();
    } else {
      throw new Error("不是有效的 Pixel New Tab 配置文件。");
    }

    if (snapshot.assets && typeof snapshot.assets === "object") {
      await restoreSnapshotAssets(snapshot.assets);
      if (snapshot.assets[assetKeys.backgroundOriginal] || snapshot.assets.backgroundOriginal) {
        localStorage.setItem(storageKeys.background, "indexeddb:background.original");
      }
      syncConfigFromLegacyStorage();
    }
  }

  window.PixelNewTabSettings = {
    buildConfigSnapshot,
    defaultAppearance,
    defaultMetingApiUrl,
    defaultShortcuts,
    importConfigSnapshot,
    migrateLegacyConfig,
    mobileDefaultAppearance,
    readConfig,
    storageKeys,
    syncConfigFromLegacyStorage,
    writeConfig,
  };
})();
