<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useTranslation } from 'i18next-vue'
import type { Component } from 'vue'
import AddRound from '~icons/ic/round-add'
import BookmarksRound from '~icons/ic/round-bookmarks'
import ImageSearchRound from '~icons/ic/round-image-search'
import KeyboardCommandKeyRound from '~icons/ic/round-keyboard-command-key'
import SearchRound from '~icons/ic/round-search'
import SettingsRound from '~icons/ic/round-settings'
import TaskAltRound from '~icons/ic/round-task-alt'
import TimerRound from '~icons/ic/round-timer'
import WallpaperRound from '~icons/ic/round-wallpaper'

import { BgType } from '@/shared/enums'
import { useSettingsStore } from '@/shared/settings'

type CommandId =
  | 'search'
  | 'daily'
  | 'settings'
  | 'background'
  | 'engine'
  | 'bookmark'
  | 'shortcut'
  | 'timer'

interface CommandItem {
  id: CommandId
  icon: Component
  title: string
  description: string
  key: string
  shortcut: string
  action: () => void
  visible?: boolean
}

const props = defineProps<{
  onFocusSearch?: () => void
  onFocusDailyBoard?: () => void
  onStartDailyTimer?: () => void
  onOpenSettings?: () => void
  onOpenBackgroundSwitcher?: () => void
  onOpenSearchEnginePreference?: () => void
  onOpenBookmarkSidebar?: () => void
  onOpenAddShortcut?: () => void
}>()

const { t } = useTranslation()
const settings = useSettingsStore()

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
let lastFocusedElement: HTMLElement | null = null

const commands = computed<CommandItem[]>(() => [
  {
    id: 'search',
    icon: SearchRound,
    title: t('quickCommand.commands.search.title'),
    description: t('quickCommand.commands.search.description'),
    key: '/',
    shortcut: 'Alt+/',
    action: () => props.onFocusSearch?.(),
  },
  {
    id: 'daily',
    icon: TaskAltRound,
    title: t('quickCommand.commands.daily.title'),
    description: t('quickCommand.commands.daily.description'),
    key: 'd',
    shortcut: 'Alt+D',
    action: () => props.onFocusDailyBoard?.(),
    visible: settings.aemeath.dailyBoard.enabled,
  },
  {
    id: 'timer',
    icon: TimerRound,
    title: t('dailyBoard.startTimer'),
    description: t('dailyBoard.timerFocus'),
    key: 't',
    shortcut: 'Alt+T',
    action: () => props.onStartDailyTimer?.(),
    visible: settings.aemeath.dailyBoard.enabled,
  },
  {
    id: 'settings',
    icon: SettingsRound,
    title: t('quickCommand.commands.settings.title'),
    description: t('quickCommand.commands.settings.description'),
    key: 's',
    shortcut: 'Alt+S',
    action: () => props.onOpenSettings?.(),
  },
  {
    id: 'background',
    icon: WallpaperRound,
    title: t('quickCommand.commands.background.title'),
    description: t('quickCommand.commands.background.description'),
    key: 'b',
    shortcut: 'Alt+B',
    action: () => props.onOpenBackgroundSwitcher?.(),
  },
  {
    id: 'engine',
    icon: ImageSearchRound,
    title: t('quickCommand.commands.engine.title'),
    description: t('quickCommand.commands.engine.description'),
    key: 'e',
    shortcut: 'Alt+E',
    action: () => props.onOpenSearchEnginePreference?.(),
  },
  {
    id: 'bookmark',
    icon: BookmarksRound,
    title: t('quickCommand.commands.bookmark.title'),
    description: t('quickCommand.commands.bookmark.description'),
    key: 'm',
    shortcut: 'Alt+M',
    action: () => props.onOpenBookmarkSidebar?.(),
    visible: settings.bookmark.showBtn,
  },
  {
    id: 'shortcut',
    icon: AddRound,
    title: t('quickCommand.commands.shortcut.title'),
    description: t('quickCommand.commands.shortcut.description'),
    key: 'a',
    shortcut: 'Alt+A',
    action: () => props.onOpenAddShortcut?.(),
    visible: settings.shortcut.enabled || settings.dock.enabled,
  },
])

