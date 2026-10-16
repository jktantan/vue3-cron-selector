---
layout: home

hero:
  name: vue3-cron-selector
  text: Visual cron selector for Vue 3
  tagline: crontab · Quartz · Spring — inline panel or popover, zero UI dependencies
  image:
    src: /logo.svg
    alt: vue3-cron-selector
    width: 220
    height: 220
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Live Demo
      link: /demo/
    - theme: alt
      text: API Reference
      link: /api/utilities

features:
  - title: Three cron dialects
    details: crontab (5-field), Spring (6-field) and Quartz (7-field with an optional year) share one component, one v-model and one validation pipeline.
  - title: Inline or popover
    details: Embed the always-visible panel in a form, or switch to a compact input that opens the panel on focus. Same props either way.
  - title: Locale aware
    details: Ships with English and Chinese locales. Pass a full LocaleDefinition object to add your own language, including month and weekday names.
  - title: Next-run preview
    details: Upcoming execution times are computed with croner and shown under the editor, so users see the effect of an expression immediately.
  - title: Themeable
    details: Every colour, spacing and motion value is a CSS custom property. Restyle the component from your own stylesheet, no build step required.
  - title: Fully typed
    details: Written in TypeScript with generated declarations for the component, the composables and every exported type.
---

## Install

```bash
pnpm add vue3-cron-selector
```

```vue
<script setup>
import { ref } from 'vue'
import { CronSelector } from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const cron = ref('*/5 * * * *')
</script>

<template>
  <CronSelector v-model="cron" />
</template>
```

See [Getting Started](/guide/getting-started) for options, or open the
[Live Demo](/demo/) to try every mode.
