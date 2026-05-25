<script lang="ts" setup>
import { useDebounceFn, useEventListener, useIntervalFn, useNow } from '@vueuse/core'
import type { Session } from '@supabase/supabase-js'
import AddRound from '~icons/ic/round-add'
import AccountCircleRound from '~icons/ic/round-account-circle'
import CheckBoxRound from '~icons/ic/round-check-box'
import CheckBoxOutlineBlankRound from '~icons/ic/round-check-box-outline-blank'
import CloseRound from '~icons/ic/round-close'
import DeleteRound from '~icons/ic/round-delete'
import KeyboardArrowDownRound from '~icons/ic/round-keyboard-arrow-down'
import KeyboardCommandKeyRound from '~icons/ic/round-keyboard-command-key'
import LaunchRound from '~icons/ic/round-launch'
import OpenInNewRound from '~icons/ic/round-open-in-new'
import PauseRound from '~icons/ic/round-pause'
import PlayArrowRound from '~icons/ic/round-play-arrow'
import SearchRound from '~icons/ic/round-search'
import SettingsRound from '~icons/ic/round-settings'
import TaskAltRound from '~icons/ic/round-task-alt'
import TimerRound from '~icons/ic/round-timer'
import TodayRound from '~icons/ic/round-today'

import { changeTheme } from '@/shared/theme/change'

import {
  createCloudSyncClient,
  fetchRemoteSnapshot,
  getCloudDeviceId,
  getCurrentSession,
  getLocalCloudVersion,
  isCloudSyncConfigured,
  onAuthStateChanged,
  pushRemoteSnapshot,
  setLocalCloudVersion,
  signInWithEmail,
  signOut,
  type CloudflareAppearanceSettings,
  type CloudflareBoardState,
  type CloudflareFeatureSettings,
  type CloudflareSyncSnapshot,
  type CloudSyncConflict,
  type CloudSyncStatus,
} from './sync'

type EngineKey = 'google' | 'bing' | 'baidu' | 'duckduckgo' | 'yandex'

const cloudflareThemeColor = '#f59db1'

const engines: Record<EngineKey, { name: string; url: string; icon: string }> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=%s',
    icon: '/aemeath/search/google.svg',
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=%s',
    icon: '/aemeath/search/bing.svg',
  },
  baidu: {
    name: 'Baidu',
    url: 'https://www.baidu.com/#ie=utf-8&wd=%s',
    icon: '/aemeath/search/baidu.svg',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=%s',
    icon: '/aemeath/search/duckduckgo.svg',
  },
  yandex: {
    name: 'Yandex',
    url: 'https://yandex.com/search?text=%s',
    icon: '/aemeath/search/yandex.svg',
  },
}

const shortcuts = [
  { title: 'GitHub', url: 'https://github.com', tone: '#f6f8fa' },
  { title: 'Cloudflare', url: 'https://dash.cloudflare.com', tone: '#ffd7a8' },
  { title: 'Notion', url: 'https://www.notion.so', tone: '#ffffff' },
  { title: 'Bilibili', url: 'https://www.bilibili.com', tone: '#bdefff' },
  { title: 'YouTube', url: 'https://www.youtube.com', tone: '#ffd1d1' },
  { title: 'Figma', url: 'https://www.figma.com', tone: '#d7ccff' },
]

const defaultBoard: CloudflareBoardState = {
  focus: '',
  note: '',
  tasks: [],
  collapsed: false,
  timerMode: 'focus',
  timerRemaining: 25 * 60,
  timerRunning: false,
}

const defaultFeatures: CloudflareFeatureSettings = {
  clock: true,
  date: true,
  search: true,
  shortcuts: true,
  dailyBoard: true,
  accountButton: true,
  commandButton: true,
  cloudflareButton: false,
  background: true,
  vignette: true,
}

const defaultAppearance: CloudflareAppearanceSettings = {
  primaryColor: cloudflareThemeColor,
  colorfulMode: true,
}

const storagePrefix = 'aemeath-cloudflare:'
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInputRef')
const focusInputRef = useTemplateRef<HTMLInputElement>('focusInputRef')
const commandInputRef = useTemplateRef<HTMLInputElement>('commandInputRef')

