import { storage } from '#imports'

export interface DailyBoardTask {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export interface DailyBoardState {
  focus: string
  note: string
  tasks: DailyBoardTask[]
  collapsed: boolean
  timerMode: 'focus' | 'break'
  timerRemaining: number
  timerRunning: boolean
  updatedAt: number
}

export function createDefaultDailyBoardState(): DailyBoardState {
  return {
    focus: '',
    note: '',
    tasks: [],
    collapsed: false,
    timerMode: 'focus',
    timerRemaining: 25 * 60,
    timerRunning: false,
    updatedAt: 0,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function finiteNumber(value: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const numberValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numberValue)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(numberValue)))
}

function normalizeTask(value: unknown, index: number): DailyBoardTask | null {
  if (!isRecord(value)) return null

  const text = typeof value.text === 'string' ? value.text.trim() : ''
  if (!text) return null

  const createdAt = finiteNumber(value.createdAt, Date.now(), 0)
  const id =
    typeof value.id === 'string' && value.id.trim()
      ? value.id
      : `restored-${createdAt}-${index}`

  return {
    id,
    text,
    done: value.done === true,
    createdAt,
  }
}

function normalizeTasks(value: unknown): DailyBoardTask[] {
  const list = Array.isArray(value)
    ? value
    : isRecord(value)
      ? Object.keys(value)
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => value[key])
      : []

  return list.map(normalizeTask).filter((task): task is DailyBoardTask => task !== null)
}

export function normalizeDailyBoardState(value: unknown): DailyBoardState {
  const fallback = createDefaultDailyBoardState()
  if (!isRecord(value)) return fallback

  const tasks = normalizeTasks(value.tasks)
  const timerMode = value.timerMode === 'break' ? 'break' : 'focus'
  const timerFallback = timerMode === 'focus' ? 25 * 60 : 5 * 60

  return {
    focus: typeof value.focus === 'string' ? value.focus : '',
    note: typeof value.note === 'string' ? value.note : '',
    tasks,
    collapsed: value.collapsed === true,
    timerMode,
    timerRemaining: finiteNumber(value.timerRemaining, timerFallback, 1, 24 * 60 * 60),
    timerRunning: value.timerRunning === true,
    updatedAt: finiteNumber(value.updatedAt, 0, 0),
  }
}

export const dailyBoardStorage = storage.defineItem<DailyBoardState>('local:dailyBoard', {
  fallback: createDefaultDailyBoardState(),
})
