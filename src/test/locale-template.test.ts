import { describe, it, expect } from 'vitest'
import {
  compactTemplateParts,
  parseLocaleTemplate,
  renderLocaleTemplate,
} from '../lib/locale/template'

describe('locale template', () => {
  it('splits literal text and control tokens', () => {
    expect(parseLocaleTemplate('每 {step} 天，从 {start} 天开始')).toEqual([
      { text: '每 ', token: null },
      { text: '', token: 'step' },
      { text: ' 天，从 ', token: null },
      { text: '', token: 'start' },
      { text: ' 天开始', token: null },
    ])
  })

  it('folds text tokens into the surrounding text', () => {
    expect(parseLocaleTemplate('{step} {unit}，从第 {base} {unit}开始', { unit: '分钟' })).toEqual([
      { text: '', token: 'step' },
      { text: ' 分钟，从第 ', token: null },
      { text: '', token: 'base' },
      { text: ' 分钟开始', token: null },
    ])
  })

  it('renders a template with plain values', () => {
    expect(
      renderLocaleTemplate('Every {step} {unit}(s), starting at {base}', {
        step: '5',
        unit: 'Minute',
        base: '0',
      }),
    ).toBe('Every 5 Minute(s), starting at 0')
  })

  it('compacts parts for flex rows', () => {
    expect(
      compactTemplateParts([
        { text: ' 分钟，从第 ', token: null },
        { text: '', token: 'base' },
        { text: '   ', token: null },
      ]),
    ).toEqual([
      { text: '分钟，从第', token: null },
      { text: '', token: 'base' },
    ])
  })
})
