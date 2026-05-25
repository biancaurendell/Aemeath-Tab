<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

import { useSettingsStore } from '@/shared/settings'

const { t } = useTranslation('settings')
const settings = useSettingsStore()

const petMotion = computed({
  get: () => settings.aemeath.pet.motion !== false,
  set: (value: boolean) => {
    settings.aemeath.pet.motion = value
  },
})
</script>

<template>
  <div class="settings__items-container">
    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('aemeath.dailyBoard.enabled') }}</div>
      <el-switch v-model="settings.aemeath.dailyBoard.enabled" />
    </div>

    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('aemeath.music.enabled') }}</div>
      <el-switch v-model="settings.aemeath.music.enabled" />
    </div>
    <template v-if="settings.aemeath.music.enabled">
      <div class="settings__item settings__item--vertical">
        <div class="settings__label">{{ t('aemeath.music.playlistUrl') }}</div>
        <el-input v-model="settings.aemeath.music.playlistUrl" clearable />
      </div>
      <p class="settings__item--note">
        {{ t('aemeath.music.note') }}
      </p>
    </template>

    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('aemeath.pet.enabled') }}</div>
      <el-switch v-model="settings.aemeath.pet.enabled" />
    </div>
    <div v-if="settings.aemeath.pet.enabled" class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('aemeath.pet.motion') }}</div>
      <el-switch v-model="petMotion" />
    </div>

    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('aemeath.effects.meteors') }}</div>
      <el-switch v-model="settings.aemeath.effects.meteors" />
    </div>

    <div class="settings__item settings__item--horizontal">
      <div class="settings__label">{{ t('aemeath.effects.clickHearts') }}</div>
      <el-switch v-model="settings.aemeath.effects.clickHearts" />
    </div>
  </div>
</template>
