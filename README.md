# vue3-cron-selector

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

MIT
