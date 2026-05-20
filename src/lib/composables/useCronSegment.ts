import { ref, watch, type Ref } from 'vue'
import type { Segment, SegmentType, FieldDefinition } from '../core/types'
import {
  createAnySegment,
  createRangeSegment,
  createStepSegment,
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
      case 'combined':
        segment.value = selectedToSegment(selected.value, field)
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
