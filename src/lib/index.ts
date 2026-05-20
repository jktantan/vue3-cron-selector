import type { App } from 'vue'
import CronSelector from './components/CronSelector.vue'

import './theme/variables.scss'
import './theme/cron-selector.scss'

export { default as CronSelector } from './components/CronSelector.vue'

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

export type { LocaleDefinition } from './locale/types'

export { EN_LOCALE } from './locale/en'
export { ZH_LOCALE } from './locale/zh'

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
