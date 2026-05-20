import { describe, it, expect } from 'vitest'
import {
  FieldWrapper,
  SECOND_FIELD,
  MINUTE_FIELD,
  HOUR_FIELD,
  DAY_OF_MONTH_FIELD,
  MONTH_FIELD,
  DAY_OF_WEEK_FIELD,
} from '../lib/core/fields'

describe('field definitions', () => {
  it('MINUTE_FIELD range is 0-59', () => {
    expect(MINUTE_FIELD.min).toBe(0)
    expect(MINUTE_FIELD.max).toBe(59)
    expect(MINUTE_FIELD.id).toBe('minute')
  })

  it('HOUR_FIELD range is 0-23', () => {
    expect(HOUR_FIELD.min).toBe(0)
    expect(HOUR_FIELD.max).toBe(23)
  })

  it('DAY_OF_MONTH_FIELD range is 1-31', () => {
    expect(DAY_OF_MONTH_FIELD.min).toBe(1)
    expect(DAY_OF_MONTH_FIELD.max).toBe(31)
  })

  it('MONTH_FIELD has alt values for JAN-DEC', () => {
    expect(MONTH_FIELD.altValues?.get('JAN')).toBe(1)
    expect(MONTH_FIELD.altValues?.get('DEC')).toBe(12)
    expect(MONTH_FIELD.altValues?.size).toBe(12)
  })

  it('DAY_OF_WEEK_FIELD has alt values for SUN-SAT', () => {
    expect(DAY_OF_WEEK_FIELD.altValues?.get('SUN')).toBe(0)
    expect(DAY_OF_WEEK_FIELD.altValues?.get('SAT')).toBe(6)
    expect(DAY_OF_WEEK_FIELD.altValues?.size).toBe(7)
  })

  it('SECOND_FIELD range is 0-59', () => {
    expect(SECOND_FIELD.min).toBe(0)
    expect(SECOND_FIELD.max).toBe(59)
    expect(SECOND_FIELD.id).toBe('second')
  })
})

describe('FieldWrapper', () => {
  it('exposes id, min, max from definition', () => {
    const wrapper = new FieldWrapper(MINUTE_FIELD)
    expect(wrapper.id).toBe('minute')
    expect(wrapper.min).toBe(0)
    expect(wrapper.max).toBe(59)
  })

  it('generates items with zero-padded labels by default', () => {
    const wrapper = new FieldWrapper(HOUR_FIELD)
    const items = wrapper.items
    expect(items).toHaveLength(24)
    expect(items[0]).toEqual({ value: 0, label: '00' })
    expect(items[9]).toEqual({ value: 9, label: '09' })
    expect(items[23]).toEqual({ value: 23, label: '23' })
  })

  it('uses custom label function when provided', () => {
    const wrapper = new FieldWrapper(HOUR_FIELD, (v) => `${v}h`)
    expect(wrapper.items[0].label).toBe('0h')
    expect(wrapper.items[12].label).toBe('12h')
  })

  it('contains checks value is in range', () => {
    const wrapper = new FieldWrapper(HOUR_FIELD)
    expect(wrapper.contains(0)).toBe(true)
    expect(wrapper.contains(23)).toBe(true)
    expect(wrapper.contains(24)).toBe(false)
    expect(wrapper.contains(-1)).toBe(false)
  })

  it('normalizes numeric strings', () => {
    const wrapper = new FieldWrapper(MINUTE_FIELD)
    expect(wrapper.normalize('30')).toBe(30)
    expect(wrapper.normalize('0')).toBe(0)
    expect(wrapper.normalize('59')).toBe(59)
  })

  it('normalizes alt values case-insensitively', () => {
    const wrapper = new FieldWrapper(MONTH_FIELD)
    expect(wrapper.normalize('jan')).toBe(1)
    expect(wrapper.normalize('DEC')).toBe(12)
    expect(wrapper.normalize('Jun')).toBe(6)
  })

  it('returns null for invalid strings', () => {
    const wrapper = new FieldWrapper(MINUTE_FIELD)
    expect(wrapper.normalize('abc')).toBeNull()
    expect(wrapper.normalize('60')).toBeNull()
    expect(wrapper.normalize('-1')).toBeNull()
  })

  it('handles dayOfWeek alt values', () => {
    const wrapper = new FieldWrapper(DAY_OF_WEEK_FIELD)
    expect(wrapper.normalize('mon')).toBe(1)
    expect(wrapper.normalize('FRI')).toBe(5)
  })

  it('generates items for dayOfMonth (1-31)', () => {
    const wrapper = new FieldWrapper(DAY_OF_MONTH_FIELD)
    const items = wrapper.items
    expect(items).toHaveLength(31)
    expect(items[0]).toEqual({ value: 1, label: '01' })
    expect(items[30]).toEqual({ value: 31, label: '31' })
  })
})
