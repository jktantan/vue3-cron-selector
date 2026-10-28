<template>
  <div
    class="cron-selector"
    :class="[themeClass, { 'cron-selector--disabled': disabled }]"
    :style="themeStyle"
  >
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
import { ref, watch, computed, provide } from 'vue'
import type { CronFormat, DisplayMode } from '../core/types'
import type { LocaleDefinition } from '../locale/types'
import { useCron } from '../composables/useCron'
import { resolveLocale } from '../locale/engine'
import {
  CronThemeKey,
  CronThemeStyleKey,
  type CronTheme,
  type CronThemeStyle,
  type ResolvedCronTheme,
} from '../theme/context'
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
    theme?: CronTheme
    primaryColor?: string
  }>(),
  {
    modelValue: '',
    format: 'crontab',
    locale: 'en',
    disabled: false,
    cols: () => ({}),
    previewCount: 5,
    mode: 'inline',
    theme: 'auto',
    primaryColor: '',
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
const previewCountRef = ref(props.previewCount)

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
watch(
  () => props.previewCount,
  (v) => {
    previewCountRef.value = v
  },
)

const { cronString, segments, formatConfig, nextExecutions, isValid, error } = useCron({
  modelValue: cronRef,
  format: formatRef,
  locale: localeRefValue,
  previewCount: previewCountRef,
})

const resolvedLocale = computed<LocaleDefinition>(() => {
  const loc = localeRefValue.value
  return typeof loc === 'string' ? resolveLocale(loc) : loc
})

// `auto` keeps the component on the inherited Element Plus theme (the `html.dark`
// convention); explicit values pin the palette for this instance. The resolved
// value is also provided to teleported panels (popover, inline-select dropdown),
// which sit outside this subtree in the DOM.
const resolvedTheme = computed<ResolvedCronTheme>(() =>
  props.theme === 'auto' ? null : props.theme,
)
const themeClass = computed(() =>
  resolvedTheme.value ? `cron-selector--${resolvedTheme.value}` : '',
)
provide(CronThemeKey, resolvedTheme)

// A custom primary colour is expanded into the four primary tokens the
// stylesheet consumes. Mixing against `--cron-color-bg` keeps the derived
// shades readable in both light and dark palettes: on a light background the
// tints move towards white, on a dark background towards the dark surface.
const EMPTY_THEME_STYLE: CronThemeStyle = {}

const themeStyle = computed<CronThemeStyle>(() => {
  const primary = props.primaryColor.trim()
  if (!primary) return EMPTY_THEME_STYLE
  return {
    '--cron-color-primary': primary,
    '--cron-color-primary-hover': `color-mix(in srgb, ${primary} 70%, var(--cron-color-bg, #ffffff))`,
    '--cron-color-primary-light': `color-mix(in srgb, ${primary} 10%, var(--cron-color-bg, #ffffff))`,
    '--cron-color-primary-border': `color-mix(in srgb, ${primary} 50%, var(--cron-color-bg, #ffffff))`,
    // Secondary surfaces derived from the primary colour. Without these the
    // selected row / dropdown option would keep Element Plus' default blue tint
    // (a near-black blue in dark mode) while the border turned green.
    '--cron-color-bg-selected': `color-mix(in srgb, ${primary} 10%, var(--cron-color-bg, #ffffff))`,
    '--cron-color-border-focus': primary,
  }
})
provide(CronThemeStyleKey, themeStyle)

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined && newVal !== cronString.value) {
      cronRef.value = newVal
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
