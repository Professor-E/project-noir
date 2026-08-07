'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DUR, EASE, STAGGER_STEP, prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

const LINES = [
  'Dark before dawn.',
  'One drum, one lot,',
  'one roast at a time.',
  'We stop at the edge',
  'of what the bean gives.',
]

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const spans = section.querySelectorAll<HTMLSpanElement>('[data-manifesto-line]')
    // `y: 0` alongside yPercent in both branches: GSAP seeds its cache from the
    // computed matrix, which has already resolved the server-rendered
    // `translateY(100%)` into a pixel offset of one line-height. Setting
    // yPercent alone leaves that pixel offset in place, so the line stays
    // pushed out of its overflow-hidden mask and the copy is never seen.
    if (prefersReducedMotion()) {
      gsap.set(spans, { yPercent: 0, y: 0, clearProps: 'transform' })
      return
    }

    const tween = gsap.fromTo(
      spans,
      { yPercent: 100, y: 0 },
      {
        yPercent: 0,
        duration: DUR.slow,
        ease: EASE.expo,
        stagger: STAGGER_STEP,
        // Clear the inline transform once settled: GSAP leaves a residual
        // translate3d matrix at yPercent 0, which pins each span to its own
        // compositor layer forever. That layer gets re-rasterized at every
        // fractional scroll offset Lenis produces, showing up as text that
        // visibly redraws pixel-by-pixel while the page is smooth-scrolled.
        clearProps: 'transform',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="manifesto-heading"
      className="relative flex min-h-screen w-full items-center bg-void px-6 py-32 md:px-10"
    >
      {/* `w-fit` + an `auto` text column sizes the pair to the heading's own
          measure, so `mx-auto` centres image and copy as one block. The text
          column must NOT be sized in `ch`: ch resolves against the grid's
          inherited 16px sans, not the 3rem display serif inside it, which
          collapses the column to ~390px and wraps every line. */}
      <div className="mx-auto grid w-fit max-w-full items-center gap-12 md:grid-cols-[clamp(190px,19vw,290px)_minmax(0,auto)] md:gap-16">
        <div className="relative hidden aspect-[3/4] overflow-hidden rounded-sm md:block">
          <Image
            src="/images/bean-dark.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 0px, clamp(190px, 19vw, 290px)"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-void/20" />
        </div>

        <div>
          <span className="eyebrow mb-10 block">The Ritual</span>

          {/* The size lives on the heading so `28ch` measures against the display
              serif at its rendered size, not the inherited body font. The cap is
              a runaway guard, not the layout: the grid column is `auto`, so the
              rendered width tracks the longest line (~377px at 52px). Keep the
              slack — at 24ch the cap landed within 1px of that line and any
              metric variance wrapped it. */}
          <h2
            id="manifesto-heading"
            className="display max-w-[28ch] text-bone"
            style={{ fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)', lineHeight: 1.14 }}
          >
            {LINES.map((line) => (
              <span key={line} className="block overflow-hidden">
                <span
                  data-manifesto-line
                  className="block"
                  style={{ transform: 'translateY(100%)' }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p className="mt-12 max-w-[42ch] text-sm leading-relaxed text-ash">
            Noir buys a single lot at a time, roasts it in a twelve-kilo drum, and ships it
            within four days. Nothing is blended to hide a bad harvest.
          </p>
        </div>
      </div>
    </section>
  )
}
