# 工具函数

解析与序列化的内核以普通函数形式导出，无需挂载任何组件即可复用。

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

| 函数 | 签名 | 说明 |
|------|------|------|
| `parseCronExpression` | `(expression: string, format: CronFormat) => ParsedCron` | 把整条表达式解析为段映射。**不会抛出异常** —— 失败信息通过 `ParsedCron.error` 返回。 |
| `parseCronField` | `(fieldStr: string, field: FieldDefinition, format?: CronFormat) => Segment` | 按字段定义解析单个字段，例如 `'*/5'`。非法输入会抛出异常。 |
| `selectedToSegment` | `(values: ReadonlyArray<number>, field: FieldDefinition) => Segment` | 把一组选中值转换为最紧凑的段：全选变为 `*`，等差序列变为步长，连续区间变为范围，其余变为组合段。 |
| `segmentsToString` | `(segments: ReadonlyMap<string, Segment>, format: CronFormat) => string` | 按该格式的字段顺序把段映射序列化回表达式。 |
| `getFormatConfig` | `(format: CronFormat) => FormatConfig` | 取得某方言的字段顺序、字段定义与默认表达式。 |
| `generateDescription` | `(parsed: ParsedCron, locale: LocaleDefinition) => string` | 为已解析的表达式生成人类可读描述。 |
| `resolveLocale` | `(code: string) => LocaleDefinition` | 查找内置语言：先精确匹配，再退回基础语言，最后退回英文。区域标签会保留在 `code` 中（如 `zh-TW`），供 Intl 使用。 |
| `getFieldValueLabel` | `(fieldId: string, value: number, locale: LocaleDefinition) => string` | 取得字段取值的显示标签：月份名、星期名，或补零后的数字。 |

## 完整示例

把表达式解析后再序列化回来：

```ts
import { parseCronExpression, segmentsToString } from 'vue3-cron-selector'

const parsed = parseCronExpression('*/5 9-17 * * 1-5', 'crontab')

if (parsed.error) {
  console.error(parsed.error)
} else {
  // 每个字段都可用，顺序与格式定义一致。
  console.log(parsed.segments.get('minute')?.toString()) // "*/5"

  // 对解析器已理解的内容，重新序列化是无损的。
  console.log(segmentsToString(parsed.segments, 'crontab')) // "*/5 9-17 * * 1-5"
}
```

## 导出的语言常量

两种内置语言也直接导出，便于在它们的基础上派生自定义语言：

```ts
import { EN_US_LOCALE, ZH_CN_LOCALE } from 'vue3-cron-selector'
```

## 其他具名导出

| 导出 | 类型 | 说明 |
|------|------|------|
| `CronSelector` | 组件 | 选择器本体 |
| `Vue3CronSelectorPlugin` | 插件（同时也是默认导出） | 通过 `app.use()` 全局注册 `<CronSelector>` |
| `FloatingPanelKey` | `InjectionKey<FloatingPanelHost>` | 内部桥接：让嵌套下拉框登记为弹出面板的一部分。为完整性而导出，通常无需使用。 |
