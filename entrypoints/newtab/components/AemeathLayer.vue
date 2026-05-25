<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import MusicNoteRound from '~icons/ic/round-music-note'
import PauseRound from '~icons/ic/round-pause'
import PlayArrowRound from '~icons/ic/round-play-arrow'
import QueueMusicRound from '~icons/ic/round-queue-music'
import RepeatRound from '~icons/ic/round-repeat'
import RepeatOneRound from '~icons/ic/round-repeat-one'
import ShuffleRound from '~icons/ic/round-shuffle'
import SkipNextRound from '~icons/ic/round-skip-next'
import SkipPreviousRound from '~icons/ic/round-skip-previous'
import SubtitlesOffRound from '~icons/ic/round-subtitles-off'
import SubtitlesRound from '~icons/ic/round-subtitles'
import VolumeOffRound from '~icons/ic/round-volume-off'
import VolumeUpRound from '~icons/ic/round-volume-up'

import { useSettingsStore } from '@/shared/settings'

type Track = {
  id: string
  name: string
  artist: string
  url: string
  cover: string
  lrc?: string
}

type PetState = 'move' | 'seal' | 'sigh' | 'stare' | 'excited'
type PlayMode = 'list' | 'one' | 'random'
type LyricStatus = 'none' | 'loading' | 'loaded' | 'failed'
type LyricLine = {
  time: number
  text: string
}
type UnknownRecord = Record<string, unknown>

const petStates: Record<PetState, string> = {
  move: '/aemeath/pet/move.gif',
  seal: '/aemeath/pet/seal.gif',
  sigh: '/aemeath/pet/sigh.gif',
  stare: '/aemeath/pet/stare.gif',
  excited: '/aemeath/pet/excited.gif',
}

const audioRef = ref<HTMLAudioElement>()
const lyricContainerRef = ref<HTMLElement>()
const petRef = ref<HTMLElement>()
const petImage = ref(petStates.move)
const petReadyImages = new Set<string>()
const playerOpen = ref(false)
const isPlaying = ref(false)
const musicLoading = ref(false)
const musicError = ref('')
const tracks = ref<Track[]>([])
const activeIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const musicDrawerOpen = ref(false)
const lyricsDrawerOpen = ref(false)
const lyrics = ref<LyricLine[]>([])
const lyricStatus = ref<LyricStatus>('none')
const playMode = ref<PlayMode>('list')
const volume = ref(0.7)
const muted = ref(false)
const playWhenReady = ref(false)
const actionButtonsReady = ref(false)
const petFacingLeft = ref(false)
const petDragging = ref(false)
const petPosition = reactive({
  x: 0,
  y: 0,
})
const settings = useSettingsStore()
const musicCoverFallback = '/aemeath/favicon.jpeg'

let petInitialized = false
let petTarget: { x: number; y: number } | null = null
let petAnimationId = 0
let petIdleTimer = 0
let petReturnTimer = 0
let petLastMoveAt = 0
let petDragOffsetX = 0
let petDragOffsetY = 0
let petPointerMoved = false
let petLastPointerX = 0
let pointerMoveTicking = false
let lastClickEffectAt = 0
let lyricScrollTimer = 0
let userScrollingLyrics = false
let playlistLoadPromise: Promise<void> | null = null

const activeTrack = computed(() => tracks.value[activeIndex.value])
const musicProgress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))
const drawerOpen = computed(() => musicDrawerOpen.value || lyricsDrawerOpen.value)
const currentLyricIndex = computed(() => {
  let current = -1
  for (let index = 0; index < lyrics.value.length; index += 1) {
    if (currentTime.value >= lyrics.value[index].time) current = index
    else break
  }
  return current
})
const petMotionEnabled = computed(() => settings.aemeath.pet.motion !== false)
const meteorStyle = computed(() => ({
  '--aemeath-meteor-blur': `${Math.min(3.2, Math.max(0, settings.background.blur * 0.22))}px`,
}))
const petStyle = computed(() => ({
  transform: `translate3d(${Math.round(petPosition.x)}px, ${Math.round(petPosition.y)}px, 0)`,
}))

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' ? (value as UnknownRecord) : null
}

