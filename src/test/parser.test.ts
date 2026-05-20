import { describe, it, expect } from 'vitest'
import {
  parseCronField,
  parseCronExpression,
  selectedToSegment,
  segmentsToString,
} from '../lib/core/parser'
import { MINUTE_FIELD, MONTH_FIELD, DAY_OF_WEEK_FIELD } from '../lib/core/fields'
import type { Segment } from '../lib/core/types'

describe('parseCronField', () => {
  it('parses * as any', () => {
    const seg = parseCronField('*', MINUTE_FIELD)
    expect(seg.type).toBe('any')
    expect(seg.values).toHaveLength(60)
  })

  it('parses ? as noSpecific', () => {
    const seg = parseCronField('?', DAY_OF_WEEK_FIELD)
    expect(seg.type).toBe('noSpecific')
  })

  it('parses single value', () => {
    const seg = parseCronField('30', MINUTE_FIELD)
    expect(seg.type).toBe('value')
    if (seg.type === 'value') {
      expect(seg.value).toBe(30)
    }
  })

  it('parses range', () => {
    const seg = parseCronField('10-20', MINUTE_FIELD)
    expect(seg.type).toBe('range')
    if (seg.type === 'range') {
      expect(seg.from).toBe(10)
      expect(seg.to).toBe(20)
      expect(seg.values).toHaveLength(11)
    }
  })

  it('parses wildcard step */5', () => {
    const seg = parseCronField('*/5', MINUTE_FIELD)
    expect(seg.type).toBe('step')
    if (seg.type === 'step') {
      expect(seg.base).toBe('*')
      expect(seg.step).toBe(5)
      expect(seg.values).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
    }
  })

  it('parses base/step like 5/10', () => {
    const seg = parseCronField('5/10', MINUTE_FIELD)
    expect(seg.type).toBe('step')
    if (seg.type === 'step') {
      expect(seg.base).toBe(5)
      expect(seg.step).toBe(10)
    }
  })

  it('parses comma-separated values', () => {
    const seg = parseCronField('1,5,10', MINUTE_FIELD)
    expect(seg.type).toBe('combined')
    expect(seg.values).toEqual([1, 5, 10])
  })

  it('parses comma with ranges', () => {
    const seg = parseCronField('1-5,10-15', MINUTE_FIELD)
    expect(seg.type).toBe('combined')
    expect(seg.values).toEqual([1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15])
  })

  it('resolves month alt values (JAN, FEB)', () => {
    const seg = parseCronField('JAN', MONTH_FIELD)
    expect(seg.type).toBe('value')
    if (seg.type === 'value') {
      expect(seg.value).toBe(1)
    }
  })

  it('resolves day-of-week alt values (MON, TUE)', () => {
    const seg = parseCronField('MON-FRI', DAY_OF_WEEK_FIELD)
    expect(seg.type).toBe('range')
    if (seg.type === 'range') {
      expect(seg.from).toBe(1)
      expect(seg.to).toBe(5)
    }
  })

  it('throws on invalid value', () => {
    expect(() => parseCronField('abc', MINUTE_FIELD)).toThrow('Invalid value')
  })

  it('throws on out-of-range value', () => {
    expect(() => parseCronField('60', MINUTE_FIELD)).toThrow('out of range')
  })
})

describe('parseCronExpression', () => {
  it('parses standard crontab expression', () => {
    const result = parseCronExpression('*/5 * * * *', 'crontab')
    expect(result.error).toBeNull()
    expect(result.segments.size).toBe(5)

    const minute = result.segments.get('minute')!
    expect(minute.type).toBe('step')
  })

  it('parses quartz 6-field expression (year omitted)', () => {
    const result = parseCronExpression('0 */15 * * * ?', 'quartz')
    expect(result.error).toBeNull()
    expect(result.segments.size).toBe(7)
    expect(result.segments.has('second')).toBe(true)
    expect(result.segments.has('year')).toBe(true)
    expect(result.segments.get('year')!.type).toBe('any')
  })

  it('returns error for wrong field count', () => {
    const result = parseCronExpression('* * *', 'crontab')
    expect(result.error).toContain('Expected 5 fields')
    expect(result.segments.size).toBe(0)
  })

  it('returns error for invalid field values', () => {
    const result = parseCronExpression('60 * * * *', 'crontab')
    expect(result.error).not.toBeNull()
  })

  it('round-trips through segmentsToString', () => {
    const expr = '*/5 0 1 * *'
    const parsed = parseCronExpression(expr, 'crontab')
    expect(parsed.error).toBeNull()
    const rebuilt = segmentsToString(parsed.segments, 'crontab')
    expect(rebuilt).toBe(expr)
  })

  it('round-trips quartz expression', () => {
    const expr = '0 0 12 * * ? *'
    const parsed = parseCronExpression(expr, 'quartz')
    expect(parsed.error).toBeNull()
    const rebuilt = segmentsToString(parsed.segments, 'quartz')
    expect(rebuilt).toBe(expr)
  })
})

describe('selectedToSegment', () => {
  it('returns any segment for empty selection', () => {
    const seg = selectedToSegment([], MINUTE_FIELD)
    expect(seg.type).toBe('any')
  })

  it('returns any segment for full range selection', () => {
    const all = Array.from({ length: 60 }, (_, i) => i)
    const seg = selectedToSegment(all, MINUTE_FIELD)
    expect(seg.type).toBe('any')
  })

  it('returns value segment for single selection', () => {
    const seg = selectedToSegment([30], MINUTE_FIELD)
    expect(seg.type).toBe('value')
    expect(seg.toString()).toBe('30')
  })

  it('detects step pattern */15', () => {
    const seg = selectedToSegment([0, 15, 30, 45], MINUTE_FIELD)
    expect(seg.type).toBe('step')
    expect(seg.toString()).toBe('*/15')
  })

  it('detects step pattern with base 5/10', () => {
    const seg = selectedToSegment([5, 15, 25, 35, 45, 55], MINUTE_FIELD)
    expect(seg.type).toBe('step')
    expect(seg.toString()).toBe('5/10')
  })

  it('detects contiguous range', () => {
    const seg = selectedToSegment([10, 11, 12, 13, 14], MINUTE_FIELD)
    expect(seg.type).toBe('range')
    expect(seg.toString()).toBe('10-14')
  })

  it('creates combined segment for disjoint values', () => {
    const seg = selectedToSegment([1, 2, 3, 10, 11, 12], MINUTE_FIELD)
    expect(seg.type).toBe('combined')
    expect(seg.toString()).toBe('1-3,10-12')
  })

  it('handles mixed single values and ranges', () => {
    const seg = selectedToSegment([1, 5, 6, 7, 20], MINUTE_FIELD)
    expect(seg.type).toBe('combined')
    expect(seg.toString()).toBe('1,5-7,20')
  })
})

describe('segmentsToString', () => {
  it('joins segments with spaces in field order', () => {
    const parsed = parseCronExpression('0 12 * 1 MON-FRI', 'crontab')
    expect(parsed.error).toBeNull()
    const result = segmentsToString(parsed.segments, 'crontab')
    expect(result).toBe('0 12 * 1 1-5')
  })

  it('defaults missing segments to *', () => {
    const segments = new Map<string, Segment>()
    const result = segmentsToString(segments, 'crontab')
    expect(result).toBe('* * * * *')
  })
})
