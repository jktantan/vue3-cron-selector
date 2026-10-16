---
title: 在线演示
---

# 在线演示

本页每一个选择器都是真实的 `CronSelector` 组件，直接从 `src/lib` 引入 —— 与 npm 上
发布的代码完全一致。修改表达式后，下方"下次执行时间"会同步更新。

用上面的语言按钮即可把本页所有选择器在中文与英文之间切换 —— 它切换的就是你在自己项目里
绑定的那个 `locale` 属性。

<script setup>
import { ref } from 'vue'
import { CronSelector } from 'vue3-cron-selector'

const crontabValue = ref('*/5 * * * *')
const quartzValue = ref('0 0 9 * * ? *')
const springValue = ref('0 */30 9-17 * * MON-FRI')
const popoverValue = ref('0 12 * * *')
const columnsValue = ref('0 0 * * *')

const locale = ref('zh')
const disabled = ref(false)
</script>

<div class="demo-toolbar">
  <button type="button" @click="locale = locale === 'zh' ? 'en' : 'zh'">
    语言：{{ locale }}
  </button>
  <label>
    <input v-model="disabled" type="checkbox" />
    禁用
  </label>
</div>

## crontab（5 位），内联模式

<ClientOnly>
  <div class="demo-block">
    <CronSelector
      v-model="crontabValue"
      format="crontab"
      :locale="locale"
      :disabled="disabled"
    />
  </div>
  <p class="demo-value">v-model：<code>{{ crontabValue }}</code></p>
</ClientOnly>

## Quartz（7 位，年份可省略）

<ClientOnly>
  <div class="demo-block">
    <CronSelector v-model="quartzValue" format="quartz" :locale="locale" :disabled="disabled" />
  </div>
  <p class="demo-value">v-model：<code>{{ quartzValue }}</code></p>
</ClientOnly>

## Spring（6 位），使用星期别名

<ClientOnly>
  <div class="demo-block">
    <CronSelector v-model="springValue" format="spring" :locale="locale" :disabled="disabled" />
  </div>
  <p class="demo-value">v-model：<code>{{ springValue }}</code></p>
</ClientOnly>

## 弹出模式

<ClientOnly>
  <div class="demo-block">
    <CronSelector
      v-model="popoverValue"
      format="crontab"
      mode="popover"
      :locale="locale"
      :disabled="disabled"
    />
  </div>
  <p class="demo-value">v-model：<code>{{ popoverValue }}</code></p>
</ClientOnly>

## 自定义网格列数

`cols` 覆盖每个字段绘制多少列网格。下面把 `minute` 设为 6 列、`hour` 设为 4 列（默认为
10 和 6）。

<ClientOnly>
  <div class="demo-block">
    <CronSelector
      v-model="columnsValue"
      format="crontab"
      :locale="locale"
      :disabled="disabled"
      :cols="{ minute: 6, hour: 4 }"
    />
  </div>
  <p class="demo-value">v-model：<code>{{ columnsValue }}</code></p>
</ClientOnly>

<style>
.demo-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.demo-block {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}

.demo-value code {
  word-break: break-all;
}
</style>
