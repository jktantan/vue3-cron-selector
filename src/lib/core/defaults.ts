import type { CronFormat, FormatConfig } from './types'
import {
  SECOND_FIELD,
  MINUTE_FIELD,
  HOUR_FIELD,
  DAY_OF_MONTH_FIELD,
  MONTH_FIELD,
  DAY_OF_WEEK_FIELD,
  YEAR_FIELD,
} from './fields'

export const CRONTAB_CONFIG: FormatConfig = Object.freeze({
  format: 'crontab',
  fieldOrder: ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
  fields: new Map([
    ['minute', MINUTE_FIELD],
    ['hour', HOUR_FIELD],
    ['dayOfMonth', DAY_OF_MONTH_FIELD],
    ['month', MONTH_FIELD],
    ['dayOfWeek', DAY_OF_WEEK_FIELD],
  ]),
  defaultExpression: '* * * * *',
})

export const QUARTZ_CONFIG: FormatConfig = Object.freeze({
  format: 'quartz',
  fieldOrder: ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek', 'year'],
  fields: new Map([
    ['second', SECOND_FIELD],
    ['minute', MINUTE_FIELD],
    ['hour', HOUR_FIELD],
    ['dayOfMonth', DAY_OF_MONTH_FIELD],
    ['month', MONTH_FIELD],
    ['dayOfWeek', DAY_OF_WEEK_FIELD],
    ['year', YEAR_FIELD],
  ]),
  defaultExpression: '0 * * * * ? *',
})

export const SPRING_CONFIG: FormatConfig = Object.freeze({
  format: 'spring',
  fieldOrder: ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
  fields: new Map([
    ['second', SECOND_FIELD],
    ['minute', MINUTE_FIELD],
    ['hour', HOUR_FIELD],
    ['dayOfMonth', DAY_OF_MONTH_FIELD],
    ['month', MONTH_FIELD],
    ['dayOfWeek', DAY_OF_WEEK_FIELD],
  ]),
  defaultExpression: '0 * * * * *',
})

const FORMAT_MAP: ReadonlyMap<CronFormat, FormatConfig> = new Map([
  ['crontab', CRONTAB_CONFIG],
  ['quartz', QUARTZ_CONFIG],
  ['spring', SPRING_CONFIG],
])

export function getFormatConfig(format: CronFormat): FormatConfig {
  const config = FORMAT_MAP.get(format)
  if (!config) {
    throw new Error(`Unknown cron format: ${format}`)
  }
  return config
}
