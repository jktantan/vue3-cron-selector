# Composables

The component is a thin view over two exported composables. Use them directly when
you need a custom trigger, a custom layout, or just the parsing without any UI.

## `useCron`

Manages a full expression: parsing, serialisation, validation, description and the
next-run preview.

```ts
import { useCron } from 'vue3-cron-selector'

const {
  cronString,     // Ref<string> — the current expression, writable
  segments,       // ComputedRef<ReadonlyMap<string, UseCronSegmentReturn>>
  formatConfig,   // ComputedRef<FormatConfig>
  period,         // Ref<PeriodId>
  description,    // ComputedRef<string> — human-readable description
  nextExecutions, // ComputedRef<ReadonlyArray<Date>> — upcoming runs
  isValid,        // ComputedRef<boolean>
  error,          // ComputedRef<string | null>
  setCronString,  // (value: string) => void
  reset,          // () => void — reset to the format's default expression
} = useCron({
  modelValue: '*/5 * * * *', // string or Ref<string>
  format: 'crontab',         // CronFormat or Ref<CronFormat>
  locale: 'en-US',              // string, LocaleDefinition, or a Ref of either
  previewCount: 5,           // number or Ref<number>
})
```

Every option accepts either a plain value or a `Ref`, so `format` and `locale` stay
reactive when they are bound to your own state.

### `UseCronOptions`

| Option | Type | Default |
|--------|------|---------|
| `modelValue` | `string \| Ref<string>` | format default expression |
| `format` | `CronFormat \| Ref<CronFormat>` | `'crontab'` |
| `locale` | `string \| LocaleDefinition \| Ref<...>` | `'en-US'` |
| `previewCount` | `number \| Ref<number>` | `5` |

### `UseCronReturn`

`cronString`, `segments`, `formatConfig`, `period`, `description`,
`nextExecutions`, `isValid`, `error`, `setCronString`, `reset` — as listed in the
destructuring example above.

`nextExecutions` is computed with [croner](https://github.com/hexagon/croner). The
Quartz-only `L` and `L-n` day-of-month forms have no croner equivalent, so they are
translated before the preview is computed; months in which the offset day does not
exist are skipped rather than rolled into the previous month.

## `useCronSegment`

Manages a single field. This is the piece the grid editor is built on.

```ts
import { useCronSegment } from 'vue3-cron-selector'

const {
  fieldId,    // string — the field id, e.g. 'minute'
  field,      // FieldDefinition
  segment,    // Ref<Segment> — the structured value
  selected,   // Ref<ReadonlyArray<number>> — expanded numeric values
  cronString, // Ref<string> — the serialised field, e.g. '*/5'
  setSelected, // (values: ReadonlyArray<number>) => void
  setType,     // (type: SegmentType) => void
  setRange,    // (from: number, to: number) => void
  setStep,     // (base: number | '*', step: number) => void
  setCron,     // (cron: string) => void
  reset,       // () => void — back to '*'
} = useCronSegment({
  field: { id: 'minute', min: 0, max: 59, label: 'Minute' },
  initialCron: '*/5',
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `field` | `FieldDefinition` | — | Required. The field to edit (`id`, `min`, `max`, `label`, optional `altValues`) |
| `initialCron` | `string` | `'*'` | Expression for this field to start from |

### `SegmentType`

`setType` switches the field to one of the segment kinds the library understands:

`'any'` · `'value'` · `'range'` · `'step'` · `'combined'` · `'noSpecific'` ·
`'lastDay'` · `'lastBusinessDay'` · `'nearestWeekday'` · `'lastWeekdayOfMonth'` ·
`'nthWeekday'`

The `lastDay`, `lastBusinessDay`, `nearestWeekday`, `lastWeekdayOfMonth` and
`nthWeekday` kinds are Quartz-only and are hidden in crontab mode.

## Building a minimal editor

```vue
<script setup>
import { ref, watch } from 'vue'
import { useCron } from 'vue3-cron-selector'

const { cronString, description, nextExecutions, isValid } = useCron({
  modelValue: ref('0 9 * * 1-5'),
  locale: 'en-US',
})

const draft = ref(cronString.value)
watch(draft, (value) => (cronString.value = value))
</script>

<template>
  <input v-model="draft" />
  <p v-if="isValid">{{ description }}</p>
  <ul v-else>
    <li>Invalid expression</li>
  </ul>
  <ul>
    <li v-for="run in nextExecutions" :key="run.toISOString()">
      {{ run.toLocaleString() }}
    </li>
  </ul>
</template>
```
