import {
  ref,
  shallowRef,
  computed,
  watch,
  triggerRef,
  type Ref,
  type ComputedRef,
  type WatchStopHandle,
} from 'vue'
import { Cron } from 'croner'
import type { CronFormat, FormatConfig, PeriodId, Segment } from '../core/types'
import { getFormatConfig } from '../core/defaults'
import { parseCronExpression, segmentsToString } from '../core/parser'
import { useCronSegment, type UseCronSegmentReturn } from './useCronSegment'
import type { LocaleDefinition } from '../locale/types'
import { generateDescription, resolveLocale } from '../locale/engine'

export interface UseCronOptions {
  modelValue?: Ref<string> | string
  format?: Ref<CronFormat> | CronFormat
  locale?: Ref<string | LocaleDefinition> | string | LocaleDefinition
}

export interface UseCronReturn {
  cronString: Ref<string>
  segments: ComputedRef<ReadonlyMap<string, UseCronSegmentReturn>>
  formatConfig: ComputedRef<FormatConfig>
  period: Ref<PeriodId>
  description: ComputedRef<string>
  nextExecutions: ComputedRef<ReadonlyArray<Date>>
  isValid: ComputedRef<boolean>
  error: ComputedRef<string | null>
  setCronString: (value: string) => void
  reset: () => void
}

function wrapRef<T>(value: Ref<T> | T): Ref<T> {
  return typeof value === 'object' && value !== null && 'value' in value
    ? (value as Ref<T>)
    : (ref(value) as Ref<T>)
}

export function useCron(options?: UseCronOptions): UseCronReturn {
  const formatRef = wrapRef(options?.format ?? 'crontab')
  const localeRef = wrapRef(options?.locale ?? 'en')

  const formatConfig = computed(() => getFormatConfig(formatRef.value))
  const resolvedLocale = computed<LocaleDefinition>(() => {
    const loc = localeRef.value
    return typeof loc === 'string' ? resolveLocale(loc) : loc
  })

  const initialExpression = (() => {
    if (options?.modelValue) {
      const mv =
        typeof options.modelValue === 'string' ? options.modelValue : options.modelValue.value
      if (mv) return mv
    }
    return getFormatConfig(formatRef.value).defaultExpression
  })()

  const cronString = ref(initialExpression)
  const period = ref<PeriodId>('day')
  let isSyncing = false

  const segmentInstances = shallowRef(new Map<string, UseCronSegmentReturn>())
  let segmentWatchers: WatchStopHandle[] = []

  function stopSegmentWatchers(): void {
    for (const stop of segmentWatchers) {
      stop()
    }
    segmentWatchers = []
  }

  function buildSegments(config: FormatConfig, expression: string): void {
    stopSegmentWatchers()
    const parsed = parseCronExpression(expression, config.format)
    const newMap = new Map<string, UseCronSegmentReturn>()

    for (const fieldId of config.fieldOrder) {
      const field = config.fields.get(fieldId)!
      const segCron = parsed.segments.get(fieldId)?.toString() ?? '*'
      const segInstance = useCronSegment({ field, initialCron: segCron })
      newMap.set(fieldId, segInstance)
    }

    segmentInstances.value = newMap
    triggerRef(segmentInstances)

    for (const [, seg] of newMap) {
      const stop = watch(
        () => seg.segment.value,
        () => syncFromSegments(),
      )
      segmentWatchers.push(stop)
    }
  }

  buildSegments(formatConfig.value, cronString.value)

  const initialParsed = parseCronExpression(cronString.value, formatRef.value)
  if (!initialParsed.error) {
    const segMap = new Map<string, Segment>()
    for (const [fieldId, seg] of segmentInstances.value) {
      segMap.set(fieldId, seg.segment.value)
    }
    const normalizedInitial = segmentsToString(segMap, formatRef.value)
    if (normalizedInitial !== cronString.value) {
      cronString.value = normalizedInitial
    }
  }

  const segments = computed(() => {
    return segmentInstances.value as ReadonlyMap<string, UseCronSegmentReturn>
  })

  function syncFromSegments(): void {
    if (isSyncing) return
    isSyncing = true
    try {
      const segMap = new Map<string, Segment>()
      for (const [fieldId, seg] of segmentInstances.value) {
        segMap.set(fieldId, seg.segment.value)
      }
      cronString.value = segmentsToString(segMap, formatRef.value)
    } finally {
      isSyncing = false
    }
  }

  watch(cronString, (newValue) => {
    if (isSyncing) return
    isSyncing = true
    try {
      const parsed = parseCronExpression(newValue, formatRef.value)
      if (!parsed.error) {
        for (const [fieldId, segment] of parsed.segments) {
          const instance = segmentInstances.value.get(fieldId)
          if (instance) {
            instance.setCron(segment.toString())
          }
        }
      }
    } finally {
      isSyncing = false
    }
  })

  watch(formatRef, (newFormat) => {
    const config = getFormatConfig(newFormat)
    buildSegments(config, config.defaultExpression)
    cronString.value = config.defaultExpression
  })

  const error = computed<string | null>(() => {
    const parsed = parseCronExpression(cronString.value, formatRef.value)
    return parsed.error
  })

  const isValid = computed(() => error.value === null)

  const description = computed(() => {
    if (!isValid.value) return ''
    const parsed = parseCronExpression(cronString.value, formatRef.value)
    return generateDescription(parsed, resolvedLocale.value)
  })

  const nextExecutions = computed<ReadonlyArray<Date>>(() => {
    if (!isValid.value) return []
    try {
      let expr = cronString.value
      if (formatRef.value === 'quartz') {
        const parts = expr.trim().split(/\s+/)
        if (parts.length === 7) {
          expr = parts.slice(0, 6).join(' ')
        }
        expr = expr.replace(/\?/g, '*')
      }
      const job = new Cron(expr)
      const runs: Date[] = []
      let next = job.nextRun()
      let count = 0
      while (next && count < 5) {
        runs.push(next)
        next = job.nextRun(new Date(next.getTime() + 1000))
        count++
      }
      return runs
    } catch {
      return []
    }
  })

  function setCronString(value: string): void {
    cronString.value = value
  }

  function reset(): void {
    cronString.value = formatConfig.value.defaultExpression
  }

  return {
    cronString,
    segments,
    formatConfig,
    period,
    description,
    nextExecutions,
    isValid,
    error,
    setCronString,
    reset,
  }
}
