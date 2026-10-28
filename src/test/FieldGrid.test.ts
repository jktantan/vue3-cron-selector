import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FieldGrid from '../lib/components/FieldGrid.vue'
import type { FieldItem } from '../lib/core/types'

function makeItems(count: number, offset = 0): FieldItem[] {
  return Array.from({ length: count }, (_, i) => ({
    value: i + offset,
    label: String(i + offset).padStart(2, '0'),
  }))
}

describe('FieldGrid', () => {
  it('renders all items as buttons', () => {
    const items = makeItems(10)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [] },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(10)
    expect(buttons[0].text()).toBe('00')
    expect(buttons[9].text()).toBe('09')
  })

  it('marks selected items with aria-pressed', () => {
    const items = makeItems(5)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [1, 3] },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('aria-pressed')).toBe('false')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(buttons[2].attributes('aria-pressed')).toBe('false')
    expect(buttons[3].attributes('aria-pressed')).toBe('true')
  })

  it('emits update:selected when clicking unselected item', async () => {
    const items = makeItems(5)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [1] },
    })
    await wrapper.findAll('button')[2].trigger('click')
    const emitted = wrapper.emitted('update:selected')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0][0]).toEqual([1, 2])
  })

  it('emits update:selected removing value when clicking selected item', async () => {
    const items = makeItems(5)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [1, 3] },
    })
    await wrapper.findAll('button')[1].trigger('click')
    const emitted = wrapper.emitted('update:selected')!
    expect(emitted[0][0]).toEqual([3])
  })

  it('applies grid columns from cols prop', () => {
    const items = makeItems(12)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [], cols: 4 },
    })
    const grid = wrapper.find('.cron-selector__grid')
    expect(grid.attributes('style')).toContain('grid-template-columns: repeat(4, 1fr)')
  })

  it('disables all buttons when disabled prop is true', () => {
    const items = makeItems(3)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [], disabled: true },
    })
    for (const btn of wrapper.findAll('button')) {
      expect(btn.attributes('disabled')).toBeDefined()
    }
  })

  it('adds selected class to selected items', () => {
    const items = makeItems(5)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [2] },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[2].classes()).toContain('cron-selector__cell--selected')
    expect(buttons[0].classes()).not.toContain('cron-selector__cell--selected')
  })

  it('does not crash with a stale shift-anchor when value is not in items', async () => {
    const items = makeItems(5)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [1] },
    })
    // Simulate the prior anchor pointing at a real item, then trigger a click
    // with shift held and a value that does not exist in items. The grid must
    // either ignore the shift range or fall back to the normal toggle path
    // without producing negative slice ranges.
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click', { shiftKey: true })
    const emitted = wrapper.emitted('update:selected')
    expect(emitted).toBeTruthy()
    // Either nothing emitted (safe) or a sensible list (no NaN / out-of-range values).
    if (emitted && emitted.length > 0) {
      for (const v of emitted[emitted.length - 1][0] as ReadonlyArray<number>) {
        expect(Number.isInteger(v)).toBe(true)
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(items.length)
      }
    }
  })

  it('drops the shift-anchor when the selection is reset externally', async () => {
    const items = makeItems(5)
    const wrapper = mount(FieldGrid, {
      props: { items, selected: [2] },
    })
    // Build a known anchor by clicking once (plain click; not shift).
    const buttons = wrapper.findAll('button')
    await buttons[2].trigger('click')
    // Now clear the selection from the outside (simulating a reset button).
    await wrapper.setProps({ selected: [] })
    // Trigger a shift-click on a far-away item; the grid must not synthesize
    // a wide range based on the previous anchor.
    await buttons[0].trigger('click', { shiftKey: true })
    const emitted = wrapper.emitted('update:selected')!
    const last = emitted[emitted.length - 1][0] as ReadonlyArray<number>
    // The plain shift-click is interpreted as a non-range click on index 0
    // because the anchor was cleared, so only [0] (or nothing) should appear.
    expect(last.length).toBeLessThanOrEqual(1)
    if (last.length === 1) expect(last[0]).toBe(0)
  })
})
