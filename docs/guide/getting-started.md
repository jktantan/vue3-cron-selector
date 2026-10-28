# Getting Started

`vue3-cron-selector` is a visual cron expression selector for Vue 3. It ships as an
ES module plus a UMD bundle, with all styles compiled into a single CSS file — no
UI framework, no CSS preprocessor and no runtime CSS-in-JS required on your side.

The JavaScript entry does **not** inject any CSS. Import
`vue3-cron-selector/style.css` once in your application.

## Installation

```bash
npm install vue3-cron-selector
# or
pnpm add vue3-cron-selector
# or
yarn add vue3-cron-selector
```

::: warning Peer dependency
This package requires **`vue >= 3.5.0`**. The day-of-month field uses Vue's
`useId()` to generate unique radio-group names, and `useId` was added in Vue 3.5.
:::

## Quick start

Import the component and the stylesheet, then bind an expression with `v-model`:

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

`v-model` is a plain string, so the selector drops into any existing form, store or
URL query parameter without adapters. Invalid input is reported through the `error`
event rather than thrown, so the component never breaks a form on its own.

## Global registration

If you prefer registering the component once, the default export is a Vue plugin:

```ts
import { createApp } from 'vue'
import Vue3CronSelector from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const app = createApp(App)
app.use(Vue3CronSelector)
```

After that, `<CronSelector>` is available in every template of the app.

## Choosing a mode

| Mode | When to use |
|------|-------------|
| `inline` (default) | The panel is always visible — good for settings pages, schedulers and admin forms where the expression is the focus. |
| `popover` | A compact text input shows the current expression and opens the panel on focus — good for dense forms and inline table editing. |

```vue
<CronSelector v-model="cron" mode="popover" />
```

## Next steps

- [Formats](/guide/formats) — pick between crontab, Quartz and Spring.
- [Props & Events](/guide/props-events) — the full component API.
- [Composables](/guide/composables) — build your own UI on the same core.
- [Live Demo](/demo/) — try every mode interactively.
