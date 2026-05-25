import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

export type CloudflareTask = {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export type CloudflareBoardState = {
  focus: string
  note: string
  tasks: CloudflareTask[]
  collapsed: boolean
  timerMode: 'focus' | 'break'
  timerRemaining: number
  timerRunning: boolean
}

export type CloudflareFeatureSettings = {
  clock: boolean
  date: boolean
  search: boolean
  shortcuts: boolean
  dailyBoard: boolean
  accountButton: boolean
  commandButton: boolean
  cloudflareButton: boolean
  background: boolean
  vignette: boolean
}

export type CloudflareAppearanceSettings = {
  primaryColor: string
  colorfulMode: boolean
}

export type CloudflareSyncSnapshot = {
  _v: 1
  engine: string
  dailyBoard: CloudflareBoardState
  features?: CloudflareFeatureSettings
  appearance?: CloudflareAppearanceSettings
  updatedAt: number
}

type CloudSyncRow = {
  user_id: string
  device_id: string
  device_name: string
  version: number
  payload: CloudflareSyncSnapshot
  updated_at: string
}

export type CloudSyncStatus =
  | 'disabled'
  | 'signed-out'
  | 'idle'
  | 'pulling'
  | 'pushing'
  | 'conflict'
  | 'error'

export type CloudSyncConflict = {
  remote: CloudflareSyncSnapshot
  local: CloudflareSyncSnapshot
  remoteVersion: number
  localVersion: number
  remoteUpdatedAt: string
  remoteDeviceName: string
}

const localDeviceKey = 'aemeath-cloudflare:device-id'
const localVersionKey = 'aemeath-cloudflare:cloud-version'
let fallbackDeviceId = ''
let fallbackCloudVersion = 0

export const isCloudSyncConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export function createCloudSyncClient(): SupabaseClient | null {
  if (!isCloudSyncConfigured) return null
  return createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export function getCloudDeviceId(): string {
  try {
    const stored = localStorage.getItem(localDeviceKey)
    if (stored) return stored
  } catch {
    if (fallbackDeviceId) return fallbackDeviceId
  }

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  fallbackDeviceId = id
  try {
    localStorage.setItem(localDeviceKey, id)
  } catch {
    // Keep the generated device id in memory for storage-restricted sessions.
  }
  return id
}

export function detectCloudDeviceName(): string {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const platform = nav.userAgentData?.platform || navigator.platform || 'Web'
  return `${platform} Web`
}

export function getLocalCloudVersion(): number {
  try {
    const value = Number(localStorage.getItem(localVersionKey))
    return Number.isFinite(value) && value >= 0 ? value : fallbackCloudVersion
  } catch {
    return fallbackCloudVersion
  }
}

export function setLocalCloudVersion(version: number) {
  fallbackCloudVersion = version
  try {
    localStorage.setItem(localVersionKey, String(version))
  } catch {
    // Sync can still continue in memory when localStorage is unavailable.
  }
}

export async function getCurrentSession(client: SupabaseClient): Promise<Session | null> {
  const { data, error } = await client.auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthStateChanged(
  client: SupabaseClient,
  callback: (session: Session | null) => void,
) {
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function signInWithEmail(client: SupabaseClient, email: string) {
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
  if (error) throw error
}

export async function signOut(client: SupabaseClient) {
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function fetchRemoteSnapshot(
  client: SupabaseClient,
  user: User,
): Promise<CloudSyncRow | null> {
  const { data, error } = await client
    .from('newtab_sync')
    .select('user_id, device_id, device_name, version, payload, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data as CloudSyncRow | null
}

export async function pushRemoteSnapshot(
  client: SupabaseClient,
  user: User,
  snapshot: CloudflareSyncSnapshot,
) {
  const localVersion = getLocalCloudVersion()
  const nextVersion = localVersion + 1
  const { data, error } = await client
    .from('newtab_sync')
    .upsert({
      user_id: user.id,
      device_id: getCloudDeviceId(),
      device_name: detectCloudDeviceName(),
      version: nextVersion,
      payload: snapshot,
      updated_at: new Date(snapshot.updatedAt).toISOString(),
    })
    .select('version')
    .single()

  if (error) throw error
  setLocalCloudVersion(Number(data.version) || nextVersion)
}
