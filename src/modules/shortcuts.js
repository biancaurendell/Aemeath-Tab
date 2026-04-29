// src/modules/shortcuts.js

import { storageKeys, syncConfigFromLegacyStorage } from "../state/settings.js";
import { isAssetRef, resolveShortcutIconSource, persistShortcutIconAsset, cleanupShortcutIconAsset } from "../state/storage.js";

export const shortcutColors = ["#5896f2", "#f7c84e", "#f25c57", "#66513f", "#93bd69", "#315caa", "#d5b76c", "#3e2d39", "#cc4049", "#3769bb", "#9dd3a4", "#e6e8ef"];

let shortcuts = [];
let shortcutLayout = { rows: 1, columns: 5, paging: true };
let shortcutPage = 0;
let draggedShortcutId = "";
let editingShortcutId = "";
let editingShortcutIconAssetRef = "";
export let activeShortcutId = "";
export let selectedShortcutColor = shortcutColors[0];
export let uploadedIcon = "";

// ...existing code...

// DOM Elements
let shortcutRow, addShortcutButton, shortcutPager, shortcutMenu, shortcutDialog, shortcutForm;
let shortcutUrl, shortcutName, shortcutIconText, shortcutKey, colorSwatches, textIconPreview, uploadIconPreview;
let saveShortcutButton, saveMoreShortcutButton, shortcutDialogTitle;
let shortcutRowsInput, shortcutColumnsInput, shortcutPagingToggle;

export function getShortcuts() {
  return shortcuts;
}

export function setShortcuts(data) {
  shortcuts = data || [];
}

function readBoolStorage(key, fallback) {
  const value = localStorage.getItem(key);
  return value === null ? fallback : value === "true";
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 680px), (pointer: coarse)").matches;
}

export function readShortcutLayout() {
  shortcutLayout = {
    rows: clampNumber(localStorage.getItem(storageKeys.shortcutRows), 1, 3, 1),
    columns: clampNumber(localStorage.getItem(storageKeys.shortcutColumns), 3, 8, 5),
    paging: readBoolStorage(storageKeys.shortcutPaging, true)
  };
  return shortcutLayout;
}

export function saveShortcutLayout() {
  localStorage.setItem(storageKeys.shortcutRows, String(shortcutLayout.rows));
  localStorage.setItem(storageKeys.shortcutColumns, String(shortcutLayout.columns));
  localStorage.setItem(storageKeys.shortcutPaging, String(shortcutLayout.paging));
  syncConfigFromLegacyStorage();
}

function updateRangeVisual(input) {
  if (!input) return;
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 100;
  const value = Number(input.value) || 0;
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  // Use the same CSS variable name as the main app (`--range-progress`) so range visuals show correctly
  input.style.setProperty("--range-progress", `${Math.min(100, Math.max(0, progress))}%`);
}

export function syncShortcutLayoutControls() {
  if (!shortcutRowsInput) return;
  shortcutRowsInput.value = String(shortcutLayout.rows);
  shortcutColumnsInput.value = String(shortcutLayout.columns);
  shortcutPagingToggle.checked = shortcutLayout.paging;
  updateRangeVisual(shortcutRowsInput);
  updateRangeVisual(shortcutColumnsInput);
}

function getEffectiveShortcutColumns() {
  return isMobileViewport() ? Math.min(shortcutLayout.columns, 4) : shortcutLayout.columns;
}

function getShortcutSlotsPerPage() {
  return Math.max(1, shortcutLayout.rows * getEffectiveShortcutColumns());
}

function getShortcutPageCount() {
  if (!shortcutLayout.paging) return 1;
  return Math.max(1, Math.ceil((shortcuts.length + 1) / getShortcutSlotsPerPage()));
}

function clampShortcutPage() {
  shortcutPage = Math.min(shortcutPage, getShortcutPageCount() - 1);
  shortcutPage = Math.max(0, shortcutPage);
}

export function saveShortcuts() {
  localStorage.setItem(storageKeys.shortcuts, JSON.stringify(shortcuts));
  syncConfigFromLegacyStorage();
}

