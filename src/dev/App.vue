<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { CronSelector } from '../lib/index'
import type { CronTheme } from '../lib/index'

const cronValue = ref('*/5 * * * *')
const quartzValue = ref('0 0 9 * * ? *')
const popoverValue = ref('0 12 * * *')
const locale = ref<'en-US' | 'zh-CN'>('en-US')
const disabled = ref(false)
const theme = ref<CronTheme>('auto')
const primaryColor = ref('')

function onPrimaryColorInput(event: Event): void {
  primaryColor.value = (event.target as HTMLInputElement).value
}

// Mirror an Element Plus dark site: the `dark` class on <html> is the global
// switch, while an explicit `theme` prop can still override a single instance.
watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
})

function toggleLocale(): void {
  locale.value = locale.value === 'en-US' ? 'zh-CN' : 'en-US'
}
</script>

<template>
  <div class="demo">
    <header class="demo__header">
      <h1>vue3-cron-selector</h1>
      <p>Visual cron expression selector for Vue 3</p>
      <div class="demo__controls">
        <button @click="toggleLocale">Locale: {{ locale }}</button>
        <label>
          <select v-model="theme">
            <option value="auto">Theme: auto</option>
            <option value="light">Theme: light</option>
            <option value="dark">Theme: dark</option>
          </select>
        </label>
        <label>
          <input type="color" :value="primaryColor || '#409eff'" @input="onPrimaryColorInput" />
          Color
        </label>
        <button @click="primaryColor = ''">Reset color</button>
        <label>
          <input v-model="disabled" type="checkbox" />
          Disabled
        </label>
      </div>
    </header>

    <section class="demo__section">
      <h2>Crontab (5-field) — Inline Mode</h2>
      <p class="demo__value">
        v-model: <code>{{ cronValue }}</code>
      </p>
      <CronSelector
        v-model="cronValue"
        format="crontab"
        :locale="locale"
        :disabled="disabled"
        :theme="theme"
        :primary-color="primaryColor"
      />
    </section>

    <section class="demo__section">
      <h2>Quartz (7-field) — Inline Mode</h2>
      <p class="demo__value">
        v-model: <code>{{ quartzValue }}</code>
      </p>
      <CronSelector
        v-model="quartzValue"
        format="quartz"
        :locale="locale"
        :disabled="disabled"
        :theme="theme"
        :primary-color="primaryColor"
      />
    </section>

    <section class="demo__section">
      <h2>Crontab — Popover Mode</h2>
      <p class="demo__value">
        v-model: <code>{{ popoverValue }}</code>
      </p>
      <CronSelector
        v-model="popoverValue"
        format="crontab"
        mode="popover"
        :locale="locale"
        :disabled="disabled"
        :theme="theme"
        :primary-color="primaryColor"
      />
    </section>
  </div>
</template>
