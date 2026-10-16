# 组合式函数

组件本身只是两个导出组合式函数的薄视图。当你需要自定义触发器、自定义布局，或只想
拿到解析能力而不需要任何 UI 时，可以直接使用它们。

## `useCron`

管理一整条表达式：解析、序列化、校验、描述文案与下次执行预览。

```ts
import { useCron } from 'vue3-cron-selector'

const {
  cronString,     // Ref<string> — 当前表达式，可写
  segments,       // ComputedRef<ReadonlyMap<string, UseCronSegmentReturn>>
  formatConfig,   // ComputedRef<FormatConfig>
  period,         // Ref<PeriodId>
  description,    // ComputedRef<string> — 人类可读描述
  nextExecutions, // ComputedRef<ReadonlyArray<Date>> — 后续执行时间
  isValid,        // ComputedRef<boolean>
  error,          // ComputedRef<string | null>
  setCronString,  // (value: string) => void
  reset,          // () => void — 重置为该格式的默认表达式
} = useCron({
  modelValue: '*/5 * * * *', // 字符串或 Ref<string>
  format: 'crontab',         // CronFormat 或 Ref<CronFormat>
  locale: 'en',              // 字符串、LocaleDefinition，或二者的 Ref
  previewCount: 5,           // number 或 Ref<number>
})
```

每个选项都同时接受普通值与 `Ref`，因此当你把 `format`、`locale` 绑定到自己的状态时，
它们会保持响应式。

### `UseCronOptions`

| 选项 | 类型 | 默认值 |
|------|------|--------|
| `modelValue` | `string \| Ref<string>` | 该格式的默认表达式 |
| `format` | `CronFormat \| Ref<CronFormat>` | `'crontab'` |
| `locale` | `string \| LocaleDefinition \| Ref<...>` | `'en'` |
| `previewCount` | `number \| Ref<number>` | `5` |

### `UseCronReturn`

`cronString`、`segments`、`formatConfig`、`period`、`description`、`nextExecutions`、
`isValid`、`error`、`setCronString`、`reset` —— 即上面解构示例中列出的成员。

`nextExecutions` 由 [croner](https://github.com/hexagon/croner) 计算。Quartz 独有的
`L`、`L-n` 日形式在 croner 中并无对应写法，因此在计算预览前会被转换；若某个月不存在
偏移后的日期，则跳过该月，而不会回滚到上一个月。

## `useCronSegment`

管理单个字段。网格编辑器正是构建在它之上。

```ts
import { useCronSegment } from 'vue3-cron-selector'

const {
  fieldId,    // string — 字段 id，例如 'minute'
  field,      // FieldDefinition
  segment,    // Ref<Segment> — 结构化取值
  selected,   // Ref<ReadonlyArray<number>> — 展开后的数值
  cronString, // Ref<string> — 该字段的序列化结果，例如 '*/5'
  setSelected, // (values: ReadonlyArray<number>) => void
  setType,     // (type: SegmentType) => void
  setRange,    // (from: number, to: number) => void
  setStep,     // (base: number | '*', step: number) => void
  setCron,     // (cron: string) => void
  reset,       // () => void — 回到 '*'
} = useCronSegment({
  field: { id: 'minute', min: 0, max: 59, label: 'Minute' },
  initialCron: '*/5',
})
```

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `field` | `FieldDefinition` | — | 必填。要编辑的字段（`id`、`min`、`max`、`label`，可选 `altValues`） |
| `initialCron` | `string` | `'*'` | 该字段的初始表达式 |

### `SegmentType`

`setType` 可把字段切换为库支持的任一种段类型：

`'any'` · `'value'` · `'range'` · `'step'` · `'combined'` · `'noSpecific'` ·
`'lastDay'` · `'lastWeekday'` · `'nearestWeekday'` · `'lastWeekdayOfMonth'` ·
`'nthWeekday'`

其中 `lastDay`、`lastWeekday`、`nearestWeekday`、`lastWeekdayOfMonth`、
`nthWeekday` 为 Quartz 专有，在 crontab 模式下会被隐藏。

## 构建一个最小编辑器

```vue
<script setup>
import { ref, watch } from 'vue'
import { useCron } from 'vue3-cron-selector'

const { cronString, description, nextExecutions, isValid } = useCron({
  modelValue: ref('0 9 * * 1-5'),
  locale: 'zh',
})

const draft = ref(cronString.value)
watch(draft, (value) => (cronString.value = value))
</script>

<template>
  <input v-model="draft" />
  <p v-if="isValid">{{ description }}</p>
  <ul v-else>
    <li>表达式非法</li>
  </ul>
  <ul>
    <li v-for="run in nextExecutions" :key="run.toISOString()">
      {{ run.toLocaleString() }}
    </li>
  </ul>
</template>
```
