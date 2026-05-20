<template>
  <div class="cron-selector" :class="{ 'cron-selector--disabled': disabled }">
    <CronPopover
      v-if="mode === 'popover'"
      :model-value="cronString"
      :is-valid="isValid"
      :error="error"
      :disabled="disabled"
      :locale="resolvedLocale"
      @manual-input="onManualInput"
    >
      <CronTabbedPanel
        :segments="segments"
        :format-config="formatConfig"
        :locale="resolvedLocale"
        :disabled="disabled"
        :cron-string="cronString"
        :is-valid="isValid"
        :error="error"
        :executions="nextExecutions"
        :preview-count="previewCount"
        :cols="cols"
      />
    </CronPopover>

    <CronTabbedPanel
      v-else
      :segments="segments"
      :format-config="formatConfig"
      :locale="resolvedLocale"
      :disabled="disabled"
      :cron-string="cronString"
      :is-valid="isValid"
      :error="error"
      :executions="nextExecutions"
      :preview-count="previewCount"
      :cols="cols"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CronFormat, DisplayMode } from '../core/types'
import type { LocaleDefinition } from '../locale/types'
import { useCron } from '../composables/useCron'
import { resolveLocale } from '../locale/engine'
import CronTabbedPanel from './CronTabbedPanel.vue'
import CronPopover from './CronPopover.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    format?: CronFormat
    locale?: string | LocaleDefinition
    disabled?: boolean
    cols?: Partial<Record<string, number>>
    previewCount?: number
    mode?: DisplayMode
  }>(),
  {
    format: 'crontab',
    locale: 'en',
    disabled: false,
    previewCount: 5,
    mode: 'inline',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  error: [error: string | null]
}>()

const cronRef = ref(props.modelValue ?? '')
const formatRef = ref(props.format)
const localeRefValue = ref<string | LocaleDefinition>(props.locale)

watch(
  () => props.format,
  (v) => {
    formatRef.value = v
  },
)
watch(
  () => props.locale,
  (v) => {
    localeRefValue.value = v
  },
)

const { cronString, segments, formatConfig, nextExecutions, isValid, error } = useCron({
  modelValue: cronRef,
  format: formatRef,
  locale: localeRefValue,
})

const resolvedLocale = computed<LocaleDefinition>(() => {
  const loc = localeRefValue.value
  return typeof loc === 'string' ? resolveLocale(loc) : loc
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined && newVal !== cronString.value) {
      cronRef.value = newVal
      cronString.value = newVal
    }
  },
)

watch(cronString, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
})

watch(error, (newError) => {
  emit('error', newError)
})

function onManualInput(value: string): void {
  cronString.value = value
}
</script>
