# Utility Functions

The parsing and serialisation core is exported as plain functions, so you can reuse
it without mounting anything.

```ts
import {
  parseCronExpression,
  parseCronField,
  selectedToSegment,
  segmentsToString,
  getFormatConfig,
  generateDescription,
  resolveLocale,
  getFieldValueLabel,
} from 'vue3-cron-selector'
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseCronExpression` | `(expression: string, format: CronFormat) => ParsedCron` | Parse a whole expression into a map of segments. Never throws — failures come back as `ParsedCron.error`. |
| `parseCronField` | `(fieldStr: string, field: FieldDefinition, format?: CronFormat) => Segment` | Parse a single field such as `'*/5'` against a field definition. Throws on invalid input. |
| `selectedToSegment` | `(values: ReadonlyArray<number>, field: FieldDefinition) => Segment` | Turn a set of selected values into the most compact segment: a full range becomes `*`, an arithmetic progression becomes a step, a contiguous run becomes a range, and anything else becomes a combined segment. |
| `segmentsToString` | `(segments: ReadonlyMap<string, Segment>, format: CronFormat) => string` | Serialise a segment map back to an expression in the field order of the format. |
| `getFormatConfig` | `(format: CronFormat) => FormatConfig` | Field order, field definitions and the default expression for a dialect. |
| `generateDescription` | `(parsed: ParsedCron, locale: LocaleDefinition) => string` | Build the human-readable sentence for a parsed expression. |
| `resolveLocale` | `(code: string) => LocaleDefinition` | Look up a built-in locale. Falls back to the base language (`zh-CN` → `zh`), then to English. |
| `getFieldValueLabel` | `(fieldId: string, value: number, locale: LocaleDefinition) => string` | Display label for a value in a field: month names, weekday names, or a zero-padded number. |

## Worked example

Round-trip an expression through the parser and back:

```ts
import { parseCronExpression, segmentsToString } from 'vue3-cron-selector'

const parsed = parseCronExpression('*/5 9-17 * * 1-5', 'crontab')

if (parsed.error) {
  console.error(parsed.error)
} else {
  // Every field is available in the same order as the format defines it.
  console.log(parsed.segments.get('minute')?.toString()) // "*/5"

  // Re-serialising is lossless for what the parser understood.
  console.log(segmentsToString(parsed.segments, 'crontab')) // "*/5 9-17 * * 1-5"
}
```

## Exported locale constants

The two built-in locales are also exported directly, which is useful when you want
to derive a custom locale from one of them:

```ts
import { EN_LOCALE, ZH_LOCALE } from 'vue3-cron-selector'
```

## Other named exports

| Export | Kind | Notes |
|--------|------|-------|
| `CronSelector` | component | The selector itself |
| `Vue3CronSelectorPlugin` | plugin (also the default export) | Registers `<CronSelector>` globally via `app.use()` |
| `FloatingPanelKey` | `InjectionKey<FloatingPanelHost>` | Internal bridge that lets nested dropdowns register as part of the popover. Exported for completeness; you will not normally need it. |
