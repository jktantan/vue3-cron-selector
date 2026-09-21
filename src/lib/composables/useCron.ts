import {
  ref,
  shallowRef,
  computed,
  watch,
  triggerRef,
  isRef,
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
  previewCount?: Ref<number> | number
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
  return isRef(value) ? value : (ref(value) as Ref<T>)
}

export function useCron(options?: UseCronOptions): UseCronReturn {
  const formatRef = wrapRef(options?.format ?? 'crontab')
  const localeRef = wrapRef(options?.locale ?? 'en')
  const previewCountRef = wrapRef(options?.previewCount ?? 5)
  const modelValueRef =
    options?.modelValue && isRef(options.modelValue) ? options.modelValue : undefined

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

  if (modelValueRef) {
    watch(modelValueRef, (newValue) => {
      if (newValue !== cronString.value) {
        cronString.value = newValue || getFormatConfig(formatRef.value).defaultExpression
      }
    })

    watch(cronString, (newValue) => {
      if (newValue !== modelValueRef.value) {
        modelValueRef.value = newValue
      }
    })
  }

  watch(formatRef, (newFormat) => {
    const config = getFormatConfig(newFormat)
    // Keep the caller's expression intact. A format change can be lossy (for
    // example, crontab has no seconds), so users must explicitly reset or edit it.
    buildSegments(config, cronString.value)
  })

  const parsed = computed(() => parseCronExpression(cronString.value, formatRef.value))

  const error = computed<string | null>(() => parsed.value.error)

  const isValid = computed(() => error.value === null)

  const description = computed(() => {
    if (!isValid.value) return ''
    return generateDescription(parsed.value, resolvedLocale.value)
  })

  const nextExecutions = computed<ReadonlyArray<Date>>(() => {
    if (!isValid.value) return []
    try {
      const job = new Cron(cronString.value)
      const runs: Date[] = []
      let next = job.nextRun()
      let count = 0
      const maxCount = Math.max(0, Math.floor(previewCountRef.value))
      while (next && count < maxCount) {
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
