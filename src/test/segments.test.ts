import { describe, it, expect } from 'vitest'
import {
  createAnySegment,
  createValueSegment,
  createRangeSegment,
  createStepSegment,
  createCombinedSegment,
  createNoSpecificSegment,
} from '../lib/core/segments'
import { MINUTE_FIELD, HOUR_FIELD } from '../lib/core/fields'

describe('createAnySegment', () => {
  it('produces all values in field range', () => {
    const seg = createAnySegment(HOUR_FIELD)
    expect(seg.type).toBe('any')
    expect(seg.values).toHaveLength(24)
    expect(seg.values[0]).toBe(0)
    expect(seg.values[23]).toBe(23)
  })

  it('serializes to *', () => {
    expect(createAnySegment(MINUTE_FIELD).toString()).toBe('*')
  })

  it('is frozen', () => {
    const seg = createAnySegment(MINUTE_FIELD)
    expect(Object.isFrozen(seg)).toBe(true)
  })
})

describe('createValueSegment', () => {
  it('creates a single value segment', () => {
    const seg = createValueSegment(30, MINUTE_FIELD)
    expect(seg.type).toBe('value')
    expect(seg.value).toBe(30)
    expect(seg.values).toEqual([30])
    expect(seg.toString()).toBe('30')
  })

  it('throws for out-of-range value', () => {
    expect(() => createValueSegment(60, MINUTE_FIELD)).toThrow('out of range')
    expect(() => createValueSegment(-1, MINUTE_FIELD)).toThrow('out of range')
  })

  it('accepts boundary values', () => {
    expect(createValueSegment(0, MINUTE_FIELD).value).toBe(0)
    expect(createValueSegment(59, MINUTE_FIELD).value).toBe(59)
  })
})

describe('createRangeSegment', () => {
  it('expands values correctly', () => {
    const seg = createRangeSegment(10, 15, MINUTE_FIELD)
    expect(seg.type).toBe('range')
    expect(seg.from).toBe(10)
    expect(seg.to).toBe(15)
    expect(seg.values).toEqual([10, 11, 12, 13, 14, 15])
    expect(seg.toString()).toBe('10-15')
  })

  it('throws when from > to', () => {
    expect(() => createRangeSegment(15, 10, MINUTE_FIELD)).toThrow('Invalid range')
  })

  it('throws for out-of-bounds range', () => {
    expect(() => createRangeSegment(0, 60, MINUTE_FIELD)).toThrow('out of bounds')
  })

  it('handles single-value range', () => {
    const seg = createRangeSegment(5, 5, MINUTE_FIELD)
    expect(seg.values).toEqual([5])
  })
})

describe('createStepSegment', () => {
  it('creates wildcard-based step', () => {
    const seg = createStepSegment('*', 15, MINUTE_FIELD)
    expect(seg.type).toBe('step')
    expect(seg.base).toBe('*')
    expect(seg.step).toBe(15)
    expect(seg.values).toEqual([0, 15, 30, 45])
    expect(seg.toString()).toBe('*/15')
  })

  it('creates value-based step', () => {
    const seg = createStepSegment(5, 10, MINUTE_FIELD)
    expect(seg.values).toEqual([5, 15, 25, 35, 45, 55])
    expect(seg.toString()).toBe('5/10')
  })

  it('throws for step < 1', () => {
    expect(() => createStepSegment('*', 0, MINUTE_FIELD)).toThrow('Step must be >= 1')
  })

  it('throws for out-of-range base', () => {
    expect(() => createStepSegment(60, 5, MINUTE_FIELD)).toThrow('out of range')
  })
})

describe('createCombinedSegment', () => {
  it('merges and deduplicates values', () => {
    const v1 = createValueSegment(5, MINUTE_FIELD)
    const v2 = createValueSegment(10, MINUTE_FIELD)
    const r = createRangeSegment(8, 12, MINUTE_FIELD)
    const seg = createCombinedSegment([v1, v2, r], MINUTE_FIELD)
    expect(seg.type).toBe('combined')
    expect(seg.values).toEqual([5, 8, 9, 10, 11, 12])
    expect(seg.toString()).toBe('5,10,8-12')
  })

  it('throws for fewer than 2 parts', () => {
    const v = createValueSegment(5, MINUTE_FIELD)
    expect(() => createCombinedSegment([v], MINUTE_FIELD)).toThrow('at least 2 parts')
  })
})

describe('createNoSpecificSegment', () => {
  it('produces ? with empty values', () => {
    const seg = createNoSpecificSegment()
    expect(seg.type).toBe('noSpecific')
    expect(seg.values).toEqual([])
    expect(seg.toString()).toBe('?')
  })
})
