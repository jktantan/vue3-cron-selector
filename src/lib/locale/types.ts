import type { SegmentType, PeriodId } from '../core/types'

export interface LocaleDefinition {
  readonly code: string
  readonly name: string
  readonly fieldLabels: Readonly<Record<string, string>>
  readonly tabLabels?: Readonly<Record<string, string>>
  readonly segmentTypes: Readonly<Record<SegmentType, string>>
  readonly periods: Readonly<Record<PeriodId, string>>
  readonly months: ReadonlyArray<string>
  readonly weekdays: ReadonlyArray<string>
  readonly weekdaysShort: ReadonlyArray<string>
  readonly ui: {
    readonly expand: string
    readonly collapse: string
    readonly nextRuns: string
    readonly invalidExpr: string
    readonly every: string
    readonly at: string
    readonly on: string
    readonly of: string
    readonly and: string
    readonly through: string
    readonly startingAt: string
    readonly from: string
    readonly to: string
    readonly cronExpression: string
    readonly placeholder: string
    readonly everyDay: string
    readonly everyNDaysStartingAt: string
    readonly specificDayOfWeek: string
    readonly specificDayOfMonth: string
    readonly lastDayOfMonth: string
    readonly lastWeekdayOfMonth: string
    readonly lastSpecificWeekdayOfMonth: string
    readonly daysBeforeEndOfMonth: string
    readonly nearestWeekdayTo: string
    readonly nthWeekdayOfMonth: string
    readonly day: string
    readonly days: string
    readonly the: string
    readonly ordinals: ReadonlyArray<string>
    readonly fieldOptions: Readonly<
      Record<
        string,
        {
          readonly everyOne: string
          readonly step: string
          readonly specific: string
          readonly range: string
        }
      >
    >
    readonly selectPlaceholder: string
  }
}
