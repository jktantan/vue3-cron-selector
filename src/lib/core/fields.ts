import type { FieldDefinition, FieldItem } from './types'

export const SECOND_FIELD: FieldDefinition = Object.freeze({
  id: 'second',
  min: 0,
  max: 59,
  label: 'Second',
})

export const MINUTE_FIELD: FieldDefinition = Object.freeze({
  id: 'minute',
  min: 0,
  max: 59,
  label: 'Minute',
})

export const HOUR_FIELD: FieldDefinition = Object.freeze({
  id: 'hour',
  min: 0,
  max: 23,
  label: 'Hour',
})

export const DAY_OF_MONTH_FIELD: FieldDefinition = Object.freeze({
  id: 'dayOfMonth',
  min: 1,
  max: 31,
  label: 'Day of Month',
})

const MONTH_ALT_VALUES = new Map<string, number>([
  ['JAN', 1],
  ['FEB', 2],
  ['MAR', 3],
  ['APR', 4],
  ['MAY', 5],
  ['JUN', 6],
  ['JUL', 7],
  ['AUG', 8],
  ['SEP', 9],
  ['OCT', 10],
  ['NOV', 11],
  ['DEC', 12],
])

export const MONTH_FIELD: FieldDefinition = Object.freeze({
  id: 'month',
  min: 1,
  max: 12,
  label: 'Month',
  altValues: MONTH_ALT_VALUES,
})

const DOW_ALT_VALUES = new Map<string, number>([
  ['SUN', 0],
  ['MON', 1],
  ['TUE', 2],
  ['WED', 3],
  ['THU', 4],
  ['FRI', 5],
  ['SAT', 6],
])

export const DAY_OF_WEEK_FIELD: FieldDefinition = Object.freeze({
  id: 'dayOfWeek',
  min: 0,
  max: 6,
  label: 'Day of Week',
  altValues: DOW_ALT_VALUES,
})

export const YEAR_FIELD: FieldDefinition = Object.freeze({
  id: 'year',
  min: 1970,
  max: 2099,
  label: 'Year',
})

export class FieldWrapper {
  readonly definition: FieldDefinition
  private readonly labelFn: ((value: number) => string) | null

  constructor(definition: FieldDefinition, labelFn?: (value: number) => string) {
    this.definition = definition
    this.labelFn = labelFn ?? null
  }

  get id(): string {
    return this.definition.id
  }

  get min(): number {
    return this.definition.min
  }

  get max(): number {
    return this.definition.max
  }

  get items(): ReadonlyArray<FieldItem> {
    const result: FieldItem[] = []
    for (let i = this.definition.min; i <= this.definition.max; i++) {
      result.push({
        value: i,
        label: this.labelFn ? this.labelFn(i) : String(i).padStart(2, '0'),
      })
    }
    return result
  }

  contains(value: number): boolean {
    return value >= this.definition.min && value <= this.definition.max
  }

  normalize(str: string): number | null {
    const trimmed = str.trim().toUpperCase()
    if (this.definition.altValues?.has(trimmed)) {
      return this.definition.altValues.get(trimmed)!
    }
    const num = parseInt(trimmed, 10)
    if (isNaN(num) || !this.contains(num)) {
      return null
    }
    return num
  }
}
