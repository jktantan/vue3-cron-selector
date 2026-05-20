# vue3-cron-selector

**English** | [中文](#vue3-cron-selector-中文文档)

A visual cron expression selector component for Vue 3. Supports 5-field crontab, 6-field Quartz, and Spring cron formats. Zero external UI dependencies — ships its own CSS and works in any Vue 3 project.

## Features

- Two display modes: always-visible inline panel and input-triggered popover
- Supports `crontab` (5-field), `quartz` (7-field with year), and `spring` (6-field) formats
- Built-in English and Chinese locales, extensible with custom locale definitions
- Next execution time preview powered by [croner](https://github.com/hexagon/croner)
- Fully typed with TypeScript declarations
- Themeable via CSS custom properties
- Keyboard-accessible tabs, dropdowns, and grid selection (with Shift+Click range select)
- Smart popover positioning: auto flip-up/down and horizontal shift to stay within viewport
- Headless composables (`useCron`, `useCronSegment`) for building custom UIs

## Installation

```bash
npm install vue3-cron-selector
# or
pnpm add vue3-cron-selector
# or
yarn add vue3-cron-selector
```

**Peer dependency:** `vue >= 3.3.0`

## Quick Start

```vue
<template>
  <CronSelector v-model="cron" />
</template>

<script setup>
import { ref } from 'vue'
import { CronSelector } from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const cron = ref('* * * * *')
</script>
```

### Global Registration

```ts
import { createApp } from 'vue'
import Vue3CronSelector from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const app = createApp(App)
app.use(Vue3CronSelector)
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | Cron expression, use with `v-model` |
| `format` | `'crontab' \| 'quartz' \| 'spring'` | `'crontab'` | Cron dialect |
| `locale` | `string \| LocaleDefinition` | `'en'` | Locale code (`'en'`, `'zh'`) or custom locale object |
| `disabled` | `boolean` | `false` | Disable all interaction |
| `mode` | `'inline' \| 'popover'` | `'inline'` | Display as always-visible panel or input-triggered popover |
| `previewCount` | `number` | `5` | Number of upcoming execution dates to show |
| `cols` | `Partial<Record<string, number>>` | — | Override grid column count per field |

### Default Column Counts

| Field | Default Columns |
|-------|----------------|
| `second` | 10 |
| `minute` | 10 |
| `hour` | 6 |
| `dayOfMonth` | 7 |
| `month` | 4 |
| `dayOfWeek` | 7 |
| `year` | 10 |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Expression changed (enables `v-model`) |
| `change` | `string` | Expression changed (alias for side effects) |
| `error` | `string \| null` | Validity changed; `null` means valid |

## Formats

### crontab (5-field)

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6)
* * * * *
```

### quartz (7-field)

```
┌───────────── second (0-59)
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of month (1-31)
│ │ │ │ ┌───────────── month (1-12)
│ │ │ │ │ ┌───────────── day of week (0-6)
│ │ │ │ │ │ ┌───────────── year (1970-2099)
0 * * * * ? *
```

### spring (6-field)

```
┌───────────── second (0-59)
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of month (1-31)
│ │ │ │ ┌───────────── month (1-12)
│ │ │ │ │ ┌───────────── day of week (0-6)
0 * * * * *
```

### Field Ranges

| Field | Min | Max |
|-------|-----|-----|
| second | 0 | 59 |
| minute | 0 | 59 |
| hour | 0 | 23 |
| dayOfMonth | 1 | 31 |
| month | 1 | 12 |
| dayOfWeek | 0 | 6 |
| year | 1970 | 2099 |

## Usage Examples

### Inline Mode (Default)

```vue
<CronSelector v-model="cron" format="crontab" />
```

### Quartz Format

```vue
<CronSelector v-model="cron" format="quartz" />
```

### Popover Mode

```vue
<CronSelector v-model="cron" format="crontab" mode="popover" />
```

### Chinese Locale

```vue
<CronSelector v-model="cron" locale="zh" />
```

### Custom Grid Columns

```vue
<CronSelector v-model="cron" :cols="{ minute: 6, hour: 4 }" />
```

### Error Handling

```vue
<CronSelector
  v-model="cron"
  @error="(err) => console.log(err)"
  @change="(val) => console.log('Changed:', val)"
/>
```

## Composables

### `useCron`

High-level composable for managing a full cron expression programmatically.

```ts
import { useCron } from 'vue3-cron-selector'

const {
  cronString,       // Ref<string> — current expression (writable)
  segments,         // ComputedRef<ReadonlyMap<string, UseCronSegmentReturn>>
  formatConfig,     // ComputedRef<FormatConfig>
  description,      // ComputedRef<string> — human-readable description
  nextExecutions,   // ComputedRef<ReadonlyArray<Date>> — upcoming run dates
  isValid,          // ComputedRef<boolean>
  error,            // ComputedRef<string | null>
  setCronString,    // (value: string) => void
  reset,            // () => void — resets to format default
} = useCron({
  modelValue: '*/5 * * * *',  // string or Ref<string>
  format: 'crontab',          // CronFormat or Ref<CronFormat>
  locale: 'en',               // string, LocaleDefinition, or Ref
})
```

### `useCronSegment`

Low-level composable for managing a single cron field.

```ts
import { useCronSegment } from 'vue3-cron-selector'

const {
  fieldId,        // string
  field,          // FieldDefinition
  segment,        // Ref<Segment>
  selected,       // Ref<ReadonlyArray<number>> — expanded numeric values
  cronString,     // Ref<string> — serialized field string
  setSelected,    // (values: ReadonlyArray<number>) => void
  setType,        // (type: SegmentType) => void
  setRange,       // (from: number, to: number) => void
  setStep,        // (base: number | '*', step: number) => void
  setCron,        // (cron: string) => void
  reset,          // () => void — reset to '*'
} = useCronSegment({
  field: { id: 'minute', min: 0, max: 59, label: 'Minute' },
  initialCron: '*/5',
})
```

## Locale / i18n

Built-in locales: `'en'` (English), `'zh'` (中文).

```vue
<CronSelector v-model="cron" locale="zh" />
```

### Custom Locale

Pass a full `LocaleDefinition` object:

```ts
import type { LocaleDefinition } from 'vue3-cron-selector'

const jaLocale: LocaleDefinition = {
  code: 'ja',
  name: '日本語',
  fieldLabels: {
    second: '秒', minute: '分', hour: '時',
    dayOfMonth: '日', month: '月', dayOfWeek: '曜日', year: '年',
  },
  months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
  weekdaysShort: ['日','月','火','水','木','金','土'],
  segmentTypes: { /* ... */ },
  periods: { /* ... */ },
  ui: { /* ... */ },
}
```

```vue
<CronSelector v-model="cron" :locale="jaLocale" />
```

### `LocaleDefinition` Interface

```ts
interface LocaleDefinition {
  code: string                    // BCP 47 code (used by Intl.DateTimeFormat)
  name: string
  fieldLabels: Record<string, string>
  tabLabels?: Record<string, string>
  segmentTypes: Record<SegmentType, string>
  periods: Record<PeriodId, string>
  months: string[]                // 12 items, index 0 = January
  weekdays: string[]              // 7 items, index 0 = Sunday
  weekdaysShort: string[]
  ui: {
    expand: string
    collapse: string
    nextRuns: string
    invalidExpr: string
    every: string
    at: string
    on: string
    of: string
    and: string
    through: string
    startingAt: string
    from: string
    to: string
    cronExpression: string
    placeholder: string
    everyDay: string
    everyNDaysStartingAt: string   // template: '{step}' and '{start}'
    specificDayOfWeek: string
    specificDayOfMonth: string
    lastDayOfMonth: string
    lastWeekdayOfMonth: string
    lastSpecificWeekdayOfMonth: string  // template: '{weekday}'
    daysBeforeEndOfMonth: string        // template: '{n}'
    nearestWeekdayTo: string            // template: '{day}'
    nthWeekdayOfMonth: string           // template: '{nth}' and '{weekday}'
    day: string
    days: string
    the: string
    ordinals: string[]            // ['1st','2nd','3rd','4th','5th']
    fieldOptions: Record<string, {
      everyOne: string
      step: string
      specific: string
      range: string
    }>
    selectPlaceholder: string
  }
}
```

## Utility Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseCronExpression` | `(expression, format) => ParsedCron` | Parse a full cron expression |
| `parseCronField` | `(fieldStr, field) => Segment` | Parse a single field string |
| `selectedToSegment` | `(values, field) => Segment` | Convert selected values to optimal segment |
| `segmentsToString` | `(segments, format) => string` | Serialize segments to expression |
| `getFormatConfig` | `(format) => FormatConfig` | Get field definitions for a format |
| `generateDescription` | `(parsed, locale) => string` | Generate human-readable description |
| `resolveLocale` | `(code) => LocaleDefinition` | Resolve locale code to definition |
| `getFieldValueLabel` | `(fieldId, value, locale) => string` | Get display label for a field value |

## Theming

All visual properties are controlled via CSS custom properties. Override them in your stylesheet:

```css
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}
```

### Color Variables

| Variable | Default |
|----------|---------|
| `--cron-color-primary` | `#4f46e5` |
| `--cron-color-primary-hover` | `#4338ca` |
| `--cron-color-primary-light` | `#eef2ff` |
| `--cron-color-text` | `#1f2937` |
| `--cron-color-text-secondary` | `#6b7280` |
| `--cron-color-border` | `#d1d5db` |
| `--cron-color-border-focus` | `#4f46e5` |
| `--cron-color-bg` | `#ffffff` |
| `--cron-color-bg-hover` | `#f9fafb` |
| `--cron-color-bg-selected` | `#eef2ff` |
| `--cron-color-error` | `#dc2626` |
| `--cron-color-error-light` | `#fef2f2` |

### Typography Variables

| Variable | Default |
|----------|---------|
| `--cron-font-family` | `system-ui, -apple-system, sans-serif` |
| `--cron-font-size-sm` | `0.75rem` |
| `--cron-font-size-base` | `0.875rem` |
| `--cron-font-size-lg` | `1rem` |
| `--cron-line-height` | `1.5` |

### Spacing Variables

| Variable | Default |
|----------|---------|
| `--cron-spacing-xs` | `0.25rem` |
| `--cron-spacing-sm` | `0.5rem` |
| `--cron-spacing-md` | `0.75rem` |
| `--cron-spacing-lg` | `1rem` |
| `--cron-spacing-xl` | `1.5rem` |

### Shape Variables

| Variable | Default |
|----------|---------|
| `--cron-border-radius` | `0.375rem` |
| `--cron-border-radius-lg` | `0.5rem` |
| `--cron-border-width` | `1px` |

### Motion Variables

| Variable | Default |
|----------|---------|
| `--cron-transition-duration` | `150ms` |
| `--cron-transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |

### Layout Variables

| Variable | Default |
|----------|---------|
| `--cron-panel-max-height` | `500px` |
| `--cron-popover-max-width` | `680px` |
| `--cron-popover-z-index` | `1000` |
| `--cron-body-min-height` | `280px` |
| `--cron-tab-height` | `2.5rem` |
| `--cron-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--cron-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...` |
| `--cron-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` |

### Dark Theme Example

```css
.dark {
  --cron-color-primary: #818cf8;
  --cron-color-primary-hover: #6366f1;
  --cron-color-primary-light: rgba(99, 102, 241, 0.15);
  --cron-color-text: #f3f4f6;
  --cron-color-text-secondary: #9ca3af;
  --cron-color-border: #374151;
  --cron-color-border-focus: #818cf8;
  --cron-color-bg: #1f2937;
  --cron-color-bg-hover: #111827;
  --cron-color-bg-selected: rgba(99, 102, 241, 0.15);
  --cron-color-error: #f87171;
  --cron-color-error-light: rgba(248, 113, 113, 0.1);
  --cron-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --cron-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --cron-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
}
```

## CSS Class Names (BEM)

All class names follow BEM convention for fine-grained styling overrides:

| Element | Class |
|---------|-------|
| Root | `.cron-selector`, `.cron-selector--disabled` |
| Tab bar | `.cron-tabs` |
| Tab button | `.cron-tabs__tab`, `.cron-tabs__tab--active` |
| Panel | `.cron-tabbed-panel` |
| Panel body | `.cron-tabbed-panel__body` |
| Field area | `.cron-tabbed-panel__field` |
| Preview area | `.cron-tabbed-panel__preview` |
| Expression footer | `.cron-tabbed-panel__expression` |
| Expression text | `.cron-tabbed-panel__expression-text`, `--error` |
| Popover wrapper | `.cron-popover` |
| Popover input | `.cron-popover__input`, `.cron-popover__input--error` |
| Popover panel | `.cron-popover__panel` |
| Day field | `.cron-day-field` |
| Day option | `.cron-day-field__option`, `.cron-day-field__option--active` |
| Grid | `.cron-grid` |
| Grid cell | `.cron-grid__cell`, `.cron-grid__cell--selected`, `--disabled` |
| Inline select | `.cron-inline-select` |
| Inline select trigger | `.cron-inline-select__trigger`, `--open` |
| Inline select dropdown | `.cron-inline-select__dropdown` |
| Inline select option | `.cron-inline-select__option`, `--selected`, `--highlighted` |
| Number spinner | `.cron-number-spinner` |
| Spinner button | `.cron-number-spinner__btn` |
| Spinner input | `.cron-number-spinner__input` |
| Preview | `.cron-preview` |
| Preview item | `.cron-preview__item` |

## Responsive Behavior

The panel body uses CSS Grid. Below `640px`:

- Grid collapses to a single column
- Preview section moves below the field editor
- Tab bar scrolls horizontally

## Keyboard Navigation

| Area | Keys |
|------|------|
| Tab bar | Arrow Left/Right/Up/Down, Home, End |
| Grid cells | Click to toggle, Shift+Click for range selection |
| Inline select | Arrow Up/Down to navigate, Enter/Space to select, Escape to close |
| Number spinner | Arrow Up/Down to increment/decrement |
| Popover | Focus input to open, Escape to close |

## Popover Auto-Positioning

The popover panel and inline select dropdown automatically detect available viewport space:

- **Vertical flip**: when space below the trigger is insufficient, the panel opens upward
- **Horizontal shift**: when the panel would overflow the right edge, it shifts left
- **Boundary clamping**: panels stay at least 8px from any viewport edge
- **Dynamic repositioning**: panels reposition on window scroll and resize

## TypeScript

Full type definitions are included. Import types directly:

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

## License

Apache-2.0

---

# vue3-cron-selector 中文文档

[English](#vue3-cron-selector) | **中文**

一个面向 Vue 3 的可视化 Cron 表达式选择器组件。支持 5 位 crontab、6 位 Spring 和 7 位 Quartz 格式。零外部 UI 依赖 — 自带 CSS 样式，可在任何 Vue 3 项目中直接使用。

## 特性

- 两种展示模式：始终可见的内联面板和输入框触发的弹出面板
- 支持 `crontab`（5 位）、`quartz`（7 位含年份）和 `spring`（6 位）格式
- 内置英文和中文语言包，支持自定义语言扩展
- 基于 [croner](https://github.com/hexagon/croner) 的下次执行时间预览
- 完整的 TypeScript 类型声明
- 通过 CSS 自定义属性实现主题定制
- 键盘无障碍访问：标签页、下拉框、网格选择（支持 Shift+Click 范围选取）
- 智能弹出定位：自动上下翻转和水平偏移，确保不超出视口
- 无头组合式函数（`useCron`、`useCronSegment`）用于构建自定义 UI

## 安装

```bash
npm install vue3-cron-selector
# 或
pnpm add vue3-cron-selector
# 或
yarn add vue3-cron-selector
```

**对等依赖：** `vue >= 3.3.0`

## 快速开始

```vue
<template>
  <CronSelector v-model="cron" />
</template>

<script setup>
import { ref } from 'vue'
import { CronSelector } from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const cron = ref('* * * * *')
</script>
```

### 全局注册

```ts
import { createApp } from 'vue'
import Vue3CronSelector from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const app = createApp(App)
app.use(Vue3CronSelector)
```

## 属性（Props）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | Cron 表达式，配合 `v-model` 使用 |
| `format` | `'crontab' \| 'quartz' \| 'spring'` | `'crontab'` | Cron 方言格式 |
| `locale` | `string \| LocaleDefinition` | `'en'` | 语言代码（`'en'`、`'zh'`）或自定义语言对象 |
| `disabled` | `boolean` | `false` | 禁用所有交互 |
| `mode` | `'inline' \| 'popover'` | `'inline'` | 展示为始终可见面板或输入框触发的弹出面板 |
| `previewCount` | `number` | `5` | 显示的下次执行时间数量 |
| `cols` | `Partial<Record<string, number>>` | — | 覆盖各字段的网格列数 |

### 默认列数

| 字段 | 默认列数 |
|------|----------|
| `second`（秒） | 10 |
| `minute`（分） | 10 |
| `hour`（时） | 6 |
| `dayOfMonth`（日） | 7 |
| `month`（月） | 4 |
| `dayOfWeek`（周） | 7 |
| `year`（年） | 10 |

## 事件（Events）

| 事件 | 载荷 | 说明 |
|------|------|------|
| `update:modelValue` | `string` | 表达式变更时触发（支持 `v-model`） |
| `change` | `string` | 表达式变更时触发（用于副作用） |
| `error` | `string \| null` | 校验状态变更时触发；`null` 表示有效 |

## 格式说明

### crontab（5 位）

```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 星期 (0-6)
* * * * *
```

### quartz（7 位）

```
┌───────────── 秒 (0-59)
│ ┌───────────── 分钟 (0-59)
│ │ ┌───────────── 小时 (0-23)
│ │ │ ┌───────────── 日 (1-31)
│ │ │ │ ┌───────────── 月 (1-12)
│ │ │ │ │ ┌───────────── 星期 (0-6)
│ │ │ │ │ │ ┌───────────── 年 (1970-2099)
0 * * * * ? *
```

### spring（6 位）

```
┌───────────── 秒 (0-59)
│ ┌───────────── 分钟 (0-59)
│ │ ┌───────────── 小时 (0-23)
│ │ │ ┌───────────── 日 (1-31)
│ │ │ │ ┌───────────── 月 (1-12)
│ │ │ │ │ ┌───────────── 星期 (0-6)
0 * * * * *
```

### 字段取值范围

| 字段 | 最小值 | 最大值 |
|------|--------|--------|
| second（秒） | 0 | 59 |
| minute（分） | 0 | 59 |
| hour（时） | 0 | 23 |
| dayOfMonth（日） | 1 | 31 |
| month（月） | 1 | 12 |
| dayOfWeek（周） | 0 | 6 |
| year（年） | 1970 | 2099 |

## 使用示例

### 内联模式（默认）

```vue
<CronSelector v-model="cron" format="crontab" />
```

### Quartz 格式

```vue
<CronSelector v-model="cron" format="quartz" />
```

### 弹出模式

```vue
<CronSelector v-model="cron" format="crontab" mode="popover" />
```

### 中文界面

```vue
<CronSelector v-model="cron" locale="zh" />
```

### 自定义网格列数

```vue
<CronSelector v-model="cron" :cols="{ minute: 6, hour: 4 }" />
```

### 错误处理

```vue
<CronSelector
  v-model="cron"
  @error="(err) => console.log(err)"
  @change="(val) => console.log('变更:', val)"
/>
```

## 组合式函数

### `useCron`

用于程序化管理完整 Cron 表达式的高级组合式函数。

```ts
import { useCron } from 'vue3-cron-selector'

const {
  cronString,       // Ref<string> — 当前表达式（可写）
  segments,         // ComputedRef<ReadonlyMap<string, UseCronSegmentReturn>>
  formatConfig,     // ComputedRef<FormatConfig>
  description,      // ComputedRef<string> — 人类可读的描述
  nextExecutions,   // ComputedRef<ReadonlyArray<Date>> — 即将执行的时间
  isValid,          // ComputedRef<boolean>
  error,            // ComputedRef<string | null>
  setCronString,    // (value: string) => void
  reset,            // () => void — 重置为格式默认值
} = useCron({
  modelValue: '*/5 * * * *',  // string 或 Ref<string>
  format: 'crontab',          // CronFormat 或 Ref<CronFormat>
  locale: 'zh',               // string、LocaleDefinition 或 Ref
})
```

### `useCronSegment`

用于管理单个 Cron 字段的低级组合式函数。

```ts
import { useCronSegment } from 'vue3-cron-selector'

const {
  fieldId,        // string
  field,          // FieldDefinition
  segment,        // Ref<Segment>
  selected,       // Ref<ReadonlyArray<number>> — 展开的数值
  cronString,     // Ref<string> — 序列化的字段字符串
  setSelected,    // (values: ReadonlyArray<number>) => void
  setType,        // (type: SegmentType) => void
  setRange,       // (from: number, to: number) => void
  setStep,        // (base: number | '*', step: number) => void
  setCron,        // (cron: string) => void
  reset,          // () => void — 重置为 '*'
} = useCronSegment({
  field: { id: 'minute', min: 0, max: 59, label: '分钟' },
  initialCron: '*/5',
})
```

## 国际化（i18n）

内置语言：`'en'`（English）、`'zh'`（中文）。

```vue
<CronSelector v-model="cron" locale="zh" />
```

### 自定义语言

传入完整的 `LocaleDefinition` 对象：

```ts
import type { LocaleDefinition } from 'vue3-cron-selector'

const jaLocale: LocaleDefinition = {
  code: 'ja',
  name: '日本語',
  fieldLabels: {
    second: '秒', minute: '分', hour: '時',
    dayOfMonth: '日', month: '月', dayOfWeek: '曜日', year: '年',
  },
  months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
  weekdaysShort: ['日','月','火','水','木','金','土'],
  segmentTypes: { /* ... */ },
  periods: { /* ... */ },
  ui: { /* ... */ },
}
```

```vue
<CronSelector v-model="cron" :locale="jaLocale" />
```

### `LocaleDefinition` 接口

```ts
interface LocaleDefinition {
  code: string                    // BCP 47 语言代码（用于 Intl.DateTimeFormat）
  name: string
  fieldLabels: Record<string, string>
  tabLabels?: Record<string, string>
  segmentTypes: Record<SegmentType, string>
  periods: Record<PeriodId, string>
  months: string[]                // 12 项，索引 0 = 一月
  weekdays: string[]              // 7 项，索引 0 = 星期日
  weekdaysShort: string[]
  ui: {
    expand: string
    collapse: string
    nextRuns: string
    invalidExpr: string
    every: string
    at: string
    on: string
    of: string
    and: string
    through: string
    startingAt: string
    from: string
    to: string
    cronExpression: string
    placeholder: string
    everyDay: string
    everyNDaysStartingAt: string   // 模板：'{step}' 和 '{start}'
    specificDayOfWeek: string
    specificDayOfMonth: string
    lastDayOfMonth: string
    lastWeekdayOfMonth: string
    lastSpecificWeekdayOfMonth: string  // 模板：'{weekday}'
    daysBeforeEndOfMonth: string        // 模板：'{n}'
    nearestWeekdayTo: string            // 模板：'{day}'
    nthWeekdayOfMonth: string           // 模板：'{nth}' 和 '{weekday}'
    day: string
    days: string
    the: string
    ordinals: string[]            // ['第1','第2','第3','第4','第5']
    fieldOptions: Record<string, {
      everyOne: string
      step: string
      specific: string
      range: string
    }>
    selectPlaceholder: string
  }
}
```

## 工具函数

| 函数 | 签名 | 说明 |
|------|------|------|
| `parseCronExpression` | `(expression, format) => ParsedCron` | 解析完整的 Cron 表达式 |
| `parseCronField` | `(fieldStr, field) => Segment` | 解析单个字段字符串 |
| `selectedToSegment` | `(values, field) => Segment` | 将选中的值转换为最优段 |
| `segmentsToString` | `(segments, format) => string` | 将段序列化为表达式字符串 |
| `getFormatConfig` | `(format) => FormatConfig` | 获取格式的字段定义 |
| `generateDescription` | `(parsed, locale) => string` | 生成人类可读的描述 |
| `resolveLocale` | `(code) => LocaleDefinition` | 将语言代码解析为语言定义 |
| `getFieldValueLabel` | `(fieldId, value, locale) => string` | 获取字段值的显示标签 |

## 主题定制

所有视觉属性通过 CSS 自定义属性控制。在你的样式表中覆盖即可：

```css
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}
```

### 颜色变量

| 变量 | 默认值 |
|------|--------|
| `--cron-color-primary` | `#4f46e5` |
| `--cron-color-primary-hover` | `#4338ca` |
| `--cron-color-primary-light` | `#eef2ff` |
| `--cron-color-text` | `#1f2937` |
| `--cron-color-text-secondary` | `#6b7280` |
| `--cron-color-border` | `#d1d5db` |
| `--cron-color-border-focus` | `#4f46e5` |
| `--cron-color-bg` | `#ffffff` |
| `--cron-color-bg-hover` | `#f9fafb` |
| `--cron-color-bg-selected` | `#eef2ff` |
| `--cron-color-error` | `#dc2626` |
| `--cron-color-error-light` | `#fef2f2` |

### 字体变量

| 变量 | 默认值 |
|------|--------|
| `--cron-font-family` | `system-ui, -apple-system, sans-serif` |
| `--cron-font-size-sm` | `0.75rem` |
| `--cron-font-size-base` | `0.875rem` |
| `--cron-font-size-lg` | `1rem` |
| `--cron-line-height` | `1.5` |

### 间距变量

| 变量 | 默认值 |
|------|--------|
| `--cron-spacing-xs` | `0.25rem` |
| `--cron-spacing-sm` | `0.5rem` |
| `--cron-spacing-md` | `0.75rem` |
| `--cron-spacing-lg` | `1rem` |
| `--cron-spacing-xl` | `1.5rem` |

### 形状变量

| 变量 | 默认值 |
|------|--------|
| `--cron-border-radius` | `0.375rem` |
| `--cron-border-radius-lg` | `0.5rem` |
| `--cron-border-width` | `1px` |

### 动效变量

| 变量 | 默认值 |
|------|--------|
| `--cron-transition-duration` | `150ms` |
| `--cron-transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |

### 布局变量

| 变量 | 默认值 |
|------|--------|
| `--cron-panel-max-height` | `500px` |
| `--cron-popover-max-width` | `680px` |
| `--cron-popover-z-index` | `1000` |
| `--cron-body-min-height` | `280px` |
| `--cron-tab-height` | `2.5rem` |
| `--cron-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--cron-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...` |
| `--cron-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` |

### 暗色主题示例

```css
.dark {
  --cron-color-primary: #818cf8;
  --cron-color-primary-hover: #6366f1;
  --cron-color-primary-light: rgba(99, 102, 241, 0.15);
  --cron-color-text: #f3f4f6;
  --cron-color-text-secondary: #9ca3af;
  --cron-color-border: #374151;
  --cron-color-border-focus: #818cf8;
  --cron-color-bg: #1f2937;
  --cron-color-bg-hover: #111827;
  --cron-color-bg-selected: rgba(99, 102, 241, 0.15);
  --cron-color-error: #f87171;
  --cron-color-error-light: rgba(248, 113, 113, 0.1);
  --cron-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --cron-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --cron-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
}
```

## CSS 类名（BEM）

所有类名遵循 BEM 命名规范，便于精细化样式覆盖：

| 元素 | 类名 |
|------|------|
| 根容器 | `.cron-selector`、`.cron-selector--disabled` |
| 标签栏 | `.cron-tabs` |
| 标签按钮 | `.cron-tabs__tab`、`.cron-tabs__tab--active` |
| 面板 | `.cron-tabbed-panel` |
| 面板主体 | `.cron-tabbed-panel__body` |
| 字段区域 | `.cron-tabbed-panel__field` |
| 预览区域 | `.cron-tabbed-panel__preview` |
| 表达式底栏 | `.cron-tabbed-panel__expression` |
| 表达式文本 | `.cron-tabbed-panel__expression-text`、`--error` |
| 弹出容器 | `.cron-popover` |
| 弹出输入框 | `.cron-popover__input`、`.cron-popover__input--error` |
| 弹出面板 | `.cron-popover__panel` |
| 日期字段 | `.cron-day-field` |
| 日期选项 | `.cron-day-field__option`、`.cron-day-field__option--active` |
| 网格 | `.cron-grid` |
| 网格单元 | `.cron-grid__cell`、`.cron-grid__cell--selected`、`--disabled` |
| 内联选择器 | `.cron-inline-select` |
| 选择器触发器 | `.cron-inline-select__trigger`、`--open` |
| 选择器下拉框 | `.cron-inline-select__dropdown` |
| 选择器选项 | `.cron-inline-select__option`、`--selected`、`--highlighted` |
| 数字微调器 | `.cron-number-spinner` |
| 微调按钮 | `.cron-number-spinner__btn` |
| 微调输入框 | `.cron-number-spinner__input` |
| 执行预览 | `.cron-preview` |
| 预览项 | `.cron-preview__item` |

## 响应式行为

面板主体使用 CSS Grid 布局。在 `640px` 以下：

- 网格折叠为单列
- 预览区移至字段编辑器下方
- 标签栏水平滚动

## 键盘导航

| 区域 | 按键 |
|------|------|
| 标签栏 | 方向键左/右/上/下、Home、End |
| 网格单元 | 点击切换选中，Shift+点击范围选取 |
| 内联选择器 | 上/下方向键导航，Enter/空格选择，Escape 关闭 |
| 数字微调器 | 上/下方向键增减 |
| 弹出面板 | 聚焦输入框打开，Escape 关闭 |

## 弹出面板自动定位

弹出面板和内联选择器下拉框会自动检测视口可用空间：

- **垂直翻转**：当触发器下方空间不足时，面板向上展开
- **水平偏移**：当面板会超出右侧边缘时，自动向左偏移
- **边界钳制**：面板与视口边缘保持至少 8px 的距离
- **动态重定位**：窗口滚动和调整大小时自动重新定位

## TypeScript 支持

包含完整的类型声明文件，可直接导入类型：

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

## 许可证

Apache-2.0