function asText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function pickText(record: UnknownRecord, keys: string[]): string {
  for (const key of keys) {
    const value = asText(record[key])
    if (value) return value
  }
  return ''
}

function isImageSource(value: string): boolean {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/') || /^data:image\//.test(value) || value.startsWith('blob:')
}

function pickCoverText(record: UnknownRecord, keys: string[]): string {
  for (const key of keys) {
    const value = asText(record[key]).trim()
    if (value && isImageSource(value)) return value
  }
  return ''
}

function pickNestedCoverText(record: UnknownRecord, key: string, nestedKeys: string[]): string {
  const nested = asRecord(record[key])
  return nested ? pickCoverText(nested, nestedKeys) : ''
}

function resolveTrackCover(record: UnknownRecord): string {
  const coverKeys = ['pic', 'picUrl', 'cover', 'picture', 'artwork', 'image', 'img', 'poster']
  return (
    pickCoverText(record, coverKeys) ||
    pickNestedCoverText(record, 'album', coverKeys) ||
    pickNestedCoverText(record, 'al', coverKeys)
  )
}

function unwrapPlaylistPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const data = asRecord(payload)
  if (!data) return []
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.result)) return data.result
  if (Array.isArray(data.playlist)) return data.playlist
  if (Array.isArray(data.songs)) return data.songs
  if (Array.isArray(data.list)) return data.list
  const dataRecord = asRecord(data.data)
  const playlistRecord = asRecord(data.playlist)
  if (Array.isArray(dataRecord?.songs)) return dataRecord.songs
  if (Array.isArray(dataRecord?.list)) return dataRecord.list
  if (Array.isArray(playlistRecord?.tracks)) return playlistRecord.tracks
  return []
}

function resolveMetingProxyUrl(url: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url, window.location.href)
    if (parsed.searchParams.get('type') === 'url') {
      parsed.searchParams.set('_t', String(Date.now()))
      return parsed.toString()
    }
  } catch {
    return url
  }
  return url
}

function normalizeArtist(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const record = asRecord(item)
        return record ? pickText(record, ['name']) || asText(item) : asText(item)
      })
      .filter(Boolean)
      .join(' / ')
  }
  const record = asRecord(value)
  return record ? pickText(record, ['name']) || asText(value) : asText(value)
}

function normalizeTrack(item: unknown, index: number): Track {
  const record = asRecord(item)
  if (!record) {
    return {
      id: `track-${index}`,
      name: 'Untitled',
      artist: '',
      url: '',
      cover: '',
      lrc: '',
    }
  }

  return {
    id: pickText(record, ['id', 'songId', 'songid']) || `track-${index}`,
    name: pickText(record, ['name', 'title', 'songname', 'songName']) || 'Untitled',
    artist: normalizeArtist(record.artist || record.artists || record.author || record.singer || record.ar),
    url: resolveMetingProxyUrl(
      pickText(record, ['url', 'src', 'link', 'audio', 'mp3', 'song_url', 'songUrl']),
    ),
    cover: resolveTrackCover(record),
    lrc: pickText(record, ['lrc', 'lyric', 'lyrics']),
  }
}

function parseLrc(value: string): LyricLine[] {
  if (!value) return []
  const timeReg = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g
  const parsed: LyricLine[] = []

  for (const line of value.split('\n')) {
    const matches = [...line.matchAll(timeReg)]
    if (matches.length === 0) continue
    const text = line.replace(timeReg, '').trim()
    if (!text) continue
    for (const match of matches) {
      const minute = Number(match[1])
      const second = Number(match[2])
      const millisecondRaw = match[3] || '0'
      const millisecond = Number(millisecondRaw) / (millisecondRaw.length === 3 ? 1000 : 100)
      parsed.push({ time: minute * 60 + second + millisecond, text })
    }
  }

  return parsed.sort((left, right) => left.time - right.time)
}

