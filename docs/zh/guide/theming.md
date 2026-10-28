# 主题定制

组件使用单一的 BEM Block —— `cron-selector`，所有视觉值都是 CSS 自定义属性。两层设计
让它可以轻松融入现有设计系统：

1. **对齐 Element Plus。** 每个 `--cron-*` 令牌优先解析为对应的 `--el-*` 变量，并以
   Element Plus 的默认值作为回退。在 Element Plus 项目中，选择器会自动跟随你的主题色、
   边框色、字体、圆角与暗色模式，无需额外配置。
2. **稳定的 BEM 类名。** 类名在版本之间保持固定结构，第三方样式表可以直接覆盖任意元素。

使用方无需编译 Sass。样式是独立入口 —— JS bundle **不会**自动注入 CSS，需要显式引入：

```ts
import 'vue3-cron-selector/style.css'
```

## 快速开始

```vue
<!-- 跟随文档 / Element Plus 主题（默认） -->
<CronSelector v-model="cron" theme="auto" />

<!-- 为当前实例强制指定色调 -->
<CronSelector v-model="cron" theme="dark" />
<CronSelector v-model="cron" theme="light" />
```

| 属性 | 类型 | 默认值 | 行为 |
|------|------|--------|------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | `auto` 跟随 `html.dark` 约定；`light` / `dark` 为当前实例锁定色调 |

## 自定义主色

通过 `primaryColor` 传入任意 CSS 颜色，hover、浅色底与边框色会自动派生。派生色会与当前
表面色混合，因此同一个值在浅色和深色模式下都可用：

```vue
<CronSelector v-model="cron" primary-color="#16a34a" />
<CronSelector v-model="cron" primary-color="var(--brand-500)" />
```

该属性会在组件根节点和 Teleport 面板上设置整组主色令牌：
`--cron-color-primary`、`--cron-color-primary-hover`、
`--cron-color-primary-light`、`--cron-color-primary-border`、
`--cron-color-bg-selected`、`--cron-color-border-focus`。

如果更想用纯 CSS，请同时覆盖整组主色令牌 —— 只设置 `--cron-color-primary` 时，
派生色仍会保持 Element Plus 的默认主色：

```css
.my-scheduler {
  --cron-color-primary: #16a34a;
  --cron-color-primary-hover: #15803d;
  --cron-color-primary-light: #dcfce7;
  --cron-color-primary-border: #86efac;
  --cron-color-bg-selected: #dcfce7;
  --cron-color-border-focus: #16a34a;
}
```

## 暗色模式

`theme="auto"` 遵循 Element Plus 的暗色模式约定：给 `<html>` 添加 `dark` 类，所有
Cron 选择器都会切换到暗色调。如果已安装 Element Plus，这就是你正在使用的同一个开关：

```ts
// Element Plus 暗色模式
document.documentElement.classList.toggle('dark')
```

```css
/* Element Plus 暗色变量 */
@import 'element-plus/theme-chalk/dark/css-vars.css';
```

如果**没有**安装 Element Plus，组件自带完整的暗色调（见下方回退值），单独使用
`html.dark` 同样生效。

显式 `theme` 的优先级高于文档级设置：在暗色应用中给某个选择器设置 `theme="light"`，
它就会保持浅色。

## 覆盖令牌

令牌可以在全局、容器级或单个组件上覆盖。它们像普通 CSS 自定义属性一样级联：

```css
/* 整个应用 */
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}

/* 单个表单 / 页面 */
.my-scheduler {
  --cron-color-primary: #0f766e;
  --cron-color-primary-hover: #0d9488;
  --cron-color-primary-light: #ccfbf1;
}
```

设置容器级别的令牌会同时作用于弹出面板与下拉框：这两个元素被 teleport 到 `<body>`，
它们自身携带同一份令牌（显式 `theme` 时还会带上 `cron-selector--light` /
`cron-selector--dark` 修饰类），因此始终与打开它们的实例保持一致。

## 颜色令牌

每个颜色在有对应 Element Plus 变量时会自动映射。

| 令牌 | Element Plus 映射 | 回退值（浅色） | 回退值（深色） |
|------|-------------------|----------------|----------------|
| `--cron-color-primary` | `--el-color-primary` | `#409eff` | `#409eff` |
| `--cron-color-primary-hover` | `--el-color-primary-light-3` | `#79bbff` | `#3375b9` |
| `--cron-color-primary-light` | `--el-color-primary-light-9` | `#ecf5ff` | `#18222c` |
| `--cron-color-primary-border` | `--el-color-primary-light-5` | `#a0cfff` | `#2a598a` |
| `--cron-color-text` | `--el-text-color-primary` | `#303133` | `#e5eaf3` |
| `--cron-color-text-regular` | `--el-text-color-regular` | `#606266` | `#cfd3dc` |
| `--cron-color-text-secondary` | `--el-text-color-secondary` | `#909399` | `#a3a6ad` |
| `--cron-color-text-placeholder` | `--el-text-color-placeholder` | `#a8abb2` | `#8d9095` |
| `--cron-color-border` | `--el-border-color` | `#dcdfe6` | `#4c4d4f` |
| `--cron-color-border-light` | `--el-border-color-light` | `#e4e7ed` | `#414243` |
| `--cron-color-border-lighter` | `--el-border-color-lighter` | `#ebeef5` | `#363637` |
| `--cron-color-border-focus` | `--cron-color-primary` | `#409eff` | `#409eff` |
| `--cron-color-bg` | `--el-bg-color-overlay` | `#ffffff` | `#1d1e1f` |
| `--cron-color-bg-hover` | `--el-fill-color-light` | `#f5f7fa` | `#262727` |
| `--cron-color-bg-selected` | `--cron-color-primary-light` | `#ecf5ff` | `#18222c` |
| `--cron-color-fill` | `--el-fill-color-light` | `#f5f7fa` | `#262727` |
| `--cron-color-error` | `--el-color-danger` | `#f56c6c` | `#f56c6c` |
| `--cron-color-error-light` | `--el-color-danger-light-9` | `#fef0f0` | `#2b1d1d` |

