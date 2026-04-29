export const assetDbName = "pixelNewTab.assets";
export const assetStoreName = "assets";
export const assetRefPrefix = "indexeddb:";

export const assetKeys = {
  backgroundOriginal: "background.original",
  backgroundCurrent: "background.current",
  backgroundDark: "background.dark",
  shortcutIconPrefix: "shortcut.icon.",
  musicCoverPrefix: "music.cover."
};

export const backgroundIndexedRef = "indexeddb:background.original";

export function assetRef(key) {
  return `${assetRefPrefix}${key}`;
}

export function isAssetRef(value) {
  return typeof value === "string" && value.startsWith(assetRefPrefix);
}

function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

export function resolveAssetKey(ref) {
  return isAssetRef(ref) ? ref.slice(assetRefPrefix.length) : "";
}

export function getShortcutIconAssetKey(shortcutId) {
  return `${assetKeys.shortcutIconPrefix}${shortcutId}`;
}

export function getShortcutIconAssetRef(shortcutId) {
  return assetRef(getShortcutIconAssetKey(shortcutId));
}

export function openAssetDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(assetDbName, 1);
    request.addEventListener("upgradeneeded", () => {
      request.result.createObjectStore(assetStoreName);
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

export async function writeAsset(key, value) {
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

export async function readAsset(key) {
  const db = await openAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(assetStoreName, "readonly");
    const request = transaction.objectStore(assetStoreName).get(key);
    request.addEventListener("success", () => resolve(request.result || ""));
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => db.close());
  });
}

export async function readAssetByRef(ref) {
  const key = resolveAssetKey(ref);
  if (!key) return "";
  return readAsset(key);
}

export async function writeAssetByRef(ref, value) {
  const key = resolveAssetKey(ref);
  if (!key) return;
  return writeAsset(key, value);
}

export async function deleteAsset(key) {
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

export async function readAssetKeys() {
  const db = await openAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(assetStoreName, "readonly");
    const request = transaction.objectStore(assetStoreName).getAllKeys();
    request.addEventListener("success", () => resolve(request.result || []));
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => db.close());
  });
}

export async function readAssetMap(keys) {
  const resolvedKeys = Array.isArray(keys) ? keys : await readAssetKeys();
  const entries = await Promise.all(
    resolvedKeys.map(async (key) => [key, await readAsset(key).catch(() => "")])
  );
  return Object.fromEntries(entries.filter(([, value]) => value));
}

export async function readAssetsByPrefix(prefix) {
  const keys = await readAssetKeys();
  return readAssetMap(keys.filter((key) => String(key).startsWith(prefix)));
}

export async function deleteAssetsByPrefix(prefix) {
  const keys = await readAssetKeys();
  await Promise.all(keys.filter((key) => String(key).startsWith(prefix)).map((key) => deleteAsset(key)));
}

export async function resolveShortcutIconSource(image) {
  if (!image) return "";
  if (isAssetRef(image)) return readAssetByRef(image).catch(() => "");
  return image;
}

export async function persistShortcutIconAsset(shortcutId, image, previousImage = "") {
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

export async function cleanupShortcutIconAsset(image) {
  if (!isAssetRef(image)) return;
  await deleteAsset(resolveAssetKey(image));
}
