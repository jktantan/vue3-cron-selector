---
layout: home

hero:
  name: vue3-cron-selector
  text: 面向 Vue 3 的可视化 Cron 选择器
  tagline: crontab · Quartz · Spring —— 内联面板或弹出面板，零 UI 依赖
  image:
    src: /logo.svg
    alt: vue3-cron-selector
    width: 220
    height: 220
  actions:
    - theme: brand
      text: 快速上手
      link: /zh/guide/getting-started
    - theme: alt
      text: 在线演示
      link: /zh/demo/
    - theme: alt
      text: API 参考
      link: /zh/api/utilities

features:
  - title: 三种 Cron 方言
    details: crontab（5 位）、Spring（6 位）与 Quartz（7 位，年份可省略）共用同一个组件、同一个 v-model 和同一套校验流程。
  - title: 内联或弹出
    details: 把始终可见的面板嵌进表单，或切换到聚焦时展开的紧凑输入框。两种模式使用同一组 props。
  - title: 多语言
    details: 内置英文与中文语言包。传入完整的 LocaleDefinition 对象即可添加自己的语言，包括月份与星期名称。
  - title: 执行预览
    details: 基于 croner 计算后续执行时间并展示在编辑器下方，让用户立刻看到表达式的结果。
  - title: 可主题化
    details: 所有颜色、间距与动效值都是 CSS 自定义属性，直接在自己的样式表里覆盖，无需构建步骤。
  - title: 完整类型
    details: 使用 TypeScript 编写，并为组件、组合式函数以及全部导出类型生成声明文件。
---

## 安装

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

各项配置见[快速上手](/zh/guide/getting-started)，或打开[在线演示](/zh/demo/)体验全部模式。