export function renderShortcuts() {
   if (!shortcutRow) return;
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

   // 添加按钮始终显示（由设置中的"显示图标"控制整体可见性）
   // 不再使用单独的隐藏功能
   const shouldShowAdd = !shortcutLayout.paging || shortcutPage === totalPages - 1;
   if (addShortcutButton) {
     addShortcutButton.hidden = !shouldShowAdd;
   }
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

// ...existing code...

export function openShortcutMenu(event, shortcutId) {
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

export function closeShortcutMenu() {
   if (!shortcutMenu) return;
   shortcutMenu.classList.remove("is-open");
   shortcutMenu.setAttribute("aria-hidden", "true");
   activeShortcutId = "";
 }

export function buildColorSwatches() {
  if (!colorSwatches) return;
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

export function resetShortcutForm() {
  shortcutForm.reset();
  editingShortcutId = "";
  editingShortcutIconAssetRef = "";
  shortcutDialogTitle.textContent = "添加快速访问";
  saveShortcutButton.textContent = "好";
  if (saveMoreShortcutButton) saveMoreShortcutButton.hidden = true;
  shortcutIconText.value = "A";
  shortcutKey.value = "";
  selectedShortcutColor = shortcutColors[0];
  uploadedIcon = "";
  uploadIconPreview.textContent = "＋";
  uploadIconPreview.style.backgroundImage = "";
  for (const item of colorSwatches.children) item.classList.toggle("active", item === colorSwatches.firstElementChild);
  updateShortcutPreview();
}

export async function openShortcutEditor(shortcut) {
  resetShortcutForm();
  editingShortcutId = shortcut.id;
  shortcutDialogTitle.textContent = "修改快速访问";
  saveShortcutButton.textContent = "好";
  if (saveMoreShortcutButton) saveMoreShortcutButton.hidden = true;
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

export function updateShortcutPreview() {
  // textIconPreview removed in simplified dialog — no-op kept for compatibility
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

export function faviconForUrl(value) {
  try {
    const parsed = new URL(getValidShortcutUrl(value));
    const domain = parsed.hostname;

    // 使用国内CDN服务获取网站图标
    // 优先使用 360 浏览器的图标服务（国内可靠）
    // 格式：https://bos.360.cn/v2/favicon/?q=domain
    return `https://bos.360.cn/v2/favicon/?q=${encodeURIComponent(domain)}`;
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

export async function saveShortcut({ keepOpen = false } = {}) {
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

export function setUploadedIcon(val) {
  uploadedIcon = val;
}

export function deleteShortcut(id) {
  const index = shortcuts.findIndex((item) => item.id === id);
  if (index >= 0) {
    const deleted = shortcuts.splice(index, 1)[0];
    if (deleted.image) {
      cleanupShortcutIconAsset(deleted.image).catch((error) => console.warn("快捷图标资源删除失败。", error));
    }
    saveShortcuts();
    renderShortcuts();
  }
}

export function handleShortcutLayoutChange(layoutProperty, value) {
  shortcutLayout[layoutProperty] = value;
  shortcutPage = 0;
  saveShortcutLayout();
  renderShortcuts();
}

export function initShortcuts(domNodes) {
  shortcutRow = domNodes.shortcutRow;
  addShortcutButton = domNodes.addShortcutButton;
  shortcutPager = domNodes.shortcutPager;
  shortcutMenu = domNodes.shortcutMenu;
  shortcutDialog = domNodes.shortcutDialog;
  shortcutForm = domNodes.shortcutForm;
  shortcutUrl = domNodes.shortcutUrl;
  shortcutName = domNodes.shortcutName;
  shortcutIconText = domNodes.shortcutIconText;
  shortcutKey = domNodes.shortcutKey;
  colorSwatches = domNodes.colorSwatches;
  textIconPreview = domNodes.textIconPreview;
  uploadIconPreview = domNodes.uploadIconPreview;
  saveShortcutButton = domNodes.saveShortcutButton;
  saveMoreShortcutButton = domNodes.saveMoreShortcutButton;
  shortcutDialogTitle = domNodes.shortcutDialogTitle;
  shortcutRowsInput = domNodes.shortcutRowsInput;
  shortcutColumnsInput = domNodes.shortcutColumnsInput;
  shortcutPagingToggle = domNodes.shortcutPagingToggle;

   readShortcutLayout();
   syncShortcutLayoutControls();

   if (domNodes.shortcutPagingToggle) {
    domNodes.shortcutPagingToggle.addEventListener("change", () => {
      handleShortcutLayoutChange("paging", domNodes.shortcutPagingToggle.checked);
    });
  }

  if (domNodes.shortcutColumnsInput) {
    domNodes.shortcutColumnsInput.addEventListener("input", () => {
      handleShortcutLayoutChange("columns", clampNumber(domNodes.shortcutColumnsInput.value, 3, 8, 5));
      updateRangeVisual(domNodes.shortcutColumnsInput);
    });
  }

  if (domNodes.shortcutRowsInput) {
    domNodes.shortcutRowsInput.addEventListener("input", () => {
      handleShortcutLayoutChange("rows", clampNumber(domNodes.shortcutRowsInput.value, 1, 3, 1));
      updateRangeVisual(domNodes.shortcutRowsInput);
    });
  }

   if (addShortcutButton) {
     addShortcutButton.addEventListener("click", () => {
       resetShortcutForm();
       shortcutDialog.showModal();
       shortcutName.focus();
     });
   }

   if (domNodes.cancelShortcutButton) {
    domNodes.cancelShortcutButton.addEventListener("click", () => {
      shortcutDialog.close();
    });
  }

  if (domNodes.closeShortcutDialogButton) {
    domNodes.closeShortcutDialogButton.addEventListener("click", () => {
      shortcutDialog.close();
    });
  }

  if (shortcutForm) {
    shortcutForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveShortcut({ keepOpen: event.submitter === saveMoreShortcutButton }).catch((error) => console.error("快捷方式保存失败。", error));
    });
  }

  if (shortcutName) {
    shortcutName.addEventListener("input", () => {
      if (!shortcutIconText.value.trim()) {
        shortcutIconText.value = shortcutName.value.slice(0, 1).toUpperCase();
        updateShortcutPreview();
      }
    });
  }

  if (shortcutIconText) {
    shortcutIconText.addEventListener("input", updateShortcutPreview);
  }

  if (shortcutKey) {
    shortcutKey.addEventListener("keydown", (event) => {
      event.preventDefault();
      if (["Backspace", "Delete", "Escape"].includes(event.key)) {
        shortcutKey.value = "";
        return;
      }
      const keys = [];
      if (event.ctrlKey) keys.push("Ctrl");
      if (event.altKey) keys.push("Alt");
      if (event.shiftKey) keys.push("Shift");
      if (event.metaKey) keys.push("Meta");
      if (!["Control", "Alt", "Shift", "Meta"].includes(event.key)) keys.push(event.key.toUpperCase());
      shortcutKey.value = keys.join("+");
    });
  }

  if (domNodes.clearShortcutKeyButton) {
    domNodes.clearShortcutKeyButton.addEventListener("click", () => {
      shortcutKey.value = "";
    });
  }

  if (domNodes.fetchIconButton) {
    domNodes.fetchIconButton.addEventListener("click", () => {
      const icon = faviconForUrl(shortcutUrl.value);
      if (!icon) return;
      setUploadedIcon(icon);
      uploadIconPreview.textContent = "";
      uploadIconPreview.style.backgroundImage = `url("${icon}")`;
    });
  }

  // Auto-fetch favicon when URL field loses focus (since explicit button is hidden)
  if (shortcutUrl) {
    shortcutUrl.addEventListener("blur", () => {
      if (uploadedIcon) return; // already has an icon
      const icon = faviconForUrl(shortcutUrl.value);
      if (!icon) return;
      setUploadedIcon(icon);
      if (uploadIconPreview) {
        uploadIconPreview.textContent = "";
        uploadIconPreview.style.backgroundImage = `url("${icon}")`;
      }
    });
  }

  if (domNodes.iconUpload) {
    domNodes.iconUpload.addEventListener("change", () => {
      const file = domNodes.iconUpload.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (typeof reader.result !== "string") return;
        setUploadedIcon(reader.result);
        if (uploadIconPreview) {
          uploadIconPreview.textContent = "";
          uploadIconPreview.style.backgroundImage = `url("${reader.result}")`;
        }
      });
      reader.readAsDataURL(file);
    });
  }

  if (shortcutMenu) {
    shortcutMenu.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      const shortcut = shortcuts.find((item) => item.id === activeShortcutId);
      closeShortcutMenu();
      if (!shortcut) return;
      
      if (action === "open" || action === "open-new") {
        window.open(shortcut.url, "_blank", "noopener,noreferrer");
      } else if (action === "edit") {
        openShortcutEditor(shortcut).catch((error) => console.error("打开快捷方式编辑器失败。", error));
      } else if (action === "delete" && window.confirm(`删除快捷方式“${shortcut.name}”？`)) {
        deleteShortcut(shortcut.id);
      }
    });
  }
}

export function handleDocumentClickForShortcuts(event) {
  if (shortcutMenu && !shortcutMenu.contains(event.target)) closeShortcutMenu();
}

export function handleDocumentKeydownForShortcuts(event) {
  if (event.key === "Escape") closeShortcutMenu();

  const combo = [];
  if (event.ctrlKey) combo.push("Ctrl");
  if (event.altKey) combo.push("Alt");
  if (event.shiftKey) combo.push("Shift");
  if (event.metaKey) combo.push("Meta");
  if (!["Control", "Alt", "Shift", "Meta"].includes(event.key)) combo.push(event.key.toUpperCase());
  const pressed = combo.join("+");
  const match = shortcuts.find((shortcut) => shortcut.hotkey && shortcut.hotkey === pressed);
  if (match) window.location.href = match.url;
}
