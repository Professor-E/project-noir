'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  formatUSD,
  linePrice,
  type CartLine,
  type Grind,
  type Weight,
} from '@/lib/cart-math'
import { useCart } from '@/lib/cart-store'
import { DUR, EASE, prefersReducedMotion } from '@/lib/motion'
import type { Product } from '@/lib/products'
import { useMagnetic } from '@/lib/use-magnetic'

const GRINDS: Grind[] = ['Whole Bean', 'Espresso', 'Filter', 'French Press']
const WEIGHTS: Weight[] = ['250g', '1kg']
const MAX_QTY = 9
const CONFIRM_MS = 2400

/**
 * Segmented selector: a crema pill slides behind the active option. The pill is
 * driven off the live button box (offsetLeft/Top/Width/Height) rather than a
 * percentage, so it stays correct when the options wrap onto two rows.
 */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  reduced,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (next: T) => void
  reduced: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const settledRef = useRef(false)
  // Holds the latest `place` closure so the long-lived ResizeObserver below
  // (mount-only, empty deps) can always call an up-to-date placement without
  // `place` itself needing to be a dependency of that effect.
  const placeRef = useRef<() => void>(() => {})
  const index = options.indexOf(value)

  // Animates/positions the pill whenever the active option changes. Deliberately
  // does NOT own the ResizeObserver: recreating the observer here would make it
  // fire its spurious "first observation" callback on every option change,
  // snapping the pill via gsap.set mid-tween and killing the slide.
  useEffect(() => {
    const wrap = wrapRef.current
    const pill = pillRef.current
    if (!wrap || !pill) return

    const place = () => {
      const button = buttonRefs.current[index]
      if (!button) return
      // offsetLeft/Top are measured from the wrapper's border box, the pill is
      // positioned against its padding box: subtract the border to line up.
      const box = {
        x: button.offsetLeft - wrap.clientLeft,
        y: button.offsetTop - wrap.clientTop,
        width: button.offsetWidth,
        height: button.offsetHeight,
      }
      // The first placement (and every reflow) is a set, not a tween: there is
      // no previous position worth animating from.
      if (reduced || !settledRef.current) {
        gsap.set(pill, { ...box, autoAlpha: 1 })
        settledRef.current = true
        return
      }
      gsap.to(pill, { ...box, duration: DUR.fast, ease: EASE.power, overwrite: 'auto' })
    }

    placeRef.current = place
    place()
  }, [index, reduced])

  // Owns the ResizeObserver for the component's whole lifetime, so it only ever
  // delivers its one spurious "just started observing" callback once (on mount)
  // instead of once per option change. Genuine layout changes (e.g. the grind
  // row wrapping from one row to two on viewport resize) still reposition the
  // pill instantly via place()'s gsap.set branch.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const observer = new ResizeObserver(() => {
      settledRef.current = false
      placeRef.current()
    })
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  return (
    <div>
      <span className="eyebrow block">{label}</span>
      <div
        ref={wrapRef}
        role="group"
        aria-label={label}
        className="relative mt-4 flex flex-wrap gap-px border border-bone/15 p-px"
      >
        <span
          ref={pillRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bg-crema"
          style={{ visibility: 'hidden' }}
        />
        {options.map((option, i) => {
          const active = option === value
          return (
            <button
              key={option}
              ref={(el) => {
                buttonRefs.current[i] = el
              }}
              type="button"
              data-cursor
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={`relative z-10 flex-1 whitespace-nowrap px-5 py-3 text-xs uppercase tracking-[0.14em] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-crema ${
                active ? 'text-void' : 'text-bone/70 hover:text-bone'
              }`}
              style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function AddToCart({ product }: { product: Product }) {
  const [grind, setGrind] = useState<Grind>('Whole Bean')
  const [weight, setWeight] = useState<Weight>('250g')
  const [subscribe, setSubscribe] = useState(false)
  const [qty, setQty] = useState(1)
  const [reduced, setReduced] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const add = useCart((state) => state.add)
  const buttonRef = useMagnetic<HTMLButtonElement>()

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the server-rendered
    // markup and the client's first paint match; the media query only exists client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (!confirmed) return
    const timer = window.setTimeout(() => setConfirmed(false), CONFIRM_MS)
    return () => window.clearTimeout(timer)
  }, [confirmed])

  const line: CartLine = {
    slug: product.slug,
    name: product.name,
    price: product.price,
    qty,
    grind,
    weight,
    subscribe,
  }

  const total = linePrice(line)
  const undiscounted = linePrice({ ...line, subscribe: false })

  return (
    <div className="mt-16 border-t border-bone/10 pt-12">
      <div className="flex flex-col gap-10">
        <Segmented
          label="Grind"
          options={GRINDS}
          value={grind}
          onChange={setGrind}
          reduced={reduced}
        />
        <Segmented
          label="Weight"
          options={WEIGHTS}
          value={weight}
          onChange={setWeight}
          reduced={reduced}
        />

        <div>
          <span className="eyebrow block">Delivery</span>
          <button
            type="button"
            role="switch"
            aria-checked={subscribe}
            data-cursor
            onClick={() => setSubscribe((on) => !on)}
            className="mt-4 flex w-full items-center justify-between gap-6 border border-bone/15 px-5 py-4 text-left outline-none transition-colors hover:border-bone/35 focus-visible:ring-1 focus-visible:ring-crema"
            style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
          >
            <span>
              <span className="block text-sm text-bone">Subscribe &amp; save</span>
              <span className="mt-1 block text-xs text-ash">
                Every four weeks. Skip or cancel any time.
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-4">
              <span className="text-xs uppercase tracking-[0.14em] text-crema">Save 10%</span>
              <span
                aria-hidden
                className={`relative h-6 w-11 rounded-full border ${
                  subscribe ? 'border-crema bg-crema/25' : 'border-bone/25 bg-transparent'
                }`}
                style={{
                  transitionProperty: 'background-color, border-color',
                  transitionDuration: reduced ? '0s' : `${DUR.fast}s`,
                }}
              >
                <span
                  className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${
                    subscribe ? 'bg-crema' : 'bg-bone/50'
                  }`}
                  style={{
                    left: subscribe ? 'calc(100% - 1.25rem)' : '0.25rem',
                    transitionProperty: 'left, background-color',
                    transitionDuration: reduced ? '0s' : `${DUR.fast}s`,
                    transitionTimingFunction: EASE.smooth,
                  }}
                />
              </span>
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <span className="eyebrow block">Quantity</span>
            <div className="mt-4 flex items-center border border-bone/15">
              <button
                type="button"
                data-cursor
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty((n) => Math.max(1, n - 1))}
                className="px-5 py-3 text-bone/80 outline-none transition-colors hover:text-bone focus-visible:ring-1 focus-visible:ring-crema disabled:opacity-30"
                style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
              >
                &minus;
              </button>
              <span
                aria-live="polite"
                className="min-w-10 text-center text-sm tabular-nums text-bone"
              >
                {qty}
              </span>
              <button
                type="button"
                data-cursor
                aria-label="Increase quantity"
                disabled={qty >= MAX_QTY}
                onClick={() => setQty((n) => Math.min(MAX_QTY, n + 1))}
                className="px-5 py-3 text-bone/80 outline-none transition-colors hover:text-bone focus-visible:ring-1 focus-visible:ring-crema disabled:opacity-30"
                style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="eyebrow block">Total</span>
            <span className="display mt-3 block text-4xl tabular-nums text-bone">
              {formatUSD(total)}
            </span>
            {subscribe && (
              <span className="mt-2 block text-xs text-ash">
                <s>{formatUSD(undiscounted)}</s> every four weeks
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        ref={buttonRef}
        type="button"
        data-cursor
        onClick={() => {
          add(line)
          setConfirmed(true)
        }}
        className="mt-12 inline-flex w-full items-center justify-center gap-4 border border-crema bg-crema px-10 py-5 text-sm uppercase tracking-[0.18em] text-void outline-none transition-colors hover:bg-transparent hover:text-crema focus-visible:ring-1 focus-visible:ring-crema md:w-auto"
        style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
      >
        Add to cart
        <span aria-hidden>&mdash;</span>
        <span className="tabular-nums">{formatUSD(total)}</span>
      </button>

      <p aria-live="polite" className="eyebrow mt-5 h-4">
        {confirmed ? `${product.name} added to your cart` : ''}
      </p>
    </div>
  )
}
