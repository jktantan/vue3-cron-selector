# 属性与事件

## 属性（Props）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | Cron 表达式，配合 `v-model` 使用 |
| `format` | `'crontab' \| 'quartz' \| 'spring'` | `'crontab'` | Cron 方言，详见[格式说明](/zh/guide/formats) |
| `locale` | `string \| LocaleDefinition` | `'en'` | 语言代码（`'en'`、`'zh'`）或自定义语言对象 |
| `disabled` | `boolean` | `false` | 禁用全部交互并使面板变暗 |
| `mode` | `'inline' \| 'popover'` | `'inline'` | 始终可见的面板，或聚焦后展开的输入框 |
| `previewCount` | `number` | `5` | 展示的后续执行时间数量 |
| `cols` | `Partial<Record<string, number>>` | — | 按字段覆盖网格列数 |

### 默认列数

网格会为该字段取值范围内的每个值绘制一个单元格，并按给定列数排布。`cols` 可以只传
字段 id 的任意子集：

| 字段 | 默认列数 |
|------|----------|
| `second` | 10 |
| `minute` | 10 |
| `hour` | 6 |
| `dayOfMonth` | 7 |
| `month` | 4 |
| `dayOfWeek` | 7 |
| `year` | 10 |

```vue
<!-- 分钟 6 列、小时 4 列，其余字段保持默认 -->
<CronSelector v-model="cron" :cols="{ minute: 6, hour: 4 }" />
```

## 事件（Events）

| 事件 | 载荷 | 说明 |
|------|------|------|
| `update:modelValue` | `string` | 表达式变化时触发，`v-model` 依赖它工作 |
| `change` | `string` | 与 `update:modelValue` 载荷相同，用于不适合写在计算属性 setter 里的副作用 |
| `error` | `string \| null` | 校验状态变化时触发：非法时为错误信息，重新合法时为 `null` |

```vue
<CronSelector
  v-model="cron"
  @change="(value) => save(value)"
  @error="(message) => (error = message)"
/>
```

推荐用 `error` 事件响应非法输入：解析永远不会从组件里抛出异常，因此
`@error` 收到 `null` 就可靠地意味着"当前表达式合法"。

## 刻意不提供插槽

组件没有插槽。如果你需要不同的排布 —— 自己的触发器、自己的布局、表格单元格渲染器 ——
请使用[组合式函数](/zh/guide/composables)，而不是去操作 DOM。
