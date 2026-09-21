import type { Segment, FieldDefinition, CronFormat, ParsedCron } from './types'
import {
  createAnySegment,
  createValueSegment,
  createRangeSegment,
  createStepSegment,
  createCombinedSegment,
  createNoSpecificSegment,
  createLastDaySegment,
  createLastWeekdaySegment,
  createNearestWeekdaySegment,
  createLastWeekdayOfMonthSegment,
  createNthWeekdaySegment,
} from './segments'
import { getFormatConfig } from './defaults'

function resolveValue(token: string, field: FieldDefinition): number {
  const upper = token.trim().toUpperCase()
  if (field.altValues?.has(upper)) {
    return field.altValues.get(upper)!
  }
  if (!/^\d+$/.test(upper)) {
    throw new Error(`Invalid value "${token}" for field ${field.id}`)
  }
  const num = Number(upper)
  if (num < field.min || num > field.max) {
    throw new Error(`Value ${num} out of range [${field.min}-${field.max}] for field ${field.id}`)
  }
  return num
}

export function parseCronField(
  fieldStr: string,
  field: FieldDefinition,
  format?: CronFormat,
): Segment {
  const trimmed = fieldStr.trim()

  if (trimmed === '*') {
    return createAnySegment(field)
  }

  if (trimmed === '?') {
    if (format === 'crontab') {
      throw new Error(`"?" is not supported by ${format} format`)
    }
    if (field.id !== 'dayOfMonth' && field.id !== 'dayOfWeek') {
      throw new Error(`"?" is only valid for dayOfMonth and dayOfWeek fields, not ${field.id}`)
    }
    return createNoSpecificSegment()
  }

  if (field.id === 'dayOfMonth') {
    if (format === 'crontab' && /^(L|LW|L-\d+|\d+W)$/.test(trimmed)) {
      throw new Error(`Day modifiers are not supported by ${format} format`)
    }
    if (trimmed === 'L') return createLastDaySegment(0)
    if (trimmed === 'LW') return createLastWeekdaySegment()
    const lastDayOffset = trimmed.match(/^L-(\d+)$/)
    if (lastDayOffset) {
      const offset = Number(lastDayOffset[1])
      if (offset < 1 || offset > 30) {
        throw new Error(`Last day offset ${offset} out of range [1-30]`)
      }
      return createLastDaySegment(offset)
    }
    const nearestWd = trimmed.match(/^(\d+)W$/)
    if (nearestWd) {
      const day = Number(nearestWd[1])
      if (day < 1 || day > 31) throw new Error(`Nearest weekday day ${day} out of range [1-31]`)
      return createNearestWeekdaySegment(day)
    }
  }

  if (field.id === 'dayOfWeek') {
    if (format === 'crontab' && /^([A-Za-z]+|\d+)(L|#\d+)$/.test(trimmed)) {
      throw new Error(`Day modifiers are not supported by ${format} format`)
    }
    const lastWdOfMonth = trimmed.match(/^([A-Za-z]+|\d+)L$/)
    if (lastWdOfMonth) {
      const weekday = resolveValue(lastWdOfMonth[1], field)
      return createLastWeekdayOfMonthSegment(weekday)
    }
    const nthWd = trimmed.match(/^([A-Za-z]+|\d+)#(\d+)$/)
    if (nthWd) {
      const weekday = resolveValue(nthWd[1], field)
      const nth = Number(nthWd[2])
      if (nth < 1 || nth > 5) throw new Error(`Nth value ${nth} out of range [1-5]`)
      return createNthWeekdaySegment(weekday, nth)
    }
  }

  if (trimmed.includes(',')) {
    const rawParts = trimmed.split(',')
    for (const rp of rawParts) {
      if (rp.trim() === '') {
        throw new Error(`Empty segment in comma-separated value "${trimmed}" for field ${field.id}`)
      }
    }
    const parts = rawParts.map((part) => parseCronField(part.trim(), field, format))
    if (parts.length === 1) {
      return parts[0]
    }
    return createCombinedSegment(parts, field)
  }

  if (trimmed.includes('/')) {
    const slashParts = trimmed.split('/')
    if (slashParts.length !== 2) {
      throw new Error(`Invalid step expression "${trimmed}" for field ${field.id}`)
    }
    const [baseStr, stepStr] = slashParts
    if (!/^\d+$/.test(stepStr)) {
      throw new Error(`Invalid step value "${stepStr}" for field ${field.id}`)
    }
    const step = Number(stepStr)
    if (step < 1) {
      throw new Error(`Invalid step value "${stepStr}" for field ${field.id}`)
    }

    if (baseStr === '*') {
      return createStepSegment('*', step, field)
    }

    if (baseStr.includes('-')) {
      const dashParts = baseStr.split('-')
      if (dashParts.length !== 2) {
        throw new Error(`Invalid range "${baseStr}" in step expression for field ${field.id}`)
      }
      const from = resolveValue(dashParts[0], field)
      const to = resolveValue(dashParts[1], field)
      return createStepSegment(from, step, field, to)
    }

    const base = resolveValue(baseStr, field)
    return createStepSegment(base, step, field)
  }

  if (trimmed.includes('-')) {
    const dashParts = trimmed.split('-')
    if (dashParts.length !== 2) {
      throw new Error(`Invalid range expression "${trimmed}" for field ${field.id}`)
    }
    const from = resolveValue(dashParts[0], field)
    const to = resolveValue(dashParts[1], field)
    return createRangeSegment(from, to, field)
  }

  const value = resolveValue(trimmed, field)
  return createValueSegment(value, field)
}

export function parseCronExpression(expression: string, format: CronFormat): ParsedCron {
  const config = getFormatConfig(format)
  const parts = expression.trim().split(/\s+/)

  const hasOptionalYear =
    format === 'quartz' && config.fieldOrder[config.fieldOrder.length - 1] === 'year'
  const minFields = hasOptionalYear ? config.fieldOrder.length - 1 : config.fieldOrder.length

  if (parts.length < minFields || parts.length > config.fieldOrder.length) {
    return {
      format,
      segments: new Map(),
      raw: expression,
      error: hasOptionalYear
        ? `Expected ${minFields}-${config.fieldOrder.length} fields for ${format} format, got ${parts.length}`
        : `Expected ${config.fieldOrder.length} fields for ${format} format, got ${parts.length}`,
    }
  }

  const segments = new Map<string, Segment>()

  try {
    for (let i = 0; i < config.fieldOrder.length; i++) {
      const fieldId = config.fieldOrder[i]
      const field = config.fields.get(fieldId)!
      if (i < parts.length) {
        segments.set(fieldId, parseCronField(parts[i], field, format))
      } else {
        segments.set(fieldId, createAnySegment(field))
      }
    }
  } catch (err) {
    return {
      format,
      segments: new Map(),
      raw: expression,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  if (format === 'quartz') {
    const dayOfMonth = segments.get('dayOfMonth')
    const dayOfWeek = segments.get('dayOfWeek')
    const noSpecificCount =
      Number(dayOfMonth?.type === 'noSpecific') + Number(dayOfWeek?.type === 'noSpecific')
    if (noSpecificCount !== 1) {
      return {
        format,
        segments: new Map(),
        raw: expression,
        error: 'Quartz format requires exactly one of dayOfMonth or dayOfWeek to be "?"',
      }
    }
  }

  return {
    format,
    segments,
    raw: expression,
    error: null,
  }
}

function detectStepPattern(
  values: ReadonlyArray<number>,
  field: FieldDefinition,
): { base: number | '*'; step: number } | null {
  if (values.length < 2) return null

  const step = values[1] - values[0]
  if (step <= 1) return null

  for (let i = 2; i < values.length; i++) {
    if (values[i] - values[i - 1] !== step) return null
  }

  if (values[0] === field.min) {
    const expectedCount = Math.floor((field.max - field.min) / step) + 1
    if (values.length === expectedCount) {
      return { base: '*', step }
    }
  }

  return { base: values[0], step }
}

function detectContiguousRanges(
  values: ReadonlyArray<number>,
): ReadonlyArray<{ from: number; to: number }> {
  if (values.length === 0) return []

  const ranges: { from: number; to: number }[] = []
  let rangeStart = values[0]
  let rangePrev = values[0]

  for (let i = 1; i < values.length; i++) {
    if (values[i] === rangePrev + 1) {
      rangePrev = values[i]
    } else {
      ranges.push({ from: rangeStart, to: rangePrev })
      rangeStart = values[i]
      rangePrev = values[i]
    }
  }
  ranges.push({ from: rangeStart, to: rangePrev })

  return ranges
}

export function selectedToSegment(
  selectedValues: ReadonlyArray<number>,
  field: FieldDefinition,
): Segment {
  const sorted = [...selectedValues].sort((a, b) => a - b)

  if (sorted.length === 0) {
    return createAnySegment(field)
  }

  const totalValues = field.max - field.min + 1
  if (sorted.length === totalValues) {
    return createAnySegment(field)
  }

  if (sorted.length === 1) {
    return createValueSegment(sorted[0], field)
  }

  const stepPattern = detectStepPattern(sorted, field)
  if (stepPattern) {
    return createStepSegment(stepPattern.base, stepPattern.step, field)
  }

  const ranges = detectContiguousRanges(sorted)
  if (ranges.length === 1) {
    return createRangeSegment(ranges[0].from, ranges[0].to, field)
  }

  const parts: Segment[] = ranges.map((range) => {
    if (range.from === range.to) {
      return createValueSegment(range.from, field)
    }
    return createRangeSegment(range.from, range.to, field)
  })

  return createCombinedSegment(parts, field)
}

export function segmentsToString(
  segments: ReadonlyMap<string, Segment>,
  format: CronFormat,
): string {
  const config = getFormatConfig(format)
  return config.fieldOrder
    .map((fieldId) => {
      const segment = segments.get(fieldId)
      if (!segment) return '*'
      if (segment.type === 'noSpecific' && format !== 'quartz') return '*'
      return segment.toString()
    })
    .join(' ')
}
