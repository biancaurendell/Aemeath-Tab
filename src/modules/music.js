import { storageKeys, syncConfigFromLegacyStorage } from "../state/settings.js";
import { assetKeys, assetRef, isAssetRef, writeAsset, readAssetByRef, deleteAsset } from "../state/storage.js";
import { stopMeteorAnimation, startMeteorAnimation } from "./effects.js";

let domNodes = {};
let localMusicObjectUrl = "";
let playlistTracks = [];
let activeTrackIndex = -1;
let isSeekingMusic = false;
let activeLyrics = [];
let activeLyricIndex = -1;
let lyricRequestId = 0;
let lastFloatingLyricAt = 0;
let lastProgressPaintAt = 0;

let areLyricsEnabledCallback = () => true;

export function initMusic(nodes, options = {}) {
  domNodes = nodes;
  if (options.areLyricsEnabledCallback) {
    areLyricsEnabledCallback = options.areLyricsEnabledCallback;
  }

  if (domNodes.applyMusicButton) {
    domNodes.applyMusicButton.addEventListener("click", () => {
      applyMusicSource(domNodes.musicUrl ? domNodes.musicUrl.value : "");
    });
  }

  if (domNodes.loadPlaylistButton) {
    domNodes.loadPlaylistButton.addEventListener("click", () => {
      loadMetingPlaylist(domNodes.metingApiUrl ? domNodes.metingApiUrl.value : "");
    });
  }

  if (domNodes.musicFile) {
    domNodes.musicFile.addEventListener("change", () => {
      const file = domNodes.musicFile.files?.[0];
      applyLocalMusicFile(file);
    });
  }

  if (domNodes.musicCollapseButton) {
    domNodes.musicCollapseButton.addEventListener("click", () => {
      try {
        if (!domNodes.musicPlayer) return;
        const nowHidden = domNodes.musicPlayer.classList.toggle("is-hidden");
        // store showMusic = true when visible, false when hidden
        try { localStorage.setItem(storageKeys.showMusic, nowHidden ? "false" : "true"); } catch {}
        try { syncConfigFromLegacyStorage(); } catch {}
        // reflect global class used elsewhere
        try {
          if (nowHidden) document.documentElement.classList.add("prefers-music-hidden");
          else document.documentElement.classList.remove("prefers-music-hidden");
        } catch {}
      } catch (e) {
        // defensive: don't throw
      }
    });
  }

  if (domNodes.musicPlayButton) {
    domNodes.musicPlayButton.addEventListener("click", toggleMusic);
  }

  if (domNodes.musicPrevButton) {
    domNodes.musicPrevButton.addEventListener("click", () => {
      if (playAdjacentTrack(-1)) return;
      domNodes.musicAudio.currentTime = Math.max(0, domNodes.musicAudio.currentTime - 10);
    });
  }

  if (domNodes.musicNextButton) {
    domNodes.musicNextButton.addEventListener("click", () => {
      if (playAdjacentTrack(1)) return;
      if (Number.isFinite(domNodes.musicAudio.duration)) {
        domNodes.musicAudio.currentTime = Math.min(domNodes.musicAudio.duration, domNodes.musicAudio.currentTime + 10);
      }
    });
  }

  if (domNodes.neteaseButton) {
    domNodes.neteaseButton.addEventListener("click", () => {
      window.open("https://music.163.com/", "_blank", "noopener,noreferrer");
    });
  }

  if (domNodes.musicProgressBar) {
    domNodes.musicProgressBar.addEventListener("pointerdown", () => {
      isSeekingMusic = true;
    });

    domNodes.musicProgressBar.addEventListener("input", seekMusicFromProgress);

    domNodes.musicProgressBar.addEventListener("change", () => {
      seekMusicFromProgress();
      isSeekingMusic = false;
      updateMusicProgress();
    });

    domNodes.musicProgressBar.addEventListener("pointerup", () => {
      seekMusicFromProgress();
      isSeekingMusic = false;
      updateMusicProgress();
    });

    domNodes.musicProgressBar.addEventListener("pointercancel", () => {
      isSeekingMusic = false;
      updateMusicProgress();
    });
  }

  if (domNodes.musicAudio) {
    domNodes.musicAudio.addEventListener("play", syncMusicState);
    domNodes.musicAudio.addEventListener("playing", syncMusicState);
    domNodes.musicAudio.addEventListener("pause", syncMusicState);
    domNodes.musicAudio.addEventListener("loadedmetadata", updateMusicProgress);
    domNodes.musicAudio.addEventListener("durationchange", updateMusicProgress);
    domNodes.musicAudio.addEventListener("timeupdate", updateMusicProgress);
    domNodes.musicAudio.addEventListener("emptied", updateMusicProgress);
    domNodes.musicAudio.addEventListener("ended", () => {
      if (!playAdjacentTrack(1)) syncMusicState();
    });
  }
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 680px), (pointer: coarse)").matches;
}

