export interface PlacementInput {
  anchorRect: DOMRect
  panelWidth: number
  panelHeight: number
  gap?: number
  viewportWidth?: number
  viewportHeight?: number
}

export interface PlacementResult {
  top: number
  left: number
  flipUp: boolean
}

const DEFAULT_GAP = 4
const VIEWPORT_PADDING = 8

export function calcPlacement(input: PlacementInput): PlacementResult {
  const {
    anchorRect,
    panelWidth,
    panelHeight,
    gap = DEFAULT_GAP,
    viewportWidth = window.innerWidth,
    viewportHeight = window.innerHeight,
  } = input

  const spaceBelow = viewportHeight - anchorRect.bottom - gap
  const spaceAbove = anchorRect.top - gap
  const flipUp = panelHeight > spaceBelow && spaceAbove > spaceBelow

  const top = flipUp ? anchorRect.top - gap - panelHeight : anchorRect.bottom + gap

  let left = anchorRect.left
  const overflowRight = left + panelWidth - viewportWidth + VIEWPORT_PADDING
  if (overflowRight > 0) {
    left = Math.max(VIEWPORT_PADDING, left - overflowRight)
  }

  return {
    top: Math.max(VIEWPORT_PADDING, top),
    left,
    flipUp,
  }
}