## 字体、间距与形状

| 令牌 | Element Plus 映射 | 回退值 |
|------|-------------------|--------|
| `--cron-font-family` | `--el-font-family` | Element Plus 字体栈 |
| `--cron-font-size-sm` | `--el-font-size-small` | `13px` |
| `--cron-font-size-base` | `--el-font-size-base` | `14px` |
| `--cron-font-size-lg` | `--el-font-size-medium` | `16px` |
| `--cron-line-height` | — | `1.5` |
| `--cron-spacing-xs` | — | `4px` |
| `--cron-spacing-sm` | — | `8px` |
| `--cron-spacing-md` | — | `12px` |
| `--cron-spacing-lg` | — | `16px` |
| `--cron-spacing-xl` | — | `24px` |
| `--cron-border-radius` | `--el-border-radius-base` | `4px` |
| `--cron-border-radius-lg` | `--el-border-radius-base` | `4px` |
| `--cron-border-width` | — | `1px` |
| `--cron-control-height` | `--el-component-size` | `32px` |
| `--cron-grid-cell-height` | — | `28px` |
| `--cron-tab-height` | `--el-component-size-large` | `40px` |

## 动效与布局

| 令牌 | Element Plus 映射 | 回退值 |
|------|-------------------|--------|
| `--cron-transition-duration` | `--el-transition-duration` | `0.3s` |
| `--cron-transition-easing` | `--el-transition-function-ease-in-out-bezier` | `cubic-bezier(0.645, 0.045, 0.355, 1)` |
| `--cron-shadow-sm` | `--el-box-shadow-lighter` | `0 0 4px rgb(0 0 0 / 6%)` |
| `--cron-shadow-md` | `--el-box-shadow-light` | `0 0 12px rgb(0 0 0 / 12%)` |
| `--cron-shadow-lg` | `--el-box-shadow-light` | `0 0 12px rgb(0 0 0 / 12%)` |
| `--cron-panel-max-height` | — | `500px` |
| `--cron-popover-max-width` | — | `680px` |
| `--cron-popover-z-index` | — | `2000` |
| `--cron-body-min-height` | — | `288px` |

## BEM 类名

组件使用单一 Block，所有类名都可预测、可直接覆盖。BEM 结构为
`cron-selector__element--modifier`。

| 元素 | 类名 |
|------|------|
| 根节点 | `.cron-selector`、`.cron-selector--disabled`、`.cron-selector--light`、`.cron-selector--dark` |
| 标签栏 | `.cron-selector__tabs`、`.cron-selector__tab`、`.cron-selector__tab--active` |
| 面板 | `.cron-selector__panel`、`.cron-selector__panel-body`、`.cron-selector__panel-field`、`.cron-selector__panel-preview` |
| 表达式底栏 | `.cron-selector__expression`、`.cron-selector__expression-text`、`.cron-selector__expression-text--error`、`.cron-selector__expression-error` |
| 弹出层容器 | `.cron-selector__popover` |
| 输入框 | `.cron-selector__input`、`.cron-selector__input--error` |
| 输入错误提示 | `.cron-selector__error` |
| 弹出面板（teleport） | `.cron-selector__popover-panel` |
| 选项列表 | `.cron-selector__field`、`.cron-selector__options` |
| 选项行 | `.cron-selector__option`、`.cron-selector__option--active`、`.cron-selector__option-text` |
| 选项子内容 | `.cron-selector__sub-content`、`.cron-selector__inline-label` |
| 网格 | `.cron-selector__grid` |
| 网格单元格 | `.cron-selector__cell`、`.cron-selector__cell--selected`、`.cron-selector__cell--disabled` |
| 内嵌下拉框 | `.cron-selector__select`、`.cron-selector__select-trigger`、`.cron-selector__select-trigger--open` |
| 下拉面板（teleport） | `.cron-selector__select-dropdown` |
| 下拉选项 | `.cron-selector__select-option`、`.cron-selector__select-option--selected`、`.cron-selector__select-option--highlighted` |
| 数字步进器 | `.cron-selector__spinner`、`.cron-selector__spinner-btn`、`.cron-selector__spinner-input` |
| 执行时间预览 | `.cron-selector__preview`、`.cron-selector__preview-header`、`.cron-selector__preview-list`、`.cron-selector__preview-item` |
| 图标 | `.cron-selector__icon`、`.cron-selector__icon--chevron`、`.cron-selector__icon--chevron-up` |

由于没有后代作用域限制，一条规则就足以重写元素样式：

```css
/* 更接近 Element Plus 的圆角按钮 */
.cron-selector__cell {
  border-radius: 2px;
}

/* 用品牌色标记选中单元格 */
.cron-selector__cell--selected {
  background: #16a34a;
  border-color: #16a34a;
}
```

弹出面板与内嵌下拉框会被 teleport 到 `<body>`。对它们做覆盖时请使用全局样式表，
或直接以面板类名为目标（而不是父容器）：

```css
.cron-selector__popover-panel {
  border-radius: 8px;
}
```
