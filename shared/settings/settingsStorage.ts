import { storage } from '#imports'

import { type CURRENT_CONFIG_SCHEMA, CURRENT_CONFIG_VERSION } from './current'
import { defaultSettings } from './default'

export const settingsStorage = storage.defineItem<CURRENT_CONFIG_SCHEMA>('local:settings', {
  fallback: structuredClone(defaultSettings),
  version: CURRENT_CONFIG_VERSION,
})
