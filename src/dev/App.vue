<script setup lang="ts">
import { ref } from 'vue'
import { CronSelector } from '../lib/index'

const cronValue = ref('*/5 * * * *')
const quartzValue = ref('0 0 9 * * ? *')
const popoverValue = ref('0 12 * * *')
const locale = ref<'en' | 'zh'>('en')
const disabled = ref(false)

function toggleLocale(): void {
  locale.value = locale.value === 'en' ? 'zh' : 'en'
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
      <CronSelector v-model="cronValue" format="crontab" :locale="locale" :disabled="disabled" />
    </section>

    <section class="demo__section">
      <h2>Quartz (7-field) — Inline Mode</h2>
      <p class="demo__value">
        v-model: <code>{{ quartzValue }}</code>
      </p>
      <CronSelector v-model="quartzValue" format="quartz" :locale="locale" :disabled="disabled" />
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
      />
    </section>
  </div>
</template>
