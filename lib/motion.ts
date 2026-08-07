export const EASE = {
  expo: 'expo.out',
  power: 'power3.out',
  smooth: 'power2.inOut',
} as const

/**
 * CSS-legal companions to EASE. GSAP's named eases ('power2.inOut') are not
 * valid `transition-timing-function` syntax — a browser drops the whole
 * declaration and silently falls back to `ease`. Use EASE for GSAP tweens and
 * EASE_CSS for anything that ends up in an inline style / stylesheet.
 */
export const EASE_CSS = {
  smooth: 'cubic-bezier(0.45, 0, 0.55, 1)', // ~power2.inOut
  power: 'cubic-bezier(0.16, 1, 0.3, 1)', // ~power3.out
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
