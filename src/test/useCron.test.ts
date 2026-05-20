import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useCron } from '../lib/composables/useCron'

describe('useCron', () => {
  it('initializes with default crontab expression', () => {
    const result = useCron()
    expect(result.cronString.value).toBe('* * * * *')
    expect(result.isValid.value).toBe(true)
    expect(result.error.value).toBeNull()
  })

  it('initializes with provided modelValue string', () => {
    const result = useCron({ modelValue: '*/5 * * * *' })
    expect(result.cronString.value).toBe('*/5 * * * *')
    expect(result.isValid.value).toBe(true)
  })

  it('initializes with provided modelValue ref', () => {
    const mv = ref('0 12 * * *')
    const result = useCron({ modelValue: mv })
    expect(result.cronString.value).toBe('0 12 * * *')
  })

  it('returns correct formatConfig for crontab', () => {
    const result = useCron({ format: 'crontab' })
    expect(result.formatConfig.value.fieldOrder).toHaveLength(5)
  })

  it('returns correct formatConfig for quartz', () => {
    const result = useCron({ format: 'quartz' })
    expect(result.formatConfig.value.fieldOrder).toHaveLength(7)
    expect(result.formatConfig.value.fieldOrder[0]).toBe('second')
    expect(result.formatConfig.value.fieldOrder[6]).toBe('year')
  })

  it('creates segments for each field', () => {
    const result = useCron()
    const segs = result.segments.value
    expect(segs.size).toBe(5)
    expect(segs.has('minute')).toBe(true)
    expect(segs.has('hour')).toBe(true)
    expect(segs.has('dayOfMonth')).toBe(true)
    expect(segs.has('month')).toBe(true)
    expect(segs.has('dayOfWeek')).toBe(true)
  })

  it('quartz format includes second and year segments', () => {
    const result = useCron({ format: 'quartz' })
    expect(result.segments.value.has('second')).toBe(true)
    expect(result.segments.value.has('year')).toBe(true)
    expect(result.segments.value.size).toBe(7)
  })

  it('generates description for valid expression', () => {
    const result = useCron({ modelValue: '*/5 * * * *' })
    expect(result.description.value).not.toBe('')
  })

  it('returns empty description for invalid expression', () => {
    const result = useCron()
    result.setCronString('invalid')
    expect(result.description.value).toBe('')
  })

  it('detects invalid expressions', () => {
    const result = useCron()
    result.setCronString('* * *')
    expect(result.isValid.value).toBe(false)
    expect(result.error.value).toContain('Expected 5 fields')
  })

  it('setCronString updates cronString', () => {
    const result = useCron()
    result.setCronString('0 12 * * *')
    expect(result.cronString.value).toBe('0 12 * * *')
  })

  it('reset returns to default expression', () => {
    const result = useCron()
    result.setCronString('0 12 * * *')
    result.reset()
    expect(result.cronString.value).toBe('* * * * *')
  })

  it('computes next executions for valid expression', () => {
    const result = useCron({ modelValue: '* * * * *' })
    expect(result.nextExecutions.value.length).toBeGreaterThan(0)
    for (const date of result.nextExecutions.value) {
      expect(date).toBeInstanceOf(Date)
    }
  })

  it('returns empty executions for invalid expression', () => {
    const result = useCron()
    result.setCronString('bad')
    expect(result.nextExecutions.value).toEqual([])
  })

  it('period defaults to day', () => {
    const result = useCron()
    expect(result.period.value).toBe('day')
  })
})
