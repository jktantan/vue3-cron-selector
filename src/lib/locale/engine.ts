import type { ParsedCron, Segment } from '../core/types'
import type { LocaleDefinition } from './types'
import { EN_LOCALE } from './en'
import { ZH_LOCALE } from './zh'

const BUILT_IN_LOCALES: ReadonlyMap<string, LocaleDefinition> = new Map([
  ['en', EN_LOCALE],
  ['zh', ZH_LOCALE],
])

export function resolveLocale(code: string): LocaleDefinition {
  const locale = BUILT_IN_LOCALES.get(code)
  if (locale) return locale

  const baseCode = code.split('-')[0]
  const fallback = BUILT_IN_LOCALES.get(baseCode)
  if (fallback) return fallback

  return EN_LOCALE
}

export function getFieldValueLabel(
  fieldId: string,
  value: number,
  locale: LocaleDefinition,
): string {
  if (fieldId === 'month' && value >= 1 && value <= 12) {
    return locale.months[value - 1]
  }
  if (fieldId === 'dayOfWeek' && value >= 0 && value <= 6) {
    return locale.weekdays[value]
  }
  if (fieldId === 'year') {
    return String(value)
  }
  return String(value).padStart(2, '0')
}

function describeSegment(segment: Segment, fieldId: string, locale: LocaleDefinition): string {
  switch (segment.type) {
    case 'any':
      return `${locale.segmentTypes.any} ${locale.fieldLabels[fieldId] ?? fieldId}`
    case 'value':
      return getFieldValueLabel(fieldId, segment.value, locale)
    case 'range':
      return `${getFieldValueLabel(fieldId, segment.from, locale)} ${locale.ui.through} ${getFieldValueLabel(fieldId, segment.to, locale)}`
    case 'step': {
      const base =
        segment.base === '*'
          ? ''
          : ` ${locale.ui.startingAt} ${getFieldValueLabel(fieldId, segment.base, locale)}`
      return `${locale.ui.every} ${segment.step} ${locale.fieldLabels[fieldId] ?? fieldId}${base}`
    }
    case 'combined': {
      const parts = segment.parts.map((p) => describeSegment(p, fieldId, locale))
      if (parts.length <= 2) {
        return parts.join(` ${locale.ui.and} `)
      }
      return `${parts.slice(0, -1).join(', ')} ${locale.ui.and} ${parts[parts.length - 1]}`
    }
    case 'noSpecific':
      return locale.segmentTypes.noSpecific
    case 'lastDay':
      return segment.offset === 0
        ? locale.ui.lastDayOfMonth
        : locale.ui.daysBeforeEndOfMonth.replace('{n}', String(segment.offset))
    case 'lastWeekday':
      return locale.ui.lastWeekdayOfMonth
    case 'nearestWeekday':
      return locale.ui.nearestWeekdayTo.replace('{day}', String(segment.day))
    case 'lastWeekdayOfMonth':
      return locale.ui.lastSpecificWeekdayOfMonth.replace(
        '{weekday}',
        locale.weekdays[segment.weekday] ?? String(segment.weekday),
      )
    case 'nthWeekday':
      return locale.ui.nthWeekdayOfMonth
        .replace('{nth}', locale.ui.ordinals[segment.nth - 1] ?? String(segment.nth))
        .replace('{weekday}', locale.weekdays[segment.weekday] ?? String(segment.weekday))
  }
}

export function generateDescription(parsed: ParsedCron, locale: LocaleDefinition): string {
  if (parsed.error) return locale.ui.invalidExpr

  const segments = parsed.segments
  if (segments.size === 0) return ''

  const parts: string[] = []

  const minute = segments.get('minute')
  const hour = segments.get('hour')
  const dayOfMonth = segments.get('dayOfMonth')
  const month = segments.get('month')
  const dayOfWeek = segments.get('dayOfWeek')
  const second = segments.get('second')

  const allAny = (s: Segment | undefined) => !s || s.type === 'any'

  if (allAny(minute) && allAny(hour) && allAny(dayOfMonth) && allAny(month) && allAny(dayOfWeek)) {
    if (second && second.type !== 'any') {
      parts.push(describeSegment(second, 'second', locale))
    } else {
      parts.push(`${locale.ui.every} ${locale.periods.minute}`)
    }
    return parts.join(' ')
  }

  if (
    minute &&
    minute.type === 'step' &&
    allAny(hour) &&
    allAny(dayOfMonth) &&
    allAny(month) &&
    allAny(dayOfWeek)
  ) {
    parts.push(describeSegment(minute, 'minute', locale))
    return parts.join(' ')
  }

  if (hour && hour.type !== 'any' && minute && minute.type !== 'any') {
    const hourLabel =
      hour.type === 'value'
        ? getFieldValueLabel('hour', hour.value, locale)
        : describeSegment(hour, 'hour', locale)
    const minuteLabel =
      minute.type === 'value'
        ? getFieldValueLabel('minute', minute.value, locale)
        : describeSegment(minute, 'minute', locale)

    if (hour.type === 'value' && minute.type === 'value') {
      parts.push(`${locale.ui.at} ${hourLabel}:${minuteLabel}`)
    } else {
      parts.push(`${locale.ui.at} ${hourLabel}:${minuteLabel}`)
    }
  } else if (hour && hour.type !== 'any') {
    parts.push(
      `${locale.ui.at} ${locale.fieldLabels.hour} ${describeSegment(hour, 'hour', locale)}`,
    )
  } else if (minute && minute.type !== 'any') {
    parts.push(describeSegment(minute, 'minute', locale))
  }

  if (dayOfWeek && dayOfWeek.type !== 'any' && dayOfWeek.type !== 'noSpecific') {
    parts.push(`${locale.ui.on} ${describeSegment(dayOfWeek, 'dayOfWeek', locale)}`)
  }

  if (dayOfMonth && dayOfMonth.type !== 'any' && dayOfMonth.type !== 'noSpecific') {
    parts.push(
      `${locale.ui.on} ${locale.fieldLabels.dayOfMonth} ${describeSegment(dayOfMonth, 'dayOfMonth', locale)}`,
    )
  }

  if (month && month.type !== 'any') {
    parts.push(`${locale.ui.of} ${describeSegment(month, 'month', locale)}`)
  }

  const year = segments.get('year')
  if (year && year.type !== 'any') {
    parts.push(`${locale.fieldLabels.year} ${describeSegment(year, 'year', locale)}`)
  }

  if (second && second.type !== 'any') {
    parts.unshift(
      `${locale.ui.at} ${locale.fieldLabels.second} ${describeSegment(second, 'second', locale)}`,
    )
  }

  return parts.join(', ')
}
