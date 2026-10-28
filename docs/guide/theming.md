# Theming

The component is styled with a single BEM block, `cron-selector`, and every
visual value is a CSS custom property. Two layers make it easy to fit into an
existing design system:

1. **Element Plus alignment.** Every `--cron-*` token resolves to the matching
   `--el-*` variable first, with an Element Plus default as the fallback. In an
   Element Plus application the selector automatically follows your primary
   colour, border colours, typography, radius and dark mode — no extra config.
2. **Stable BEM classes.** Classes never change shape between versions, so a
   consumer stylesheet can target any element directly.

No Sass compilation is required on the consumer side. Styles are a separate
entry point — the JS bundle does **not** inject CSS, so load them explicitly:

```ts
import 'vue3-cron-selector/style.css'
```

## Quick start

```vue
<!-- Inherit the document / Element Plus theme (default) -->
<CronSelector v-model="cron" theme="auto" />

<!-- Force a palette for this instance -->
<CronSelector v-model="cron" theme="dark" />
<CronSelector v-model="cron" theme="light" />
```

| Prop | Type | Default | Behaviour |
|------|------|---------|-----------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | `auto` follows the `html.dark` convention; `light` / `dark` pin the palette for this instance |

## Custom primary colour

Pass any CSS colour as `primaryColor`; the hover, tint and border shades are
derived from it. They are mixed against the active surface colour, so the same
value works in both light and dark mode:

```vue
<CronSelector v-model="cron" primary-color="#16a34a" />
<CronSelector v-model="cron" primary-color="var(--brand-500)" />
```

The prop sets the whole primary token group on the component root and on its
teleported panels: `--cron-color-primary`, `--cron-color-primary-hover`,
`--cron-color-primary-light`, `--cron-color-primary-border`,
`--cron-color-bg-selected` and `--cron-color-border-focus`.

If you prefer plain CSS, override the whole primary group together — setting
only `--cron-color-primary` leaves the derived shades at the Element Plus
defaults:

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

## Dark mode

`theme="auto"` follows Element Plus' dark-mode convention: add the `dark` class
to `<html>` and every cron selector switches to the dark palette. With Element
Plus installed, this is the same switch you already use:

```ts
// Element Plus dark mode
document.documentElement.classList.toggle('dark')
```

```css
/* Element Plus dark variables */
@import 'element-plus/theme-chalk/dark/css-vars.css';
```

If Element Plus is **not** installed, the component ships its own dark palette
(see the fallback values below), so `html.dark` still works on its own.

An explicit `theme` wins over the document: placing `theme="light"` inside a
dark application keeps that single selector light.

## Overriding tokens

Tokens can be overridden globally, per container, or per component instance.
Values cascade like any CSS custom property:

```css
/* Whole application */
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}

/* A single form / page */
.my-scheduler {
  --cron-color-primary: #0f766e;
  --cron-color-primary-hover: #0d9488;
  --cron-color-primary-light: #ccfbf1;
}
```

When set on a container, the tokens also reach the popover panel and dropdown,
which are teleported to `<body>`: those panels carry their own copy of the
tokens (and the `cron-selector--light` / `cron-selector--dark` modifier when an
explicit `theme` is used), so they stay in sync with the instance that opened
them.

## Colour tokens

Every colour maps to an Element Plus variable when one exists.

| Token | Element Plus mapping | Fallback (light) | Fallback (dark) |
|-------|----------------------|------------------|-----------------|
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

## Typography, spacing and shape

| Token | Element Plus mapping | Fallback |
|-------|----------------------|----------|
| `--cron-font-family` | `--el-font-family` | Element Plus font stack |
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

## Motion and layout

| Token | Element Plus mapping | Fallback |
|-------|----------------------|----------|
| `--cron-transition-duration` | `--el-transition-duration` | `0.3s` |
| `--cron-transition-easing` | `--el-transition-function-ease-in-out-bezier` | `cubic-bezier(0.645, 0.045, 0.355, 1)` |
| `--cron-shadow-sm` | `--el-box-shadow-lighter` | `0 0 4px rgb(0 0 0 / 6%)` |
| `--cron-shadow-md` | `--el-box-shadow-light` | `0 0 12px rgb(0 0 0 / 12%)` |
| `--cron-shadow-lg` | `--el-box-shadow-light` | `0 0 12px rgb(0 0 0 / 12%)` |
| `--cron-panel-max-height` | — | `500px` |
| `--cron-popover-max-width` | — | `680px` |
| `--cron-popover-z-index` | — | `2000` |
| `--cron-body-min-height` | — | `288px` |

## BEM class names

The component uses a single block, so every class is predictable and safe to
override. The BEM pattern is `cron-selector__element--modifier`.

| Element | Classes |
|---------|---------|
| Root | `.cron-selector`, `.cron-selector--disabled`, `.cron-selector--light`, `.cron-selector--dark` |
| Tab bar | `.cron-selector__tabs`, `.cron-selector__tab`, `.cron-selector__tab--active` |
| Panel | `.cron-selector__panel`, `.cron-selector__panel-body`, `.cron-selector__panel-field`, `.cron-selector__panel-preview` |
| Expression footer | `.cron-selector__expression`, `.cron-selector__expression-text`, `.cron-selector__expression-text--error`, `.cron-selector__expression-error` |
| Popover wrapper | `.cron-selector__popover` |
| Popover input | `.cron-selector__input`, `.cron-selector__input--error` |
| Popover error message | `.cron-selector__error` |
| Popover panel (teleported) | `.cron-selector__popover-panel` |
| Option list | `.cron-selector__field`, `.cron-selector__options` |
| Option row | `.cron-selector__option`, `.cron-selector__option--active`, `.cron-selector__option-text` |
| Option sub-content | `.cron-selector__sub-content`, `.cron-selector__inline-label` |
| Grid | `.cron-selector__grid` |
| Grid cell | `.cron-selector__cell`, `.cron-selector__cell--selected`, `.cron-selector__cell--disabled` |
| Inline select | `.cron-selector__select`, `.cron-selector__select-trigger`, `.cron-selector__select-trigger--open` |
| Inline select dropdown (teleported) | `.cron-selector__select-dropdown` |
| Inline select option | `.cron-selector__select-option`, `.cron-selector__select-option--selected`, `.cron-selector__select-option--highlighted` |
| Number spinner | `.cron-selector__spinner`, `.cron-selector__spinner-btn`, `.cron-selector__spinner-input` |
| Execution preview | `.cron-selector__preview`, `.cron-selector__preview-header`, `.cron-selector__preview-list`, `.cron-selector__preview-item` |
| Icon | `.cron-selector__icon`, `.cron-selector__icon--chevron`, `.cron-selector__icon--chevron-up` |

Because there is no descendant scoping, a single rule is enough to restyle an
element:

```css
/* Rounded, Element Plus-like buttons */
.cron-selector__cell {
  border-radius: 2px;
}

/* Highlight selected cells in your brand colour */
.cron-selector__cell--selected {
  background: #16a34a;
  border-color: #16a34a;
}
```

The popover panel and inline-select dropdown are teleported to `<body>`. Scope
overrides for them from a global stylesheet (or target the panel class directly
rather than a parent container):

```css
.cron-selector__popover-panel {
  border-radius: 8px;
}
```
