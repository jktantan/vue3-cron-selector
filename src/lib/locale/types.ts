import type { SegmentType, PeriodId } from '../core/types'

/**
 * Word forms for a countable unit. The form is chosen with
 * `Intl.PluralRules` for the locale's BCP 47 code, so languages that need
 * more than a binary singular/plural split can supply `few`, `many`, etc.
 * `other` is the only required form and is the fallback.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  readonly other: string
}

/** Labels for the four segment kinds offered for a non-day field. */
export interface FieldOptionLabels {
  readonly everyOne: string
  readonly step: string
  readonly specific: string
  readonly range: string
}

/**
 * Sentence templates. Every `{token}` is owned by the template, so a locale
 * decides word order, spacing and punctuation instead of the components
 * concatenating translated fragments.
 */
export interface LocaleTemplates {
  /** Step row of a field: `{step}` and `{base}` are controls, `{unit}` text. */
  readonly step: string
  /** Range row of a field: `{from}` and `{to}` are controls, `{unit}` text. */
  readonly range: string

  /** Copy for the merged day tab. */
  readonly day: {
    readonly everyDay: string
    /** `{step}` and `{base}` are controls, `{unit}` text. */
    readonly everyNStartingAt: string
    readonly specificDayOfWeek: string
    readonly specificDayOfMonth: string
    readonly lastDayOfMonth: string
    /** Quartz `LW` — the last business day of the month. */
    readonly lastBusinessDayOfMonth: string
    /** Quartz `nL` — the last given weekday of the month. `{weekday}` is text. */
    readonly lastWeekdayOfMonth: string
    /** Quartz `L-n`. `{n}` is a control, `{unit}` text. */
    readonly daysBeforeEndOfMonth: string
    /** Quartz `nW`. `{day}` is a control. */
    readonly nearestWeekdayTo: string
    /** Quartz `n#d`. `{nth}` and `{weekday}` are text. */
    readonly nthWeekdayOfMonth: string
  }

  /** Clauses used by `generateDescription`. */
  readonly description: {
    /** `{period}` is a singular period name, e.g. "minute". */
    readonly everyPeriod: string
    /** `{field}` is a field label, e.g. "Hour". */
    readonly everyField: string
    /** `{step}` is a number, `{unit}` a pluralised unit. */
    readonly step: string
    /** `{step}`, `{unit}`, `{base}`. */
    readonly stepWithBase: string
    /** `{from}` and `{to}` are already-formatted value labels. */
    readonly range: string
    /** `{hour}` and `{minute}` are already-formatted value labels. */
    readonly atTime: string
    /** `{hour}` and `{minute}` are descriptive segments. */
    readonly atHourMinute: string
    /** `{field}` is a field label, `{value}` a descriptive segment. */
    readonly atField: string
    /** `{value}` is a descriptive segment. */
    readonly on: string
    /** `{value}` is a day-of-month value. */
    readonly onDayOfMonth: string
    /** `{value}` is a month label. */
    readonly inMonth: string
    /** `{value}` is a year. */
    readonly year: string
    /** `{head}` and `{last}` build a two-or-more item list. */
    readonly list: string
    /** Joins top-level clauses. */
    readonly clauseSeparator: string
    /** Joins items inside one clause. */
    readonly listSeparator: string
  }
}

export interface LocaleDefinition {
  /**
   * BCP 47 language tag. Used for `Intl.DateTimeFormat` and
   * `Intl.PluralRules`; a requested regional code such as `zh-TW` is kept
   * here even when the text falls back to the base language.
   */
  readonly code: string
  /** Endonym, e.g. "English" or "中文". */
  readonly name: string

  /** Field labels. `labels` are long names, `tabs` the short tab names. */
  readonly fields: {
    readonly labels: Readonly<Record<string, string>>
    readonly tabs: Readonly<Record<string, string>>
  }

  /** Short labels for segment kinds, used by option rows and descriptions. */
  readonly segmentTypes: Readonly<Record<SegmentType, string>>
  /** Singular period names used by "every period" descriptions. */
  readonly periods: Readonly<Record<PeriodId, string>>
  /** Countable unit forms, keyed by field id. */
  readonly units: Readonly<Record<string, PluralForms>>
  /** Ordinal words, index 0 = first. */
  readonly ordinals: ReadonlyArray<string>

  readonly months: ReadonlyArray<string>
  readonly weekdays: ReadonlyArray<string>
  readonly weekdaysShort: ReadonlyArray<string>

  /** Chrome copy that is not part of a sentence template. */
  readonly ui: {
    readonly expand: string
    readonly collapse: string
    readonly nextRuns: string
    readonly invalidExpr: string
    readonly cronExpression: string
    readonly placeholder: string
    readonly selectPlaceholder: string
    readonly fieldOptions: Readonly<Record<string, FieldOptionLabels>>
  }

  readonly templates: LocaleTemplates
}
