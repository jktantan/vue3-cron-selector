import { describe, it, expect } from 'vitest'
import type { CronFormat } from '../lib/core/types'
import { parseCronExpression } from '../lib/core/parser'
import { generateDescription, pluralUnit, resolveLocale } from '../lib/locale/engine'
import { EN_US_LOCALE } from '../lib/locale/en-US'
import { ZH_CN_LOCALE } from '../lib/locale/zh-CN'
import type { LocaleDefinition } from '../lib/locale/types'

function render(expression: string, format: CronFormat, locale: LocaleDefinition): string {
  return generateDescription(parseCronExpression(expression, format), locale)
}

describe('resolveLocale', () => {
  it('resolves built-in regional tags and bare-language aliases', () => {
    expect(resolveLocale('en-US')).toBe(EN_US_LOCALE)
    expect(resolveLocale('zh-CN')).toBe(ZH_CN_LOCALE)
    expect(resolveLocale('en')).toBe(EN_US_LOCALE)
    expect(resolveLocale('zh')).toBe(ZH_CN_LOCALE)
    expect(resolveLocale('zh-cn')).toBe(ZH_CN_LOCALE)
  })

  it('keeps the requested regional tag for Intl', () => {
    const taiwan = resolveLocale('zh-TW')
    expect(taiwan.code).toBe('zh-TW')
    // Copy falls back to the closest built-in variant (zh-CN).
    expect(taiwan.fields.labels.minute).toBe('分钟')
    expect(taiwan.months[0]).toBe('一月')

    expect(resolveLocale('en-GB').code).toBe('en-GB')
  })

  it('falls back to the base language, then to English', () => {
    expect(resolveLocale('EN-us')).toBe(EN_US_LOCALE)
    expect(resolveLocale('fr')).toBe(EN_US_LOCALE)
    expect(resolveLocale('')).toBe(EN_US_LOCALE)
  })
})

describe('pluralUnit', () => {
  it('selects English singular and plural forms', () => {
    expect(pluralUnit('minute', 1, EN_US_LOCALE)).toBe('minute')
    expect(pluralUnit('minute', 5, EN_US_LOCALE)).toBe('minutes')
    expect(pluralUnit('dayOfMonth', 1, EN_US_LOCALE)).toBe('day')
    expect(pluralUnit('dayOfMonth', 3, EN_US_LOCALE)).toBe('days')
  })

  it('uses the single Chinese form for every count', () => {
    expect(pluralUnit('minute', 1, ZH_CN_LOCALE)).toBe('分钟')
    expect(pluralUnit('minute', 5, ZH_CN_LOCALE)).toBe('分钟')
  })
})

describe('generateDescription', () => {
  it('renders a step clause with a plural unit', () => {
    expect(render('*/5 * * * *', 'crontab', EN_US_LOCALE)).toBe('Every 5 minutes')
    expect(render('*/5 * * * *', 'crontab', ZH_CN_LOCALE)).toBe('每 5 分钟')
  })

  it('renders time, day and month clauses', () => {
    expect(render('0 9 * * 1', 'crontab', EN_US_LOCALE)).toBe('At 09:00, On Monday')
    expect(render('0 9 15 3 *', 'crontab', EN_US_LOCALE)).toBe(
      'At 09:00, On day 15 of the month, In March',
    )
    expect(render('0 9 15 3 *', 'crontab', ZH_CN_LOCALE)).toBe('在 09:00，每月 15 日，三月')
  })

  it('renders Quartz day modifiers as whole clauses', () => {
    expect(render('0 0 0 LW * ? *', 'quartz', EN_US_LOCALE)).toBe(
      'At Second 00, At 00:00, On the last business day of the month',
    )
    expect(render('0 0 0 LW * ? *', 'quartz', ZH_CN_LOCALE)).toBe(
      '在秒 00，在 00:00，每月最后一个工作日',
    )

    expect(render('0 0 0 ? * 5L *', 'quartz', EN_US_LOCALE)).toBe(
      'At Second 00, At 00:00, On the last Friday of the month',
    )
    expect(render('0 0 0 ? * 5L *', 'quartz', ZH_CN_LOCALE)).toBe(
      '在秒 00，在 00:00，每月最后一个星期五',
    )

    expect(render('0 0 0 L-3 * ? *', 'quartz', EN_US_LOCALE)).toBe(
      'At Second 00, At 00:00, 3 days before the end of the month',
    )
    expect(render('0 0 0 15W * ? *', 'quartz', EN_US_LOCALE)).toBe(
      'At Second 00, At 00:00, Nearest weekday to day 15 of the month',
    )
    expect(render('0 0 0 ? * 1#2 *', 'quartz', EN_US_LOCALE)).toBe(
      'At Second 00, At 00:00, On the 2nd Monday of the month',
    )
  })

  it('leaves no template placeholders in the output', () => {
    const cases: ReadonlyArray<[string, CronFormat]> = [
      ['*/5 * * * *', 'crontab'],
      ['0 9 15 3 *', 'crontab'],
      ['0 0 0 L * ? *', 'quartz'],
      ['0 0 0 ? * 5L *', 'quartz'],
      ['0 0 0 ? * 1#2 *', 'quartz'],
    ]

    for (const locale of [EN_US_LOCALE, ZH_CN_LOCALE]) {
      for (const [expression, format] of cases) {
        const text = render(expression, format, locale)
        expect(text).not.toContain('{')
        expect(text).not.toContain('}')
        expect(text).not.toContain('(s)')
      }
    }
  })
})
