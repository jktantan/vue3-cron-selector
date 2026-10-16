# Type Definitions

All types ship with the package and can be imported directly:

```ts
import type {
  CronFormat,
  DisplayMode,
  Segment,
  SegmentType,
  FieldDefinition,
  ParsedCron,
  PeriodId,
  FormatConfig,
  FieldItem,
  LocaleDefinition,
  UseCronOptions,
  UseCronReturn,
  UseCronSegmentOptions,
  UseCronSegmentReturn,
} from 'vue3-cron-selector'
```

## Component types

```ts
type CronFormat = 'crontab' | 'quartz' | 'spring'
type DisplayMode = 'inline' | 'popover'
```

## Segments

A segment is the structured form of one cron field. `segment.values` always holds
the expanded numeric values, which is what the grid renders.

```ts
type SegmentType =
  | 'any'                 // *
  | 'value'               // 5
  | 'range'               // 1-5
  | 'step'                // */5, 0/15, 1-30/5
  | 'combined'            // 1,3,5-10
  | 'noSpecific'          // ? (Quartz day-of-month / day-of-week)
  | 'lastDay'             // L, L-n (Quartz)
  | 'lastWeekday'         // LW (Quartz)
  | 'nearestWeekday'      // 15W (Quartz)
  | 'lastWeekdayOfMonth'  // L-3 for a weekday (Quartz)
  | 'nthWeekday'          // 3rd FRI (Quartz)

interface BaseSegment {
  readonly type: SegmentType
  readonly values: ReadonlyArray<number>
  toString(): string
}
```

Each segment kind narrows `BaseSegment` with its own fields:

| Type | Extra fields |
|------|--------------|
| `AnySegment` | — |
| `ValueSegment` | `value: number` |
| `RangeSegment` | `from: number`, `to: number` |
| `StepSegment` | `base: number \| '*'`, `step: number`, `rangeEnd?: number` |
| `CombinedSegment` | `parts: ReadonlyArray<Segment>` |
| `NoSpecificSegment` | — |
| `LastDaySegment` | `offset: number` |
| `LastWeekdaySegment` | — |
| `NearestWeekdaySegment` | `day: number` |
| `LastWeekdayOfMonthSegment` | `weekday: number` |
| `NthWeekdaySegment` | `weekday: number`, `nth: number` |

`Segment` is the union of all of them.

## Fields and formats

```ts
interface FieldItem {
  readonly value: number
  readonly label: string
}

interface FieldDefinition {
  readonly id: string
  readonly min: number
  readonly max: number
  readonly label: string
  readonly altValues?: ReadonlyMap<string, number>  // e.g. JAN -> 1, MON -> 1
}

type PeriodId = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

interface FormatConfig {
  readonly format: CronFormat
  readonly fieldOrder: ReadonlyArray<string>
  readonly fields: ReadonlyMap<string, FieldDefinition>
  readonly defaultExpression: string
}
```

## Parsed expression

```ts
interface ParsedCron {
  readonly format: CronFormat
  readonly segments: ReadonlyMap<string, Segment>
  readonly raw: string
  readonly error: string | null
}
```

`parseCronExpression` returns this shape for both success and failure: check `error`
instead of catching. On failure `segments` is an empty map.

## Composable types

```ts
interface UseCronOptions {
  modelValue?: Ref<string> | string
  format?: Ref<CronFormat> | CronFormat
  locale?: Ref<string | LocaleDefinition> | string | LocaleDefinition
  previewCount?: Ref<number> | number
}

interface UseCronSegmentOptions {
  field: FieldDefinition
  initialCron?: string
}
```

`UseCronReturn` and `UseCronSegmentReturn` describe the objects returned by the two
composables; see [Composables](/guide/composables) for the full member list.

## TypeScript configuration

The package is written in TypeScript and its declarations are generated from source,
so `types` resolution works out of the box in `moduleResolution: "bundler"`,
`"node16"` and `"nodenext"` modes. No `@types` package is needed.
