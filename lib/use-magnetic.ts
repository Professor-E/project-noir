'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DUR, EASE, prefersReducedMotion } from '@/lib/motion'

export const MAGNET_RADIUS = 120
export const MAGNET_STRENGTH = 0.3

/**
 * Pulls an element toward the pointer once the pointer is within `radius`, then
 * releases it. Shared by every primary CTA (ClosingCTA, AddToCart) so the
 * magnetism reads identically wherever it appears.
 *
 * Magnetism is a pointer affordance: off for coarse pointers and off when the
 * visitor has asked for reduced motion.
 */
export function useMagnetic<T extends HTMLElement>(
  radius: number = MAGNET_RADIUS,
  strength: number = MAGNET_STRENGTH,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine || prefersReducedMotion()) return

    const xTo = gsap.quickTo(el, 'x', { duration: DUR.fast, ease: EASE.power })
    const yTo = gsap.quickTo(el, 'y', { duration: DUR.fast, ease: EASE.power })

    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      const inRange = Math.hypot(dx, dy) < radius
      xTo(inRange ? dx * strength : 0)
      yTo(inRange ? dy * strength : 0)
    }

    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [radius, strength])

  return ref
}
