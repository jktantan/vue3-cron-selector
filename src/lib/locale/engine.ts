import type { ParsedCron, Segment } from '../core/types'
import type { LocaleDefinition, PluralForms } from './types'
import { EN_US_LOCALE } from './en-US'
import { ZH_CN_LOCALE } from './zh-CN'
import { renderLocaleTemplate } from './template'

const BUILT_IN_LOCALES: ReadonlyMap<string, LocaleDefinition> = new Map([
  ['en-us', EN_US_LOCALE],
  ['zh-cn', ZH_CN_LOCALE],
])

// A bare language tag resolves to the package's default regional variant, so
// `locale="zh"` and `locale="zh-CN"` behave the same and match the codes UI
// frameworks pass around.
const BASE_LANGUAGE_ALIASES: ReadonlyMap<string, string> = new Map([
  ['en', 'en-us'],
  ['zh', 'zh-cn'],
])

function canonicalizeTag(tag: string): string {
  try {
    return Intl.getCanonicalLocales(tag)[0] ?? tag
  } catch {
    return tag
  }
}

/**
 * Resolve a BCP 47 tag to a built-in locale.
 *
 * Matching is: exact regional tag, then base language, then English. `en` and
 * `zh` are aliases for the built-in `en-US` and `zh-CN` packs. When a regional
 * tag such as `zh-TW` or `en-GB` has no pack of its own, the returned locale
 * keeps the canonicalised tag in `code` so `Intl.DateTimeFormat` and
 * `Intl.PluralRules` still format for that region; only the copy falls back
 * to the closest built-in variant.
 */
export function resolveLocale(code: string): LocaleDefinition {
  const tag = canonicalizeTag(code.trim())
  if (!tag) return EN_US_LOCALE

  const lower = tag.toLowerCase()
  const exact = BUILT_IN_LOCALES.get(lower)
  if (exact) return exact

  const language = lower.split('-')[0]
  const alias = BASE_LANGUAGE_ALIASES.get(language)
  if (!alias) return EN_US_LOCALE

  const base = BUILT_IN_LOCALES.get(alias)!
  if (lower === language) return base
  return { ...base, code: tag }
}

const pluralRulesCache = new Map<string, Intl.PluralRules>()

function getPluralRules(code: string): Intl.PluralRules {
  let rules = pluralRulesCache.get(code)
  if (!rules) {
    try {
      rules = new Intl.PluralRules(code)
    } catch {
      // A custom locale may carry an invalid tag; English rules are a safe
      // fallback and keep rendering alive.
      rules = new Intl.PluralRules('en')
    }
    pluralRulesCache.set(code, rules)
  }
  return rules
}

/** Pick the word form for `count` using the locale's BCP 47 plural rules. */
export function selectPluralForm(forms: PluralForms, count: number, code: string): string {
  const category = getPluralRules(code).select(count)
  return forms[category] ?? forms.other
}

