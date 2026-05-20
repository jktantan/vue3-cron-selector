export type CronFormat = 'crontab' | 'quartz' | 'spring'

export type DisplayMode = 'inline' | 'popover'

export type SegmentType =
  | 'any'
  | 'value'
  | 'range'
  | 'step'
  | 'combined'
  | 'noSpecific'
  | 'lastDay'
  | 'lastWeekday'
  | 'nearestWeekday'
  | 'lastWeekdayOfMonth'
  | 'nthWeekday'

export interface BaseSegment {
  readonly type: SegmentType
  readonly values: ReadonlyArray<number>
  toString(): string
}

export interface AnySegment extends BaseSegment {
  readonly type: 'any'
}

export interface ValueSegment extends BaseSegment {
  readonly type: 'value'
  readonly value: number
}

export interface RangeSegment extends BaseSegment {
  readonly type: 'range'
  readonly from: number
  readonly to: number
}

export interface StepSegment extends BaseSegment {
  readonly type: 'step'
  readonly base: number | '*'
  readonly step: number
  readonly rangeEnd?: number
}

export interface CombinedSegment extends BaseSegment {
  readonly type: 'combined'
  readonly parts: ReadonlyArray<Segment>
}

export interface NoSpecificSegment extends BaseSegment {
  readonly type: 'noSpecific'
}

export interface LastDaySegment extends BaseSegment {
  readonly type: 'lastDay'
  readonly offset: number
}

export interface LastWeekdaySegment extends BaseSegment {
  readonly type: 'lastWeekday'
}

export interface NearestWeekdaySegment extends BaseSegment {
  readonly type: 'nearestWeekday'
  readonly day: number
}

export interface LastWeekdayOfMonthSegment extends BaseSegment {
  readonly type: 'lastWeekdayOfMonth'
  readonly weekday: number
}

export interface NthWeekdaySegment extends BaseSegment {
  readonly type: 'nthWeekday'
  readonly weekday: number
  readonly nth: number
}

export type Segment =
  | AnySegment
  | ValueSegment
  | RangeSegment
  | StepSegment
  | CombinedSegment
  | NoSpecificSegment
  | LastDaySegment
  | LastWeekdaySegment
  | NearestWeekdaySegment
  | LastWeekdayOfMonthSegment
  | NthWeekdaySegment

export interface FieldItem {
  readonly value: number
  readonly label: string
}

export interface FieldDefinition {
  readonly id: string
  readonly min: number
  readonly max: number
  readonly label: string
  readonly altValues?: ReadonlyMap<string, number>
}

export type PeriodId = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export interface Period {
  readonly id: PeriodId
  readonly label: string
}

export interface FormatConfig {
  readonly format: CronFormat
  readonly fieldOrder: ReadonlyArray<string>
  readonly fields: ReadonlyMap<string, FieldDefinition>
  readonly defaultExpression: string
}

export interface ParsedCron {
  readonly format: CronFormat
  readonly segments: ReadonlyMap<string, Segment>
  readonly raw: string
  readonly error: string | null
}
