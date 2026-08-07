'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '@/lib/motion'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    // One-time client-only capability check (pointer/motion media queries);
    // there is no value to read this from during render, so an effect is correct here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(fine && !prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (!enabled) return
    const el = dotRef.current
    if (!el) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })

    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const hot = (e.target as HTMLElement).closest('a,button,[data-cursor]')
      gsap.to(el, { scale: hot ? 2.6 : 1, duration: 0.3, ease: 'power3.out' })
    }

    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crema mix-blend-difference"
    />
  )
}
