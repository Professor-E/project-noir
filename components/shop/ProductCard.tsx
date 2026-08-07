'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DUR, EASE, prefersReducedMotion } from '@/lib/motion'
import type { Product } from '@/lib/products'

type Props = {
  product: Product
  index: number
}

export default function ProductCard({ product, index }: Props) {
  const imageRef = useRef<HTMLDivElement>(null)
  const ruleRef = useRef<HTMLSpanElement>(null)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = prefersReducedMotion()
    // With motion off the rule is not a hover reveal any more, so it simply rests
    // in place rather than being a permanently invisible element.
    if (reducedRef.current) gsap.set(ruleRef.current, { scaleX: 1 })
  }, [])

  // Hover and keyboard focus drive the same state, so the card reads the same
  // way when tabbed to as when pointed at.
  const setActive = useCallback((active: boolean) => {
    if (reducedRef.current) return
    gsap.to(imageRef.current, {
      scale: active ? 1.06 : 1,
      duration: DUR.base,
      ease: EASE.smooth,
    })
    gsap.to(ruleRef.current, {
      scaleX: active ? 1 : 0,
      duration: DUR.base,
      ease: EASE.smooth,
    })
  }, [])

  return (
    <Link
      href={`/shop/${product.slug}`}
      data-cursor
      className="group block outline-offset-4 focus-visible:outline-1 focus-visible:outline-crema"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink">
        <div ref={imageRef} className="absolute inset-0 will-change-transform">
          <Image
            src={product.image}
            alt={`${product.name} — ${product.origin}`}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>

        <span className="eyebrow absolute left-4 top-4 z-10 text-bone/70">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Keeps the type legible over the lighter product shots. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-void/20"
        />
      </div>

      {/* Inline scaleX rather than Tailwind's `scale-x-0`: v4 compiles that to the
          standalone `scale` property, which would compose with — and defeat —
          GSAP's transform-based tween. */}
      <span
        ref={ruleRef}
        aria-hidden
        className="mt-5 block h-px w-full origin-left bg-crema"
        style={{ transform: 'scaleX(0)' }}
      />

      <div className="mt-4 flex items-baseline justify-between gap-6">
        <div>
          <h3 className="display text-3xl text-bone">{product.name}</h3>
          <span className="eyebrow mt-2 block">{product.origin}</span>
        </div>
        <span className="shrink-0 text-right text-sm tabular-nums text-bone/80">
          ${product.price}
        </span>
      </div>
    </Link>
  )
}