const searchText = ref('')
const engine = ref<EngineKey>(normalizeEngine(readStorage('engine', 'google')))
const commandOpen = ref(false)
const commandQuery = ref('')
const accountOpen = ref(false)
const settingsOpen = ref(false)
const email = ref('')
const authMessage = ref('')
const authError = ref('')
const syncStatus = ref<CloudSyncStatus>(isCloudSyncConfigured ? 'signed-out' : 'disabled')
const session = ref<Session | null>(null)
const cloudConflict = ref<CloudSyncConflict | null>(null)

const now = useNow({ interval: 1000 })
const dateNow = useNow({ interval: 60 * 1000 })
const state = reactive<CloudflareBoardState>({
  ...defaultBoard,
  ...readStorage('dailyBoard', defaultBoard),
  timerRunning: false,
})
const features = reactive<CloudflareFeatureSettings>({
  ...defaultFeatures,
  ...readStorage('features', defaultFeatures),
})
const appearance = reactive<CloudflareAppearanceSettings>({
  ...defaultAppearance,
  ...readStorage('appearance', defaultAppearance),
})
const newTask = ref('')
const supabase = createCloudSyncClient()
let isApplyingCloud = false

const formattedTime = computed(() => {
  const date = now.value
  return {
    hour: String(date.getHours()).padStart(2, '0'),
    minute: String(date.getMinutes()).padStart(2, '0'),
    second: String(date.getSeconds()).padStart(2, '0'),
  }
})

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(dateNow.value)
})

const todayLabel = computed(() => {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())
})

