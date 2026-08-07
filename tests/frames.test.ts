import { describe, expect, it } from 'vitest'
import { FRAME_COUNT, frameIndexFor, framePath } from '@/lib/frames'

describe('frames', () => {
  it('has 120 frames', () => {
    expect(FRAME_COUNT).toBe(120)
  })

  it('pads frame paths to four digits, one-based', () => {
    expect(framePath(0)).toBe('/frames/noir-0001.webp')
    expect(framePath(119)).toBe('/frames/noir-0120.webp')
  })

  it('maps scroll progress onto frame indices', () => {
    expect(frameIndexFor(0)).toBe(0)
    expect(frameIndexFor(1)).toBe(119)
    expect(frameIndexFor(0.5)).toBe(59)
  })

  it('clamps out-of-range progress', () => {
    expect(frameIndexFor(-2)).toBe(0)
    expect(frameIndexFor(4)).toBe(119)
  })
})
