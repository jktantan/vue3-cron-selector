# 主题定制

组件中所有颜色、间距与动效值都是定义在 `:root` 上的 CSS 自定义属性。在自己的样式表里
覆盖即可 —— 无需构建步骤、无需编译 Sass、也无需层层传递 props。

```css
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}
```

上面是一段覆盖示例；本包实际发布的默认值见下表。

## 颜色变量

| 变量 | 默认值 |
|------|--------|
| `--cron-color-primary` | `#4f46e5` |
| `--cron-color-primary-hover` | `#4338ca` |
| `--cron-color-primary-light` | `#eef2ff` |
| `--cron-color-text` | `#1f2937` |
| `--cron-color-text-secondary` | `#6b7280` |
| `--cron-color-border` | `#d1d5db` |
| `--cron-color-border-focus` | `#4f46e5` |
| `--cron-color-bg` | `#ffffff` |
| `--cron-color-bg-hover` | `#f9fafb` |
| `--cron-color-bg-selected` | `#eef2ff` |
| `--cron-color-error` | `#dc2626` |
| `--cron-color-error-light` | `#fef2f2` |

## 字体变量

| 变量 | 默认值 |
|------|--------|
| `--cron-font-family` | `system-ui, -apple-system, sans-serif` |
| `--cron-font-size-sm` | `0.75rem` |
| `--cron-font-size-base` | `0.875rem` |
| `--cron-font-size-lg` | `1rem` |
| `--cron-line-height` | `1.5` |

## 间距变量

| 变量 | 默认值 |
|------|--------|
| `--cron-spacing-xs` | `0.25rem` |
| `--cron-spacing-sm` | `0.5rem` |
| `--cron-spacing-md` | `0.75rem` |
| `--cron-spacing-lg` | `1rem` |
| `--cron-spacing-xl` | `1.5rem` |

## 形状变量

| 变量 | 默认值 |
|------|--------|
| `--cron-border-radius` | `0.375rem` |
| `--cron-border-radius-lg` | `0.5rem` |
| `--cron-border-width` | `1px` |

## 动效变量

| 变量 | 默认值 |
|------|--------|
| `--cron-transition-duration` | `150ms` |
| `--cron-transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |

## 布局变量

| 变量 | 默认值 |
|------|--------|
| `--cron-panel-max-height` | `500px` |
| `--cron-popover-max-width` | `680px` |
| `--cron-popover-z-index` | `1000` |
| `--cron-body-min-height` | `280px` |
| `--cron-tab-height` | `2.5rem` |
| `--cron-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--cron-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `--cron-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |

## 暗色主题示例

这些变量就是普通的自定义属性，因此在任意祖先元素上加一个类就足够了：

```css
.dark {
  --cron-color-primary: #818cf8;
  --cron-color-primary-hover: #6366f1;
  --cron-color-primary-light: rgba(99, 102, 241, 0.15);
  --cron-color-text: #f3f4f6;
  --cron-color-text-secondary: #9ca3af;
  --cron-color-border: #374151;
  --cron-color-border-focus: #818cf8;
  --cron-color-bg: #1f2937;
  --cron-color-bg-hover: #111827;
  --cron-color-bg-selected: rgba(99, 102, 241, 0.15);
  --cron-color-error: #f87171;
  --cron-color-error-light: rgba(248, 113, 113, 0.1);
  --cron-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --cron-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --cron-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
}
```

## CSS 类名

如果变量还不够，每个元素也带有可精确命中的 BEM 类名，全部以 `cron-` 为前缀。

| 元素 | 类名 |
|------|------|
| 根元素 | `.cron-selector`、`.cron-selector--disabled` |
| 标签栏 | `.cron-tabs`、`.cron-tabs__tab`、`.cron-tabs__tab--active` |
| 面板 | `.cron-tabbed-panel`、`.cron-tabbed-panel__body` |
| 字段区 | `.cron-tabbed-panel__field` |
| 预览区 | `.cron-tabbed-panel__preview` |
| 表达式底栏 | `.cron-tabbed-panel__expression` |
| 表达式文本 | `.cron-tabbed-panel__expression-text`、`.cron-tabbed-panel__expression-text--error` |
| 表达式错误信息 | `.cron-tabbed-panel__expression-error` |
| 弹出层容器 | `.cron-popover` |
| 弹出层输入框 | `.cron-popover__input`、`.cron-popover__input--error` |
| 弹出层错误信息 | `.cron-popover__error` |
| 弹出层面板 | `.cron-popover__panel` |
| 单选项列表（字段 / 日期） | `.cron-day-field`、`.cron-day-field__options` |
| 单选项 | `.cron-day-field__option`、`.cron-day-field__option--active` |
| 单选项文本 | `.cron-day-field__option-text` |
| 单选项子内容 | `.cron-day-field__sub-content` |
| 单选项行内标签 | `.cron-day-field__inline-label` |
| 网格 | `.cron-grid` |
| 网格单元 | `.cron-grid__cell`、`.cron-grid__cell--selected`、`.cron-grid__cell--disabled` |
| 内联选择器 | `.cron-inline-select` |
| 内联选择器触发器 | `.cron-inline-select__trigger`、`.cron-inline-select__trigger--open` |
| 内联选择器下拉框 | `.cron-inline-select__dropdown` |
| 内联选择器选项 | `.cron-inline-select__option`、`.cron-inline-select__option--selected`、`.cron-inline-select__option--highlighted` |
| 数字微调器 | `.cron-number-spinner` |
| 微调按钮 | `.cron-number-spinner__btn` |
| 微调输入框 | `.cron-number-spinner__input` |
| 执行预览 | `.cron-preview`、`.cron-preview__header`、`.cron-preview__list` |
| 预览项 | `.cron-preview__item` |
| 行内错误文本 | `.cron-error` |
| 图标 | `.cron-icon`、`.cron-icon--chevron`、`.cron-icon--chevron-up` |
