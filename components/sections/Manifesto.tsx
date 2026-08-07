'use client'

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
    if (prefersReducedMotion()) {
      gsap.set(spans, { yPercent: 0 })
      return
    }

    const tween = gsap.fromTo(
      spans,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: DUR.slow,
        ease: EASE.expo,
        stagger: STAGGER_STEP,
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
      <div className="mx-auto w-full max-w-7xl">
        {/* Wide left gutter: the copy sits off the optical centre, closer to the third column. */}
        <div className="md:pl-[22vw]">
          <span className="eyebrow mb-10 block">The Ritual</span>

          {/* The size lives on the heading so `22ch` measures against the display
              serif at its rendered size, not the inherited body font. */}
          <h2
            id="manifesto-heading"
            className="display max-w-[22ch] text-bone"
            style={{ fontSize: 'clamp(1.75rem, 4.2vw, 4rem)', lineHeight: 1.12 }}
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
