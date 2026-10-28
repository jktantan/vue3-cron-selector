import type { ComputedRef, InjectionKey } from 'vue'

/** Theme selector exposed as the `theme` prop. */
export type CronTheme = 'light' | 'dark' | 'auto'

/**
 * `null` means "inherit": the component follows the document convention —
 * Element Plus' `html.dark` class — instead of pinning a palette.
 */
export type ResolvedCronTheme = 'light' | 'dark' | null

/**
 * Provided by CronSelector and injected by teleported panels (CronPopover's
 * panel and InlineSelect's dropdown) so they receive the same explicit theme
 * modifier as the component root.
 */
export const CronThemeKey: InjectionKey<ComputedRef<ResolvedCronTheme>> = Symbol('cronTheme')

/** Inline custom properties generated from the `primaryColor` prop. */
export type CronThemeStyle = Record<string, string>

/**
 * Provided by CronSelector and injected by teleported panels so a custom
 * primary colour reaches elements that live outside the component subtree.
 */
export const CronThemeStyleKey: InjectionKey<ComputedRef<CronThemeStyle>> = Symbol('cronThemeStyle')
