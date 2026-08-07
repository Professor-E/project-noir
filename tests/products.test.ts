import { describe, expect, it } from 'vitest'
import { PRODUCTS, getProduct } from '@/lib/products'

describe('products', () => {
  it('has six products with unique slugs', () => {
    expect(PRODUCTS).toHaveLength(6)
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(6)
  })

  it('prices every product between 22 and 38 dollars', () => {
    for (const p of PRODUCTS) {
      expect(p.price).toBeGreaterThanOrEqual(22)
      expect(p.price).toBeLessThanOrEqual(38)
    }
  })

  it('gives every product a roast level and exactly three tasting notes', () => {
    for (const p of PRODUCTS) {
      expect(p.roast).toBeGreaterThanOrEqual(1)
      expect(p.roast).toBeLessThanOrEqual(5)
      expect(p.notes).toHaveLength(3)
    }
  })

  it('covers the full roast range from 1 to 5', () => {
    const levels = new Set(PRODUCTS.map((p) => p.roast))
    expect(levels.has(1)).toBe(true)
    expect(levels.has(5)).toBe(true)
  })

  it('looks a product up by slug', () => {
    expect(getProduct(PRODUCTS[0].slug)?.name).toBe(PRODUCTS[0].name)
    expect(getProduct('nope')).toBeUndefined()
  })
})
