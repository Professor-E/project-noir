'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { BREW_METHODS, type BrewMethod } from '@/lib/brew'
import { DUR, EASE, STAGGER_STEP, prefersReducedMotion } from '@/lib/motion'

/**
 * Counts every numeric group inside a spec string up from zero — "18g" counts
 * the 18, "3:15" counts both halves at once, keeping the zero padding. Runs
 * once, the first time its card is opened.
 */
function CountingSpec({ value, play }: { value: string; play: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!play || playedRef.current || !el) return
    playedRef.current = true

    if (prefersReducedMotion()) {
      el.textContent = value
      return
    }

    const parts = value.split(/(\d+)/)
    const counters = parts.map((part) =>
      /^\d+$/.test(part) ? { n: 0, target: Number(part), pad: part.length } : null,
    )

    const render = () => {
      el.textContent = parts
        .map((part, i) => {
          const counter = counters[i]
          if (!counter) return part
          return String(Math.round(counter.n)).padStart(counter.pad, '0')
        })
        .join('')
    }

    // Deliberately not rendering zeros up front: if the ticker never runs (JS
    // error, hostile environment) the server-rendered value stays on screen
    // instead of a frozen "00g".
    const tweens = counters
      .filter((c): c is { n: number; target: number; pad: number } => c !== null)
      .map((counter) =>
        gsap.to(counter, {
          n: counter.target,
          duration: DUR.base,
          ease: EASE.smooth,
          onUpdate: render,
          onComplete: render,
        }),
      )

    return () => tweens.forEach((t) => t.kill())
  }, [play, value])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  )
}

function Spec({ label, value, play }: { label: string; value: string; play: boolean }) {
  return (
    <div>
      <span className="eyebrow block">{label}</span>
      <span className="display mt-2 block text-4xl text-crema">
        <CountingSpec value={value} play={play} />
      </span>
    </div>
  )
}

function MethodCard({
  method,
  index,
  open,
  reduced,
  onOpen,
}: {
  method: BrewMethod
  index: number
  open: boolean
  reduced: boolean
  onOpen: () => void
}) {
  const stepsRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = stepsRef.current
    if (!open || !list) return
    const rows = list.querySelectorAll<HTMLLIElement>('li')
    if (reduced) {
      gsap.set(rows, { opacity: 1, y: 0 })
      return
    }
    const tween = gsap.fromTo(
      rows,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: DUR.base,
        ease: EASE.expo,
        stagger: STAGGER_STEP,
      },
    )
    return () => {
      tween.kill()
    }
  }, [open, reduced])

  return (
    <article
      className="min-w-0 overflow-hidden bg-ink"
      style={{
        flexGrow: open ? 2.4 : 1,
        flexBasis: 0,
        transitionProperty: 'flex-grow',
        transitionDuration: reduced ? '0s' : `${DUR.base}s`,
      }}
    >
      <h3>
        <button
          type="button"
          data-cursor
          onClick={onOpen}
          aria-expanded={open}
          aria-controls={`brew-panel-${method.id}`}
          id={`brew-header-${method.id}`}
          className="flex w-full items-baseline justify-between gap-6 px-7 pb-6 pt-8 text-left outline-none focus-visible:ring-1 focus-visible:ring-crema/60 md:px-9 md:pt-10"
        >
          <span className="display text-4xl text-bone md:text-5xl">{method.name}</span>
          <span className="eyebrow shrink-0">{String(index + 1).padStart(2, '0')}</span>
        </button>
      </h3>

      <div
        id={`brew-panel-${method.id}`}
        role="region"
        aria-labelledby={`brew-header-${method.id}`}
        hidden={!open}
        className="px-7 pb-10 md:px-9 md:pb-14"
      >
        <div className="flex flex-wrap gap-x-14 gap-y-6 border-t border-bone/10 pt-8">
          <Spec label="Dose" value={method.dose} play={open} />
          <Spec label="Ratio" value={method.ratio} play={open} />
          <Spec label="Time" value={method.time} play={open} />
        </div>

        <ol ref={stepsRef} className="mt-10 flex flex-col gap-6">
          {method.steps.map((step) => (
            <li key={step.at} className="flex gap-6" style={{ opacity: 0 }}>
              <span className="eyebrow w-12 shrink-0 pt-1 tabular-nums text-crema">
                {step.at}
              </span>
              <span className="max-w-[52ch] text-sm leading-relaxed text-bone/85">
                {step.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}

export default function BrewGuide() {
  const [openId, setOpenId] = useState(BREW_METHODS[0].id)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the server-rendered
    // markup and the client's first paint match; the media query only exists client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
  }, [])

  return (
    <section
      id="brew"
      aria-labelledby="brew-heading"
      className="relative w-full bg-void px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow block">The Brew</span>
            <h2
              id="brew-heading"
              className="display mt-6 max-w-[14ch] text-bone"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
            >
              Three ways to pull it
            </h2>
          </div>
          <p className="max-w-[34ch] text-sm leading-relaxed text-ash">
            Water at temperature, a scale, and a timer. Everything else is patience.
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-px bg-bone/10 md:flex-row md:items-stretch">
          {BREW_METHODS.map((method, i) => (
            <MethodCard
              key={method.id}
              method={method}
              index={i}
              open={openId === method.id}
              reduced={reduced}
              onOpen={() => setOpenId(method.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