function isMobileBackgroundPage() {
  return isMobileViewport() && document.hidden;
}

export function isMusicActivelyPlaying() {
  return domNodes.musicAudio && !domNodes.musicAudio.paused && !domNodes.musicAudio.ended;
}

function getMusicDuration() {
  return domNodes.musicAudio && Number.isFinite(domNodes.musicAudio.duration) && domNodes.musicAudio.duration > 0 ? domNodes.musicAudio.duration : 0;
}

function formatMusicTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function setProgressVisual(value) {
  const clamped = Math.min(1000, Math.max(0, Number(value) || 0));
  domNodes.musicProgressBar.value = String(Math.round(clamped));
  domNodes.musicProgressBar.style.setProperty("--progress", `${clamped / 10}%`);
}

export function updateMusicProgress() {
  if (!domNodes.musicAudio || !domNodes.musicProgressBar) return;
  const duration = getMusicDuration();
  const currentTime = Number.isFinite(domNodes.musicAudio.currentTime) ? domNodes.musicAudio.currentTime : 0;
  const now = performance.now();
  const shouldPaintProgress = !isMusicActivelyPlaying() || now - lastProgressPaintAt > 240;

  domNodes.musicProgressBar.disabled = !duration;
  if (!isSeekingMusic && shouldPaintProgress) {
    lastProgressPaintAt = now;
    setProgressVisual(duration ? (currentTime / duration) * 1000 : 0);
    domNodes.musicCurrentTime.textContent = formatMusicTime(currentTime);
  }
  if (shouldPaintProgress) domNodes.musicDuration.textContent = formatMusicTime(duration);
  updateDynamicLyric(currentTime);
}

function seekMusicFromProgress() {
  if (!domNodes.musicAudio) return;
  const duration = getMusicDuration();
  const progress = Number(domNodes.musicProgressBar.value) || 0;
  setProgressVisual(progress);

  if (!duration) {
    domNodes.musicCurrentTime.textContent = "0:00";
    return;
  }

  const nextTime = (progress / 1000) * duration;
  domNodes.musicCurrentTime.textContent = formatMusicTime(nextTime);
  domNodes.musicAudio.currentTime = nextTime;
}

export async function toggleMusic() {
  if (!domNodes.musicAudio) return;
  if (!domNodes.musicAudio.src) {
    window.open("https://music.163.com/", "_blank", "noopener,noreferrer");
    return;
  }

  try {
    if (domNodes.musicAudio.paused) {
      await domNodes.musicAudio.play();
    } else {
      domNodes.musicAudio.pause();
    }
  } catch (error) {
    console.warn("音乐无法播放，请确认链接是可直接播放的音频地址。", error);
  }
}

export function syncMusicState() {
  const playing = isMusicActivelyPlaying();
  document.body.classList.toggle("is-music-playing", playing);
  if (domNodes.musicPlayButton) {
    domNodes.musicPlayButton.textContent = playing ? "Ⅱ" : "▶";
  }
  if (playing) {
    stopMeteorAnimation();
  } else {
    startMeteorAnimation();
  }
  updateMusicProgress();
}

function setTrackCover(src) {
  if (!domNodes.trackCover) return;
  const cover = (src || "").trim();
  if (!cover) {
    domNodes.trackCover.removeAttribute("src");
    return;
  }
  domNodes.trackCover.src = cover;
}

