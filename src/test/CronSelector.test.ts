import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CronSelector from '../lib/components/CronSelector.vue'

describe('CronSelector', () => {
  it('renders with default props', () => {
    const wrapper = mount(CronSelector)
    expect(wrapper.find('.cron-selector').exists()).toBe(true)
    expect(wrapper.find('.cron-tabbed-panel').exists()).toBe(true)
  })

  it('renders tab bar with crontab fields (merged day tab)', () => {
    const wrapper = mount(CronSelector)
    const tabs = wrapper.findAll('.cron-tabs__tab')
    expect(tabs).toHaveLength(4)
  })

  it('renders tab bar with quartz fields (merged day tab)', () => {
    const wrapper = mount(CronSelector, {
      props: { format: 'quartz' },
    })
    const tabs = wrapper.findAll('.cron-tabs__tab')
    expect(tabs).toHaveLength(6)
  })

  it('displays expression in the bottom bar', () => {
    const wrapper = mount(CronSelector, {
      props: { modelValue: '*/5 * * * *' },
    })
    const expr = wrapper.find('.cron-tabbed-panel__expression-text')
    expect(expr.exists()).toBe(true)
    expect(expr.text()).toBe('*/5 * * * *')
  })

  it('emits update:modelValue when expression changes', async () => {
    const wrapper = mount(CronSelector, {
      props: { modelValue: '* * * * *' },
    })
    const radios = wrapper.findAll('.cron-day-field__option input[type="radio"]')
    const stepRadio = radios.find((r) => r.attributes('value') === 'step')
    if (stepRadio) {
      await stepRadio.setValue(true)
    }
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
  })

  it('shows error styling for invalid expression', () => {
    const wrapper = mount(CronSelector, {
      props: { modelValue: '* * *' },
    })
    expect(wrapper.find('.cron-tabbed-panel__expression-text--error').exists()).toBe(true)
  })

  it('applies disabled class when disabled', () => {
    const wrapper = mount(CronSelector, {
      props: { disabled: true },
    })
    expect(wrapper.find('.cron-selector--disabled').exists()).toBe(true)
  })

  it('renders tabbed panel in inline mode by default', () => {
    const wrapper = mount(CronSelector)
    expect(wrapper.find('.cron-tabbed-panel').exists()).toBe(true)
    expect(wrapper.find('.cron-popover').exists()).toBe(false)
  })

  it('renders popover in popover mode', () => {
    const wrapper = mount(CronSelector, {
      props: { mode: 'popover' },
    })
    expect(wrapper.find('.cron-popover').exists()).toBe(true)
    expect(wrapper.find('.cron-popover__input').exists()).toBe(true)
  })

  it('popover input shows the cron expression', () => {
    const wrapper = mount(CronSelector, {
      props: { mode: 'popover', modelValue: '0 12 * * *' },
    })
    const input = wrapper.find('.cron-popover__input')
    expect((input.element as HTMLInputElement).value).toBe('0 12 * * *')
  })

  it('renders field options for the active tab', () => {
    const wrapper = mount(CronSelector)
    expect(wrapper.find('.cron-day-field').exists()).toBe(true)
    expect(wrapper.find('.cron-day-field__options').exists()).toBe(true)
  })
})
