'use client'

import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/scroll/Reveal'
import { DUR, stagger } from '@/lib/motion'
import { useMagnetic } from '@/lib/use-magnetic'

export default function ClosingCTA() {
  // Extracted to a shared hook in Task 10 so AddToCart's primary button behaves
  // identically to this one.
  const buttonRef = useMagnetic<HTMLAnchorElement>()

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
