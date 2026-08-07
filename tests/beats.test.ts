import { describe, expect, it } from 'vitest'
import { BEATS, beatOpacity } from '@/lib/beats'

const beat = { word: 'NOIR', sub: 'x', from: 0.2, to: 0.4 }

describe('beats', () => {
  it('defines four beats in ascending, non-overlapping order', () => {
    expect(BEATS).toHaveLength(4)
    expect(BEATS.map((b) => b.word)).toEqual(['NOIR', 'SLOW', 'DARK', 'PURE'])
    for (let i = 1; i < BEATS.length; i += 1) {
      expect(BEATS[i].from).toBeGreaterThanOrEqual(BEATS[i - 1].to)
    }
  })

  it('is fully opaque in the middle of its range', () => {
    expect(beatOpacity(beat, 0.3)).toBe(1)
  })

  it('is transparent outside its range', () => {
    expect(beatOpacity(beat, 0.05)).toBe(0)
    expect(beatOpacity(beat, 0.9)).toBe(0)
  })

  it('fades in over the first 20% and out over the last 20% of its range', () => {
    expect(beatOpacity(beat, 0.22)).toBeCloseTo(0.5)
    expect(beatOpacity(beat, 0.38)).toBeCloseTo(0.5)
  })
})
