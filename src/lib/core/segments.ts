import type {
  AnySegment,
  ValueSegment,
  RangeSegment,
  StepSegment,
  CombinedSegment,
  NoSpecificSegment,
  LastDaySegment,
  LastWeekdaySegment,
  NearestWeekdaySegment,
  LastWeekdayOfMonthSegment,
  NthWeekdaySegment,
  Segment,
  FieldDefinition,
} from './types'

function expandRange(min: number, max: number): ReadonlyArray<number> {
  const result: number[] = []
  for (let i = min; i <= max; i++) {
    result.push(i)
  }
  return result
}

function expandStep(base: number, step: number, min: number, max: number): ReadonlyArray<number> {
  const result: number[] = []
  const start = base === -1 ? min : base
  for (let i = start; i <= max; i += step) {
    result.push(i)
  }
  return result
}

function dedupSort(values: ReadonlyArray<number>): ReadonlyArray<number> {
  return [...new Set(values)].sort((a, b) => a - b)
}

export function createAnySegment(field: FieldDefinition): AnySegment {
  let cached: ReadonlyArray<number> | null = null
  function lazyValues(): ReadonlyArray<number> {
    if (!cached) {
      cached = expandRange(field.min, field.max)
    }
    return cached
  }
  const segment = Object.create(null) as AnySegment
  Object.defineProperties(segment, {
    type: { value: 'any' as const, enumerable: true },
    values: { get: lazyValues, enumerable: true },
    toString: { value: () => '*', enumerable: true },
  })
  return Object.freeze(segment)
}

export function createValueSegment(value: number, field: FieldDefinition): ValueSegment {
  if (value < field.min || value > field.max) {
    throw new Error(`Value ${value} out of range [${field.min}-${field.max}] for field ${field.id}`)
  }
  return Object.freeze({
    type: 'value' as const,
    value,
    values: [value],
    toString: () => String(value),
  })
}

export function createRangeSegment(from: number, to: number, field: FieldDefinition): RangeSegment {
  if (from < field.min || to > field.max) {
    throw new Error(
      `Range ${from}-${to} out of bounds [${field.min}-${field.max}] for field ${field.id}`,
    )
  }
  if (from > to) {
    throw new Error(`Invalid range: ${from} > ${to} for field ${field.id}`)
  }
  const values = expandRange(from, to)
  return Object.freeze({
    type: 'range' as const,
    from,
    to,
    values,
    toString: () => `${from}-${to}`,
  })
}

export function createStepSegment(
  base: number | '*',
  step: number,
  field: FieldDefinition,
  rangeEnd?: number,
): StepSegment {
  if (step < 1) {
    throw new Error(`Step must be >= 1, got ${step} for field ${field.id}`)
  }
  const numericBase = base === '*' ? -1 : base
  if (base !== '*' && (base < field.min || base > field.max)) {
    throw new Error(
      `Step base ${base} out of range [${field.min}-${field.max}] for field ${field.id}`,
    )
  }
  if (rangeEnd !== undefined && (rangeEnd < field.min || rangeEnd > field.max)) {
    throw new Error(
      `Step range end ${rangeEnd} out of range [${field.min}-${field.max}] for field ${field.id}`,
    )
  }
  const max = rangeEnd ?? field.max
  const values = expandStep(numericBase, step, field.min, max)
  return Object.freeze({
    type: 'step' as const,
    base,
    step,
    rangeEnd,
    values,
    toString: () => (rangeEnd !== undefined ? `${base}-${rangeEnd}/${step}` : `${base}/${step}`),
  })
}

export function createCombinedSegment(
  parts: ReadonlyArray<Segment>,
  _field: FieldDefinition,
): CombinedSegment {
  if (parts.length < 2) {
    throw new Error('CombinedSegment requires at least 2 parts')
  }
  const allValues: number[] = []
  for (const part of parts) {
    allValues.push(...part.values)
  }
  const values = dedupSort(allValues)
  return Object.freeze({
    type: 'combined' as const,
    parts,
    values,
    toString: () => parts.map((p) => p.toString()).join(','),
  })
}

export function createNoSpecificSegment(): NoSpecificSegment {
  return Object.freeze({
    type: 'noSpecific' as const,
    values: [] as ReadonlyArray<number>,
    toString: () => '?',
  })
}

export function createLastDaySegment(offset: number = 0): LastDaySegment {
  return Object.freeze({
    type: 'lastDay' as const,
    offset,
    values: [] as ReadonlyArray<number>,
    toString: () => (offset === 0 ? 'L' : `L-${offset}`),
  })
}

export function createLastWeekdaySegment(): LastWeekdaySegment {
  return Object.freeze({
    type: 'lastWeekday' as const,
    values: [] as ReadonlyArray<number>,
    toString: () => 'LW',
  })
}

export function createNearestWeekdaySegment(day: number): NearestWeekdaySegment {
  return Object.freeze({
    type: 'nearestWeekday' as const,
    day,
    values: [] as ReadonlyArray<number>,
    toString: () => `${day}W`,
  })
}

export function createLastWeekdayOfMonthSegment(weekday: number): LastWeekdayOfMonthSegment {
  return Object.freeze({
    type: 'lastWeekdayOfMonth' as const,
    weekday,
    values: [] as ReadonlyArray<number>,
    toString: () => `${weekday}L`,
  })
}

export function createNthWeekdaySegment(weekday: number, nth: number): NthWeekdaySegment {
  return Object.freeze({
    type: 'nthWeekday' as const,
    weekday,
    nth,
    values: [] as ReadonlyArray<number>,
    toString: () => `${weekday}#${nth}`,
  })
}
