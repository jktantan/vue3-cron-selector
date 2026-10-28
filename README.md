# vue3-cron-selector

**English** | [中文](#vue3-cron-selector-中文文档)

[![npm version](https://img.shields.io/npm/v/vue3-cron-selector.svg)](https://www.npmjs.com/package/vue3-cron-selector)
[![license](https://img.shields.io/npm/l/vue3-cron-selector.svg)](https://github.com/jktantan/vue3-cron-selector/blob/main/LICENSE)

A visual cron expression selector component for Vue 3. Supports 5-field crontab, 6-field Spring, and 7-field Quartz formats. Zero external UI dependencies — ships its own CSS and works in any Vue 3 project.

> 📖 **Full documentation and live demo: <https://jktantan.github.io/vue3-cron-selector/>**

## Features

- Two display modes: always-visible inline panel and input-triggered popover
- Supports `crontab` (5-field), `spring` (6-field), and `quartz` (7-field, year optional) formats
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

**Peer dependency:** `vue >= 3.5.0` (the component uses `useId`, added in Vue 3.5)

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
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Palette for this instance — `auto` follows the `html.dark` convention |
| `primaryColor` | `string` | — | Custom primary colour (any CSS colour). Derived hover/tint/border tokens are generated automatically |
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

### quartz (7-field, year optional)

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

```vue
<!-- Inline mode (default) -->
<CronSelector v-model="cron" format="crontab" />

<!-- Quartz format -->
<CronSelector v-model="cron" format="quartz" />

<!-- Popover mode -->
<CronSelector v-model="cron" mode="popover" />

<!-- Chinese locale -->
<CronSelector v-model="cron" locale="zh" />

<!-- Custom grid columns -->
<CronSelector v-model="cron" :cols="{ minute: 6, hour: 4 }" />

<!-- Error handling -->
<CronSelector v-model="cron" @error="(err) => console.log(err)" />
```

## Composables

Headless building blocks exported alongside the component:

```ts
import { useCron, useCronSegment } from 'vue3-cron-selector'

const {
  cronString,     // Ref<string> — current expression (writable)
  segments,       // ComputedRef<ReadonlyMap<string, UseCronSegmentReturn>>
  formatConfig,   // ComputedRef<FormatConfig>
  description,    // ComputedRef<string> — human-readable description
  nextExecutions, // ComputedRef<ReadonlyArray<Date>>
  isValid,        // ComputedRef<boolean>
  error,          // ComputedRef<string | null>
  setCronString,  // (value: string) => void
  reset,          // () => void — resets to format default
} = useCron({ modelValue: '*/5 * * * *', format: 'crontab', locale: 'en', previewCount: 5 })
```

See the [Composables guide](https://jktantan.github.io/vue3-cron-selector/guide/composables) for the full `useCronSegment` API.

## Locale / i18n

Built-in locales: `'en'` (English) and `'zh'` (中文). Pass a full `LocaleDefinition` object for custom languages:

```vue
<CronSelector v-model="cron" locale="zh" />
```

```ts
import type { LocaleDefinition } from 'vue3-cron-selector'
```

See the [i18n guide](https://jktantan.github.io/vue3-cron-selector/guide/i18n) for the complete `LocaleDefinition` interface and a custom-locale example.

## Theming

The styles are aligned with Element Plus: every `--cron-*` token resolves to the
matching `--el-*` variable first and only falls back to a built-in default, so
the selector follows your Element Plus theme colour, typography and dark mode
automatically. Override tokens globally or per container:

```css
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}
```

Light and dark palettes are built in. `theme="auto"` (the default) follows the
`html.dark` convention used by Element Plus; `theme="light"` / `theme="dark"`
pin the palette for a single instance. Set `primaryColor` to any CSS colour and
the hover, tint and border shades are derived automatically.

```vue
<CronSelector v-model="cron" theme="dark" />
<CronSelector v-model="cron" primary-color="#16a34a" />
```

Styles are a separate entry point and are **not** injected by the JS bundle:

```ts
import 'vue3-cron-selector/style.css'
```

Every element also carries a stable BEM class from the single `cron-selector`
block (for example `.cron-selector__cell--selected`), so a third-party
stylesheet can restyle any part directly:

```css
.my-scheduler .cron-selector__cell--selected {
  background: #16a34a;
  border-color: #16a34a;
}
```

See the [Theming guide](https://jktantan.github.io/vue3-cron-selector/guide/theming)
for the full token reference, dark-mode setup and the complete BEM class list.

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

## Documentation

| Resource | Link |
|----------|------|
| Documentation site | <https://jktantan.github.io/vue3-cron-selector/> |
| Live demo | <https://jktantan.github.io/vue3-cron-selector/demo/> |
| Getting started | <https://jktantan.github.io/vue3-cron-selector/guide/getting-started> |
| API reference | <https://jktantan.github.io/vue3-cron-selector/api/composables> |
| Theming reference | <https://jktantan.github.io/vue3-cron-selector/guide/theming> |
| Issues | <https://github.com/jktantan/vue3-cron-selector/issues> |

## License

Apache-2.0

---

# vue3-cron-selector 中文文档

[English](#vue3-cron-selector) | **中文**

[![npm version](https://img.shields.io/npm/v/vue3-cron-selector.svg)](https://www.npmjs.com/package/vue3-cron-selector)
[![license](https://img.shields.io/npm/l/vue3-cron-selector.svg)](https://github.com/jktantan/vue3-cron-selector/blob/main/LICENSE)

一个面向 Vue 3 的可视化 Cron 表达式选择器组件。支持 5 位 crontab、6 位 Spring 和 7 位 Quartz（年份可省略）格式。零外部 UI 依赖 —— 自带 CSS 样式，可在任何 Vue 3 项目中直接使用。

> 📖 **完整文档与在线演示：<https://jktantan.github.io/vue3-cron-selector/>**

## 特性

- 两种展示模式：始终可见的内联面板和输入框触发的弹出面板
- 支持 `crontab`（5 位）、`spring`（6 位）和 `quartz`（7 位，年份可省略）格式
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

**对等依赖：** `vue >= 3.5.0`（组件使用了 Vue 3.5 引入的 `useId`）

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
| `format` | `'crontab' \| 'quartz' \| 'spring'` | `'crontab'` | Cron 方言 |
| `locale` | `string \| LocaleDefinition` | `'en'` | 语言代码（`'en'`、`'zh'`）或自定义语言对象 |
| `disabled` | `boolean` | `false` | 禁用全部交互 |
| `mode` | `'inline' \| 'popover'` | `'inline'` | 内联面板或输入框触发的弹出面板 |
| `previewCount` | `number` | `5` | 展示的后续执行时间数量 |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 当前实例的色调：`auto` 跟随 `html.dark` 约定 |
| `primaryColor` | `string` | — | 自定义主色（任意 CSS 颜色），自动生成 hover/浅色/边框派生色 |
| `cols` | `Partial<Record<string, number>>` | — | 按字段覆盖网格列数 |

### 默认列数

| 字段 | 默认列数 |
|------|----------|
| `second` | 10 |
| `minute` | 10 |
| `hour` | 6 |
| `dayOfMonth` | 7 |
| `month` | 4 |
| `dayOfWeek` | 7 |
| `year` | 10 |

## 事件（Events）

| 事件 | 载荷 | 说明 |
|------|------|------|
| `update:modelValue` | `string` | 表达式变化（支持 `v-model`） |
| `change` | `string` | 表达式变化（用于副作用） |
| `error` | `string \| null` | 校验状态变化；`null` 表示合法 |

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

### quartz（7 位，年份可省略）

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
| second | 0 | 59 |
| minute | 0 | 59 |
| hour | 0 | 23 |
| dayOfMonth | 1 | 31 |
| month | 1 | 12 |
| dayOfWeek | 0 | 6 |
| year | 1970 | 2099 |

## 使用示例

```vue
<!-- 内联模式（默认） -->
<CronSelector v-model="cron" format="crontab" />

<!-- Quartz 格式 -->
<CronSelector v-model="cron" format="quartz" />

<!-- 弹出模式 -->
<CronSelector v-model="cron" mode="popover" />

<!-- 中文界面 -->
<CronSelector v-model="cron" locale="zh" />

<!-- 自定义网格列数 -->
<CronSelector v-model="cron" :cols="{ minute: 6, hour: 4 }" />

<!-- 错误处理 -->
<CronSelector v-model="cron" @error="(err) => console.log(err)" />
```

## 组合式函数

组件之外还导出了可复用的无头构建块：

```ts
import { useCron, useCronSegment } from 'vue3-cron-selector'

const {
  cronString,     // Ref<string> — 当前表达式（可写）
  segments,       // ComputedRef<ReadonlyMap<string, UseCronSegmentReturn>>
  formatConfig,   // ComputedRef<FormatConfig>
  description,    // ComputedRef<string> — 人类可读描述
  nextExecutions, // ComputedRef<ReadonlyArray<Date>>
  isValid,        // ComputedRef<boolean>
  error,          // ComputedRef<string | null>
  setCronString,  // (value: string) => void
  reset,          // () => void — 重置为格式默认值
} = useCron({ modelValue: '*/5 * * * *', format: 'crontab', locale: 'en', previewCount: 5 })
```

`useCronSegment` 的完整 API 见[组合式函数指南](https://jktantan.github.io/vue3-cron-selector/zh/guide/composables)。

## 国际化（i18n）

内置语言包：`'en'`（英文）和 `'zh'`（中文）。传入完整的 `LocaleDefinition` 对象即可自定义语言：

```vue
<CronSelector v-model="cron" locale="zh" />
```

```ts
import type { LocaleDefinition } from 'vue3-cron-selector'
```

完整的 `LocaleDefinition` 接口定义与自定义语言示例见[国际化指南](https://jktantan.github.io/vue3-cron-selector/zh/guide/i18n)。

## 主题定制

样式以 Element Plus 为基础对齐：每个 `--cron-*` 令牌优先解析为对应的 `--el-*` 变量，
仅在不存在时才使用内置默认值，因此选择器会自动跟随 Element Plus 的主题色、字体与暗色
模式。可在全局或容器级覆盖令牌：

```css
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}
```

组件内置浅色与深色两套色调。`theme="auto"`（默认）跟随 Element Plus 使用的
`html.dark` 约定；`theme="light"` / `theme="dark"` 可为单个实例锁定色调。
`primaryColor` 接受任意 CSS 颜色，hover、浅色底与边框派生色会自动生成。

```vue
<CronSelector v-model="cron" theme="dark" />
<CronSelector v-model="cron" primary-color="#16a34a" />
```

样式是独立入口，JS bundle **不会**自动注入：

```ts
import 'vue3-cron-selector/style.css'
```

所有元素都带有单一 `cron-selector` Block 下的稳定 BEM 类名（例如
`.cron-selector__cell--selected`），第三方样式表可以直接覆盖任意部分：

```css
.my-scheduler .cron-selector__cell--selected {
  background: #16a34a;
  border-color: #16a34a;
}
```

完整的令牌清单、暗色模式接入方式与 BEM 类名列表见[主题定制指南](https://jktantan.github.io/vue3-cron-selector/zh/guide/theming)。

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

## 文档资源

| 资源 | 链接 |
|------|------|
| 文档站点 | <https://jktantan.github.io/vue3-cron-selector/zh/> |
| 在线演示 | <https://jktantan.github.io/vue3-cron-selector/zh/demo/> |
| 快速上手 | <https://jktantan.github.io/vue3-cron-selector/zh/guide/getting-started> |
| API 参考 | <https://jktantan.github.io/vue3-cron-selector/zh/api/composables> |
| 主题定制 | <https://jktantan.github.io/vue3-cron-selector/zh/guide/theming> |
| 问题反馈 | <https://github.com/jktantan/vue3-cron-selector/issues> |

## 许可证

Apache-2.0
