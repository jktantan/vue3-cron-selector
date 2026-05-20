import { describe, it, expect } from 'vitest'
import { calcPlacement } from '../lib/utils/positioning'

function makeRect(x: number, y: number, w: number, h: number): DOMRect {
  return {
    x,
    y,
    width: w,
    height: h,
    top: y,
    left: x,
    right: x + w,
    bottom: y + h,
    toJSON: () => ({}),
  }
}

describe('calcPlacement', () => {
  it('places panel below anchor when space is sufficient', () => {
    const result = calcPlacement({
      anchorRect: makeRect(100, 50, 200, 30),
      panelWidth: 200,
      panelHeight: 300,
      viewportWidth: 1024,
      viewportHeight: 768,
    })

    expect(result.flipUp).toBe(false)
    expect(result.top).toBe(84)
    expect(result.left).toBe(100)
  })

  it('flips panel above anchor when space below is insufficient', () => {
    const result = calcPlacement({
      anchorRect: makeRect(100, 600, 200, 30),
      panelWidth: 200,
      panelHeight: 300,
      viewportWidth: 1024,
      viewportHeight: 768,
    })

    expect(result.flipUp).toBe(true)
    expect(result.top).toBe(296)
  })

  it('stays below when space above is even less than below', () => {
    const result = calcPlacement({
      anchorRect: makeRect(100, 100, 200, 30),
      panelWidth: 200,
      panelHeight: 800,
      viewportWidth: 1024,
      viewportHeight: 768,
    })

    expect(result.flipUp).toBe(false)
  })

  it('shifts left when panel overflows right edge', () => {
    const result = calcPlacement({
      anchorRect: makeRect(900, 50, 100, 30),
      panelWidth: 200,
      viewportWidth: 1024,
      panelHeight: 100,
      viewportHeight: 768,
    })

    expect(result.left).toBeLessThanOrEqual(1024 - 200 - 8)
  })

  it('clamps left to viewport padding when shifted past left edge', () => {
    const result = calcPlacement({
      anchorRect: makeRect(50, 50, 50, 30),
      panelWidth: 300,
      panelHeight: 100,
      viewportWidth: 200,
      viewportHeight: 768,
    })

    expect(result.left).toBe(8)
  })

  it('clamps top to viewport padding', () => {
    const result = calcPlacement({
      anchorRect: makeRect(100, 10, 200, 30),
      panelWidth: 200,
      panelHeight: 800,
      viewportWidth: 1024,
      viewportHeight: 100,
    })

    expect(result.top).toBeGreaterThanOrEqual(8)
  })

  it('respects custom gap', () => {
    const result = calcPlacement({
      anchorRect: makeRect(100, 50, 200, 30),
      panelWidth: 200,
      panelHeight: 100,
      gap: 10,
      viewportWidth: 1024,
      viewportHeight: 768,
    })

    expect(result.top).toBe(90)
  })
})
