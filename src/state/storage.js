(() => {
  const assetDbName = "pixelNewTab.assets";
  const assetStoreName = "assets";
  const assetRefPrefix = "indexeddb:";

  const assetKeys = {
    backgroundOriginal: "background.original",
    backgroundCurrent: "background.current",
    backgroundDark: "background.dark",
    shortcutIconPrefix: "shortcut.icon.",
    musicCoverPrefix: "music.cover."
  };

  const backgroundIndexedRef = "indexeddb:background.original";

  function assetRef(key) {
    return `${assetRefPrefix}${key}`;
  }

  function isAssetRef(value) {
    return typeof value === "string" && value.startsWith(assetRefPrefix);
  }

  function resolveAssetKey(ref) {
    return isAssetRef(ref) ? ref.slice(assetRefPrefix.length) : "";
  }

  function openAssetDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(assetDbName, 1);
      request.addEventListener("upgradeneeded", () => {
        request.result.createObjectStore(assetStoreName);
      });
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  async function writeAsset(key, value) {
    const db = await openAssetDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(assetStoreName, "readwrite");
      transaction.objectStore(assetStoreName).put(value, key);
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
      const transaction = db.transaction(assetStoreName, "readonly");
      const request = transaction.objectStore(assetStoreName).get(key);
      request.addEventListener("success", () => resolve(request.result || ""));
      request.addEventListener("error", () => reject(request.error));
      transaction.addEventListener("complete", () => db.close());
    });
  }

  async function readAssetByRef(ref) {
    const key = resolveAssetKey(ref);
    if (!key) return "";
    return readAsset(key);
  }

  async function writeAssetByRef(ref, value) {
    const key = resolveAssetKey(ref);
    if (!key) return;
    return writeAsset(key, value);
  }

  async function deleteAsset(key) {
    const db = await openAssetDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(assetStoreName, "readwrite");
      transaction.objectStore(assetStoreName).delete(key);
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

  async function readAssetKeys() {
    const db = await openAssetDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(assetStoreName, "readonly");
      const request = transaction.objectStore(assetStoreName).getAllKeys();
      request.addEventListener("success", () => resolve(request.result || []));
      request.addEventListener("error", () => reject(request.error));
      transaction.addEventListener("complete", () => db.close());
    });
  }

  async function readAssetMap(keys) {
    const resolvedKeys = Array.isArray(keys) ? keys : await readAssetKeys();
    const entries = await Promise.all(
      resolvedKeys.map(async (key) => [key, await readAsset(key).catch(() => "")])
    );
    return Object.fromEntries(entries.filter(([, value]) => value));
  }

  async function readAssetsByPrefix(prefix) {
    const keys = await readAssetKeys();
    return readAssetMap(keys.filter((key) => String(key).startsWith(prefix)));
  }

  async function deleteAssetsByPrefix(prefix) {
    const keys = await readAssetKeys();
    await Promise.all(keys.filter((key) => String(key).startsWith(prefix)).map((key) => deleteAsset(key)));
  }

  const pixelNewTabStorage = {
    assetKeys,
    assetRef,
    backgroundIndexedRef,
    deleteAsset,
    deleteAssetsByPrefix,
    isAssetRef,
    readAssetByRef,
    readAssetKeys,
    readAssetMap,
    readAsset,
    readAssetsByPrefix,
    resolveAssetKey,
    writeAsset,
    writeAssetByRef
  };

  const {
    assetRef: _assetRef,
    deleteAssetsByPrefix: _deleteAssetsByPrefix,
    isAssetRef: _isAssetRef,
    readAssetByRef: _readAssetByRef,
    readAssetKeys: _readAssetKeys,
    readAssetMap: _readAssetMap,
    readAssetsByPrefix: _readAssetsByPrefix,
    resolveAssetKey: _resolveAssetKey,
    writeAssetByRef: _writeAssetByRef
  } = pixelNewTabStorage;

  void [_assetRef, _deleteAssetsByPrefix, _isAssetRef, _readAssetByRef, _readAssetKeys, _readAssetMap, _readAssetsByPrefix, _resolveAssetKey, _writeAssetByRef];

  window.PixelNewTabStorage = pixelNewTabStorage;
})();
