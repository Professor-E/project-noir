'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { DUR, EASE, prefersReducedMotion } from '@/lib/motion'
import { PRODUCTS, ROAST_STOPS, getProduct, type Product } from '@/lib/products'

type Roast = 1 | 2 | 3 | 4 | 5

const STOPS: Roast[] = [1, 2, 3, 4, 5]

const ROAST_LABELS: Record<Roast, string> = {
  1: 'Light',
  2: 'Medium light',
  3: 'Medium',
  4: 'Medium dark',
  5: 'Dark',
}

// Three plates cover five stops: the roast reads as a continuum, the imagery
// steps in thirds the way a roaster's colour discs do.
const BEAN_LAYERS = [
  { src: '/images/bean-light.jpg', covers: [1, 2] },
  { src: '/images/bean-medium.jpg', covers: [3] },
  { src: '/images/bean-dark.jpg', covers: [4, 5] },
] as const

const BG_FROM = '#1B1512'
const BG_TO = '#0A0908'

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Section tone at a given roast: warm near-black at Light, true void at Dark. */
export function roastBackground(roast: number): string {
  const t = (roast - 1) / (STOPS.length - 1)
  const from = hexToRgb(BG_FROM)
  const to = hexToRgb(BG_TO)
  const mix = from.map((c, i) => Math.round(c + (to[i] - c) * t))
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`
}

function beanIndexFor(roast: Roast): number {
  return BEAN_LAYERS.findIndex((layer) => (layer.covers as readonly number[]).includes(roast))
}

export default function RoastSlider() {
  const [roast, setRoast] = useState<Roast>(3)
  // Which SKU at the current stop is showing. Stop 3 carries two (Ember and
  // Atlas); every other stop carries one and this stays 0.
  const [variant, setVariant] = useState(0)
  const [reduced, setReduced] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the server-rendered
    // markup and the client's first paint match; the media query only exists client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
  }, [])

  useEffect(() => {
    const active = beanIndexFor(roast)
    const tweens: gsap.core.Tween[] = []
    layerRefs.current.forEach((el, i) => {
      if (!el) return
      const opacity = i === active ? 1 : 0
      if (reduced) {
        gsap.set(el, { opacity })
        return
      }
      tweens.push(
        gsap.to(el, { opacity, duration: DUR.base, ease: EASE.smooth, overwrite: 'auto' }),
      )
    })

    return () => {
      tweens.forEach((tween) => tween.kill())
    }
  }, [roast, reduced])

  const slugs = ROAST_STOPS[roast]
  const variantIndex = Math.min(variant, slugs.length - 1)
  const product: Product = getProduct(slugs[variantIndex]) ?? PRODUCTS[PRODUCTS.length - 1]

  // Moving the slider always lands on the first SKU of the new stop.
  const selectRoast = (next: Roast) => {
    setRoast(next)
    setVariant(0)
  }

  const clampStop = (value: number): Roast =>
    (Math.min(STOPS.length, Math.max(1, value)) as Roast)

  const stopFromClientX = (clientX: number): Roast => {
    const track = trackRef.current
    if (!track) return roast
    const rect = track.getBoundingClientRect()
    if (rect.width === 0) return roast
    const t = (clientX - rect.left) / rect.width
    return clampStop(Math.round(t * (STOPS.length - 1)) + 1)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: Roast | null = null
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = clampStop(roast - 1)
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = clampStop(roast + 1)
    else if (e.key === 'Home') next = 1
    else if (e.key === 'End') next = 5
    if (next === null) return
    e.preventDefault()
    selectRoast(next)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    selectRoast(stopFromClientX(e.clientX))
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    selectRoast(stopFromClientX(e.clientX))
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const knobPercent = ((roast - 1) / (STOPS.length - 1)) * 100

  return (
    <section
      id="roast"
      aria-labelledby="roast-heading"
      className="relative w-full px-6 py-32 md:px-10 md:py-48"
      style={{
        backgroundColor: roastBackground(roast),
        transitionProperty: 'background-color',
        transitionDuration: reduced ? '0s' : `${DUR.base}s`,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <span className="eyebrow block">Roast Explorer</span>
        <h2
          id="roast-heading"
          className="display mt-6 max-w-[14ch] text-bone"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
        >
          Drag the roast
        </h2>

        <div className="mt-20 grid items-center gap-16 md:grid-cols-2 md:gap-20">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
            {BEAN_LAYERS.map((layer, i) => (
              <div
                key={layer.src}
                ref={(el) => {
                  layerRefs.current[i] = el
                }}
                aria-hidden
                className="absolute inset-0"
                style={{ opacity: i === beanIndexFor(3) ? 1 : 0 }}
              >
                <Image
                  src={layer.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover brightness-90"
                />
              </div>
            ))}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 to-transparent"
            />
            <span className="eyebrow absolute bottom-5 left-5 text-bone/70">
              {ROAST_LABELS[roast]} · {roast} of 5
            </span>
          </div>

          <div>
            {/* aria-live so the paired product is announced when the slider moves. */}
            <div aria-live="polite">
              <h3 className="display text-5xl text-bone md:text-6xl">{product.name}</h3>
              <span className="eyebrow mt-3 block">{product.origin}</span>

              <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2 text-sm text-bone/85">
                {product.notes.map((note, i) => (
                  <li key={note} className="flex items-center gap-3">
                    {i > 0 && <span className="text-ash/60">·</span>}
                    {note}
                  </li>
                ))}
              </ul>

              <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-ash">
                {product.blurb}
              </p>

              <p className="mt-8 text-sm tabular-nums text-bone/80">${product.price}</p>
            </div>

            {/* Two SKUs share the medium stop, so the stop gets a picker rather
                than silently hiding the second one. */}
            {slugs.length > 1 && (
              <div className="mt-8">
                <span className="eyebrow block">Two at this roast</span>
                <div className="mt-3 flex flex-wrap gap-px border border-bone/15 p-px">
                  {slugs.map((slug, i) => {
                    const option = getProduct(slug)
                    if (!option) return null
                    const active = i === variantIndex
                    return (
                      <button
                        key={slug}
                        type="button"
                        data-cursor
                        aria-pressed={active}
                        onClick={() => setVariant(i)}
                        className={`flex-1 whitespace-nowrap px-5 py-3 text-xs uppercase tracking-[0.14em] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-crema ${
                          active ? 'bg-crema text-void' : 'text-bone/70 hover:text-bone'
                        }`}
                        style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
                      >
                        {option.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-14">
              <div className="mb-5 flex items-center justify-between">
                <span className="eyebrow">Light</span>
                <span className="eyebrow">Dark</span>
              </div>

              <div
                ref={trackRef}
                role="slider"
                tabIndex={0}
                aria-label="Roast intensity"
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={roast}
                aria-valuetext={`${ROAST_LABELS[roast]} — ${product.name}`}
                data-cursor
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="relative h-10 w-full cursor-pointer touch-none select-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-crema/60"
              >
                <span
                  aria-hidden
                  className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-crema/25"
                />
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-crema"
                  style={{
                    width: `${knobPercent}%`,
                    transitionProperty: 'width',
                    transitionDuration: reduced ? '0s' : `${DUR.fast}s`,
                  }}
                />

                {STOPS.map((stop) => (
                  <span
                    key={stop}
                    aria-hidden
                    className={`absolute top-1/2 h-3 w-px -translate-y-1/2 ${
                      stop <= roast ? 'bg-crema/70' : 'bg-crema/25'
                    }`}
                    style={{ left: `${((stop - 1) / (STOPS.length - 1)) * 100}%` }}
                  />
                ))}

                <span
                  aria-hidden
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crema ring-4 ring-crema/15"
                  style={{
                    left: `${knobPercent}%`,
                    transitionProperty: 'left',
                    transitionDuration: reduced ? '0s' : `${DUR.fast}s`,
                  }}
                />
              </div>

              <Link
                href={`/shop/${product.slug}`}
                data-cursor
                className="mt-10 inline-flex items-center gap-3 border-b border-crema/40 pb-2 text-sm text-crema transition-colors hover:border-crema"
              >
                View {product.name}
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
