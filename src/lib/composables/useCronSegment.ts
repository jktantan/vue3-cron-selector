import { ref, watch, type Ref } from 'vue'
import type { Segment, SegmentType, FieldDefinition } from '../core/types'
import {
  createAnySegment,
  createCombinedSegment,
  createRangeSegment,
  createStepSegment,
  createValueSegment,
  createNoSpecificSegment,
  createLastDaySegment,
  createLastWeekdaySegment,
  createNearestWeekdaySegment,
  createLastWeekdayOfMonthSegment,
  createNthWeekdaySegment,
} from '../core/segments'
import { selectedToSegment, parseCronField } from '../core/parser'

export interface UseCronSegmentOptions {
  field: FieldDefinition
  initialCron?: string
}

export interface UseCronSegmentReturn {
  readonly fieldId: string
  readonly field: FieldDefinition
  segment: Ref<Segment>
  selected: Ref<ReadonlyArray<number>>
  cronString: Ref<string>
  setSelected: (values: ReadonlyArray<number>) => void
  setType: (type: SegmentType) => void
  setRange: (from: number, to: number) => void
  setStep: (base: number | '*', step: number) => void
  setCron: (cron: string) => void
  reset: () => void
}

export function useCronSegment(options: UseCronSegmentOptions): UseCronSegmentReturn {
  const { field } = options
  const initialCron = options.initialCron ?? '*'

  let isSyncing = false

  const segment = ref<Segment>(parseCronField(initialCron, field)) as Ref<Segment>
  const selected = ref<ReadonlyArray<number>>([...segment.value.values])
  const cronString = ref(segment.value.toString())

  watch(segment, (newSegment) => {
    if (isSyncing) return
    isSyncing = true
    try {
      selected.value = [...newSegment.values]
      cronString.value = newSegment.toString()
    } finally {
      isSyncing = false
    }
  })

  function setSelected(values: ReadonlyArray<number>): void {
    if (isSyncing) return
    isSyncing = true
    try {
      const newSegment = selectedToSegment(values, field)
      segment.value = newSegment
      selected.value = [...newSegment.values]
      cronString.value = newSegment.toString()
    } finally {
      isSyncing = false
    }
  }

  function setType(type: SegmentType): void {
    if (segment.value.type === type) return
    switch (type) {
      case 'any':
        segment.value = createAnySegment(field)
        break
      case 'range':
        segment.value = createRangeSegment(field.min, Math.min(field.min + 4, field.max), field)
        break
      case 'step':
        segment.value = createStepSegment('*', 1, field)
        break
      case 'value':
        segment.value = selectedToSegment(selected.value, field)
        break
      case 'combined':
        // Build a combined segment explicitly so the type is always 'combined',
        // independent of selectedToSegment's pattern-detection (which would
        // collapse arithmetic progressions into a step segment).
        const parts: Segment[] = []
        if (selected.value.length >= 2) {
          const seed = [...selected.value].sort((a, b) => a - b)
          let runStart = seed[0]
          let runPrev = seed[0]
          const pushRange = (from: number, to: number): void => {
            if (from === to) parts.push(createValueSegment(from, field))
            else parts.push(createRangeSegment(from, to, field))
          }
          for (let i = 1; i < seed.length; i++) {
            if (seed[i] === runPrev + 1) {
              runPrev = seed[i]
            } else {
              pushRange(runStart, runPrev)
              runStart = seed[i]
              runPrev = seed[i]
            }
          }
          pushRange(runStart, runPrev)
        } else {
          // Seed two distinct single-value parts so the type contract holds even
          // for a sparse selection. We deliberately avoid createRangeSegment
          // here because [min, min+1] would otherwise collapse to one part.
          parts.push(createValueSegment(field.min, field))
          const second = Math.min(field.min + 1, field.max)
          if (second !== field.min) {
            parts.push(createValueSegment(second, field))
          } else {
            // Single-value field edge case: synthesize two adjacent values by
            // widening to the next valid step if possible; otherwise fall back
            // to a value segment below.
            parts.push(createValueSegment(field.max, field))
          }
        }
        if (parts.length >= 2) {
          segment.value = createCombinedSegment(parts, field)
        } else {
          segment.value = parts[0] ?? createAnySegment(field)
        }
        break
      case 'noSpecific':
        segment.value = createNoSpecificSegment()
        break
      case 'lastDay':
        segment.value = createLastDaySegment(0)
        break
      case 'lastWeekday':
        segment.value = createLastWeekdaySegment()
        break
      case 'nearestWeekday':
        segment.value = createNearestWeekdaySegment(1)
        break
      case 'lastWeekdayOfMonth':
        segment.value = createLastWeekdayOfMonthSegment(0)
        break
      case 'nthWeekday':
        segment.value = createNthWeekdaySegment(0, 1)
        break
      default:
        segment.value = createAnySegment(field)
    }
  }

  function setRange(from: number, to: number): void {
    segment.value = createRangeSegment(from, to, field)
  }

  function setStep(base: number | '*', step: number): void {
    segment.value = createStepSegment(base, step, field)
  }

  function setCron(cron: string): void {
    if (isSyncing) return
    isSyncing = true
    try {
      const parsed = parseCronField(cron, field)
      segment.value = parsed
      selected.value = [...parsed.values]
      cronString.value = parsed.toString()
    } catch {
      // keep current state on parse error
    } finally {
      isSyncing = false
    }
  }

  function reset(): void {
    segment.value = createAnySegment(field)
  }

  return {
    fieldId: field.id,
    field,
    segment,
    selected,
    cronString,
    setSelected,
    setType,
    setRange,
    setStep,
    setCron,
    reset,
  }
}
