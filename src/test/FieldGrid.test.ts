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
    const grid = wrapper.find('.cron-grid')
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
    expect(buttons[2].classes()).toContain('cron-grid__cell--selected')
    expect(buttons[0].classes()).not.toContain('cron-grid__cell--selected')
  })
})
