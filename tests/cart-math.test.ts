import { describe, expect, it } from 'vitest'
import { formatUSD, lineKey, linePrice, subtotal } from '@/lib/cart-math'

const base = {
  slug: 'obsidian',
  name: 'Obsidian',
  price: 28,
  qty: 1,
  grind: 'Whole Bean' as const,
  weight: '250g' as const,
  subscribe: false,
}

describe('cart math', () => {
  it('keys a line by slug, grind, weight and subscription', () => {
    expect(lineKey(base)).toBe('obsidian|Whole Bean|250g|once')
    expect(lineKey({ ...base, subscribe: true })).toBe('obsidian|Whole Bean|250g|sub')
  })

  it('charges 3.4x for a 1kg bag', () => {
    expect(linePrice({ ...base, weight: '1kg' })).toBeCloseTo(95.2)
  })

  it('applies a 10% subscription discount', () => {
    expect(linePrice({ ...base, subscribe: true })).toBeCloseTo(25.2)
  })

  it('multiplies by quantity', () => {
    expect(linePrice({ ...base, qty: 3 })).toBe(84)
  })

  it('sums a cart', () => {
    expect(subtotal([base, { ...base, weight: '1kg' }])).toBeCloseTo(123.2)
  })

  it('formats to two decimals with a dollar sign', () => {
    expect(formatUSD(123.2)).toBe('$123.20')
  })
})
