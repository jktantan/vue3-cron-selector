---
title: Live Demo
---

# Live Demo

Every selector on this page is the real `CronSelector` component, imported straight
from `src/lib` — the same code that ships on npm. Change an expression and the next
execution times update as you type.

Use the locale button to switch every selector on the page between English and
Chinese — that is the same `locale` prop you would bind in your own app.

<script setup>
import { ref } from 'vue'
import { CronSelector } from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const crontabValue = ref('*/5 * * * *')
const quartzValue = ref('0 0 9 * * ? *')
const springValue = ref('0 */30 9-17 * * MON-FRI')
const popoverValue = ref('0 12 * * *')
const columnsValue = ref('0 0 * * *')

const locale = ref('en-US')
const disabled = ref(false)
const theme = ref('auto')
const primaryColor = ref('')

function onPrimaryColorInput(event) {
  primaryColor.value = event.target.value
}
</script>

<div class="demo-toolbar">
  <button type="button" @click="locale = locale === 'en-US' ? 'zh-CN' : 'en-US'">
    Locale: {{ locale }}
  </button>
  <label>
    <select v-model="theme">
      <option value="auto">Theme: auto</option>
      <option value="light">Theme: light</option>
      <option value="dark">Theme: dark</option>
    </select>
  </label>
  <label>
    <input
      type="color"
      :value="primaryColor || '#409eff'"
      @input="onPrimaryColorInput"
    />
    Colour
  </label>
  <button type="button" @click="primaryColor = ''">Reset colour</button>
  <label>
    <input v-model="disabled" type="checkbox" />
    Disabled
  </label>
</div>

## crontab (5-field), inline mode

<ClientOnly>
  <div class="demo-block">
    <CronSelector
      v-model="crontabValue"
      format="crontab"
      :locale="locale"
      :disabled="disabled" :theme="theme" :primary-color="primaryColor"
    />
  </div>
  <p class="demo-value">v-model: <code>{{ crontabValue }}</code></p>
</ClientOnly>

## Quartz (7-field, year optional)

<ClientOnly>
  <div class="demo-block">
    <CronSelector v-model="quartzValue" format="quartz" :locale="locale" :disabled="disabled" :theme="theme" :primary-color="primaryColor" />
  </div>
  <p class="demo-value">v-model: <code>{{ quartzValue }}</code></p>
</ClientOnly>

## Spring (6-field) with weekday names

<ClientOnly>
  <div class="demo-block">
    <CronSelector v-model="springValue" format="spring" :locale="locale" :disabled="disabled" :theme="theme" :primary-color="primaryColor" />
  </div>
  <p class="demo-value">v-model: <code>{{ springValue }}</code></p>
</ClientOnly>

## Popover mode

<ClientOnly>
  <div class="demo-block">
    <CronSelector
      v-model="popoverValue"
      format="crontab"
      mode="popover"
      :locale="locale"
      :disabled="disabled" :theme="theme" :primary-color="primaryColor"
    />
  </div>
  <p class="demo-value">v-model: <code>{{ popoverValue }}</code></p>
</ClientOnly>

## Custom grid columns

`cols` overrides how many grid cells are drawn per field. Here `minute` gets 6
columns and `hour` gets 4 instead of the defaults.

<ClientOnly>
  <div class="demo-block">
    <CronSelector
      v-model="columnsValue"
      format="crontab"
      :locale="locale"
      :disabled="disabled" :theme="theme" :primary-color="primaryColor"
      :cols="{ minute: 6, hour: 4 }"
    />
  </div>
  <p class="demo-value">v-model: <code>{{ columnsValue }}</code></p>
</ClientOnly>

<style>
.demo-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.demo-block {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}

.demo-value code {
  word-break: break-all;
}
</style>
