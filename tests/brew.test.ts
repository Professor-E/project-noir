import { describe, expect, it } from 'vitest'
import { BREW_METHODS } from '@/lib/brew'

describe('brew methods', () => {
  it('covers the three methods with unique ids', () => {
    expect(BREW_METHODS).toHaveLength(3)
    expect(BREW_METHODS.map((m) => m.id)).toEqual(['espresso', 'pour-over', 'french-press'])
  })

  it('gives every method a dose, ratio, time and at least three steps', () => {
    for (const method of BREW_METHODS) {
      expect(method.dose).toMatch(/\d/)
      expect(method.ratio).toMatch(/^\d+:\d+$/)
      expect(method.time).toMatch(/\d/)
      expect(method.steps.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps step timestamps ascending within each method', () => {
    const seconds = (at: string) => {
      const [m, s] = at.split(':').map(Number)
      return m * 60 + s
    }
    for (const method of BREW_METHODS) {
      const times = method.steps.map((step) => seconds(step.at))
      expect([...times].sort((a, b) => a - b)).toEqual(times)
    }
  })
})
