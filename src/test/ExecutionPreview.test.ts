import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExecutionPreview from '../lib/components/ExecutionPreview.vue'
import { EN_LOCALE } from '../lib/locale/en'

function makeDate(iso: string): Date {
  return new Date(iso)
}

describe('ExecutionPreview', () => {
  it('renders nothing when executions is empty', () => {
    const wrapper = mount(ExecutionPreview, {
      props: { executions: [], locale: EN_LOCALE },
    })
    expect(wrapper.find('.cron-selector__preview').exists()).toBe(false)
  })

  it('renders each execution as a time element', () => {
    const executions = [makeDate('2026-01-01T00:00:00Z'), makeDate('2026-01-01T01:00:00Z')]
    const wrapper = mount(ExecutionPreview, {
      props: { executions, locale: EN_LOCALE, count: 5 },
    })
    const items = wrapper.findAll('.cron-selector__preview-item')
    expect(items).toHaveLength(2)
    expect(items[0].find('time').attributes('datetime')).toBe('2026-01-01T00:00:00.000Z')
  })

  it('honors the count prop to truncate the list', () => {
    const executions = [
      makeDate('2026-01-01T00:00:00Z'),
      makeDate('2026-01-01T01:00:00Z'),
      makeDate('2026-01-01T02:00:00Z'),
    ]
    const wrapper = mount(ExecutionPreview, {
      props: { executions, locale: EN_LOCALE, count: 2 },
    })
    expect(wrapper.findAll('.cron-selector__preview-item')).toHaveLength(2)
  })

  it('formats dates with the active locale', () => {
    const executions = [makeDate('2026-01-01T00:00:00Z')]
    const wrapper = mount(ExecutionPreview, {
      props: { executions, locale: EN_LOCALE },
    })
    const text = wrapper.find('.cron-selector__preview-item time').text()
    expect(text.length).toBeGreaterThan(0)
    // The exact format depends on the test host's Intl data; just make sure
    // the rendered text is non-empty and contains a recognizable component.
    expect(text).toMatch(/\d/)
  })
})
