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
    expect(
      wrapper
        .findAll('.cron-day-field__option input[type="radio"]')
        .every((radio) => radio.attributes('disabled') !== undefined),
    ).toBe(true)
  })

  it('disables day option radios on the day tab', async () => {
    const wrapper = mount(CronSelector)
    await wrapper.findAll('.cron-tabs__tab')[2].trigger('click')
    await wrapper.setProps({ disabled: true })
    expect(
      wrapper
        .findAll('.cron-day-field__option input[type="radio"]')
        .every((radio) => radio.attributes('disabled') !== undefined),
    ).toBe(true)
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

  it('allows mouse focus inside the popover panel', async () => {
    const wrapper = mount(CronSelector, { props: { mode: 'popover' } })
    await wrapper.find('.cron-popover__input').trigger('focus')
    const panel = document.querySelector('.cron-popover__panel')!
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    panel.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('closes the popover when Escape is pressed from inside the panel', async () => {
    const wrapper = mount(CronSelector, {
      props: { mode: 'popover', modelValue: '* * * * *' },
    })
    // Trigger focus on the input to open the popover. Use the underlying input
    // element so the focus event reaches the host listener.
    const inputEl = wrapper.find('input').element as HTMLInputElement
    inputEl.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.querySelector('.cron-popover__panel')).toBeTruthy()
    // Fire Escape on document since the popover listens there. This simulates
    // the user having tabbed focus into a control inside the panel.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.querySelector('.cron-popover__panel')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders field options for the active tab', () => {
    const wrapper = mount(CronSelector)
    expect(wrapper.find('.cron-day-field').exists()).toBe(true)
    expect(wrapper.find('.cron-day-field__options').exists()).toBe(true)
  })

  it('hides Quartz-only day options in crontab mode', async () => {
    const wrapper = mount(CronSelector, {
      props: { format: 'crontab' },
    })
    await wrapper.findAll('.cron-tabs__tab')[2].trigger('click')
    const quartzOnlyValues = ['lastDay', 'lastWeekday', 'lastWeekdayOfMonth', 'lastDayOffset', 'nearestWeekday', 'nthWeekday']
    const radios = wrapper.findAll('.cron-day-field__option input[type="radio"]')
    const foundValues = radios.map((r) => r.attributes('value'))
    for (const value of quartzOnlyValues) {
      expect(foundValues, `radio ${value} should be hidden in crontab`).not.toContain(value)
    }
  })

  it('shows Quartz-only day options in quartz mode', async () => {
    const wrapper = mount(CronSelector, {
      props: { format: 'quartz' },
    })
    await wrapper.findAll('.cron-tabs__tab')[3].trigger('click')
    const quartzOnlyValues = ['lastDay', 'lastWeekday', 'lastWeekdayOfMonth', 'lastDayOffset', 'nearestWeekday', 'nthWeekday']
    const radios = wrapper.findAll('.cron-day-field__option input[type="radio"]')
    const foundValues = radios.map((r) => r.attributes('value'))
    for (const value of quartzOnlyValues) {
      expect(foundValues, `radio ${value} should be visible in quartz`).toContain(value)
      const radio = radios.find((r) => r.attributes('value') === value)
      expect(radio!.attributes('disabled'), `radio ${value} should be enabled in quartz`).toBeUndefined()
    }
  })
})