/** Unit word for a field and count, e.g. `5` → "minutes" / "分钟". */
export function pluralUnit(fieldId: string, count: number, locale: LocaleDefinition): string {
  const forms = locale.units[fieldId] ?? locale.units.dayOfMonth
  if (!forms) return locale.fields.labels[fieldId] ?? fieldId
  return selectPluralForm(forms, count, locale.code)
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

function fieldLabel(locale: LocaleDefinition, fieldId: string): string {
  return locale.fields.labels[fieldId] ?? fieldId
}

function render(template: string, values: Readonly<Record<string, string>>): string {
  return renderLocaleTemplate(template, values)
}

function describeSegment(segment: Segment, fieldId: string, locale: LocaleDefinition): string {
  const templates = locale.templates.description

  switch (segment.type) {
    case 'any':
      return render(templates.everyField, { field: fieldLabel(locale, fieldId) })
    case 'value':
      return getFieldValueLabel(fieldId, segment.value, locale)
    case 'range':
      return render(templates.range, {
        from: getFieldValueLabel(fieldId, segment.from, locale),
        to: getFieldValueLabel(fieldId, segment.to, locale),
      })
    case 'step': {
      const unit = pluralUnit(fieldId, segment.step, locale)
      if (segment.base === '*') {
        return render(templates.step, { step: String(segment.step), unit })
      }
      return render(templates.stepWithBase, {
        step: String(segment.step),
        unit,
        base: getFieldValueLabel(fieldId, segment.base, locale),
      })
    }
    case 'combined': {
      const parts = segment.parts.map((part) => describeSegment(part, fieldId, locale))
      if (parts.length <= 1) return parts[0] ?? ''
      return render(templates.list, {
        head: parts.slice(0, -1).join(templates.listSeparator),
        last: parts[parts.length - 1],
      })
    }
    case 'noSpecific':
      return locale.segmentTypes.noSpecific
    case 'lastDay':
      if (segment.offset === 0) return locale.templates.day.lastDayOfMonth
      return render(locale.templates.day.daysBeforeEndOfMonth, {
        n: String(segment.offset),
        unit: pluralUnit('dayOfMonth', segment.offset, locale),
      })
    case 'lastBusinessDay':
      return locale.templates.day.lastBusinessDayOfMonth
    case 'nearestWeekday':
      return render(locale.templates.day.nearestWeekdayTo, { day: String(segment.day) })
    case 'lastWeekdayOfMonth':
      return render(locale.templates.day.lastWeekdayOfMonth, {
        weekday: locale.weekdays[segment.weekday] ?? String(segment.weekday),
      })
    case 'nthWeekday':
      return render(locale.templates.day.nthWeekdayOfMonth, {
        nth: locale.ordinals[segment.nth - 1] ?? String(segment.nth),
        weekday: locale.weekdays[segment.weekday] ?? String(segment.weekday),
      })
  }
}

export function generateDescription(parsed: ParsedCron, locale: LocaleDefinition): string {
  if (parsed.error) return locale.ui.invalidExpr

  const segments = parsed.segments
  if (segments.size === 0) return ''

  const templates = locale.templates.description
  const parts: string[] = []

  const minute = segments.get('minute')
  const hour = segments.get('hour')
  const dayOfMonth = segments.get('dayOfMonth')
  const month = segments.get('month')
  const dayOfWeek = segments.get('dayOfWeek')
  const second = segments.get('second')

  const allAny = (segment: Segment | undefined) => !segment || segment.type === 'any'

  if (allAny(minute) && allAny(hour) && allAny(dayOfMonth) && allAny(month) && allAny(dayOfWeek)) {
    if (second && second.type !== 'any') {
      parts.push(describeSegment(second, 'second', locale))
    } else {
      parts.push(render(templates.everyPeriod, { period: locale.periods.minute }))
    }
    return parts.join(templates.clauseSeparator)
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
    return parts.join(templates.clauseSeparator)
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
      parts.push(render(templates.atTime, { hour: hourLabel, minute: minuteLabel }))
    } else {
      parts.push(render(templates.atHourMinute, { hour: hourLabel, minute: minuteLabel }))
    }
  } else if (hour && hour.type !== 'any') {
    parts.push(describeSegment(hour, 'hour', locale))
  } else if (minute && minute.type !== 'any') {
    parts.push(describeSegment(minute, 'minute', locale))
  }

  if (dayOfWeek && dayOfWeek.type !== 'any' && dayOfWeek.type !== 'noSpecific') {
    // The Quartz weekday modifiers already render a complete clause
    // ("On the last Friday of the month"); only plain value/range/combined
    // segments need the "on …" wrapper.
    const isWeekdayValue =
      dayOfWeek.type === 'value' || dayOfWeek.type === 'range' || dayOfWeek.type === 'combined'
    parts.push(
      isWeekdayValue
        ? render(templates.on, { value: describeSegment(dayOfWeek, 'dayOfWeek', locale) })
        : describeSegment(dayOfWeek, 'dayOfWeek', locale),
    )
  }

  if (dayOfMonth && dayOfMonth.type !== 'any' && dayOfMonth.type !== 'noSpecific') {
    // Value/range/combined describe a day number, so they fit the
    // "on day … of the month" template. Step and the Quartz day modifiers
    // already produce a complete clause ("Every 5 days",
    // "On the last business day of the month"), so wrapping them would
    // duplicate the month wording.
    const isDayNumber =
      dayOfMonth.type === 'value' || dayOfMonth.type === 'range' || dayOfMonth.type === 'combined'
    parts.push(
      isDayNumber
        ? render(templates.onDayOfMonth, {
            value: describeSegment(dayOfMonth, 'dayOfMonth', locale),
          })
        : describeSegment(dayOfMonth, 'dayOfMonth', locale),
    )
  }

  if (month && month.type !== 'any') {
    parts.push(render(templates.inMonth, { value: describeSegment(month, 'month', locale) }))
  }

  const year = segments.get('year')
  if (year && year.type !== 'any') {
    parts.push(render(templates.year, { value: describeSegment(year, 'year', locale) }))
  }

  if (second && second.type !== 'any') {
    parts.unshift(
      render(templates.atField, {
        field: fieldLabel(locale, 'second'),
        value: describeSegment(second, 'second', locale),
      }),
    )
  }

  return parts.join(templates.clauseSeparator)
}
