<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { useTranslation } from 'i18next-vue'
import AddRound from '~icons/ic/round-add'
import CheckBoxRound from '~icons/ic/round-check-box'
import CheckBoxOutlineBlankRound from '~icons/ic/round-check-box-outline-blank'
import DeleteRound from '~icons/ic/round-delete'
import EditNoteRound from '~icons/ic/round-edit-note'
import KeyboardArrowDownRound from '~icons/ic/round-keyboard-arrow-down'
import PauseRound from '~icons/ic/round-pause'
import PlayArrowRound from '~icons/ic/round-play-arrow'
import RestartAltRound from '~icons/ic/round-restart-alt'
import TaskAltRound from '~icons/ic/round-task-alt'
import TimerRound from '~icons/ic/round-timer'
import TodayRound from '~icons/ic/round-today'

import type { DailyBoardState, DailyBoardTask } from '@newtab/shared/storages/dailyBoardStorage'
import {
  createDefaultDailyBoardState,
  dailyBoardStorage,
  normalizeDailyBoardState,
} from '@newtab/shared/storages/dailyBoardStorage'

const { t } = useTranslation()

const state = reactive<DailyBoardState>(createDefaultDailyBoardState())
const newTask = ref('')
const isLoaded = ref(true)
const isHydrated = ref(false)
const focusInputRef = useTemplateRef<HTMLInputElement>('focusInputRef')
const pendingActions: (() => void | Promise<void>)[] = []

