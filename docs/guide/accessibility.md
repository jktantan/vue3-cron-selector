# Accessibility & Positioning

## Keyboard navigation

| Area | Keys |
|------|------|
| Tab bar | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> to move between fields, <kbd>Home</kbd> / <kbd>End</kbd> to jump to the first or last |
| Grid cells | <kbd>Click</kbd> to toggle a value, <kbd>Shift</kbd>+<kbd>Click</kbd> to select the whole range from the last clicked cell |
| Inline select | <kbd>↑</kbd> <kbd>↓</kbd> to highlight, <kbd>Enter</kbd> / <kbd>Space</kbd> to choose, <kbd>Esc</kbd> to close |
| Number spinner | <kbd>↑</kbd> <kbd>↓</kbd> to increment and decrement |
| Popover | Focus the input to open the panel, <kbd>Esc</kbd> to close it |

The popover installs a document-level <kbd>Esc</kbd> handler while it is open, so the
panel closes no matter which inner control currently has focus.

## Roles and attributes

| Element | ARIA |
|---------|------|
| Tab bar | `role="tablist"`, tabs expose `aria-selected` |
| Grid cells | `<button>` with `aria-pressed` reflecting the selected state, plus a `title` with the value label |
| Field option lists | `role="radiogroup"` with real radio inputs, so screen readers announce each mode |
| Day-of-month option list | Radio inputs share a generated `name` from Vue's `useId()`, keeping groups unique when several selectors are on one page |
| Icons | `aria-hidden="true"` — they are decorative, the adjacent text carries the meaning |

Because the underlying controls are native buttons, radios and inputs, the component
works with the usual browser and assistive-technology navigation without extra
key handling.

## Responsive behaviour

The panel body is a CSS Grid. Below `640px`:

- the field/preview grid collapses to a single column
- the preview section moves below the editor and switches its divider from a left
  border to a top border
- the tab bar scrolls horizontally (`overflow-x: auto`) instead of squeezing the tabs

## Popover auto-positioning

The popover panel and the inline select dropdown measure the available viewport
space before they open:

| Behaviour | Rule |
|-----------|------|
| Vertical flip | If the panel is taller than the space below the trigger, and there is more room above, it opens upward |
| Horizontal shift | If the panel would overflow the right edge, it shifts left by the overflow amount |
| Boundary clamping | The panel never sits closer than `8px` to any viewport edge |
| Gap | `4px` between the trigger and the panel |
| Repositioning | Position is recalculated on window scroll and resize while the panel is open |

The calculation lives in `calcPlacement` and is exported from the package's source
for reuse; it takes the anchor rect, panel size and optional viewport size and
returns `{ top, left, flipUp }`.

## Reduced motion

Transitions use the `--cron-transition-duration` and `--cron-transition-easing`
custom properties. To respect a reduced-motion preference, set the duration to `0ms`
in your own stylesheet:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --cron-transition-duration: 0ms;
  }
}
```