const visibleCommands = computed(() => commands.value.filter((command) => command.visible !== false))

const filteredCommands = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase()
  if (!normalizedQuery) return visibleCommands.value

  return visibleCommands.value.filter((command) => {
    const haystack = `${command.title} ${command.description} ${command.shortcut}`.toLocaleLowerCase()
    return haystack.includes(normalizedQuery)
  })
})

watch(open, async (isOpen) => {
  if (isOpen) {
    activeIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  } else {
    query.value = ''
    lastFocusedElement?.focus()
    lastFocusedElement = null
  }
})

watch(filteredCommands, () => {
  activeIndex.value = 0
})

function show() {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
  open.value = true
}

function hide() {
  open.value = false
}

function toggle() {
  if (open.value) {
    hide()
  } else {
    show()
  }
}

async function runCommand(command: CommandItem | undefined) {
  if (!command) return
  const action = command.action
  hide()
  await nextTick()
  window.setTimeout(action, 180)
}

function moveActive(delta: number) {
  const count = filteredCommands.value.length
  if (!count) return
  activeIndex.value = (activeIndex.value + delta + count) % count
}

function runShortcut(event: KeyboardEvent) {
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (!open.value && isTypingTarget(event.target)) return

  const command = visibleCommands.value.find(
    (item) => item.key.toLocaleLowerCase() === event.key.toLocaleLowerCase(),
  )
  if (!command) return
  event.preventDefault()
  runCommand(command)
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

useEventListener(document, 'keydown', (event) => {
  if (!open.value) {
    runShortcut(event)
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
    event.preventDefault()
    toggle()
    return
  }

  if (!open.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    hide()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(-1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    runCommand(filteredCommands.value[activeIndex.value])
  } else {
    runShortcut(event)
  }
})

const subtitle = computed(() => {
  if (settings.background.bgType === BgType.None) {
    return t('quickCommand.subtitlePlain')
  }
  return t('quickCommand.subtitle')
})

defineExpose({ show, hide, toggle })
</script>

<template>
  <Transition name="quick-command">
    <div v-if="open" class="quick-command" @click.self="hide">
      <section
        class="quick-command__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="t('quickCommand.title')"
      >
        <header class="quick-command__header">
          <span class="quick-command__mark">
            <el-icon><keyboard-command-key-round /></el-icon>
          </span>
          <div class="quick-command__copy">
            <h2>{{ t('quickCommand.title') }}</h2>
            <p>{{ subtitle }}</p>
          </div>
          <kbd class="quick-command__esc">Esc</kbd>
        </header>

        <label class="quick-command__search">
          <el-icon><search-round /></el-icon>
          <input
            ref="inputRef"
            v-model="query"
            :placeholder="t('quickCommand.placeholder')"
            autocomplete="off"
            spellcheck="false"
          />
        </label>

        <div class="quick-command__list" role="listbox">
          <button
            v-for="(command, index) in filteredCommands"
            :key="command.id"
            class="quick-command__item"
            :class="{ 'is-active': index === activeIndex }"
            type="button"
            role="option"
            :aria-selected="index === activeIndex"
            @mouseenter="activeIndex = index"
            @click="runCommand(command)"
          >
            <span class="quick-command__icon">
              <el-icon><component :is="command.icon" /></el-icon>
            </span>
            <span class="quick-command__text">
              <strong>{{ command.title }}</strong>
              <small>{{ command.description }}</small>
            </span>
            <kbd>{{ command.shortcut }}</kbd>
          </button>

          <p v-if="filteredCommands.length === 0" class="quick-command__empty">
            {{ t('quickCommand.empty') }}
          </p>
        </div>
      </section>
    </div>
  </Transition>
</template>
