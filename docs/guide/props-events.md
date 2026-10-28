# Props & Events

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | Cron expression, use with `v-model` |
| `format` | `'crontab' \| 'quartz' \| 'spring'` | `'crontab'` | Cron dialect — see [Formats](/guide/formats) |
| `locale` | `string \| LocaleDefinition` | `'en'` | Locale code (`'en'`, `'zh'`) or a custom locale object |
| `disabled` | `boolean` | `false` | Disables every control and dims the panel |
| `mode` | `'inline' \| 'popover'` | `'inline'` | Always-visible panel, or input that opens the panel |
| `previewCount` | `number` | `5` | How many upcoming execution dates to list |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Palette for this instance — `auto` follows the `html.dark` convention. See [Theming](/guide/theming) |
| `primaryColor` | `string` | — | Custom primary colour (any CSS colour); derived hover/tint/border tokens are generated automatically |
| `cols` | `Partial<Record<string, number>>` | — | Override the grid column count per field |

### Default column counts

The grid draws one cell per value in the field's range, laid out in the given number
of columns. `cols` accepts any subset of the field ids:

| Field | Default columns |
|-------|-----------------|
| `second` | 10 |
| `minute` | 10 |
| `hour` | 6 |
| `dayOfMonth` | 7 |
| `month` | 4 |
| `dayOfWeek` | 7 |
| `year` | 10 |

```vue
<!-- six columns for minutes, four for hours; everything else keeps its default -->
<CronSelector v-model="cron" :cols="{ minute: 6, hour: 4 }" />
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted whenever the expression changes; this is what makes `v-model` work |
| `change` | `string` | Same payload as `update:modelValue`, for side effects that should not live in a computed setter |
| `error` | `string \| null` | Emitted when validity changes. The payload is a message when the expression is invalid, or `null` when it becomes valid again |

```vue
<CronSelector
  v-model="cron"
  @change="(value) => save(value)"
  @error="(message) => (error = message)"
/>
```

The `error` event is the recommended way to react to invalid input: parsing never
throws out of the component, so `@error="null"` reliably means "the current
expression is valid".

## Slot-free by design

The component has no slots. If you need a different arrangement — your own trigger,
your own layout, a table cell renderer — use the [composables](/guide/composables)
instead of reaching into the DOM.