function clearDynamicLyrics() {
  lyricRequestId += 1;
  activeLyrics = [];
  activeLyricIndex = -1;
  lastFloatingLyricAt = 0;
  if (domNodes.floatingLyrics) domNodes.floatingLyrics.innerHTML = "";
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
  if (!id || !domNodes.metingApiUrl || !domNodes.metingApiUrl.value) return "";

  try {
    const url = new URL(domNodes.metingApiUrl.value);
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
  if (!text || document.hidden || isMobileBackgroundPage() || !domNodes.floatingLyrics) return;
  const maxLyrics = isMobileViewport() ? 4 : 8;
  while (domNodes.floatingLyrics.children.length >= maxLyrics) {
    domNodes.floatingLyrics.firstElementChild?.remove();
  }
  const lyric = document.createElement("span");
  lyric.textContent = stripLyricTimestamps(text);
  if (!lyric.textContent) return;
  lyric.style.setProperty("--lyric-x", `${10 + Math.random() * 80}vw`);
  lyric.style.setProperty("--lyric-y", `${12 + Math.random() * 58}vh`);
  lyric.style.setProperty("--lyric-size", `${18 + Math.random() * 18}px`);
  lyric.style.setProperty("--lyric-dur", `${3.2 + Math.random() * 1.8}s`);
  lyric.style.setProperty("--lyric-tilt", `${-4 + Math.random() * 8}deg`);
  domNodes.floatingLyrics.append(lyric);
  lyric.addEventListener("animationend", () => lyric.remove(), { once: true });
}

function updateDynamicLyric(currentTime) {
  if (!areLyricsEnabledCallback()) return;
  if (document.hidden) return;
  if (!domNodes.musicAudio || domNodes.musicAudio.paused || !activeLyrics.length || !Number.isFinite(currentTime)) return;

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

export function clearFloatingLyricNodes() {
  if (domNodes.floatingLyrics) domNodes.floatingLyrics.innerHTML = "";
}

export function syncLyricCursorToCurrentTime() {
  if (!activeLyrics.length || !domNodes.musicAudio || !Number.isFinite(domNodes.musicAudio.currentTime)) {
    activeLyricIndex = -1;
    lastFloatingLyricAt = 0;
    return;
  }
  let index = -1;
  for (let i = 0; i < activeLyrics.length; i += 1) {
    if (domNodes.musicAudio.currentTime >= activeLyrics[i].time) {
      index = i;
    } else {
      break;
    }
  }
  activeLyricIndex = index;
  lastFloatingLyricAt = domNodes.musicAudio.currentTime;
}

export function applyMusicSource(value, { revealPlayer = true } = {}) {
  const url = value.trim();
  if (!url) return;
  if (domNodes.musicAudio) {
    domNodes.musicAudio.src = url;
    domNodes.musicAudio.currentTime = 0;
  }
  activeTrackIndex = -1;
  setTrackCover("");
  clearDynamicLyrics();
  updateMusicProgress();
  renderPlaylist();
  try { localStorage.setItem(storageKeys.musicUrl, url); } catch {}
  if (revealPlayer) {
    try { localStorage.setItem(storageKeys.showMusic, "true"); } catch {}
    try { syncConfigFromLegacyStorage(); } catch {}
    try { if (domNodes.musicPlayer) domNodes.musicPlayer.classList.remove("is-hidden"); } catch {}
    try { document.documentElement.classList.remove("prefers-music-hidden"); } catch {}
  }
  if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = "Direct Audio";
  if (domNodes.trackTitle) {
    try {
      const parsed = new URL(url);
      const filename = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "网易云音乐");
      domNodes.trackTitle.textContent = filename.replace(/\.(mp3|ogg|wav|m4a)$/i, "") || "网易云音乐";
    } catch {
      domNodes.trackTitle.textContent = "网易云音乐";
    }
  }
}

export function applyLocalMusicFile(file) {
  if (!file || !domNodes.musicAudio) return;
  if (localMusicObjectUrl) URL.revokeObjectURL(localMusicObjectUrl);
  localMusicObjectUrl = URL.createObjectURL(file);
  domNodes.musicAudio.src = localMusicObjectUrl;
  domNodes.musicAudio.currentTime = 0;
  activeTrackIndex = -1;
  if (domNodes.trackTitle) domNodes.trackTitle.textContent = file.name.replace(/\.(mp3|ogg|wav|m4a|flac)$/i, "");
  if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = "Local Audio";
  setTrackCover("");
  clearDynamicLyrics();
  renderPlaylist();
  updateMusicProgress();
  try { localStorage.removeItem(storageKeys.musicUrl); } catch {}
  try { localStorage.setItem(storageKeys.showMusic, "true"); } catch {}
  try { syncConfigFromLegacyStorage(); } catch {}
  try { if (domNodes.musicPlayer) domNodes.musicPlayer.classList.remove("is-hidden"); } catch {}
  try { document.documentElement.classList.remove("prefers-music-hidden"); } catch {}
  if (domNodes.musicUrl) domNodes.musicUrl.value = "";
}

export async function deleteLocalMusicAsset() {
  if (localMusicObjectUrl) URL.revokeObjectURL(localMusicObjectUrl);
  localMusicObjectUrl = "";
  if (domNodes.musicAudio) domNodes.musicAudio.removeAttribute("src");
  if (domNodes.trackTitle) domNodes.trackTitle.textContent = "未选择文件";
  if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = "Local Audio";
  setTrackCover("");
  clearDynamicLyrics();
  updateMusicProgress();
  syncMusicState();
  if (domNodes.musicLocalFileText) domNodes.musicLocalFileText.textContent = "选择本地音频文件...";
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
  if (!domNodes.playlistPanel) return;
  domNodes.playlistPanel.innerHTML = "";
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
    domNodes.playlistPanel.append(button);
  });
}

