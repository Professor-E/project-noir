import { describe, expect, it } from 'vitest'
import { DUR, EASE, stagger } from '@/lib/motion'

describe('motion tokens', () => {
  it('exposes the shared easings', () => {
    expect(EASE.expo).toBe('expo.out')
    expect(EASE.power).toBe('power3.out')
    expect(EASE.smooth).toBe('power2.inOut')
  })

  it('exposes durations in seconds, ascending', () => {
    expect(DUR.fast).toBeLessThan(DUR.base)
    expect(DUR.base).toBeLessThan(DUR.slow)
    expect(DUR.curtain).toBe(1.4)
  })

  it('staggers linearly at 0.06s per index', () => {
    expect(stagger(0)).toBe(0)
    expect(stagger(3)).toBeCloseTo(0.18)
  })
})
