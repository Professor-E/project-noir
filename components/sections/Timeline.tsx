'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Reveal from '@/components/scroll/Reveal'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

export type TimelineEntry = {
  year: string
  title: string
  body: string
  image: string
}

type Props = {
  entries: TimelineEntry[]
}

export default function Timeline({ entries }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const ruleRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const rule = ruleRef.current
    if (!section || !rule) return

    if (prefersReducedMotion()) {
      // Fully drawn, no scrub trigger at all — and since the per-row image
      // wrappers are never touched below, they stay at their untransformed
      // rest position (the parallax is skipped entirely).
      gsap.set(rule, { scaleY: 1 })
      return
    }

    const triggers: ScrollTrigger[] = []

    // Spans the whole time the timeline is in view: the line starts drawing
    // the moment the section enters from the bottom and finishes exactly as
    // it exits through the top.
    const ruleTween = gsap.fromTo(
      rule,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      },
    )
    if (ruleTween.scrollTrigger) triggers.push(ruleTween.scrollTrigger)

    const rows = section.querySelectorAll<HTMLElement>('[data-timeline-row]')
    rows.forEach((row) => {
      const imageWrap = row.querySelector<HTMLElement>('[data-timeline-image]')
      if (!imageWrap) return

      // Each row's own scroll range, not the section's — so a row still
      // mid-viewport keeps drifting after an earlier row has finished.
      const parallaxTween = gsap.fromTo(
        imageWrap,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
      if (parallaxTween.scrollTrigger) triggers.push(parallaxTween.scrollTrigger)
    })

    return () => {
      triggers.forEach((t) => t.kill())
      gsap.killTweensOf(rule)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="timeline-heading"
      className="relative w-full bg-void px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="timeline-heading" className="sr-only">
          The story so far
        </h2>

        <div className="relative">
          {/* Inline scaleY rather than a Tailwind scale utility: v4 compiles
              those to the standalone `scale` property, which composes with —
              and defeats — GSAP's transform-based tween (see ProductCard). */}
          <span
            ref={ruleRef}
            aria-hidden
            className="absolute inset-y-0 left-6 w-px origin-top bg-crema/50 md:left-1/2"
            style={{ transform: 'scaleY(0)' }}
          />

          <div className="flex flex-col gap-24 md:gap-32">
            {entries.map((entry, i) => (
              <div
                key={entry.year}
                data-timeline-row
                className={`relative flex flex-col gap-8 pl-14 md:flex-row md:items-center md:gap-16 md:pl-0 ${
                  i % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <Reveal className="md:flex-1">
                  <span className="eyebrow block">{entry.year}</span>
                  <h3
                    className="display mt-4 text-bone"
                    style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
                  >
                    {entry.title}
                  </h3>
                  <p className="mt-6 max-w-[42ch] text-sm leading-relaxed text-ash">
                    {entry.body}
                  </p>
                </Reveal>

                <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink md:flex-1">
                  <div
                    data-timeline-image
                    className="absolute inset-x-0 will-change-transform"
                    style={{ top: '-15%', bottom: '-15%' }}
                  >
                    <Image
                      src={entry.image}
                      alt={`${entry.title} — ${entry.year}`}
                      fill
                      sizes="(min-width: 768px) 42vw, 86vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
