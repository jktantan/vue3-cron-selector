import { describe, it, expect } from 'vitest'
import { getFormatConfig, CRONTAB_CONFIG, QUARTZ_CONFIG, SPRING_CONFIG } from '../lib/core/defaults'

describe('getFormatConfig', () => {
  it('returns crontab config with 5 fields', () => {
    const config = getFormatConfig('crontab')
    expect(config.format).toBe('crontab')
    expect(config.fieldOrder).toEqual(['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'])
    expect(config.fields.size).toBe(5)
    expect(config.defaultExpression).toBe('* * * * *')
  })

  it('returns quartz config with 7 fields', () => {
    const config = getFormatConfig('quartz')
    expect(config.format).toBe('quartz')
    expect(config.fieldOrder).toHaveLength(7)
    expect(config.fieldOrder[0]).toBe('second')
    expect(config.fieldOrder[6]).toBe('year')
    expect(config.defaultExpression).toBe('0 * * * * ? *')
  })

  it('returns spring config with 6 fields', () => {
    const config = getFormatConfig('spring')
    expect(config.format).toBe('spring')
    expect(config.fieldOrder).toHaveLength(6)
    expect(config.defaultExpression).toBe('0 * * * * *')
  })

  it('throws for unknown format', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => getFormatConfig('unknown' as any)).toThrow('Unknown cron format')
  })
})

describe('format configs are frozen', () => {
  it('CRONTAB_CONFIG is frozen', () => {
    expect(Object.isFrozen(CRONTAB_CONFIG)).toBe(true)
  })

  it('QUARTZ_CONFIG is frozen', () => {
    expect(Object.isFrozen(QUARTZ_CONFIG)).toBe(true)
  })

  it('SPRING_CONFIG is frozen', () => {
    expect(Object.isFrozen(SPRING_CONFIG)).toBe(true)
  })
})

describe('quartz vs spring differences', () => {
  it('quartz default has ? for dayOfWeek', () => {
    expect(QUARTZ_CONFIG.defaultExpression).toContain('?')
  })

  it('spring default uses * for dayOfWeek', () => {
    expect(SPRING_CONFIG.defaultExpression).not.toContain('?')
  })
})
