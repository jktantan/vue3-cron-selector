import { describe, it, expect } from 'vitest'
import { useCronSegment } from '../lib/composables/useCronSegment'
import { MINUTE_FIELD, HOUR_FIELD, DAY_OF_WEEK_FIELD } from '../lib/core/fields'

describe('useCronSegment', () => {
  it('initializes with * by default', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD })
    expect(seg.fieldId).toBe('minute')
    expect(seg.segment.value.type).toBe('any')
    expect(seg.cronString.value).toBe('*')
    expect(seg.selected.value).toHaveLength(60)
  })

  it('initializes with custom cron string', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD, initialCron: '*/15' })
    expect(seg.segment.value.type).toBe('step')
    expect(seg.cronString.value).toBe('*/15')
    expect(seg.selected.value).toEqual([0, 15, 30, 45])
  })

  it('setSelected updates segment and cronString', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD })
    seg.setSelected([0, 15, 30, 45])
    expect(seg.segment.value.type).toBe('step')
    expect(seg.cronString.value).toBe('*/15')
  })

  it('setSelected with single value creates value segment', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD })
    seg.setSelected([30])
    expect(seg.segment.value.type).toBe('value')
    expect(seg.cronString.value).toBe('30')
  })

  it('setSelected with empty array creates any segment', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD, initialCron: '30' })
    seg.setSelected([])
    expect(seg.segment.value.type).toBe('any')
    expect(seg.cronString.value).toBe('*')
  })

  it('setType switches segment type', () => {
    const seg = useCronSegment({ field: HOUR_FIELD })

    seg.setType('range')
    expect(seg.segment.value.type).toBe('range')

    seg.setType('step')
    expect(seg.segment.value.type).toBe('step')

    seg.setType('any')
    expect(seg.segment.value.type).toBe('any')
  })

  it('setRange creates a range segment', () => {
    const seg = useCronSegment({ field: HOUR_FIELD })
    seg.setRange(9, 17)
    expect(seg.segment.value.type).toBe('range')
    expect(seg.segment.value.toString()).toBe('9-17')
  })

  it('setStep creates a step segment', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD })
    seg.setStep('*', 10)
    expect(seg.segment.value.type).toBe('step')
    expect(seg.segment.value.toString()).toBe('*/10')
  })

  it('setStep with numeric base', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD })
    seg.setStep(5, 10)
    expect(seg.segment.value.toString()).toBe('5/10')
  })

  it('setCron parses and updates segment', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD })
    seg.setCron('10-20')
    expect(seg.segment.value.type).toBe('range')
    expect(seg.cronString.value).toBe('10-20')
  })

  it('setCron ignores invalid input and keeps current state', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD, initialCron: '30' })
    seg.setCron('invalid')
    expect(seg.segment.value.type).toBe('value')
    expect(seg.cronString.value).toBe('30')
  })

  it('reset returns to any segment', () => {
    const seg = useCronSegment({ field: MINUTE_FIELD, initialCron: '30' })
    expect(seg.segment.value.type).toBe('value')
    seg.reset()
    expect(seg.segment.value.type).toBe('any')
    expect(seg.segment.value.toString()).toBe('*')
  })

  it('handles dayOfWeek field with range', () => {
    const seg = useCronSegment({ field: DAY_OF_WEEK_FIELD, initialCron: '1-5' })
    expect(seg.segment.value.type).toBe('range')
    expect(seg.selected.value).toEqual([1, 2, 3, 4, 5])
  })
})