const openTasks = computed(() => state.tasks.filter((task) => !task.done))
const doneTasks = computed(() => state.tasks.filter((task) => task.done).slice(0, 3))
const completedCount = computed(() => state.tasks.filter((task) => task.done).length)
const totalCount = computed(() => state.tasks.length)
const progress = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})
const timerTotal = computed(() => (state.timerMode === 'focus' ? 25 * 60 : 5 * 60))
const timerProgress = computed(() => {
  return Math.max(0, Math.min(100, Math.round((1 - state.timerRemaining / timerTotal.value) * 100)))
})
const timerLabel = computed(() => {
  const minutes = Math.floor(state.timerRemaining / 60)
  const seconds = state.timerRemaining % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const timerModeLabel = computed(() =>
  state.timerMode === 'focus' ? t('dailyBoard.timerFocus') : t('dailyBoard.timerBreak'),
)

const todayLabel = computed(() => {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())
})

const save = useDebounceFn(async () => {
  if (!isHydrated.value) return
  state.updatedAt = Date.now()
  try {
    await dailyBoardStorage.setValue({
      focus: state.focus,
      note: state.note,
      tasks: state.tasks.map((task) => ({ ...task })),
      collapsed: state.collapsed,
      timerMode: state.timerMode,
      timerRemaining: state.timerRemaining,
      timerRunning: state.timerRunning,
      updatedAt: state.updatedAt,
    })
  } catch (error) {
    console.error('[daily-board] Failed to save state:', error)
  }
}, 180)

watch(state, () => void save(), { deep: true })

onMounted(async () => {
  try {
    const stored = normalizeDailyBoardState(await dailyBoardStorage.getValue())
    state.focus = stored.focus
    state.note = stored.note
    state.tasks = stored.tasks
    state.collapsed = stored.collapsed
    state.timerMode = stored.timerMode
    state.timerRemaining = stored.timerRemaining
    state.timerRunning = false
    state.updatedAt = stored.updatedAt
  } catch (error) {
    console.error('[daily-board] Failed to load state, using defaults:', error)
  } finally {
    isHydrated.value = true
    const actions = pendingActions.splice(0)
    for (const action of actions) {
      void action()
    }
  }
})

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

onUnmounted(() => {
  if (timerId) {
    window.clearInterval(timerId)
  }
})

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

function toggleTask(task: DailyBoardTask) {
  task.done = !task.done
}

function removeTask(id: string) {
  const index = state.tasks.findIndex((task) => task.id === id)
  if (index >= 0) {
    state.tasks.splice(index, 1)
  }
}

function toggleCollapsed() {
  state.collapsed = !state.collapsed
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

async function focusBoard() {
  if (!isHydrated.value) {
    pendingActions.push(focusBoard)
    return
  }
  state.collapsed = false
  await nextTick()
  focusInputRef.value?.focus()
}

async function openBoard() {
  if (!isHydrated.value) {
    pendingActions.push(openBoard)
    return
  }
  state.collapsed = false
  await nextTick()
}

async function startFocusTimer() {
  if (!isHydrated.value) {
    pendingActions.push(startFocusTimer)
    return
  }
  state.collapsed = false
  if (state.timerMode !== 'focus') {
    state.timerMode = 'focus'
    state.timerRemaining = timerTotal.value
  }
  state.timerRunning = true
  await nextTick()
}

defineExpose({
  focus: focusBoard,
  open: openBoard,
  startFocusTimer,
})
</script>

<template>
  <Transition name="daily-board">
    <aside v-if="isLoaded" class="daily-board" :class="{ 'is-collapsed': state.collapsed }">
      <button class="daily-board__toggle" type="button" @click="toggleCollapsed">
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
            {{ t('dailyBoard.focus') }}
          </span>
          <input
            ref="focusInputRef"
            v-model="state.focus"
            :placeholder="t('dailyBoard.focusPlaceholder')"
          />
        </label>

        <form class="daily-board__task-form" @submit.prevent="addTask">
          <input v-model="newTask" :placeholder="t('dailyBoard.taskPlaceholder')" />
          <button type="submit" :aria-label="t('dailyBoard.addTask')">
            <el-icon><add-round /></el-icon>
          </button>
        </form>

        <section
          class="daily-board__timer"
          :style="{ '--timer-progress': `${timerProgress}%` }"
        >
          <button class="daily-board__timer-mode" type="button" @click="toggleTimerMode">
            <el-icon><timer-round /></el-icon>
            {{ timerModeLabel }}
          </button>
          <strong>{{ timerLabel }}</strong>
          <div class="daily-board__timer-actions">
            <button
              type="button"
              :aria-label="state.timerRunning ? t('dailyBoard.pauseTimer') : t('dailyBoard.startTimer')"
              @click="toggleTimer"
            >
              <el-icon>
                <pause-round v-if="state.timerRunning" />
                <play-arrow-round v-else />
              </el-icon>
            </button>
            <button type="button" :aria-label="t('dailyBoard.resetTimer')" @click="resetTimer">
              <el-icon><restart-alt-round /></el-icon>
            </button>
          </div>
        </section>

        <div class="daily-board__tasks">
          <div
            v-for="task in openTasks"
            :key="task.id"
            class="daily-board__task"
          >
            <button
              class="daily-board__check"
              type="button"
              :aria-label="t('dailyBoard.completeTask')"
              @click="toggleTask(task)"
            >
              <el-icon><check-box-outline-blank-round /></el-icon>
            </button>
            <span>{{ task.text }}</span>
            <button
              class="daily-board__delete"
              type="button"
              :aria-label="t('dailyBoard.deleteTask')"
              @click.stop="removeTask(task.id)"
            >
              <el-icon><delete-round /></el-icon>
            </button>
          </div>

          <p v-if="state.tasks.length === 0" class="daily-board__empty">
            {{ t('dailyBoard.empty') }}
          </p>

          <div
            v-for="task in doneTasks"
            :key="task.id"
            class="daily-board__task daily-board__task--done"
          >
            <button
              class="daily-board__check"
              type="button"
              :aria-label="t('dailyBoard.reopenTask')"
              @click="toggleTask(task)"
            >
              <el-icon><check-box-round /></el-icon>
            </button>
            <span>{{ task.text }}</span>
            <button
              class="daily-board__delete"
              type="button"
              :aria-label="t('dailyBoard.deleteTask')"
              @click.stop="removeTask(task.id)"
            >
              <el-icon><delete-round /></el-icon>
            </button>
          </div>
        </div>

        <label class="daily-board__note">
          <span>
            <el-icon><edit-note-round /></el-icon>
            {{ t('dailyBoard.note') }}
          </span>
          <textarea v-model="state.note" :placeholder="t('dailyBoard.notePlaceholder')" rows="3" />
        </label>
      </div>
    </aside>
  </Transition>
</template>