const currentEngine = computed(() => engines[engine.value])
const signedInUser = computed(() => session.value?.user ?? null)
const accountLabel = computed(() => {
  if (!isCloudSyncConfigured) return '本地模式'
  if (syncStatus.value === 'pulling') return '同步中'
  if (syncStatus.value === 'pushing') return '保存中'
  if (cloudConflict.value) return '需合并'
  return signedInUser.value?.email || '登录同步'
})
const syncStatusLabel = computed(() => {
  if (!isCloudSyncConfigured) return '未配置云同步'
  if (!signedInUser.value) return '未登录'
  if (syncStatus.value === 'pulling') return '正在拉取云端数据'
  if (syncStatus.value === 'pushing') return '正在保存到云端'
  if (syncStatus.value === 'conflict') return '本机和云端都有修改'
  if (syncStatus.value === 'error') return '同步遇到问题'
  return '已登录，多端同步开启'
})
const timerTotal = computed(() => (state.timerMode === 'focus' ? 25 * 60 : 5 * 60))
const timerProgress = computed(() => {
  return `${Math.max(0, Math.min(100, Math.round((1 - state.timerRemaining / timerTotal.value) * 100)))}%`
})
const timerLabel = computed(() => {
  const minutes = Math.floor(state.timerRemaining / 60)
  const seconds = state.timerRemaining % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const openTasks = computed(() => state.tasks.filter((task) => !task.done))
const doneTasks = computed(() => state.tasks.filter((task) => task.done).slice(0, 3))
const progress = computed(() => {
  if (state.tasks.length === 0) return 0
  const done = state.tasks.filter((task) => task.done).length
  return Math.round((done / state.tasks.length) * 100)
})
const commands = computed(() => [
  {
    title: '聚焦搜索',
    description: '回到搜索框',
    keywords: 'search focus',
    icon: SearchRound,
    action: focusSearch,
  },
  {
    title: '显示设置',
    description: '隐藏或显示页面功能',
    keywords: 'settings minimal display toggle',
    icon: SettingsRound,
    action: openSettings,
  },
  {
    title: '今日面板',
    description: '写下重点、任务和计时',
    keywords: 'daily board task timer',
    icon: TodayRound,
    action: focusBoard,
  },
  {
    title: `切换到 ${nextEngine().name}`,
    description: '循环切换搜索引擎',
    keywords: 'engine search',
    icon: OpenInNewRound,
    action: cycleEngine,
  },
  {
    title: signedInUser.value ? '立即同步' : '登录同步',
    description: signedInUser.value ? '把当前数据保存到云端' : '打开账号面板',
    keywords: 'account login sync cloud',
    icon: AccountCircleRound,
    action: signedInUser.value ? syncNow : openAccount,
  },
  {
    title: 'Cloudflare 控制台',
    description: '打开 Pages 部署入口',
    keywords: 'cloudflare deploy pages',
    icon: LaunchRound,
    action: () => window.open('https://dash.cloudflare.com', '_blank', 'noopener noreferrer'),
  },
])

const filteredCommands = computed(() => {
  const query = commandQuery.value.trim().toLowerCase()
  if (!query) return commands.value
  return commands.value.filter((item) =>
    `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(query),
  )
})

const debouncedCloudPush = useDebounceFn(() => {
  void pushLocalToCloud()
}, 1200)

applyAppearanceSettings()

watch(engine, (value) => {
  writeStorage('engine', value)
  writeStorage('localUpdatedAt', Date.now())
  if (!isApplyingCloud) void debouncedCloudPush()
})
watch(
  state,
  () => {
    writeStorage('dailyBoard', {
      ...state,
      timerRunning: false,
    })
    writeStorage('localUpdatedAt', Date.now())
    if (!isApplyingCloud) void debouncedCloudPush()
  },
  { deep: true },
)
watch(
  features,
  () => {
    writeStorage('features', features)
    writeStorage('localUpdatedAt', Date.now())
    if (!isApplyingCloud) void debouncedCloudPush()
  },
  { deep: true },
)
watch(
  appearance,
  () => {
    applyAppearanceSettings()
    writeStorage('appearance', appearance)
    writeStorage('localUpdatedAt', Date.now())
    if (!isApplyingCloud) void debouncedCloudPush()
  },
  { deep: true },
)

let timerId: number | undefined
watch(
  () => state.timerRunning,
  (running) => {
    if (timerId) {
      window.clearInterval(timerId)
      timerId = undefined
    }

    if (!running) return
    timerId = window.setInterval(() => {
      if (state.timerRemaining > 0) {
        state.timerRemaining -= 1
        return
      }
      state.timerRunning = false
      state.timerMode = state.timerMode === 'focus' ? 'break' : 'focus'
      state.timerRemaining = timerTotal.value
    }, 1000)
  },
)

useIntervalFn(() => {
  document.documentElement.style.setProperty('--aemeath-sky-shift', `${Date.now() % 240000}ms`)
}, 2000)

useEventListener('keydown', async (event) => {
  const commandKey = event.ctrlKey || event.metaKey

  if (commandKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openCommand()
    return
  }

  if (commandKey && event.key.toLowerCase() === 'l') {
    event.preventDefault()
    focusSearch()
    return
  }

  if (event.key === 'Escape') {
    commandOpen.value = false
    accountOpen.value = false
    settingsOpen.value = false
  }
})

let unsubscribeAuth: (() => void) | undefined
onMounted(async () => {
  if (!supabase) return

  unsubscribeAuth = onAuthStateChanged(supabase, (nextSession) => {
    session.value = nextSession
    syncStatus.value = nextSession ? 'idle' : 'signed-out'
    if (nextSession?.user) void pullCloudAfterLogin(nextSession)
  })

  try {
    session.value = await getCurrentSession(supabase)
    if (session.value?.user) {
      syncStatus.value = 'idle'
      await pullCloudAfterLogin(session.value)
    }
  } catch (error) {
    reportAuthError(error)
  }
})

onUnmounted(() => {
  unsubscribeAuth?.()
  if (timerId) {
    window.clearInterval(timerId)
  }
})

function normalizeEngine(value: string): EngineKey {
  return value in engines ? (value as EngineKey) : 'google'
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`${storagePrefix}${key}`)
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value))
  } catch {
    // Keep the tab usable in privacy modes or quota-limited environments.
  }
}

function applyAppearanceSettings() {
  changeTheme(appearance.primaryColor)
  document.documentElement.classList.toggle('colorful', appearance.colorfulMode)
}

function resetDisplaySettings() {
  Object.assign(features, defaultFeatures)
  Object.assign(appearance, defaultAppearance)
}

function buildSnapshot(): CloudflareSyncSnapshot {
  return {
    _v: 1,
    engine: engine.value,
    dailyBoard: {
      ...structuredClone(toRaw(state)),
      timerRunning: false,
    },
    features: structuredClone(toRaw(features)),
    appearance: structuredClone(toRaw(appearance)),
    updatedAt: Date.now(),
  }
}

function getLocalSnapshot(): CloudflareSyncSnapshot {
  return {
    ...buildSnapshot(),
    updatedAt: readStorage('localUpdatedAt', 0) || Date.now(),
  }
}

function hasMeaningfulLocalData(snapshot: CloudflareSyncSnapshot) {
  return (
    snapshot.engine !== 'google' ||
    Boolean(snapshot.dailyBoard.focus.trim()) ||
    Boolean(snapshot.dailyBoard.note.trim()) ||
    snapshot.dailyBoard.tasks.length > 0 ||
    JSON.stringify(snapshot.features ?? defaultFeatures) !== JSON.stringify(defaultFeatures) ||
    JSON.stringify(snapshot.appearance ?? defaultAppearance) !== JSON.stringify(defaultAppearance)
  )
}

function applySnapshot(snapshot: CloudflareSyncSnapshot) {
  isApplyingCloud = true
  try {
    engine.value = normalizeEngine(snapshot.engine)
    Object.assign(state, {
      ...defaultBoard,
      ...snapshot.dailyBoard,
      timerRunning: false,
    })
    Object.assign(features, {
      ...defaultFeatures,
      ...snapshot.features,
    })
    Object.assign(appearance, {
      ...defaultAppearance,
      ...snapshot.appearance,
    })
    writeStorage('engine', engine.value)
    writeStorage('dailyBoard', {
      ...state,
      timerRunning: false,
    })
    writeStorage('features', features)
    writeStorage('appearance', appearance)
    writeStorage('localUpdatedAt', snapshot.updatedAt)
  } finally {
    nextTick(() => {
      isApplyingCloud = false
    })
  }
}

function snapshotsEqual(a: CloudflareSyncSnapshot, b: CloudflareSyncSnapshot) {
  return (
    JSON.stringify({
      engine: a.engine,
      dailyBoard: a.dailyBoard,
      features: a.features ?? defaultFeatures,
      appearance: a.appearance ?? defaultAppearance,
    }) ===
    JSON.stringify({
      engine: b.engine,
      dailyBoard: b.dailyBoard,
      features: b.features ?? defaultFeatures,
      appearance: b.appearance ?? defaultAppearance,
    })
  )
}

async function pullCloudAfterLogin(currentSession: Session) {
  if (!supabase) return

  syncStatus.value = 'pulling'
  authError.value = ''
  try {
    const remote = await fetchRemoteSnapshot(supabase, currentSession.user)
    const local = getLocalSnapshot()

    if (!remote) {
      await pushRemoteSnapshot(supabase, currentSession.user, buildSnapshot())
      syncStatus.value = 'idle'
      return
    }

    if (snapshotsEqual(remote.payload, local)) {
      setLocalCloudVersion(remote.version)
      syncStatus.value = 'idle'
      return
    }

    const isSameDevice = remote.device_id === getCloudDeviceId()
    if (isSameDevice || !hasMeaningfulLocalData(local)) {
      applySnapshot(remote.payload)
      setLocalCloudVersion(remote.version)
      syncStatus.value = 'idle'
      return
    }

    cloudConflict.value = {
      remote: remote.payload,
      local,
      remoteVersion: remote.version,
      localVersion: getLocalCloudVersion(),
      remoteUpdatedAt: remote.updated_at,
      remoteDeviceName: remote.device_name,
    }
    syncStatus.value = 'conflict'
  } catch (error) {
    reportAuthError(error)
  }
}

async function pushLocalToCloud() {
  if (!supabase || !signedInUser.value || cloudConflict.value) return

  syncStatus.value = 'pushing'
  authError.value = ''
  try {
    await pushRemoteSnapshot(supabase, signedInUser.value, buildSnapshot())
    syncStatus.value = 'idle'
  } catch (error) {
    reportAuthError(error)
  }
}

async function syncNow() {
  await pushLocalToCloud()
  accountOpen.value = true
}

async function submitEmailLogin() {
  if (!supabase) return
  const target = email.value.trim()
  if (!target) return

  authError.value = ''
  authMessage.value = ''
  try {
    await signInWithEmail(supabase, target)
    authMessage.value = '登录链接已发送，请到邮箱中确认。'
  } catch (error) {
    reportAuthError(error)
  }
}

async function handleSignOut() {
  if (!supabase) return
  try {
    await signOut(supabase)
    session.value = null
    syncStatus.value = 'signed-out'
    cloudConflict.value = null
    authMessage.value = '已退出账号。'
  } catch (error) {
    reportAuthError(error)
  }
}

async function resolveConflict(choice: 'remote' | 'local') {
  if (!supabase || !signedInUser.value || !cloudConflict.value) return

  if (choice === 'remote') {
    applySnapshot(cloudConflict.value.remote)
    setLocalCloudVersion(cloudConflict.value.remoteVersion)
    cloudConflict.value = null
    syncStatus.value = 'idle'
    return
  }

  cloudConflict.value = null
  await pushLocalToCloud()
}

function reportAuthError(error: unknown) {
  syncStatus.value = 'error'
  authError.value = error instanceof Error ? error.message : String(error)
}

function doSearch() {
  const text = searchText.value.trim()
  if (!text) {
    focusSearch()
    return
  }

  const url = currentEngine.value.url.replace('%s', encodeURIComponent(text))
  window.open(url, '_self', 'noopener noreferrer')
}

function cycleEngine() {
  const keys = Object.keys(engines) as EngineKey[]
  const currentIndex = keys.indexOf(engine.value)
  engine.value = keys[(currentIndex + 1) % keys.length]!
}

function nextEngine() {
  const keys = Object.keys(engines) as EngineKey[]
  const currentIndex = keys.indexOf(engine.value)
  return engines[keys[(currentIndex + 1) % keys.length]!]
}

async function focusSearch() {
  commandOpen.value = false
  await nextTick()
  searchInputRef.value?.focus()
}

async function focusBoard() {
  commandOpen.value = false
  state.collapsed = false
  await nextTick()
  focusInputRef.value?.focus()
}

async function openCommand() {
  commandOpen.value = true
  settingsOpen.value = false
  commandQuery.value = ''
  await nextTick()
  commandInputRef.value?.focus()
}

function openAccount() {
  commandOpen.value = false
  settingsOpen.value = false
  accountOpen.value = true
}

function openSettings() {
  commandOpen.value = false
  accountOpen.value = false
  settingsOpen.value = true
}

function closePanels() {
  commandOpen.value = false
  accountOpen.value = false
  settingsOpen.value = false
}

function runCommand(action: () => void | Promise<void>) {
  void action()
  commandOpen.value = false
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function addTask() {
  const text = newTask.value.trim()
  if (!text) return
  state.tasks.unshift({
    id: createId(),
    text,
    done: false,
    createdAt: Date.now(),
  })
  newTask.value = ''
}

function removeTask(id: string) {
  const index = state.tasks.findIndex((task) => task.id === id)
  if (index >= 0) {
    state.tasks.splice(index, 1)
  }
}

function toggleTimer() {
  state.timerRunning = !state.timerRunning
}

function resetTimer() {
  state.timerRunning = false
  state.timerRemaining = timerTotal.value
}

function toggleTimerMode() {
  state.timerRunning = false
  state.timerMode = state.timerMode === 'focus' ? 'break' : 'focus'
  state.timerRemaining = timerTotal.value
}
</script>

<template>
  <main class="cloudflare-app">
    <div v-if="features.background" class="background-wrapper" aria-hidden="true">
      <img class="background" :src="'/aemeath/wallpapers/default-config.png'" alt="" />
      <div class="background-mask"></div>
      <div v-if="features.vignette" class="background__vignette"></div>
    </div>

    <section class="cloudflare-stage" aria-label="Aemeath static new tab">
      <div v-if="features.clock" class="clock noselect clock--shadow">
        <div class="clock__time-container">
          <span class="clock__time">
            <span class="clock__hour">{{ formattedTime.hour }}</span>
            <span class="clock__colon clock__colon--blinking">:</span>
            <span class="clock__minute colorful">{{ formattedTime.minute }}</span>
            <span class="clock__colon clock__colon--blinking">:</span>
            <span class="clock__second">{{ formattedTime.second }}</span>
          </span>
        </div>
        <div v-if="features.date" class="clock__date">{{ formattedDate }}</div>
      </div>

      <form
        v-if="features.search"
        class="search-box__form search-box__form--shadow search-box__form--opacity"
        @submit.prevent="doSearch"
      >
        <button
          class="cloudflare-engine"
          type="button"
          :aria-label="`切换搜索引擎，当前是 ${currentEngine.name}`"
          @click="cycleEngine"
        >
          <img :src="currentEngine.icon" alt="" />
        </button>
        <input
          ref="searchInputRef"
          v-model="searchText"
          class="search-box__input"
          name="q"
          autocomplete="off"
          placeholder="搜索，或输入一段想法"
        />
        <button class="search-box__btn" type="submit" aria-label="搜索">
          <el-icon><search-round /></el-icon>
        </button>
      </form>

      <nav v-if="features.shortcuts" class="cloudflare-shortcuts" aria-label="快捷入口">
        <a
          v-for="item in shortcuts"
          :key="item.title"
          class="cloudflare-shortcut"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ '--shortcut-tone': item.tone }"
        >
          <span>{{ item.title.slice(0, 1) }}</span>
          <strong>{{ item.title }}</strong>
        </a>
      </nav>
    </section>

    <aside
      v-if="features.dailyBoard"
      class="daily-board"
      :class="{ 'is-collapsed': state.collapsed }"
    >
      <button class="daily-board__toggle" type="button" @click="state.collapsed = !state.collapsed">
        <span>
          <el-icon><today-round /></el-icon>
          {{ todayLabel }}
        </span>
        <span class="daily-board__progress">{{ progress }}%</span>
        <el-icon class="daily-board__chevron"><keyboard-arrow-down-round /></el-icon>
      </button>

      <div v-show="!state.collapsed" class="daily-board__body">
        <label class="daily-board__focus">
          <span>
            <el-icon><task-alt-round /></el-icon>
            今日重点
          </span>
          <input ref="focusInputRef" v-model="state.focus" placeholder="今天最值得推进的一件事" />
        </label>

        <form class="daily-board__task-form" @submit.prevent="addTask">
          <input v-model="newTask" placeholder="添加任务" />
          <button type="submit" aria-label="添加任务">
            <el-icon><add-round /></el-icon>
          </button>
        </form>

        <section class="daily-board__timer" :style="{ '--timer-progress': timerProgress }">
          <button class="daily-board__timer-mode" type="button" @click="toggleTimerMode">
            <el-icon><timer-round /></el-icon>
            {{ state.timerMode === 'focus' ? '专注' : '休息' }}
          </button>
          <strong>{{ timerLabel }}</strong>
          <div class="daily-board__timer-actions">
            <button
              type="button"
              :aria-label="state.timerRunning ? '暂停计时' : '开始计时'"
              @click="toggleTimer"
            >
              <el-icon>
                <pause-round v-if="state.timerRunning" />
                <play-arrow-round v-else />
              </el-icon>
            </button>
            <button type="button" aria-label="重置计时" @click="resetTimer">
              <el-icon><close-round /></el-icon>
            </button>
          </div>
        </section>

        <div class="daily-board__tasks">
          <div v-for="task in openTasks" :key="task.id" class="daily-board__task">
            <button
              class="daily-board__check"
              type="button"
              aria-label="完成任务"
              @click="task.done = true"
            >
              <el-icon><check-box-outline-blank-round /></el-icon>
            </button>
            <span>{{ task.text }}</span>
            <button
              class="daily-board__delete"
              type="button"
              aria-label="删除任务"
              @click="removeTask(task.id)"
            >
              <el-icon><delete-round /></el-icon>
            </button>
          </div>

          <p v-if="state.tasks.length === 0" class="daily-board__empty">暂时没有任务</p>

          <div v-for="task in doneTasks" :key="task.id" class="daily-board__task daily-board__task--done">
            <button
              class="daily-board__check"
              type="button"
              aria-label="重新打开任务"
              @click="task.done = false"
            >
              <el-icon><check-box-round /></el-icon>
            </button>
            <span>{{ task.text }}</span>
            <button
              class="daily-board__delete"
              type="button"
              aria-label="删除任务"
              @click="removeTask(task.id)"
            >
              <el-icon><delete-round /></el-icon>
            </button>
          </div>
        </div>

        <label class="daily-board__note">
          <span>备忘</span>
          <textarea v-model="state.note" placeholder="临时记录一两句" rows="3" />
        </label>
      </div>
    </aside>

    <div class="action-btn-container action-btn-container--tran action-btn-container--blur action-btn-container--top">
      <button
        v-if="features.commandButton"
        class="action-btn command-btn"
        type="button"
        aria-label="快速指挥中心"
        @click="openCommand"
      >
        <el-icon><keyboard-command-key-round /></el-icon>
      </button>
      <button
        v-if="features.accountButton"
        class="action-btn account-btn"
        type="button"
        :aria-label="accountLabel"
        @click="openAccount"
      >
        <el-icon><account-circle-round /></el-icon>
      </button>
      <button class="action-btn setting-btn" type="button" aria-label="显示设置" @click="openSettings">
        <el-icon><settings-round /></el-icon>
      </button>
      <a
        v-if="features.cloudflareButton"
        class="action-btn"
        href="https://dash.cloudflare.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="打开 Cloudflare"
      >
        <el-icon><settings-round /></el-icon>
      </a>
    </div>

    <Transition name="quick-command" :duration="220">
      <section v-if="commandOpen" class="quick-command" aria-label="快速指挥中心" @click.self="closePanels">
        <div class="quick-command__panel">
          <header class="quick-command__header">
            <div class="quick-command__mark">
              <el-icon><keyboard-command-key-round /></el-icon>
            </div>
            <div class="quick-command__copy">
              <h2>快速指挥中心</h2>
              <p>搜索动作、账号同步、打开面板</p>
            </div>
            <button
              class="quick-command__esc"
              type="button"
              aria-label="关闭快速指挥中心"
              @click.stop="closePanels"
            >
              Esc
            </button>
          </header>

          <label class="quick-command__search">
            <el-icon><search-round /></el-icon>
            <input ref="commandInputRef" v-model="commandQuery" placeholder="输入指令" />
          </label>

          <div class="quick-command__list">
            <button
              v-for="item in filteredCommands"
              :key="item.title"
              class="quick-command__item"
              type="button"
              @click="runCommand(item.action)"
            >
              <span class="quick-command__icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </span>
              <span class="quick-command__text">
                <strong>{{ item.title }}</strong>
                <small>{{ item.description }}</small>
              </span>
              <kbd>Enter</kbd>
            </button>
            <p v-if="filteredCommands.length === 0" class="quick-command__empty">没有匹配的指令</p>
          </div>
        </div>
      </section>
    </Transition>

    <Transition name="quick-command" :duration="220">
      <section
        v-if="accountOpen"
        class="quick-command account-sync"
        aria-label="账号同步"
        @click.self="closePanels"
      >
        <div class="quick-command__panel account-sync__panel">
          <header class="quick-command__header">
            <div class="quick-command__mark">
              <el-icon><account-circle-round /></el-icon>
            </div>
            <div class="quick-command__copy">
              <h2>账号同步</h2>
              <p>{{ syncStatusLabel }}</p>
            </div>
            <button
              class="account-sync__close"
              type="button"
              aria-label="关闭"
              @click.stop="closePanels"
            >
              <el-icon><close-round /></el-icon>
            </button>
          </header>

          <div v-if="!isCloudSyncConfigured" class="account-sync__body">
            <p>当前部署没有配置 Supabase 环境变量，因此保持本地模式。</p>
            <p>在 Cloudflare Pages 中添加 Supabase URL 和 anon key 后，登录同步会自动启用。</p>
          </div>

          <div v-else-if="!signedInUser" class="account-sync__body">
            <form class="account-sync__form" @submit.prevent="submitEmailLogin">
              <label>
                <span>邮箱</span>
                <input v-model="email" type="email" autocomplete="email" placeholder="you@example.com" />
              </label>
              <button type="submit">发送登录链接</button>
            </form>
            <p>使用邮箱魔法链接登录，同一账号下的搜索偏好和今日面板会跨设备同步。</p>
          </div>

          <div v-else class="account-sync__body">
            <div class="account-sync__identity">
              <span>{{ signedInUser.email }}</span>
              <strong>{{ syncStatusLabel }}</strong>
            </div>

            <div v-if="cloudConflict" class="account-sync__conflict">
              <strong>发现同步冲突</strong>
              <p>
                云端来自 {{ cloudConflict.remoteDeviceName }}，更新时间
                {{ new Date(cloudConflict.remoteUpdatedAt).toLocaleString() }}。
              </p>
              <div class="account-sync__actions">
                <button type="button" @click="resolveConflict('remote')">使用云端</button>
                <button type="button" @click="resolveConflict('local')">保留本机</button>
              </div>
            </div>

            <div class="account-sync__actions">
              <button type="button" @click="syncNow">立即同步</button>
              <button type="button" @click="handleSignOut">退出登录</button>
            </div>
          </div>

          <p v-if="authMessage" class="account-sync__message">{{ authMessage }}</p>
          <p v-if="authError" class="account-sync__error">{{ authError }}</p>
        </div>
      </section>
    </Transition>

    <Transition name="quick-command" :duration="220">
      <section
        v-if="settingsOpen"
        class="quick-command display-settings"
        aria-label="显示设置"
        @click.self="closePanels"
      >
        <div class="quick-command__panel display-settings__panel">
          <header class="quick-command__header">
            <div class="quick-command__mark">
              <el-icon><settings-round /></el-icon>
            </div>
            <div class="quick-command__copy">
              <h2>显示设置</h2>
              <p>把页面收成适合自己的极简状态</p>
            </div>
            <button
              class="account-sync__close"
              type="button"
              aria-label="关闭"
              @click.stop="closePanels"
            >
              <el-icon><close-round /></el-icon>
            </button>
          </header>

          <div class="display-settings__body">
            <button
              class="display-settings__preset"
              type="button"
              @click="
                Object.assign(features, {
                  ...features,
                  search: false,
                  shortcuts: false,
                  dailyBoard: false,
                  accountButton: false,
                  commandButton: false,
                  cloudflareButton: false,
                  vignette: false,
                })
              "
            >
              极简模式
            </button>
            <button
              class="display-settings__preset"
              type="button"
              data-testid="display-reset"
              @click="resetDisplaySettings"
            >
              恢复默认
            </button>

            <div class="display-settings__grid">
              <label class="display-settings__color">
                <span>主题色</span>
                <input
                  v-model="appearance.primaryColor"
                  type="color"
                  aria-label="主题色"
                  data-testid="appearance-color"
                />
              </label>
              <label>
                <span>全局色彩</span>
                <input
                  v-model="appearance.colorfulMode"
                  type="checkbox"
                  data-testid="appearance-colorful"
                />
              </label>
              <label>
                <span>时间</span>
                <input v-model="features.clock" type="checkbox" />
              </label>
              <label>
                <span>日期</span>
                <input v-model="features.date" type="checkbox" />
              </label>
              <label>
                <span>搜索</span>
                <input v-model="features.search" type="checkbox" />
              </label>
              <label>
                <span>快捷入口</span>
                <input v-model="features.shortcuts" type="checkbox" />
              </label>
              <label>
                <span>今日面板</span>
                <input v-model="features.dailyBoard" type="checkbox" />
              </label>
              <label>
                <span>快速指挥</span>
                <input v-model="features.commandButton" type="checkbox" />
              </label>
              <label>
                <span>账号同步</span>
                <input v-model="features.accountButton" type="checkbox" />
              </label>
              <label>
                <span>Cloudflare</span>
                <input v-model="features.cloudflareButton" type="checkbox" />
              </label>
              <label>
                <span>背景</span>
                <input v-model="features.background" type="checkbox" />
              </label>
              <label>
                <span>暗角</span>
                <input v-model="features.vignette" type="checkbox" />
              </label>
            </div>

            <p>设置按钮会始终保留，方便从极简模式回到完整界面。</p>
          </div>
        </div>
      </section>
    </Transition>
  </main>
</template>
