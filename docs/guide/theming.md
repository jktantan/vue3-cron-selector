# Theming

Every colour, spacing and motion value in the component is a CSS custom property
defined on `:root`. Override them from your own stylesheet — no build step, no
Sass compilation and no prop drilling required.

```css
:root {
  --cron-color-primary: #2563eb;
  --cron-color-primary-hover: #1d4ed8;
  --cron-color-primary-light: #dbeafe;
}
```

The values above are an example override; the shipped defaults are listed below.

## Colour variables

| Variable | Default |
|----------|---------|
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

## Typography variables

| Variable | Default |
|----------|---------|
| `--cron-font-family` | `system-ui, -apple-system, sans-serif` |
| `--cron-font-size-sm` | `0.75rem` |
| `--cron-font-size-base` | `0.875rem` |
| `--cron-font-size-lg` | `1rem` |
| `--cron-line-height` | `1.5` |

## Spacing variables

| Variable | Default |
|----------|---------|
| `--cron-spacing-xs` | `0.25rem` |
| `--cron-spacing-sm` | `0.5rem` |
| `--cron-spacing-md` | `0.75rem` |
| `--cron-spacing-lg` | `1rem` |
| `--cron-spacing-xl` | `1.5rem` |

## Shape variables

| Variable | Default |
|----------|---------|
| `--cron-border-radius` | `0.375rem` |
| `--cron-border-radius-lg` | `0.5rem` |
| `--cron-border-width` | `1px` |

## Motion variables

| Variable | Default |
|----------|---------|
| `--cron-transition-duration` | `150ms` |
| `--cron-transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |

## Layout variables

| Variable | Default |
|----------|---------|
| `--cron-panel-max-height` | `500px` |
| `--cron-popover-max-width` | `680px` |
| `--cron-popover-z-index` | `1000` |
| `--cron-body-min-height` | `280px` |
| `--cron-tab-height` | `2.5rem` |
| `--cron-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--cron-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `--cron-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |

## Dark theme example

The variables are plain custom properties, so a class on any ancestor is enough:

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

## CSS class names

If a variable is not enough, every element also carries a BEM class name you can
target. All names are prefixed with `cron-`.

| Element | Class |
|---------|-------|
| Root | `.cron-selector`, `.cron-selector--disabled` |
| Tab bar | `.cron-tabs`, `.cron-tabs__tab`, `.cron-tabs__tab--active` |
| Panel | `.cron-tabbed-panel`, `.cron-tabbed-panel__body` |
| Field area | `.cron-tabbed-panel__field` |
| Preview area | `.cron-tabbed-panel__preview` |
| Expression footer | `.cron-tabbed-panel__expression` |
| Expression text | `.cron-tabbed-panel__expression-text`, `.cron-tabbed-panel__expression-text--error` |
| Expression error message | `.cron-tabbed-panel__expression-error` |
| Popover wrapper | `.cron-popover` |
| Popover input | `.cron-popover__input`, `.cron-popover__input--error` |
| Popover error message | `.cron-popover__error` |
| Popover panel | `.cron-popover__panel` |
| Option list (field / day) | `.cron-day-field`, `.cron-day-field__options` |
| Option | `.cron-day-field__option`, `.cron-day-field__option--active` |
| Option text | `.cron-day-field__option-text` |
| Option sub-content | `.cron-day-field__sub-content` |
| Option inline label | `.cron-day-field__inline-label` |
| Grid | `.cron-grid` |
| Grid cell | `.cron-grid__cell`, `.cron-grid__cell--selected`, `.cron-grid__cell--disabled` |
| Inline select | `.cron-inline-select` |
| Inline select trigger | `.cron-inline-select__trigger`, `.cron-inline-select__trigger--open` |
| Inline select dropdown | `.cron-inline-select__dropdown` |
| Inline select option | `.cron-inline-select__option`, `.cron-inline-select__option--selected`, `.cron-inline-select__option--highlighted` |
| Number spinner | `.cron-number-spinner` |
| Spinner button | `.cron-number-spinner__btn` |
| Spinner input | `.cron-number-spinner__input` |
| Preview | `.cron-preview`, `.cron-preview__header`, `.cron-preview__list` |
| Preview item | `.cron-preview__item` |
| Inline error text | `.cron-error` |
| Icon | `.cron-icon`, `.cron-icon--chevron`, `.cron-icon--chevron-up` |
