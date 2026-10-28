import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CronSelector from '../lib/components/CronSelector.vue'

describe('CronSelector', () => {
  it('renders with default props', () => {
    const wrapper = mount(CronSelector)
    expect(wrapper.find('.cron-selector').exists()).toBe(true)
    expect(wrapper.find('.cron-selector__panel').exists()).toBe(true)
  })

  it('renders tab bar with crontab fields (merged day tab)', () => {
    const wrapper = mount(CronSelector)
    const tabs = wrapper.findAll('.cron-selector__tab')
    expect(tabs).toHaveLength(4)
  })

  it('renders tab bar with quartz fields (merged day tab)', () => {
    const wrapper = mount(CronSelector, {
      props: { format: 'quartz' },
    })
    const tabs = wrapper.findAll('.cron-selector__tab')
    expect(tabs).toHaveLength(6)
  })

  it('displays expression in the bottom bar', () => {
    const wrapper = mount(CronSelector, {
      props: { modelValue: '*/5 * * * *' },
    })
    const expr = wrapper.find('.cron-selector__expression-text')
    expect(expr.exists()).toBe(true)
    expect(expr.text()).toBe('*/5 * * * *')
  })

  it('emits update:modelValue when expression changes', async () => {
    const wrapper = mount(CronSelector, {
      props: { modelValue: '* * * * *' },
    })
    const radios = wrapper.findAll('.cron-selector__option input[type="radio"]')
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
    expect(wrapper.find('.cron-selector__expression-text--error').exists()).toBe(true)
  })

  it('applies disabled class when disabled', () => {
    const wrapper = mount(CronSelector, {
      props: { disabled: true },
    })
    expect(wrapper.find('.cron-selector--disabled').exists()).toBe(true)
    expect(
      wrapper
        .findAll('.cron-selector__option input[type="radio"]')
        .every((radio) => radio.attributes('disabled') !== undefined),
    ).toBe(true)
  })

  it('applies explicit theme modifiers and clears them for auto', async () => {
    const wrapper = mount(CronSelector, { props: { theme: 'dark' } })
    const root = wrapper.find('.cron-selector')
    expect(root.classes()).toContain('cron-selector--dark')

    await wrapper.setProps({ theme: 'light' })
    expect(root.classes()).toContain('cron-selector--light')
    expect(root.classes()).not.toContain('cron-selector--dark')

    await wrapper.setProps({ theme: 'auto' })
    expect(root.classes()).not.toContain('cron-selector--light')
    expect(root.classes()).not.toContain('cron-selector--dark')
  })

  it('carries the explicit theme into the teleported popover panel', async () => {
    const wrapper = mount(CronSelector, {
      props: { mode: 'popover', theme: 'dark' },
    })
    const inputEl = wrapper.find('input').element as HTMLInputElement
    inputEl.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    await wrapper.vm.$nextTick()

    const panel = document.querySelector('.cron-selector__popover-panel')!
    expect(panel.classList.contains('cron-selector--dark')).toBe(true)
    wrapper.unmount()
  })

  it('applies a custom primary colour as derived CSS variables', () => {
    const wrapper = mount(CronSelector, {
      props: { primaryColor: '#16a34a' },
    })
    const style = wrapper.find('.cron-selector').attributes('style') ?? ''
    expect(style).toContain('--cron-color-primary: #16a34a')
    expect(style).toContain('--cron-color-primary-hover: color-mix(')
    expect(style).toContain('--cron-color-primary-light: color-mix(')
    expect(style).toContain('--cron-color-primary-border: color-mix(')
    expect(style).toContain('--cron-color-bg-selected: color-mix(')
    expect(style).toContain('--cron-color-border-focus: #16a34a')
  })

  it('carries a custom primary colour into the teleported popover panel', async () => {
    const wrapper = mount(CronSelector, {
      props: { mode: 'popover', primaryColor: '#16a34a' },
    })
    const inputEl = wrapper.find('input').element as HTMLInputElement
    inputEl.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    await wrapper.vm.$nextTick()

    const panel = document.querySelector('.cron-selector__popover-panel')!
    expect(panel.getAttribute('style')).toContain('--cron-color-primary: #16a34a')
    wrapper.unmount()
  })

  it('disables day option radios on the day tab', async () => {
    const wrapper = mount(CronSelector)
    await wrapper.findAll('.cron-selector__tab')[2].trigger('click')
    await wrapper.setProps({ disabled: true })
    expect(
      wrapper
        .findAll('.cron-selector__option input[type="radio"]')
        .every((radio) => radio.attributes('disabled') !== undefined),
    ).toBe(true)
  })

  it('renders tabbed panel in inline mode by default', () => {
    const wrapper = mount(CronSelector)
    expect(wrapper.find('.cron-selector__panel').exists()).toBe(true)
    expect(wrapper.find('.cron-selector__popover').exists()).toBe(false)
  })

  it('renders popover in popover mode', () => {
    const wrapper = mount(CronSelector, {
      props: { mode: 'popover' },
    })
    expect(wrapper.find('.cron-selector__popover').exists()).toBe(true)
    expect(wrapper.find('.cron-selector__input').exists()).toBe(true)
  })

  it('popover input shows the cron expression', () => {
    const wrapper = mount(CronSelector, {
      props: { mode: 'popover', modelValue: '0 12 * * *' },
    })
    const input = wrapper.find('.cron-selector__input')
    expect((input.element as HTMLInputElement).value).toBe('0 12 * * *')
  })

  it('allows mouse focus inside the popover panel', async () => {
    const wrapper = mount(CronSelector, { props: { mode: 'popover' } })
    await wrapper.find('.cron-selector__input').trigger('focus')
    const panel = document.querySelector('.cron-selector__popover-panel')!
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
    expect(document.querySelector('.cron-selector__popover-panel')).toBeTruthy()
    // Fire Escape on document since the popover listens there. This simulates
    // the user having tabbed focus into a control inside the panel.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.querySelector('.cron-selector__popover-panel')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders field options for the active tab', () => {
    const wrapper = mount(CronSelector)
    expect(wrapper.find('.cron-selector__field').exists()).toBe(true)
    expect(wrapper.find('.cron-selector__options').exists()).toBe(true)
  })

  it('hides Quartz-only day options in crontab mode', async () => {
    const wrapper = mount(CronSelector, {
      props: { format: 'crontab' },
    })
    await wrapper.findAll('.cron-selector__tab')[2].trigger('click')
    const quartzOnlyValues = [
      'lastDay',
      'lastBusinessDay',
      'lastWeekdayOfMonth',
      'lastDayOffset',
      'nearestWeekday',
      'nthWeekday',
    ]
    const radios = wrapper.findAll('.cron-selector__option input[type="radio"]')
    const foundValues = radios.map((r) => r.attributes('value'))
    for (const value of quartzOnlyValues) {
      expect(foundValues, `radio ${value} should be hidden in crontab`).not.toContain(value)
    }
  })

  it('shows Quartz-only day options in quartz mode', async () => {
    const wrapper = mount(CronSelector, {
      props: { format: 'quartz' },
    })
    await wrapper.findAll('.cron-selector__tab')[3].trigger('click')
    const quartzOnlyValues = [
      'lastDay',
      'lastBusinessDay',
      'lastWeekdayOfMonth',
      'lastDayOffset',
      'nearestWeekday',
      'nthWeekday',
    ]
    const radios = wrapper.findAll('.cron-selector__option input[type="radio"]')
    const foundValues = radios.map((r) => r.attributes('value'))
    for (const value of quartzOnlyValues) {
      expect(foundValues, `radio ${value} should be visible in quartz`).toContain(value)
      const radio = radios.find((r) => r.attributes('value') === value)
      expect(
        radio!.attributes('disabled'),
        `radio ${value} should be enabled in quartz`,
      ).toBeUndefined()
    }
  })

  it('renders the English step row in natural word order', () => {
    const wrapper = mount(CronSelector, {
      props: { modelValue: '*/5 * * * *', locale: 'en' },
    })
    const text = wrapper.find('.cron-selector__options').text()
    expect(text).toContain('minutes, starting at')
    expect(text).not.toContain('MinuteFrom')
    expect(text).not.toContain('Minutestarting')
  })

  it('renders the Chinese step row in natural word order', () => {
    const wrapper = mount(CronSelector, {
      props: { modelValue: '*/5 * * * *', locale: 'zh' },
    })
    const text = wrapper.find('.cron-selector__options').text()
    expect(text).toContain('分钟，从第')
    expect(text).toContain('分钟开始')
    expect(text).not.toContain('分钟从')
  })

  it('renders day option templates without leaking placeholders', async () => {
    const wrapper = mount(CronSelector, {
      props: { format: 'quartz', locale: 'en' },
    })
    await wrapper.findAll('.cron-selector__tab')[3].trigger('click')

    const optionText = wrapper.findAll('.cron-selector__option').map((option) =>
      option
        .findAll('.cron-selector__option-text')
        .map((span) => span.text())
        .join(' '),
    )
    const copy = optionText.join('\n')

    for (const text of optionText) {
      expect(text).not.toContain('{')
      expect(text).not.toContain('}')
    }

    expect(copy).toContain('On the last day of the month')
    expect(copy).toContain('On the last business day of the month')
    expect(copy).toContain('On the last')
    expect(copy).toContain('before the end of the month')
    expect(copy).toContain('Nearest weekday to day')
    expect(copy).toContain('of the month')
  })
})
