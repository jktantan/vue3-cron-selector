# 类型定义

所有类型都随包发布，可直接导入：

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

## 组件类型

```ts
type CronFormat = 'crontab' | 'quartz' | 'spring'
type DisplayMode = 'inline' | 'popover'
```

## 段（Segment）

段是单个 Cron 字段的结构化形式。`segment.values` 始终保存展开后的数值 —— 网格渲染的
正是它。

```ts
type SegmentType =
  | 'any'                 // *
  | 'value'               // 5
  | 'range'               // 1-5
  | 'step'                // */5、0/15、1-30/5
  | 'combined'            // 1,3,5-10
  | 'noSpecific'          // ?（Quartz 的日 / 星期字段）
  | 'lastDay'             // L、L-n（Quartz）
  | 'lastWeekday'         // LW（Quartz）
  | 'nearestWeekday'      // 15W（Quartz）
  | 'lastWeekdayOfMonth'  // 某星期的 L-3（Quartz）
  | 'nthWeekday'          // 第 3 个周五（Quartz）

interface BaseSegment {
  readonly type: SegmentType
  readonly values: ReadonlyArray<number>
  toString(): string
}
```

每种段类型都会在 `BaseSegment` 上收窄出各自的字段：

| 类型 | 额外字段 |
|------|----------|
| `AnySegment` | — |
| `ValueSegment` | `value: number` |
| `RangeSegment` | `from: number`、`to: number` |
| `StepSegment` | `base: number \| '*'`、`step: number`、`rangeEnd?: number` |
| `CombinedSegment` | `parts: ReadonlyArray<Segment>` |
| `NoSpecificSegment` | — |
| `LastDaySegment` | `offset: number` |
| `LastWeekdaySegment` | — |
| `NearestWeekdaySegment` | `day: number` |
| `LastWeekdayOfMonthSegment` | `weekday: number` |
| `NthWeekdaySegment` | `weekday: number`、`nth: number` |

`Segment` 是以上所有类型的联合。

## 字段与格式

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
  readonly altValues?: ReadonlyMap<string, number>  // 例如 JAN -> 1、MON -> 1
}

type PeriodId = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

interface FormatConfig {
  readonly format: CronFormat
  readonly fieldOrder: ReadonlyArray<string>
  readonly fields: ReadonlyMap<string, FieldDefinition>
  readonly defaultExpression: string
}
```

## 解析结果

```ts
interface ParsedCron {
  readonly format: CronFormat
  readonly segments: ReadonlyMap<string, Segment>
  readonly raw: string
  readonly error: string | null
}
```

`parseCronExpression` 成功与失败都返回这一结构：判断 `error` 即可，不必 try/catch。
失败时 `segments` 为空映射。

## 组合式函数类型

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

`UseCronReturn` 与 `UseCronSegmentReturn` 描述两个组合式函数返回的对象成员，完整列表见
[组合式函数](/zh/guide/composables)。

## TypeScript 配置

本包使用 TypeScript 编写，声明文件由源码生成，因此在
`moduleResolution: "bundler"`、`"node16"` 与 `"nodenext"` 模式下开箱即可解析类型，无需
任何 `@types` 包。