function isLrcUrl(value: string) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/') || /\.(lrc|txt)(\?|#|$)/i.test(value)
}

async function loadLyrics(track: Track) {
  lyrics.value = []
  lyricStatus.value = 'none'
  if (!track.lrc) return

  try {
    if (isLrcUrl(track.lrc)) {
      lyricStatus.value = 'loading'
      const response = await fetch(track.lrc, { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      lyrics.value = parseLrc(await response.text())
    } else {
      lyrics.value = parseLrc(track.lrc)
    }
    lyricStatus.value = lyrics.value.length > 0 ? 'loaded' : 'none'
  } catch (error) {
    lyrics.value = []
    lyricStatus.value = 'failed'
    console.warn('[Aemeath] Lyrics unavailable.', error)
  }
}

async function loadPlaylist() {
  if (!settings.aemeath.music.enabled || !settings.aemeath.music.playlistUrl) return
  if (playlistLoadPromise) return playlistLoadPromise
  playlistLoadPromise = (async () => {
    musicLoading.value = true
    musicError.value = ''
    try {
      const response = await fetch(settings.aemeath.music.playlistUrl, { cache: 'no-store' })
      if (!response.ok) return
      const payload = await response.json()
      tracks.value = unwrapPlaylistPayload(payload)
        .map(normalizeTrack)
        .filter((track) => track.url)
      if (tracks.value.length > 0) {
        selectTrack(Math.min(activeIndex.value, tracks.value.length - 1), playWhenReady.value)
        playWhenReady.value = false
        musicDrawerOpen.value = true
        lyricsDrawerOpen.value = false
      } else {
        musicError.value = 'No songs loaded'
      }
    } catch (error) {
      musicError.value = 'Playlist unavailable'
      console.warn('[Aemeath] Meting playlist unavailable.', error)
    } finally {
      musicLoading.value = false
    }
  })()

  try {
    await playlistLoadPromise
  } finally {
    playlistLoadPromise = null
  }
}

function selectTrack(index: number, play = false) {
  if (tracks.value.length === 0) return
  activeIndex.value = (index + tracks.value.length) % tracks.value.length
  const audio = audioRef.value
  const track = activeTrack.value
  if (!audio || !track) return
  musicError.value = ''
  audio.src = track.url
  audio.currentTime = 0
  applyAudioVolume()
  currentTime.value = 0
  duration.value = 0
  void loadLyrics(track)
  if (play) audio.play().catch(() => {})
}

function ensureTrackLoaded() {
  if (!audioRef.value?.src && activeTrack.value) selectTrack(activeIndex.value)
}

function toggleMusicPanel() {
  if (!settings.aemeath.music.enabled) return
  playerOpen.value = !playerOpen.value
  musicDrawerOpen.value = true
  lyricsDrawerOpen.value = false
  playWhenReady.value = false
  if (tracks.value.length === 0 && !musicLoading.value) void loadPlaylist()
}

async function toggleMusic() {
  if (!settings.aemeath.music.enabled) return
  playerOpen.value = true
  if (tracks.value.length === 0) {
    playWhenReady.value = true
    await loadPlaylist()
    const audio = audioRef.value
    if (!audio || tracks.value.length === 0) return
    ensureTrackLoaded()
    applyAudioVolume()
    if (audio.paused) audio.play().catch(() => {})
    return
  }
  const audio = audioRef.value
  if (!audio) return
  ensureTrackLoaded()
  applyAudioVolume()
  if (audio.paused) audio.play().catch(() => {})
  else audio.pause()
}

function nextTrack(auto = false) {
  if (tracks.value.length === 0) return
  if (playMode.value === 'one' && auto) {
    const audio = audioRef.value
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
    return
  }
  const nextIndex =
    playMode.value === 'random'
      ? Math.floor(Math.random() * tracks.value.length)
      : activeIndex.value + 1
  selectTrack(nextIndex, true)
}

function previousTrack() {
  if (tracks.value.length === 0) return
  const previousIndex =
    playMode.value === 'random'
      ? Math.floor(Math.random() * tracks.value.length)
      : activeIndex.value - 1
  selectTrack(previousIndex, true)
}

function cyclePlayMode() {
  playMode.value = playMode.value === 'list' ? 'one' : playMode.value === 'one' ? 'random' : 'list'
}

function togglePlaylistDrawer() {
  musicDrawerOpen.value = !musicDrawerOpen.value
  if (musicDrawerOpen.value) lyricsDrawerOpen.value = false
}

function toggleLyricsDrawer() {
  lyricsDrawerOpen.value = !lyricsDrawerOpen.value
  if (lyricsDrawerOpen.value) musicDrawerOpen.value = false
  scrollActiveLyric('auto', true)
}

function seekMusic(percent: number) {
  const audio = audioRef.value
  if (!audio || !duration.value) return
  audio.currentTime = Math.max(0, Math.min(1, percent)) * duration.value
}

function seekLyric(line: LyricLine) {
  const audio = audioRef.value
  if (!audio) return
  ensureTrackLoaded()
  audio.currentTime = line.time
  currentTime.value = line.time
  scrollActiveLyric('smooth', true)
}

function scrollActiveLyric(behavior: ScrollBehavior = 'smooth', force = false) {
  if (userScrollingLyrics && !force) return
  if (!lyricsDrawerOpen.value || currentLyricIndex.value < 0) return
  nextTick(() => {
    requestAnimationFrame(() => {
      const container = lyricContainerRef.value
      const line = container?.querySelector<HTMLElement>(`[data-lyric-index="${currentLyricIndex.value}"]`)
      if (!container || !line) return
      const containerRect = container.getBoundingClientRect()
      const lineRect = line.getBoundingClientRect()
      const lineCenter = lineRect.top - containerRect.top + container.scrollTop + lineRect.height / 2
      const target = lineCenter - container.clientHeight / 2
      container.scrollTo({ top: Math.max(0, target), behavior })
    })
  })
}

function markLyricsUserScrolling() {
  userScrollingLyrics = true
  window.clearTimeout(lyricScrollTimer)
  lyricScrollTimer = window.setTimeout(() => {
    userScrollingLyrics = false
    scrollActiveLyric('auto', true)
  }, 3000)
}

function applyAudioVolume() {
  const audio = audioRef.value
  if (!audio) return
  audio.volume = volume.value
  audio.muted = muted.value
}

function setVolume(value: number) {
  volume.value = Math.max(0, Math.min(1, value))
  muted.value = false
  applyAudioVolume()
}

function toggleMute() {
  muted.value = !muted.value
  applyAudioVolume()
}

function updateProgress() {
  const audio = audioRef.value
  if (!audio) return
  currentTime.value = audio.currentTime || 0
  duration.value = audio.duration || 0
}

function handleAudioError() {
  musicError.value = 'Playback error'
  isPlaying.value = false
}

function handleMusicCoverError(event: Event) {
  const image = event.target as HTMLImageElement
  if (image.src.endsWith(musicCoverFallback)) return
  image.src = musicCoverFallback
}

function formatTime(value: number) {
  if (!Number.isFinite(value)) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${seconds}`
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function petBounds() {
  const size = petRef.value?.getBoundingClientRect().width || 74
  const margin = 18
  return {
    size,
    minX: margin,
    minY: Math.max(76, margin),
    maxX: Math.max(margin, window.innerWidth - size - margin),
    maxY: Math.max(margin, window.innerHeight - size - 92),
  }
}

function placePet(x: number, y: number) {
  const bounds = petBounds()
  petPosition.x = Math.min(bounds.maxX, Math.max(bounds.minX, x))
  petPosition.y = Math.min(bounds.maxY, Math.max(bounds.minY, y))
}

function setPetImage(state: PetState) {
  const nextImage = petStates[state] || petStates.move
  petImage.value = petReadyImages.has(nextImage) ? nextImage : petStates.move
}

function preloadPetImages() {
  Object.values(petStates).forEach((src) => {
    const image = new Image()
    image.onload = () => petReadyImages.add(src)
    image.src = src
  })
  petReadyImages.add(petStates.move)
}

function setPetDirection(dx: number) {
  if (Math.abs(dx) < 1) return
  petFacingLeft.value = dx < 0
}

function randomPetTarget() {
  const bounds = petBounds()
  const forbidden = {
    x1: window.innerWidth * 0.22,
    x2: window.innerWidth * 0.78,
    y1: window.innerHeight * 0.22,
    y2: window.innerHeight * 0.6,
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = randomBetween(bounds.minX, bounds.maxX)
    const y = randomBetween(bounds.minY, bounds.maxY)
    if (x < forbidden.x1 || x > forbidden.x2 || y < forbidden.y1 || y > forbidden.y2) {
      return { x, y }
    }
  }

  return {
    x: randomBetween(bounds.minX, bounds.maxX),
    y: randomBetween(bounds.minY, bounds.maxY),
  }
}

function clearPetTimers() {
  window.clearTimeout(petIdleTimer)
  window.clearTimeout(petReturnTimer)
  window.cancelAnimationFrame(petAnimationId)
  petAnimationId = 0
}

function startPetIdle() {
  if (!settings.aemeath.pet.enabled || !petMotionEnabled.value || petDragging.value) return
  setPetImage(Math.random() > 0.5 ? 'seal' : 'sigh')
  petIdleTimer = window.setTimeout(startPetMove, 1800 + Math.random() * 2400)
}

function startPetMove() {
  if (!settings.aemeath.pet.enabled || !petMotionEnabled.value) {
    clearPetTimers()
    setPetImage('seal')
    return
  }
  if (petDragging.value) return
  window.clearTimeout(petIdleTimer)
  setPetImage('move')
  petTarget = randomPetTarget()
  setPetDirection(petTarget.x - petPosition.x)
  const speed = 0.85 + Math.random() * 0.45

  function step(now: number) {
    if (petDragging.value || !petTarget) return
    if (now - petLastMoveAt < 1000 / 24) {
      petAnimationId = requestAnimationFrame(step)
      return
    }
    petLastMoveAt = now

    const dx = petTarget.x - petPosition.x
    const dy = petTarget.y - petPosition.y
    const distance = Math.hypot(dx, dy)

    if (distance < 2) {
      placePet(petTarget.x, petTarget.y)
      petTarget = null
      startPetIdle()
      return
    }

    placePet(petPosition.x + (dx / distance) * speed, petPosition.y + (dy / distance) * speed)
    petAnimationId = requestAnimationFrame(step)
  }

  petAnimationId = requestAnimationFrame(step)
}

function startPetTemporaryState(state: PetState, duration = 1800) {
  if (petDragging.value) return
  clearPetTimers()
  setPetImage(state)
  petReturnTimer = window.setTimeout(startPetMove, duration)
}

function initPetPosition() {
  if (petInitialized) return
  petInitialized = true
  const bounds = petBounds()
  placePet(bounds.maxX - 8, bounds.maxY - 6)
}

function handlePetPointerDown(event: PointerEvent) {
  event.preventDefault()
  initPetPosition()
  clearPetTimers()
  petDragging.value = true
  petPointerMoved = false
  setPetImage('excited')
  const rect = petRef.value?.getBoundingClientRect()
  petDragOffsetX = event.clientX - (rect?.left || 0)
  petDragOffsetY = event.clientY - (rect?.top || 0)
  petLastPointerX = event.clientX
  petRef.value?.setPointerCapture(event.pointerId)
}

function handlePetPointerMove(event: PointerEvent) {
  if (!petDragging.value) return
  petPointerMoved = true
  if (pointerMoveTicking) return
  window.requestAnimationFrame(() => {
    setPetDirection(event.clientX - petLastPointerX)
    petLastPointerX = event.clientX
    placePet(event.clientX - petDragOffsetX, event.clientY - petDragOffsetY)
    pointerMoveTicking = false
  })
  pointerMoveTicking = true
}

function handlePetPointerUp(event: PointerEvent) {
  if (!petDragging.value) return
  petDragging.value = false
  if (petRef.value?.hasPointerCapture(event.pointerId)) {
    petRef.value.releasePointerCapture(event.pointerId)
  }
  startPetTemporaryState(petPointerMoved ? 'excited' : 'stare', petPointerMoved ? 950 : 1700)
}

function handlePetImageError() {
  if (petImage.value !== petStates.move) {
    petImage.value = petStates.move
  }
}

function spawnHeart(event: MouseEvent) {
  if (!settings.aemeath.effects.clickHearts) return
  if (event.button !== 0 && event.button !== undefined) return
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return
  if ((event.target as HTMLElement).closest('input, button, select, textarea, label, dialog')) return

  const now = performance.now()
  if (now - lastClickEffectAt < 180) return
  lastClickEffectAt = now

  for (let index = 0; index < 2; index += 1) {
    const heart = document.createElement('img')
    const angle = -135 + index * 40 + randomBetween(-12, 12)
    const distance = randomBetween(28, 88)
    const radians = (angle * Math.PI) / 180

    heart.src = '/aemeath/effects/blue-heart.png'
    heart.alt = ''
    heart.className = 'aemeath-click-heart'
    heart.style.setProperty('--click-x', `${event.clientX}px`)
    heart.style.setProperty('--click-y', `${event.clientY}px`)
    heart.style.setProperty('--heart-dx', `${Math.cos(radians) * distance}px`)
    heart.style.setProperty('--heart-dy', `${Math.sin(radians) * distance - randomBetween(8, 34)}px`)
    heart.style.setProperty('--heart-size', `${randomBetween(18, 34)}px`)
    heart.style.setProperty('--heart-scale', String(randomBetween(0.68, 1.18)))
    heart.style.setProperty('--heart-rotate', `${randomBetween(-18, 18)}deg`)
    heart.style.setProperty('--heart-delay', `${index * 26}ms`)
    heart.style.setProperty('--heart-duration', `${randomBetween(820, 1180)}ms`)
    document.body.append(heart)
    heart.addEventListener('animationend', () => heart.remove(), { once: true })
  }
}

useEventListener(document, 'click', spawnHeart)
useEventListener(window, 'resize', () => {
  if (!petInitialized) return
  placePet(petPosition.x, petPosition.y)
})

function readSavedVolume() {
  try {
    const savedVolumeRaw = localStorage.getItem('aemeath.music.volume')
    const savedVolume = savedVolumeRaw === null ? volume.value : Number(savedVolumeRaw)
    return Number.isFinite(savedVolume) && savedVolume > 0 ? savedVolume : volume.value
  } catch {
    return volume.value
  }
}

function saveVolume(value: number) {
  try {
    localStorage.setItem('aemeath.music.volume', String(value))
  } catch {
    // Audio remains usable even when browser storage is unavailable.
  }
}

onMounted(() => {
  preloadPetImages()
  void loadPlaylist()
  setVolume(readSavedVolume())
  nextTick(() => {
    applyAudioVolume()
    actionButtonsReady.value = Boolean(document.querySelector('.action-btn-container'))
  })
  nextTick(() => {
    initPetPosition()
    if (settings.aemeath.pet.enabled && petMotionEnabled.value) {
      petIdleTimer = window.setTimeout(startPetMove, 600)
    }
  })
})

onBeforeUnmount(() => {
  clearPetTimers()
  window.clearTimeout(lyricScrollTimer)
})

watch(
  () => [settings.aemeath.music.enabled, settings.aemeath.music.playlistUrl] as const,
  ([enabled, playlistUrl], [wasEnabled, previousPlaylistUrl]) => {
    if (wasEnabled && playlistUrl === previousPlaylistUrl) return
    if (!enabled) {
      playWhenReady.value = false
      audioRef.value?.pause()
      playerOpen.value = false
      musicDrawerOpen.value = false
      lyricsDrawerOpen.value = false
      tracks.value = []
      lyrics.value = []
      lyricStatus.value = 'none'
      activeIndex.value = 0
      currentTime.value = 0
      duration.value = 0
      return
    }

    const shouldResume = isPlaying.value
    tracks.value = []
    lyrics.value = []
    lyricStatus.value = 'none'
    activeIndex.value = 0
    currentTime.value = 0
    duration.value = 0
    playWhenReady.value = shouldResume
    void loadPlaylist()
  },
)

watch(currentLyricIndex, () => scrollActiveLyric())
watch(lyricsDrawerOpen, (open) => {
  if (open) scrollActiveLyric('auto', true)
})
watch(lyrics, () => scrollActiveLyric('auto', true))

watch(volume, (value) => {
  saveVolume(value)
})

watch(
  () => [settings.aemeath.pet.enabled, petMotionEnabled.value] as const,
  ([enabled, motion]) => {
    clearPetTimers()
    if (!enabled) return
    nextTick(() => {
      initPetPosition()
      if (motion) startPetIdle()
      else setPetImage('seal')
    })
  },
)
</script>

<template>
  <div v-if="settings.aemeath.effects.meteors" class="aemeath-effects" :style="meteorStyle" aria-hidden="true" />

  <Teleport v-if="settings.aemeath.music.enabled && actionButtonsReady" to=".action-btn-container">
    <div
      role="button"
      tabindex="0"
      class="action-btn aemeath-music-toggle"
      :class="{ 'is-playing': isPlaying }"
      aria-label="Open music player"
      @click.stop="toggleMusicPanel"
      @keydown.enter.stop="toggleMusicPanel"
    >
      <el-icon><music-note-round /></el-icon>
    </div>
  </Teleport>

  <section
    v-if="settings.aemeath.music.enabled"
    class="aemeath-music"
    :class="{ 'is-open': playerOpen, 'is-playing': isPlaying, 'is-drawer-open': drawerOpen }"
    aria-label="Aemeath music player"
  >
    <div class="aemeath-music__hero">
      <button class="aemeath-music__cover" type="button" aria-label="Toggle music" @click="toggleMusic">
        <img v-if="activeTrack?.cover" :src="activeTrack.cover" alt="" @error="handleMusicCoverError" />
        <el-icon v-else><music-note-round /></el-icon>
      </button>

      <div class="aemeath-music__copy">
        <strong>{{ activeTrack?.name || (musicLoading ? 'Loading playlist' : 'Meting Playlist') }}</strong>
        <span>{{ musicError || activeTrack?.artist || 'NetEase playlist connected' }}</span>
        <div class="aemeath-music__meta">
          <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          <button type="button" class="aemeath-music__icon-btn" :aria-label="muted ? 'Unmute' : 'Mute'" @click="toggleMute">
            <el-icon>
              <volume-off-round v-if="muted || volume === 0" />
              <volume-up-round v-else />
            </el-icon>
          </button>
          <div class="aemeath-music__volume">
            <input
              type="range"
              min="0"
              max="100"
              :value="muted ? 0 : Math.round(volume * 100)"
              :style="{ '--progress': `${muted ? 0 : volume * 100}%` }"
              @input="setVolume(Number(($event.target as HTMLInputElement).value) / 100)"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        class="aemeath-music__icon-btn"
        :class="{ 'is-active': lyricsDrawerOpen }"
        aria-label="Lyrics"
        @click="toggleLyricsDrawer"
      >
        <el-icon>
          <subtitles-round v-if="lyricsDrawerOpen" />
          <subtitles-off-round v-else />
        </el-icon>
      </button>
    </div>

    <div class="aemeath-music__progress">
      <input
        type="range"
        min="0"
        max="1000"
        :value="duration ? Math.round((currentTime / duration) * 1000) : 0"
        :style="{ '--progress': `${musicProgress}%` }"
        @input="
          seekMusic(Number(($event.target as HTMLInputElement).value) / 1000)
        "
      />
    </div>

    <div class="aemeath-music__controls">
      <button type="button" class="aemeath-music__icon-btn" :aria-label="`Play mode: ${playMode}`" @click="cyclePlayMode">
        <el-icon>
          <repeat-round v-if="playMode === 'list'" />
          <repeat-one-round v-else-if="playMode === 'one'" />
          <shuffle-round v-else />
        </el-icon>
      </button>
      <button type="button" class="aemeath-music__icon-btn" aria-label="Previous track" @click="previousTrack">
        <el-icon><skip-previous-round /></el-icon>
      </button>
      <button
        type="button"
        class="aemeath-music__play"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        @click="toggleMusic"
      >
        <el-icon>
          <pause-round v-if="isPlaying" />
          <play-arrow-round v-else />
        </el-icon>
      </button>
      <button type="button" class="aemeath-music__icon-btn" aria-label="Next track" @click="nextTrack()">
        <el-icon><skip-next-round /></el-icon>
      </button>
      <button
        type="button"
        class="aemeath-music__icon-btn"
        :class="{ 'is-active': musicDrawerOpen }"
        aria-label="Playlist"
        @click="togglePlaylistDrawer"
      >
        <el-icon><queue-music-round /></el-icon>
      </button>
    </div>

    <div class="aemeath-music__drawer">
      <div
        v-if="lyricsDrawerOpen"
        ref="lyricContainerRef"
        class="aemeath-music__lyrics"
        role="listbox"
        aria-label="Lyrics"
        @wheel.passive="markLyricsUserScrolling"
        @touchstart.passive="markLyricsUserScrolling"
      >
        <button
          v-for="(line, index) in lyrics"
          :key="`${line.time}-${index}`"
          type="button"
          class="aemeath-music__lyric"
          :class="{ 'is-active': index === currentLyricIndex }"
          :data-lyric-index="index"
          @click="seekLyric(line)"
        >
          {{ line.text }}
        </button>
        <p v-if="lyricStatus === 'loading'" class="aemeath-music__empty">Loading lyrics</p>
        <p v-else-if="lyricStatus === 'failed'" class="aemeath-music__empty">Lyrics unavailable</p>
        <p v-else-if="lyrics.length === 0" class="aemeath-music__empty">No lyrics</p>
      </div>

      <div v-if="musicDrawerOpen" class="aemeath-music__playlist" role="listbox" aria-label="Playlist">
        <button
          v-for="(track, index) in tracks"
          :key="track.id || `${track.url}-${index}`"
          type="button"
          class="aemeath-music__track"
          :class="{ 'is-active': index === activeIndex }"
          @click="selectTrack(index, true)"
        >
          <img :src="track.cover || musicCoverFallback" alt="" @error="handleMusicCoverError" />
          <span>
            <strong>{{ track.name }}</strong>
            <small>{{ track.artist || 'Unknown artist' }}</small>
          </span>
        </button>
        <p v-if="!musicLoading && tracks.length === 0" class="aemeath-music__empty">
          {{ musicError || 'No songs loaded' }}
        </p>
        <p v-else-if="musicLoading" class="aemeath-music__empty">Loading playlist</p>
      </div>
    </div>

    <audio
      ref="audioRef"
      preload="metadata"
      @timeupdate="updateProgress"
      @loadedmetadata="updateProgress"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @volumechange="audioRef ? ((volume = audioRef.volume), (muted = audioRef.muted)) : undefined"
      @ended="nextTrack(true)"
      @error="handleAudioError"
    />
  </section>

  <button
    v-if="settings.aemeath.pet.enabled"
    ref="petRef"
    class="aemeath-pet"
    :class="{ 'is-facing-left': petFacingLeft, 'is-dragging': petDragging }"
    :style="petStyle"
    type="button"
    aria-label="Aemeath pet"
    @pointerdown="handlePetPointerDown"
    @pointermove="handlePetPointerMove"
    @pointerup="handlePetPointerUp"
    @pointercancel="handlePetPointerUp"
  >
    <img :src="petImage" alt="" draggable="false" @error="handlePetImageError" />
  </button>
</template>