export async function loadMetingPlaylist(url, { silent = false, revealPlayer = true } = {}) {
  const apiUrl = (url || "").trim();
  if (!apiUrl) return;

  if (domNodes.metingApiUrl) domNodes.metingApiUrl.value = apiUrl;
  localStorage.setItem(storageKeys.metingApiUrl, apiUrl);
  syncConfigFromLegacyStorage();
  if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = "Loading playlist...";

  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) {
      console.warn(`Meting playlist load failed. HTTP ${response.status}`);
      if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = "Playlist unavailable";
      if (!silent) alert("歌单加载失败，请确认 Meting API 可以跨域访问，并且返回了歌曲 url。");
      return;
    }
    const payload = await response.json();
    const tracks = normalizePlaylistTracks(payload);
    if (!tracks.length) {
      console.warn("Meting playlist load failed. No playable track url in playlist.");
      if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = "Playlist unavailable";
      if (!silent) alert("歌单加载失败，请确认 Meting API 可以跨域访问，并且返回了歌曲 url。");
      return;
    }

    playlistTracks = tracks;
    activeTrackIndex = 0;
    renderPlaylist();
    selectPlaylistTrack(0, false, { revealPlayer });
  } catch (error) {
    console.warn("Meting playlist load failed.", error);
    if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = "Playlist unavailable";
    if (!silent) alert("歌单加载失败，请确认 Meting API 可以跨域访问，并且返回了歌曲 url。");
  }
}

async function resolveMusicCoverSource(track) {
  if (!track) return "";
  if (track.cover && isUrlLike(track.cover)) return track.cover;
  const assetKey = `${assetKeys.musicCoverPrefix}${track.id}`;
  const stored = await readAssetByRef(assetRef(assetKey)).catch(() => "");
  if (stored) return stored;
  return "";
}

async function cacheMusicCoverAsset(track) {
  if (!track || !track.cover || !track.id) return;
  try {
    const assetKey = `${assetKeys.musicCoverPrefix}${track.id}`;
    const stored = await readAssetByRef(assetRef(assetKey)).catch(() => "");
    if (stored) return;

    const response = await fetch(track.cover, { cache: "force-cache" });
    if (!response.ok) return;
    const blob = await response.blob();
    const reader = new FileReader();
    const base64 = await new Promise((resolve, reject) => {
      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", reject);
      reader.readAsDataURL(blob);
    });

    if (typeof base64 !== "string") return;
    await writeAsset(assetKey, base64);
  } catch (error) {
    console.warn("Music cover fetch or cache failed.", error);
  }
}

async function cleanupMusicCoverAsset(trackId) {
  if (!trackId) return;
  const assetKey = `${assetKeys.musicCoverPrefix}${trackId}`;
  await deleteAsset(assetKey);
}

async function selectPlaylistTrack(index, shouldPlay = false, { revealPlayer = true } = {}) {
  const track = playlistTracks[index];
  if (!track) return;

  activeTrackIndex = index;
  if (domNodes.musicAudio) {
    domNodes.musicAudio.src = track.url;
    domNodes.musicAudio.currentTime = 0;
  }
  if (domNodes.trackTitle) domNodes.trackTitle.textContent = track.title;
  if (domNodes.trackSubtitle) domNodes.trackSubtitle.textContent = track.artist || "Netease Playlist";
  setTrackCover(await resolveMusicCoverSource(track));
  clearDynamicLyrics();
  const requestId = ++lyricRequestId;
  localStorage.removeItem(storageKeys.musicUrl);
  if (revealPlayer) {
    try { localStorage.setItem(storageKeys.showMusic, "true"); } catch {}
    try { syncConfigFromLegacyStorage(); } catch {}
    try { if (domNodes.musicPlayer) domNodes.musicPlayer.classList.remove("is-hidden"); } catch {}
    try { document.documentElement.classList.remove("prefers-music-hidden"); } catch {}
  }
  if (domNodes.musicUrl) domNodes.musicUrl.value = "";
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

  if (shouldPlay && domNodes.musicAudio) {
    try {
      await domNodes.musicAudio.play();
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

export function buildAlbumSpectrum(container) {
  if (!container) return;
  container.innerHTML = "";
  for (let index = 0; index < 46; index += 1) {
    const bar = document.createElement("i");
    const leftStackLevel = 1.06 - index * 0.085;
    const tailLevel = 0.14 + Math.random() * 0.08;
    const level = index < 10 ? Math.max(0.26, leftStackLevel) : tailLevel;
    bar.className = "spectrum-bar";
    bar.style.setProperty("--i", index);
    bar.style.setProperty("--level", String(level));
    container.append(bar);
  }
}

export function buildSpectrum(container, count) {
  if (!container) return;
  container.innerHTML = "";
  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement("i");
    bar.className = "spectrum-bar";
    bar.style.setProperty("--i", index);
    bar.style.setProperty("--level", String(0.22 + Math.random() * 0.86));
    container.append(bar);
  }
}

export function buildMusicNotes(container, count, lower = 0, upper = 100) {
  if (!container) return;
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
