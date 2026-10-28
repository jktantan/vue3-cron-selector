import type { App, InjectionKey } from 'vue'
import CronSelector from './components/CronSelector.vue'

// Styles are intentionally NOT imported here. Consumers opt in with
// `import 'vue3-cron-selector/style.css'`; keeping the JS entry style-free lets
// tree-shaking, SSR and custom theme pipelines work without side effects.

export { default as CronSelector } from './components/CronSelector.vue'

// Provide/inject bridge so CronPopover and InlineSelect (children of the popover
// panel) can register their floating dropdowns without stringly-typed class
// lookups. Each InlineSelect exposes its dropdown element ref; CronPopover
// collects them and treats clicks inside any of them as "still inside the
// popover" instead of closing.
export interface FloatingPanelHost {
  register(el: HTMLElement): void
  unregister(el: HTMLElement): void
}

export const FloatingPanelKey: InjectionKey<FloatingPanelHost> = Symbol('cronFloatingPanels')

export { useCron } from './composables/useCron'
export type { UseCronOptions, UseCronReturn } from './composables/useCron'

export { useCronSegment } from './composables/useCronSegment'
export type { UseCronSegmentOptions, UseCronSegmentReturn } from './composables/useCronSegment'

export type {
  CronFormat,
  DisplayMode,
  Segment,
  SegmentType,
  FieldDefinition,
  ParsedCron,
  PeriodId,
  FormatConfig,
  FieldItem,
} from './core/types'

export type {
  LocaleDefinition,
  LocaleTemplates,
  FieldOptionLabels,
  PluralForms,
} from './locale/types'

export type { CronTheme, ResolvedCronTheme } from './theme/context'

export { EN_US_LOCALE } from './locale/en-US'
export { ZH_CN_LOCALE } from './locale/zh-CN'

export {
  parseCronExpression,
  parseCronField,
  selectedToSegment,
  segmentsToString,
} from './core/parser'
export { getFormatConfig } from './core/defaults'
export { generateDescription, resolveLocale, getFieldValueLabel } from './locale/engine'

export const Vue3CronSelectorPlugin = {
  install(app: App): void {
    app.component('CronSelector', CronSelector)
  },
}

export default Vue3CronSelectorPlugin
