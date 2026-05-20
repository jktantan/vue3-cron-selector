<template>
  <div class="cron-tabbed-panel">
    <CronTabBar
      :fields="visibleTabs"
      :active-field="activeTabId"
      :locale="mergedLocale"
      :disabled="disabled"
      @update:active-field="activeTabId = $event"
    />

    <div class="cron-tabbed-panel__body">
      <div class="cron-tabbed-panel__field">
        <CronDayField
          v-if="isDayTabActive && hasMergedDayTab"
          :dom-segment="domSegment!"
          :dow-segment="dowSegment!"
          :format="formatConfig.format"
          :locale="locale"
          :disabled="disabled"
        />
        <CronField
          v-else
          :key="resolvedFieldId"
          :field-id="resolvedFieldId"
          :field="activeFieldDef!"
          :segment="activeSegment!"
          :locale="locale"
          :disabled="disabled"
          :cols="fieldCols"
        />
      </div>

      <div class="cron-tabbed-panel__preview">
        <ExecutionPreview :executions="executions" :count="previewCount" :locale="locale" />
      </div>
    </div>

    <div class="cron-tabbed-panel__expression">
      <code
        class="cron-tabbed-panel__expression-text"
        :class="{ 'cron-tabbed-panel__expression-text--error': !isValid }"
      >
        {{ cronString }}
      </code>
      <span v-if="!isValid" class="cron-tabbed-panel__expression-error">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormatConfig } from '../core/types'
import type { UseCronSegmentReturn } from '../composables/useCronSegment'
import type { LocaleDefinition } from '../locale/types'
import CronTabBar from './CronTabBar.vue'
import CronField from './CronField.vue'
import CronDayField from './CronDayField.vue'
import ExecutionPreview from './ExecutionPreview.vue'

const VIRTUAL_DAY_TAB = 'day'

const DEFAULT_COLS: Record<string, number> = {
  second: 10,
  minute: 10,
  hour: 6,
  dayOfMonth: 7,
  month: 4,
  dayOfWeek: 7,
  year: 10,
}

const props = withDefaults(
  defineProps<{
    segments: ReadonlyMap<string, UseCronSegmentReturn>
    formatConfig: FormatConfig
    locale: LocaleDefinition
    disabled?: boolean
    cronString: string
    isValid: boolean
    error: string | null
    executions: ReadonlyArray<Date>
    previewCount?: number
    cols?: Partial<Record<string, number>>
  }>(),
  {
    disabled: false,
    previewCount: 5,
  },
)

const hasMergedDayTab = computed(() => {
  const order = props.formatConfig.fieldOrder
  return order.includes('dayOfMonth') && order.includes('dayOfWeek')
})

const visibleTabs = computed<ReadonlyArray<string>>(() => {
  if (!hasMergedDayTab.value) {
    return props.formatConfig.fieldOrder
  }
  const tabs: string[] = []
  for (const fieldId of props.formatConfig.fieldOrder) {
    if (fieldId === 'dayOfMonth') {
      tabs.push(VIRTUAL_DAY_TAB)
    } else if (fieldId === 'dayOfWeek') {
      continue
    } else {
      tabs.push(fieldId)
    }
  }
  return tabs
})

const mergedLocale = computed<LocaleDefinition>(() => {
  if (!hasMergedDayTab.value) return props.locale
  const dayLabel = props.locale.tabLabels?.dayOfMonth ?? props.locale.fieldLabels.dayOfMonth ?? 'Day'
  return {
    ...props.locale,
    tabLabels: {
      ...props.locale.tabLabels,
      [VIRTUAL_DAY_TAB]: dayLabel,
    },
    fieldLabels: {
      ...props.locale.fieldLabels,
      [VIRTUAL_DAY_TAB]: dayLabel,
    },
  }
})

const activeTabId = ref(visibleTabs.value[0])

watch(
  () => props.formatConfig,
  () => {
    if (!visibleTabs.value.includes(activeTabId.value)) {
      activeTabId.value = visibleTabs.value[0]
    }
  },
)

const isDayTabActive = computed(() => activeTabId.value === VIRTUAL_DAY_TAB)

const resolvedFieldId = computed(() => {
  if (isDayTabActive.value && !hasMergedDayTab.value) {
    return 'dayOfMonth'
  }
  return activeTabId.value
})

const activeFieldDef = computed(() => props.formatConfig.fields.get(resolvedFieldId.value))
const activeSegment = computed(() => props.segments.get(resolvedFieldId.value))

const domSegment = computed(() => props.segments.get('dayOfMonth'))
const dowSegment = computed(() => props.segments.get('dayOfWeek'))

const fieldCols = computed(() => {
  const custom = props.cols?.[resolvedFieldId.value]
  if (custom !== undefined) return custom
  return DEFAULT_COLS[resolvedFieldId.value] ?? 10
})
</script>
