'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Reveal from '@/components/scroll/Reveal'
import { DUR, EASE, prefersReducedMotion, stagger } from '@/lib/motion'

const MAGNET_RADIUS = 120
const MAGNET_STRENGTH = 0.3

export default function ClosingCTA() {
  const buttonRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return
    // Magnetism is a pointer affordance: off for coarse pointers and off when
    // the visitor has asked for reduced motion.
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine || prefersReducedMotion()) return

    const xTo = gsap.quickTo(button, 'x', { duration: DUR.fast, ease: EASE.power })
    const yTo = gsap.quickTo(button, 'y', { duration: DUR.fast, ease: EASE.power })

    const move = (e: PointerEvent) => {
      const rect = button.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      const inRange = Math.hypot(dx, dy) < MAGNET_RADIUS
      xTo(inRange ? dx * MAGNET_STRENGTH : 0)
      yTo(inRange ? dy * MAGNET_STRENGTH : 0)
    }

    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      gsap.set(button, { x: 0, y: 0 })
    }
  }, [])

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-void px-6 py-32 md:px-10"
    >
      <div aria-hidden className="absolute inset-0 opacity-40">
        <Image
          src="/images/atelier-1.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover brightness-75"
        />
        <span className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <Reveal>
          <span className="eyebrow block">Shipped within four days of the roast</span>
        </Reveal>

        <Reveal delay={stagger(2)}>
          <h2
            id="cta-heading"
            className="display mt-8 text-bone"
            style={{ fontSize: 'clamp(3.25rem, 15vw, 14rem)' }}
          >
            Enter the dark
          </h2>
        </Reveal>

        <Reveal delay={stagger(4)}>
          <div className="mt-16">
            <Link
              ref={buttonRef}
              href="/shop"
              data-cursor
              className="inline-flex items-center gap-4 border border-crema/60 px-10 py-5 text-sm uppercase tracking-[0.18em] text-crema transition-colors hover:bg-crema hover:text-void"
              style={{ transitionDuration: `${DUR.fast}s` }}
            >
              Enter the shop
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
