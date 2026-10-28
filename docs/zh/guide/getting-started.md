# 快速上手

`vue3-cron-selector` 是一个面向 Vue 3 的可视化 Cron 表达式选择器。它以 ESM 加
UMD 两种格式发布，全部样式编译进单个 CSS 文件 —— 你的项目里不需要 UI 框架、不需要
CSS 预处理器，也不需要运行时 CSS-in-JS。

JavaScript 入口**不会**自动注入任何 CSS，请在应用中单独引入一次
`vue3-cron-selector/style.css`。

## 安装

```bash
npm install vue3-cron-selector
# 或
pnpm add vue3-cron-selector
# 或
yarn add vue3-cron-selector
```

::: warning 对等依赖
本包要求 **`vue >= 3.5.0`**。日期字段使用 Vue 的 `useId()` 生成唯一的单选按钮组名，
而 `useId` 是 Vue 3.5 才引入的 API。
:::

## 快速开始

导入组件与样式文件，然后用 `v-model` 绑定表达式：

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

`v-model` 就是一个普通字符串，因此选择器可以直接接入任何已有表单、状态仓库或 URL
查询参数，无需适配层。输入非法时通过 `error` 事件上报而不会抛出异常，所以组件本身
不会让表单崩溃。

## 全局注册

如果希望只注册一次，默认导出本身就是一个 Vue 插件：

```ts
import { createApp } from 'vue'
import Vue3CronSelector from 'vue3-cron-selector'
import 'vue3-cron-selector/style.css'

const app = createApp(App)
app.use(Vue3CronSelector)
```

之后应用中的任何模板都可以直接使用 `<CronSelector>`。

## 选择模式

| 模式 | 适用场景 |
|------|----------|
| `inline`（默认） | 面板始终可见 —— 适合表达式是关注点的设置页、调度器和管理后台表单。 |
| `popover` | 用一个紧凑输入框显示当前表达式，聚焦时展开面板 —— 适合密集表单和表格内联编辑。 |

```vue
<CronSelector v-model="cron" mode="popover" />
```

## 下一步

- [格式说明](/zh/guide/formats) —— 在 crontab、Quartz 和 Spring 之间选择。
- [属性与事件](/zh/guide/props-events) —— 完整的组件 API。
- [组合式函数](/zh/guide/composables) —— 用同一套内核构建自己的界面。
- [在线演示](/zh/demo/) —— 交互式体验全部模式。
