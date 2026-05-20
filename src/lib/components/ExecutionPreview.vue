<template>
  <div v-if="executions.length > 0" class="cron-preview">
    <div class="cron-preview__header">
      <ClockIcon />
      <span>{{ locale.ui.nextRuns }}</span>
    </div>
    <ol class="cron-preview__list">
      <li v-for="(date, index) in displayedExecutions" :key="index" class="cron-preview__item">
        <time :datetime="date.toISOString()">{{ formatDate(date) }}</time>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LocaleDefinition } from '../locale/types'
import ClockIcon from './icons/ClockIcon.vue'

const props = withDefaults(
  defineProps<{
    executions: ReadonlyArray<Date>
    count?: number
    locale: LocaleDefinition
  }>(),
  {
    count: 5,
  },
)

const displayedExecutions = computed(() => props.executions.slice(0, props.count))

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(props.locale.code, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
)

function formatDate(date: Date): string {
  return dateFormatter.value.format(date)
}
</script>
