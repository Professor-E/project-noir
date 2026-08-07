export const EASE = {
  expo: 'expo.out',
  power: 'power3.out',
  smooth: 'power2.inOut',
} as const

export const DUR = {
  fast: 0.35,
  base: 0.8,
  slow: 1.1,
  curtain: 1.4,
} as const

export const STAGGER_STEP = 0.06

export function stagger(index: number): number {
  return index * STAGGER_STEP
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
